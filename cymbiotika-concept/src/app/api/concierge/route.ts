import { NextResponse } from "next/server";
import type { Product } from "@/data/products";
import { getShopifyProducts } from "@/lib/shopify-products";
import { getIngredientsForProduct } from "@/lib/sanity-ingredients";

export const runtime = "nodejs";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";
const MAX_MESSAGES = 12;
const MAX_RECOMMENDATIONS = 3;

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

function isMessage(value: unknown): value is IncomingMessage {
  if (!value || typeof value !== "object") return false;
  const m = value as Partial<IncomingMessage>;
  return (m.role === "user" || m.role === "assistant") && typeof m.content === "string";
}

const VOICE_PROMPT = `You are Cymbiotika's routine concierge — a calm, science-leaning guide on the Cymbiotika homepage.

Voice: editorial and grounded. No exclamation marks. No marketing fluff. Sentence case throughout. Default to one short paragraph (2–3 sentences). Total prose under 110 words unless the user explicitly asks for a stack or sequence.

What you know: Cymbiotika is known for liposomal delivery, methylated B vitamins, third-party testing, and stack-based daily routines.

How you help: orient visitors to ingredient forms, formula choice for a goal (energy, sleep, immunity, longevity, gut, focus), absorption science, and routine sequencing (morning vs evening, with food, with what). Recommend up to ${MAX_RECOMMENDATIONS} relevant products from the catalog when the user is asking for guidance toward a goal. If they're just chatting or asking a definition, return zero recommendations.

Boundaries: never diagnose, treat, cure, or prescribe. For medical conditions, drug interactions, pregnancy, allergies, dosing risk, or pediatric questions, recommend a healthcare professional. Don't compare to specific competitor products by name; speak in terms of ingredient forms when relevant.`;

const FORMAT_PROMPT = `OUTPUT FORMAT — respond with ONLY valid minified JSON, no markdown, no commentary outside the JSON:

{"message": "<your prose response>", "recommendations": [{"handle": "<exact-handle-from-catalog>", "reason": "<one short sentence, max 14 words, why this product fits>"}]}

Rules:
- "message" is sentence case prose, under 110 words, no markdown.
- "recommendations" is an array of 0 to ${MAX_RECOMMENDATIONS} items.
- "handle" MUST exactly match a handle from the CATALOG below. Never invent or modify a handle.
- If the user's question doesn't map to a product (greetings, definitions, science questions), return "recommendations": [].
- Don't repeat the same handle.
- Don't restate product names in "message"; let the recommendation card speak for itself.`;

type CatalogEntry = {
  handle: string;
  title: string;
  productType?: string;
  price: number;
  benefits: string[];
  ingredients: string[];
};

async function buildCatalog(): Promise<{ entries: CatalogEntry[]; productByHandle: Map<string, Product> }> {
  const products = await getShopifyProducts();
  const productByHandle = new Map<string, Product>();
  const entries: CatalogEntry[] = [];

  await Promise.all(
    products.slice(0, 30).map(async (product) => {
      productByHandle.set(product.handle, product);
      const ingredients = await getIngredientsForProduct(product);
      entries.push({
        handle: product.handle,
        title: product.title,
        productType: product.productType,
        price: product.price,
        benefits: product.benefits.slice(0, 4),
        ingredients: ingredients.slice(0, 4).map((i) => i.name),
      });
    }),
  );

  return { entries, productByHandle };
}

function catalogText(entries: CatalogEntry[]): string {
  return entries
    .map((e) =>
      [
        `- handle: ${e.handle}`,
        `title: ${e.title}`,
        e.productType ? `type: ${e.productType}` : null,
        `price: $${e.price}`,
        e.benefits.length ? `benefits: ${e.benefits.join("; ")}` : null,
        e.ingredients.length ? `key ingredients: ${e.ingredients.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join(" | "),
    )
    .join("\n");
}

type ParsedResponse = {
  message: string;
  recommendations: Array<{ handle: string; reason: string }>;
};

function parseModelResponse(raw: string): ParsedResponse {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(stripped);
    if (!parsed || typeof parsed !== "object") throw new Error("not object");

    const message = typeof parsed.message === "string" ? parsed.message.trim() : "";
    const rawRecs = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
    const recommendations = rawRecs
      .filter(
        (r: unknown): r is { handle: string; reason: string } =>
          Boolean(r) &&
          typeof r === "object" &&
          typeof (r as Record<string, unknown>).handle === "string" &&
          typeof (r as Record<string, unknown>).reason === "string",
      )
      .slice(0, MAX_RECOMMENDATIONS);

    return { message, recommendations };
  } catch {
    return { message: stripped, recommendations: [] };
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const messages = Array.isArray(payload.messages)
    ? payload.messages.filter(isMessage).slice(-MAX_MESSAGES)
    : [];

  if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json({ error: "A latest user message is required." }, { status: 400 });
  }

  const { entries, productByHandle } = await buildCatalog();

  const systemPrompt = `${VOICE_PROMPT}\n\nCATALOG (only these handles are real; never invent products outside this list):\n${catalogText(entries)}\n\n${FORMAT_PROMPT}`;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Cymbiotika Routine Concierge",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      max_tokens: 520,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: "OpenRouter request failed.", detail: detail.slice(0, 500) },
      { status: response.status },
    );
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return NextResponse.json({ error: "Model returned an empty response." }, { status: 502 });
  }

  const parsed = parseModelResponse(raw);

  type Recommendation = { reason: string; product: Product };

  const recommendations: Recommendation[] = parsed.recommendations
    .map(({ handle, reason }): Recommendation | null => {
      const product = productByHandle.get(handle);
      if (!product) return null;
      return { reason, product };
    })
    .filter((r): r is Recommendation => r !== null);

  return NextResponse.json({
    message: parsed.message || raw,
    recommendations,
    model: MODEL,
  });
}
