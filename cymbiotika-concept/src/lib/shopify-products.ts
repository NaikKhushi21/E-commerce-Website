import { cache } from "react";
import { type Product, type ProductVariant } from "@/data/products";
import { type WellnessGoal } from "@/data/goals";
import { assertPublicCymbiotikaUrl } from "@/lib/safe-fetch";

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

  const query = `
    query ProductsPage($first: Int!, $after: String) {
      products(first: $first, after: $after) {
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
  const description = stripHtml(descriptionHtml) || "Daily wellness support.";
  const goals = inferGoalsFromContent(node.title, productType, tags, description);
  const benefits = tags.slice(0, 3).map((tag) => tag.replace(/-/g, " "));
  const modelPath = pickModelUrl(mediaNodes);
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

export const getShopifyProducts = cache(async (): Promise<Product[]> => {
  try {
    const rows = await fetchAllShopifyProducts();
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
