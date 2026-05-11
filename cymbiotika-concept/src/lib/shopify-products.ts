import { cache } from "react";
import { type Product, type ProductVariant } from "@/data/products";
import { type WellnessGoal } from "@/data/goals";
import { assertPublicCymbiotikaUrl } from "@/lib/safe-fetch";
import { getProductEnrichmentMap, type ProductEnrichment } from "@/lib/sanity-products";

type ShopifyPageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

type ShopifyVariantNode = {
  id: string;
  title: string;
  price: string;
  compareAtPrice?: string | null;
  sku?: string | null;
};

type ShopifyImageNode = {
  url?: string | null;
};

type ShopifyModelSource = {
  url?: string | null;
  mimeType?: string | null;
  format?: string | null;
};

type ShopifyMediaNode = {
  mediaContentType?: "IMAGE" | "MODEL_3D" | string;
  image?: ShopifyImageNode | null;
  sources?: ShopifyModelSource[] | null;
};

type ShopifyMetafield = {
  value?: string | null;
};

type ShopifyProductNode = {
  id: string;
  title: string;
  handle: string;
  descriptionHtml?: string | null;
  vendor?: string | null;
  productType?: string | null;
  tags?: string[];
  featuredImage?: ShopifyImageNode | null;
  variants?: {
    edges: Array<{ node: ShopifyVariantNode }>;
  };
  media?: {
    nodes: ShopifyMediaNode[];
  };
  ratingMetafield?: ShopifyMetafield | null;
  reviewCountMetafield?: ShopifyMetafield | null;
};

type ShopifyProductsResponse = {
  products: {
    pageInfo: ShopifyPageInfo;
    edges: Array<{ node: ShopifyProductNode }>;
  };
};

const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "cymbiotika.com";
const SHOPIFY_API_VERSION = "2024-01";
const PAGE_SIZE = 50;
const MAX_PAGES = 20;

const GOAL_KEYWORDS: Array<{ goal: WellnessGoal; terms: string[] }> = [
  {
    goal: "energy",
    terms: [
      "energy", "focus", "stamina", "vitality", "mitochondri",
      "b12", "b-12", "b complex", "coq10", "co-q10", "shilajit",
      "nad+", "nad ", "adrenal", "iron", "ribose", "creatine",
    ],
  },
  {
    goal: "immunity",
    terms: [
      "immunity", "immune", "defense", "antioxidant",
      "vitamin c", "vit c", "zinc", "elderberry", "echinacea",
      "colostrum", "sea moss", "d3", "k2", "vitamin d",
    ],
  },
  {
    goal: "gut-health",
    terms: [
      "gut", "digest", "microbiome", "probiotic", "prebiotic",
      "tudca", "colostrum", "fiber", "enzyme",
    ],
  },
  {
    goal: "brain-health",
    terms: [
      "brain", "cognitive", "memory", "mental", "clarity",
      "lion's mane", "lions mane", "omega", "dha", "epa",
      "phosphatidyl", "b12", "b-12", "l-theanine", "theanine",
      "bacopa", "ginkgo",
    ],
  },
  {
    goal: "sleep",
    terms: [
      "sleep", "rest", "night", "circadian",
      "magnesium", "apigenin", "melatonin", "ashwagandha",
      "theanine", "glycine", "valerian",
    ],
  },
  {
    goal: "stress",
    terms: [
      "stress", "calm", "mood", "anxiety", "balance",
      "ashwagandha", "rhodiola", "magnesium", "theanine",
      "gaba", "holy basil", "tulsi",
    ],
  },
  {
    goal: "skin",
    terms: [
      "skin", "beauty", "glow", "radiance",
      "collagen", "hyaluronic", "vitamin c", "glutathione",
      "biotin", "silica", "elasticity",
    ],
  },
  {
    goal: "detox",
    terms: [
      "detox", "cleanse", "liver", "purif",
      "glutathione", "tudca", "milk thistle", "chlorella",
      "spirulina", "curcumin", "nac ",
    ],
  },
  {
    goal: "longevity",
    terms: [
      "longevity", "cellular", "aging", "anti-aging", "healthspan",
      "resveratrol", "nad+", "nad ", "coq10", "co-q10",
      "omega", "vitamin d", "d3", "k2", "spermidine",
      "fisetin", "quercetin",
    ],
  },
];

function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return trimmed;
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

