/**
 * This script only fetches public Shopify Ajax product JSON.
 * It does not use private APIs, customer data, admin APIs, or authenticated endpoints.
 * Use for local prototyping only.
 */

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { WELLNESS_GOALS, type WellnessGoal } from "../src/data/goals";
import { assertPublicCymbiotikaUrl } from "../src/lib/safe-fetch";

const productSchema = z.object({
  id: z.union([z.string(), z.number()]),
  handle: z.string(),
  title: z.string(),
  body_html: z.string().optional().default(""),
  vendor: z.string().optional(),
  type: z.string().optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional().default([]),
  images: z.array(
    z.object({
      src: z.string().url(),
    }),
  ).optional().default([]),
  image: z.object({ src: z.string().url() }).nullable().optional(),
  variants: z.array(
    z.object({
      id: z.union([z.string(), z.number()]),
      title: z.string(),
      price: z.string(),
      compare_at_price: z.string().nullable().optional(),
      available: z.boolean().optional().default(true),
      sku: z.string().nullable().optional(),
    }),
  ).default([]),
});

type NormalizedProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags: string[];
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  featuredImage: string;
  images: string[];
  available: boolean;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    available: boolean;
    sku?: string | null;
  }>;
  benefits: string[];
  goals: WellnessGoal[];
};

const fallbackHandles = [
  "liposomal-vitamin-c",
  "liposomal-glutathione",
  "magnesium-l-threonate",
];

const goalMap: Record<WellnessGoal, string[]> = {
  energy: ["energy", "adrenal", "metabolism"],
  immunity: ["immune", "immunity", "defense"],
  "gut-health": ["gut", "digest", "microbiome", "probiotic"],
  "brain-health": ["brain", "focus", "cognitive"],
  sleep: ["sleep", "calm", "night"],
  stress: ["stress", "calm", "mood", "adrenal"],
  skin: ["skin", "beauty", "collagen"],
  detox: ["detox", "liver", "cleanse", "glutathione"],
  longevity: ["longevity", "healthy aging", "cellular"],
};

const args = process.argv.slice(2);
const handles = args.length > 0 ? args : fallbackHandles;

function parseRobotsDisallowForWildcard(robotsText: string): string[] {
  const lines = robotsText
    .split("\n")
    .map((line) => line.split("#")[0]?.trim() ?? "")
    .filter(Boolean);

  const disallow: string[] = [];
  let activeWildcardGroup = false;

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.startsWith("user-agent:")) {
      const agent = line.split(":")[1]?.trim().toLowerCase() ?? "";
      activeWildcardGroup = agent === "*";
      continue;
    }

    if (!activeWildcardGroup) continue;
    if (lower.startsWith("disallow:")) {
      const rule = line.split(":")[1]?.trim() ?? "";
      if (rule) disallow.push(rule);
    }
  }

  return disallow;
}

function sanitizeTags(tags: string[] | string): string[] {
  if (Array.isArray(tags)) return tags;
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function inferGoals(title: string, tags: string[]): WellnessGoal[] {
  const haystack = `${title} ${tags.join(" ")}`.toLowerCase();
  return WELLNESS_GOALS.filter((goal) => goalMap[goal].some((needle) => haystack.includes(needle)));
}

function normalizeBenefits(description: string, goals: WellnessGoal[]): string[] {
  const base = goals.map((goal) => goal.replace("-", " "));
  return (base.length > 0 ? base : ["Daily wellness support"]).slice(0, 3);
}

function htmlToText(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toMoney(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeProduct(raw: unknown): NormalizedProduct {
  const parsed = productSchema.parse(raw);
  const tags = sanitizeTags(parsed.tags);
  const variants = parsed.variants.map((variant) => ({
    id: String(variant.id),
    title: variant.title,
    price: Number(variant.price),
    compareAtPrice: toMoney(variant.compare_at_price),
    available: variant.available,
    sku: variant.sku ?? null,
  }));

  const featuredImage = parsed.image?.src ?? parsed.images[0]?.src ?? "";
  const goals = inferGoals(parsed.title, tags);
  const description = htmlToText(parsed.body_html);

  return {
    id: String(parsed.id),
    handle: parsed.handle,
    title: parsed.title,
    description,
    descriptionHtml: parsed.body_html,
    vendor: parsed.vendor,
    productType: parsed.type,
    tags,
    price: variants[0]?.price ?? 0,
    compareAtPrice: variants[0]?.compareAtPrice ?? null,
    currency: "USD",
    featuredImage,
    images: parsed.images.map((image) => image.src),
    available: variants.some((variant) => variant.available),
    variants,
    benefits: normalizeBenefits(description, goals),
    goals,
  };
}

async function wait(ms: number) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function run() {
  const outputPath = resolve(process.cwd(), "src/data/products.json");
  const successful: NormalizedProduct[] = [];
  const failed: string[] = [];

  const robotsUrl = "https://cymbiotika.com/robots.txt";
  assertPublicCymbiotikaUrl(robotsUrl);
  const robotsResponse = await fetch(robotsUrl, { headers: { "User-Agent": "cymbiotika-concept-prototype/1.0" } });
  if (robotsResponse.ok) {
    const rules = parseRobotsDisallowForWildcard(await robotsResponse.text());
    const productsDisallowed = rules.some((rule) => rule === "/products" || rule === "/products/" || rule.startsWith("/products/"));
    if (productsDisallowed) {
      throw new Error("robots.txt disallows /products paths. Stop import and use manually supplied local data.");
    }
  } else {
    console.warn(`Could not read robots.txt (${robotsResponse.status}). Proceeding with explicit handles only.`);
  }

  for (const handle of handles) {
    const endpoint = `https://cymbiotika.com/products/${handle}.js`;

    try {
      assertPublicCymbiotikaUrl(endpoint);
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "cymbiotika-concept-prototype/1.0 (public-data-only)",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        failed.push(`${handle} (${response.status})`);
        continue;
      }

      const normalized = normalizeProduct(await response.json());
      if (!normalized.handle || normalized.images.length === 0) {
        failed.push(`${handle} (missing required fields)`);
        continue;
      }

      successful.push(normalized);
      const delay = 500 + Math.floor(Math.random() * 500);
      await wait(delay);
    } catch (error) {
      failed.push(`${handle} (${error instanceof Error ? error.message : "unknown error"})`);
    }
  }

  await writeFile(outputPath, JSON.stringify(successful, null, 2), "utf8");

  console.log(`Saved ${successful.length} products to ${outputPath}`);
  if (failed.length > 0) {
    console.log("Skipped/failed products:");
    failed.forEach((entry) => console.log(`- ${entry}`));
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
