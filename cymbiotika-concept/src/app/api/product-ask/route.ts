import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";
const MAX_MESSAGES = 10;

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

type ProductContext = {
  title?: string;
  description?: string;
  benefits?: string[];
  ingredients?: string[];
  price?: number;
  currency?: string;
  category?: string;
  productType?: string;
  tags?: string[];
};

function isMessage(value: unknown): value is IncomingMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<IncomingMessage>;
  return (message.role === "user" || message.role === "assistant") && typeof message.content === "string";
}

function cleanList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.filter((value): value is string => typeof value === "string").slice(0, 8);
}

function sanitizeProduct(value: unknown): ProductContext {
  if (!value || typeof value !== "object") return {};
  const product = value as Record<string, unknown>;

  return {
    title: typeof product.title === "string" ? product.title : undefined,
    description: typeof product.description === "string" ? product.description.slice(0, 1200) : undefined,
    benefits: cleanList(product.benefits),
    ingredients: cleanList(product.ingredients),
    price: typeof product.price === "number" ? product.price : undefined,
    currency: typeof product.currency === "string" ? product.currency : undefined,
    category: typeof product.category === "string" ? product.category : undefined,
    productType: typeof product.productType === "string" ? product.productType : undefined,
    tags: cleanList(product.tags),
  };
}

function productContextText(product: ProductContext) {
  return [
    `Product: ${product.title ?? "Unknown product"}`,
    product.category ? `Category: ${product.category}` : null,
    product.productType ? `Type: ${product.productType}` : null,
    typeof product.price === "number" ? `Price: ${product.currency ?? "USD"} ${product.price}` : null,
    product.description ? `Description: ${product.description}` : null,
    product.benefits?.length ? `Benefits: ${product.benefits.join("; ")}` : null,
    product.ingredients?.length ? `Ingredients: ${product.ingredients.join(", ")}` : null,
    product.tags?.length ? `Tags: ${product.tags.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
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
  const product = sanitizeProduct(payload.product);
  const messages = Array.isArray(payload.messages) ? payload.messages.filter(isMessage).slice(-MAX_MESSAGES) : [];

  if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json({ error: "A latest user message is required." }, { status: 400 });
  }

  const systemPrompt = `You are Cymbiotika's product query assistant. Answer only using the provided product context and safe general wellness knowledge. Keep answers simple, direct, and useful for shoppers. Do not diagnose, treat, cure, or prescribe. If a user asks about a medical condition, medication interaction, pregnancy, allergies, or dosing risk, recommend consulting a qualified healthcare professional. If product data is missing, say what is not available instead of inventing details. Keep most answers under 120 words.\n\n${productContextText(product)}`;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Cymbiotika Product Assistant",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.35,
      max_tokens: 420,
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
  const answer = data?.choices?.[0]?.message?.content;

  if (typeof answer !== "string" || answer.trim().length === 0) {
    return NextResponse.json({ error: "Model returned an empty response." }, { status: 502 });
  }

  return NextResponse.json({ answer: answer.trim(), model: MODEL });
}