function inferGoalsFromContent(
  title: string,
  productType: string,
  tags: string[],
  description: string,
): WellnessGoal[] {
  const haystack = `${title} ${productType} ${tags.join(" ")} ${description}`.toLowerCase();
  const matched: WellnessGoal[] = [];

  for (const entry of GOAL_KEYWORDS) {
    if (entry.terms.some((term) => haystack.includes(term))) {
      matched.push(entry.goal);
    }
  }

  return matched.slice(0, 4);
}

function parsePrice(value: string | null | undefined, fallback = 0): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.round(parsed * 100) / 100;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "’")
    .replace(/&lsquo;/gi, "‘")
    .replace(/&ldquo;/gi, "“")
    .replace(/&rdquo;/gi, "”");
}

function htmlToText(fragment: string): string {
  return decodeEntities(fragment.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

type SectionMap = Record<string, string>;

/**
 * Splits Shopify descriptionHtml into sections keyed by lowercased <h4> label.
 * Cymbiotika product copy uses a stable layout — Benefits, Description, How to
 * Enjoy, Ingredients, Third Party Testing — so we segment on h4 boundaries and
 * parse each block independently.
 */
function splitSections(html: string): SectionMap {
  const out: SectionMap = {};
  if (!html) return out;
  const re = /<h4[^>]*>([\s\S]*?)<\/h4>([\s\S]*?)(?=<h4[^>]*>|$)/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const heading = htmlToText(match[1]).toLowerCase();
    const body = match[2] ?? "";
    if (heading) out[heading] = body;
  }
  return out;
}

function parseListItems(html: string): string[] {
  const items: string[] = [];
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const text = htmlToText(match[1]).replace(/\*+\s*$/, "").trim();
    if (text) items.push(text);
  }
  return items;
}

function parseParagraphs(html: string): string[] {
  const paragraphs: string[] = [];
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const text = htmlToText(match[1]);
    if (text) paragraphs.push(text);
  }
  return paragraphs;
}

function findSection(sections: SectionMap, ...needles: string[]): string | undefined {
  for (const key of Object.keys(sections)) {
    for (const needle of needles) {
      if (key.includes(needle)) return sections[key];
    }
  }
  return undefined;
}

function splitIngredientList(line: string): string[] {
  return line
    .split(/,(?![^()]*\))/g)
    .map((entry) => entry.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function parseIngredients(block: string | undefined): { active: string[]; other: string[] } {
  if (!block) return { active: [], other: [] };
  const paragraphs = parseParagraphs(block);
  let active: string[] = [];
  let other: string[] = [];
  for (const paragraph of paragraphs) {
    const lower = paragraph.toLowerCase();
    if (lower.startsWith("active ingredient")) {
      const after = paragraph.replace(/^[^:]*:\s*/i, "");
      active = splitIngredientList(after);
    } else if (lower.startsWith("other ingredient") || lower.startsWith("inactive ingredient")) {
      const after = paragraph.replace(/^[^:]*:\s*/i, "");
      other = splitIngredientList(after);
    } else if (active.length === 0) {
      // Some products list everything inline without an "Active Ingredients:" prefix.
      active = splitIngredientList(paragraph);
    }
  }
  return { active, other };
}

function parseProTip(block: string | undefined): string | undefined {
  if (!block) return undefined;
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(block)) !== null) {
    const text = htmlToText(match[1]);
    if (/pro\s*-?\s*tip/i.test(text)) {
      return text.replace(/^pro\s*-?\s*tip\s*:\s*/i, "");
    }
  }
  return undefined;
}

function parseCoaUrl(block: string | undefined): string | undefined {
  if (!block) return undefined;
  const match = block.match(/href="([^"]+\.(?:pdf|jpg|jpeg|png)[^"]*)"/i);
  return match?.[1];
}

type ParsedDescription = {
  benefits: string[];
  descriptionRich: string[];
  howToUse: string[];
  ingredientsActive: string[];
  ingredientsOther: string[];
  proTip?: string;
  coaUrl?: string;
};

function parseDescriptionHtml(html: string | null | undefined): ParsedDescription {
  const empty: ParsedDescription = {
    benefits: [],
    descriptionRich: [],
    howToUse: [],
    ingredientsActive: [],
    ingredientsOther: [],
  };
  if (!html) return empty;

  const sections = splitSections(html);

  const benefitsBlock = findSection(sections, "benefit");
  const descriptionBlock = findSection(sections, "description", "about");
  const howToBlock = findSection(sections, "how to enjoy", "how to use", "directions", "suggested use");
  const ingredientsBlock = findSection(sections, "ingredient");
  const testingBlock = findSection(sections, "third party");

  const benefits = benefitsBlock ? parseListItems(benefitsBlock) : [];
  const descriptionParas = descriptionBlock ? parseParagraphs(descriptionBlock) : [];
  const howToParas = howToBlock ? parseParagraphs(howToBlock).filter((line) => !/^disclaimer/i.test(line)) : [];
  const { active, other } = parseIngredients(ingredientsBlock);
  const proTip = parseProTip(benefitsBlock) ?? parseProTip(descriptionBlock);
  const coaUrl = parseCoaUrl(testingBlock);

  return {
    benefits,
    descriptionRich: descriptionParas,
    howToUse: howToParas,
    ingredientsActive: active,
    ingredientsOther: other,
    proTip,
    coaUrl,
  };
}

async function getAdminToken(): Promise<string> {
  const staticToken = process.env.SHOPIFY_ACCESS_TOKEN?.trim();
  if (staticToken) return staticToken;

  const apiKey = process.env.SHOPIFY_API_KEY?.trim();
  const apiSecret = process.env.SHOPIFY_API_SECRET?.trim();
  if (!apiKey || !apiSecret) {
    throw new Error("Missing Shopify credentials. Set SHOPIFY_ACCESS_TOKEN or SHOPIFY_API_KEY + SHOPIFY_API_SECRET.");
  }

  const url = `https://${SHOP_DOMAIN}/admin/oauth/access_token`;
  assertPublicCymbiotikaUrl(url);

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: apiKey,
    client_secret: apiSecret,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to get Shopify admin token (${res.status}).`);
  }

  const json = (await res.json()) as { access_token?: string };
  const token = json.access_token?.trim();
  if (!token) throw new Error("Shopify admin token missing in response.");
  return token;
}

async function fetchProductsPage(token: string, after: string | null): Promise<ShopifyProductsResponse> {
  const url = `https://${SHOP_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
  assertPublicCymbiotikaUrl(url);

  // Scope to active products only. The dev store carries an ARCHIVED legacy
  // catalog alongside the current ACTIVE one — the archived rows have no
  // media uploaded and would otherwise leak through as imageless duplicates
  // (different titles than the active versions, so the dedupe-by-title step
  // can't merge them).
  const query = `
    query ProductsPage($first: Int!, $after: String) {
      products(first: $first, after: $after, query: "status:active") {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            handle
            descriptionHtml
            vendor
            productType
            tags
            featuredImage {
              url
            }
            variants(first: 25) {
              edges {
                node {
                  id
                  title
                  price
                  compareAtPrice
                  sku
                }
              }
            }
            media(first: 25) {
              nodes {
                mediaContentType
                ... on MediaImage {
                  image {
                    url
                  }
                }
                ... on Model3d {
                  sources {
                    url
                    format
                    mimeType
                  }
                }
              }
            }
            ratingMetafield: metafield(namespace: "reviews", key: "rating") {
              value
            }
            reviewCountMetafield: metafield(namespace: "reviews", key: "reviewCount") {
              value
            }
          }
        }
      }
    }
  `;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        first: PAGE_SIZE,
        after,
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Shopify GraphQL request failed (${res.status}).`);
  }

  const json = (await res.json()) as { data?: ShopifyProductsResponse; errors?: unknown[] };
  if (json.errors && json.errors.length > 0) {
    throw new Error("Shopify GraphQL returned errors.");
  }
  if (!json.data) {
    throw new Error("Shopify GraphQL returned empty data.");
  }
  return json.data;
}

async function fetchAllShopifyProducts(): Promise<ShopifyProductNode[]> {
  const token = await getAdminToken();
  const all: ShopifyProductNode[] = [];
  let after: string | null = null;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const data = await fetchProductsPage(token, after);
    const edges = data.products.edges ?? [];
    all.push(...edges.map((edge) => edge.node));

    const pageInfo = data.products.pageInfo;
    if (!pageInfo.hasNextPage || !pageInfo.endCursor) break;
    after = pageInfo.endCursor;
  }

  return all;
}

function extractNumericId(gid: string): string {
  const match = gid.match(/(\d+)$/);
  return match?.[1] ?? gid;
}

/**
 * Local .glb files live in /public/models/. The first 4 are real
 * product-specific scans; the rest of the catalog gets one of these
 * deterministically (hash of handle → index), so each product always
 * resolves to the same model across renders.
 */
const LOCAL_MODEL_POOL = [
  "/models/vitamin-c.glb",
  "/models/colestrum.glb",
  "/models/glutathione_left.glb",
  "/models/seamoss_left.glb",
];

const HANDLE_TO_MODEL: Record<string, string> = {
  "vitamin-c": "/models/vitamin-c.glb",
  "liposomal-vitamin-c": "/models/vitamin-c.glb",
  "vitamin-c-2": "/models/vitamin-c.glb",
  "liquid-colostrum": "/models/colestrum.glb",
  glutathione: "/models/glutathione_left.glb",
  "glutathione-2": "/models/glutathione_left.glb",
};

function hashHandle(handle: string): number {
  let h = 0;
  for (let i = 0; i < handle.length; i += 1) {
    h = (h * 31 + handle.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickLocalModel(handle: string): string {
  return HANDLE_TO_MODEL[handle] ?? LOCAL_MODEL_POOL[hashHandle(handle) % LOCAL_MODEL_POOL.length];
}

function pickModelUrl(mediaNodes: ShopifyMediaNode[]): string | undefined {
  for (const node of mediaNodes) {
    if (node.mediaContentType !== "MODEL_3D") continue;
    const sources = node.sources ?? [];
    const glb = sources.find((entry) => {
      const mime = (entry.mimeType ?? "").toLowerCase();
      const format = (entry.format ?? "").toLowerCase();
      const url = (entry.url ?? "").toLowerCase();
      return mime.includes("gltf-binary") || format.includes("glb") || url.endsWith(".glb");
    });
    const anySource = glb ?? sources[0];
    const resolved = normalizeImageUrl(anySource?.url);
    if (resolved) return resolved;
  }
  return undefined;
}

function mapToProduct(node: ShopifyProductNode): Product {
  const tags = (node.tags ?? []).map(normalizeTag).filter(Boolean);
  const productType = node.productType ?? "Supplement";

  const variants: ProductVariant[] = (node.variants?.edges ?? []).map((edge) => ({
    id: extractNumericId(edge.node.id),
    title: edge.node.title || "Default",
    price: parsePrice(edge.node.price, 0),
    compareAtPrice: parsePrice(edge.node.compareAtPrice, 0) || null,
    available: true,
    sku: edge.node.sku ?? null,
  }));

  const mediaNodes = node.media?.nodes ?? [];
  const mediaImages = mediaNodes
    .filter((entry) => entry.mediaContentType === "IMAGE")
    .map((entry) => normalizeImageUrl(entry.image?.url))
    .filter((entry): entry is string => Boolean(entry));

  const featuredFromShopify = normalizeImageUrl(node.featuredImage?.url);
  const images = Array.from(new Set([featuredFromShopify, ...mediaImages].filter((entry): entry is string => Boolean(entry))));
  const featuredImage = featuredFromShopify ?? images[0] ?? "";
  const descriptionHtml = node.descriptionHtml ?? "<p>Daily wellness support.</p>";
  const parsed = parseDescriptionHtml(node.descriptionHtml);
  // Prefer the first paragraph of the curated "Description" section as the
  // short blurb. Fall back to plain stripped HTML when the section layout is
  // missing (gift cards, merch, etc.).
  const description =
    parsed.descriptionRich[0] || stripHtml(descriptionHtml) || "Daily wellness support.";
  const goals = inferGoalsFromContent(node.title, productType, tags, description);
  const tagBenefits = tags.slice(0, 3).map((tag) => tag.replace(/-/g, " "));
  const benefits = parsed.benefits.length > 0 ? parsed.benefits : tagBenefits;
  // Prefer Shopify's MODEL_3D media (uploaded via scripts/sync-shopify-models).
  // Fall back to the local /public/models/ copy while Shopify is still
  // processing the GLB asynchronously, and as a permanent safety net.
  const modelPath = pickModelUrl(mediaNodes) ?? pickLocalModel(node.handle);
  const firstVariant = variants[0];

  // Rating + reviewCount come from Shopify metafields (namespace: "reviews").
  // Null when the metafields aren't set on the product.
  const ratingFromMeta = parseFloat(node.ratingMetafield?.value ?? "");
  const reviewCountFromMeta = parseInt(node.reviewCountMetafield?.value ?? "", 10);
  const rating = Number.isFinite(ratingFromMeta) ? ratingFromMeta : null;
  const reviewCount = Number.isFinite(reviewCountFromMeta) ? reviewCountFromMeta : null;

  return {
    id: extractNumericId(node.id),
    handle: node.handle,
    title: node.title,
    description,
    descriptionHtml,
    vendor: node.vendor ?? "Cymbiotika",
    productType,
    tags,
    price: firstVariant?.price ?? 0,
    compareAtPrice: firstVariant?.compareAtPrice ?? null,
    currency: "USD",
    featuredImage,
    images,
    available: variants.length > 0,
    variants,
    benefits: benefits.length > 0 ? benefits : ["daily wellness support"],
    descriptionRich: parsed.descriptionRich.length > 0 ? parsed.descriptionRich : undefined,
    howToUse: parsed.howToUse.length > 0 ? parsed.howToUse : undefined,
    ingredientsActive: parsed.ingredientsActive.length > 0 ? parsed.ingredientsActive : undefined,
    ingredientsOther: parsed.ingredientsOther.length > 0 ? parsed.ingredientsOther : undefined,
    proTip: parsed.proTip,
    coaUrl: parsed.coaUrl,
    goals,
    modelPath,
    rating,
    reviewCount,
    datasetSource: "Shopify Admin API",
    sourceUrl: `https://${SHOP_DOMAIN}/products/${node.handle}`,
  };
}

function canonicalTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function mediaScore(product: Product): number {
  const imageScore = product.images.length;
  const featuredScore = product.featuredImage ? 2 : 0;
  const modelScore = product.modelPath ? 4 : 0;
  return imageScore + featuredScore + modelScore;
}

/**
 * Apply Sanity-authored editorial copy on top of Shopify-derived fields.
 * Sanity wins per-field when present; everything else passes through.
 */
function applyEnrichment(product: Product, enrichment: ProductEnrichment | undefined): Product {
  if (!enrichment) return product;
  const description = enrichment.shortDescription ?? enrichment.descriptionRich?.[0] ?? product.description;
  return {
    ...product,
    title: enrichment.displayTitle ?? product.title,
    description,
    benefits: enrichment.benefits && enrichment.benefits.length > 0 ? enrichment.benefits : product.benefits,
    descriptionRich: enrichment.descriptionRich ?? product.descriptionRich,
    howToUse: enrichment.howToUse ?? product.howToUse,
    ingredientsActive: enrichment.ingredientsActive ?? product.ingredientsActive,
    ingredientsOther: enrichment.ingredientsOther ?? product.ingredientsOther,
    proTip: enrichment.proTip ?? product.proTip,
    coaUrl: enrichment.coaUrl ?? product.coaUrl,
  };
}

export const getShopifyProducts = cache(async (): Promise<Product[]> => {
  try {
    const [rows, enrichmentMap] = await Promise.all([
      fetchAllShopifyProducts(),
      getProductEnrichmentMap(),
    ]);
    const mapped = rows.map((row) => mapToProduct(row));

    // Shopify store currently has duplicate catalog rows (some with no media).
    // Keep the best media-rich version for each product title.
    const bestByTitle = new Map<string, Product>();
    for (const product of mapped) {
      const key = canonicalTitle(product.title);
      const existing = bestByTitle.get(key);
      if (!existing || mediaScore(product) > mediaScore(existing)) {
        bestByTitle.set(key, product);
      }
    }

    return [...bestByTitle.values()]
      .filter((entry) => entry.images.length > 0 || Boolean(entry.modelPath))
      .map((entry) => applyEnrichment(entry, enrichmentMap[entry.handle]))
      // Hide products that don't have authored content yet — neither a parsed
      // Shopify "Description" section nor a Sanity productEnrichment override.
      // Reappears automatically once either source is populated.
      .filter((entry) => (entry.descriptionRich?.length ?? 0) > 0)
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
});

export async function getShopifyProductByHandle(handle: string): Promise<Product | undefined> {
  const all = await getShopifyProducts();
  return all.find((entry) => entry.handle === handle);
}

export async function getShopifyFeaturedProducts(limit = 6): Promise<Product[]> {
  const all = await getShopifyProducts();
  return all.filter((entry) => entry.available).slice(0, limit);
}
