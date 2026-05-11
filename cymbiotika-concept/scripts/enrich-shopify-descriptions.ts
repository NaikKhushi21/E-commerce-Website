/**
 * Enrich supplement-recommander.myshopify.com product descriptions with rich
 * body_html scraped from the public cymbiotika.com storefront.
 *
 * Flow:
 *   1. List all products from the configured Shopify Admin API.
 *   2. For each product, search cymbiotika.com for a matching public product
 *      using a small set of handle-alias rules + canonical-title fallback.
 *   3. If a match is found, write the public body_html into the Shopify
 *      product's descriptionHtml via the productUpdate GraphQL mutation.
 *
 * Defaults to dry-run. Pass --apply to actually mutate Shopify.
 *
 * Usage:
 *   npx tsx scripts/enrich-shopify-descriptions.ts            # dry run
 *   npx tsx scripts/enrich-shopify-descriptions.ts --apply    # write changes
 *   npx tsx scripts/enrich-shopify-descriptions.ts --apply --only=the-omega,nad
 *   npx tsx scripts/enrich-shopify-descriptions.ts --apply --force
 *
 * Flags:
 *   --apply     actually write to Shopify (default: dry-run)
 *   --force     also overwrite products whose descriptionHtml already looks rich
 *   --only=...  comma-separated handle whitelist
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------- Env loading (no external deps) ----------

const env: Record<string, string> = {};
const candidates = [
  resolve(dirname(fileURLToPath(import.meta.url)), "../.env"),
  resolve(process.cwd(), ".env"),
];
for (const path of candidates) {
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [k, ...v] = trimmed.split("=");
      const key = k.trim();
      if (env[key]) continue;
      env[key] = v.join("=").trim().replace(/^"|"$/g, "");
    }
    if (Object.keys(env).length > 0) break;
  } catch {
    // try next candidate
  }
}

function readEnv(name: string): string | undefined {
  return env[name] || process.env[name];
}

const STORE_DOMAIN =
  readEnv("SHOPIFY_STORE_DOMAIN") ??
  readEnv("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN") ??
  "cymbiotika.com";
const PUBLIC_DOMAIN = "cymbiotika.com";
const API_VERSION = "2024-01";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const FORCE = args.includes("--force");
const ONLY = args.find((a) => a.startsWith("--only="))?.slice("--only=".length).split(",").map((s) => s.trim()).filter(Boolean) ?? [];

// ---------- Auth ----------

async function getAdminToken(): Promise<string> {
  const staticToken = readEnv("SHOPIFY_ACCESS_TOKEN");
  if (staticToken) return staticToken;
  const key = readEnv("SHOPIFY_API_KEY");
  const secret = readEnv("SHOPIFY_API_SECRET");
  if (!key || !secret) {
    throw new Error("Missing Shopify creds (SHOPIFY_ACCESS_TOKEN or SHOPIFY_API_KEY+SECRET).");
  }
  const res = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: key,
      client_secret: secret,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed (${res.status}): ${await res.text()}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("No access_token in response.");
  return json.access_token;
}

// ---------- Shopify Admin product list ----------

type AdminProduct = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
};

async function listAdminProducts(token: string): Promise<AdminProduct[]> {
  const all: AdminProduct[] = [];
  let after: string | null = null;
  for (let page = 0; page < 30; page += 1) {
    const query = `
      query Products($after: String) {
        products(first: 100, after: $after) {
          pageInfo { hasNextPage endCursor }
          edges { node { id handle title descriptionHtml } }
        }
      }
    `;
    const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables: { after } }),
    });
    if (!res.ok) throw new Error(`List failed (${res.status}): ${await res.text()}`);
    const json = (await res.json()) as {
      data: {
        products: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          edges: Array<{ node: AdminProduct }>;
        };
      };
    };
    for (const edge of json.data.products.edges) all.push(edge.node);
    if (!json.data.products.pageInfo.hasNextPage) break;
    after = json.data.products.pageInfo.endCursor;
  }
  return all;
}

// ---------- Public storefront lookup ----------

type PublicProduct = {
  handle: string;
  title: string;
  body_html: string;
};

let publicCatalogCache: PublicProduct[] | null = null;
async function loadPublicCatalog(): Promise<PublicProduct[]> {
  if (publicCatalogCache) return publicCatalogCache;
  const all: PublicProduct[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const res = await fetch(`https://${PUBLIC_DOMAIN}/collections/all/products.json?limit=250&page=${page}`);
    if (!res.ok) break;
    const json = (await res.json()) as { products?: PublicProduct[] };
    if (!json.products || json.products.length === 0) break;
    all.push(...json.products);
    if (json.products.length < 250) break;
  }
  publicCatalogCache = all;
  return all;
}

function canonicalTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Hand-curated mappings for handles that don't pattern-match cleanly. Each
 * key is an admin handle on supplement-recommander; each value is the matching
 * cymbiotika.com public handle.
 */
const MANUAL_ALIASES: Record<string, string> = {
  "magnesium-l-threonate": "magnesium-complex",
  "b-complex": "b12",
  "vitamin-d3-k2": "d3",
  "l-theanine-gaba": "sleep",
  "zinc-elderberry": "liposomal-elderberry-defense",
  "omega-3-fish-oil": "the-omega",
  "shilajit-liquid-complex-2": "shilajit-liquid-complex",
  "vitamin-c-2": "vitamin-c",
  "glutathione-2": "glutathione",
};

/**
 * Try to find a matching public product for a given Shopify admin product.
 * Resolution order: manual alias → direct handle hit → handle alias rules → canonical-title match.
 */
async function findPublicMatch(admin: AdminProduct): Promise<PublicProduct | null> {
  const candidates = new Set<string>();

  // 1. Manual alias (highest priority)
  const manual = MANUAL_ALIASES[admin.handle];
  if (manual) candidates.add(manual);

  // 2. Direct handle hit
  candidates.add(admin.handle);

  // 3. Handle alias rules
  const stripped = admin.handle.replace(/^liposomal-/, "");
  if (stripped !== admin.handle) {
    candidates.add(stripped);
    candidates.add(`the-${stripped}`);
  }
  if (!admin.handle.startsWith("the-")) candidates.add(`the-${admin.handle}`);

  for (const handle of candidates) {
    try {
      const res = await fetch(`https://${PUBLIC_DOMAIN}/products/${handle}.json`);
      if (!res.ok) continue;
      const json = (await res.json()) as { product?: PublicProduct };
      if (json.product?.body_html) {
        return { handle, title: json.product.title, body_html: json.product.body_html };
      }
    } catch {
      // skip
    }
  }

  // 3. Canonical-title fallback against full public catalog
  const catalog = await loadPublicCatalog();
  const target = canonicalTitle(admin.title);
  const hit = catalog.find((p) => canonicalTitle(p.title) === target);
  if (hit?.body_html) return hit;

  // Loose match: drop "liposomal" / "the" tokens from both sides
  const fuzzy = (t: string) => canonicalTitle(t).replace(/\b(liposomal|the)\b/g, "").replace(/\s+/g, " ").trim();
  const target2 = fuzzy(admin.title);
  if (target2) {
    const fuzzyHit = catalog.find((p) => fuzzy(p.title) === target2);
    if (fuzzyHit?.body_html) return fuzzyHit;
  }

  return null;
}

// ---------- Heuristics ----------

function looksRich(html: string): boolean {
  const lower = html.toLowerCase();
  const hits = ["<h4>benefits", "<h4>description", "<h4>ingredients"].filter((t) => lower.includes(t)).length;
  return hits >= 2;
}

// ---------- Mutation ----------

async function updateDescription(token: string, productGid: string, descriptionHtml: string): Promise<void> {
  const mutation = `
    mutation ProductUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id handle }
        userErrors { field message }
      }
    }
  `;
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: mutation,
      variables: { input: { id: productGid, descriptionHtml } },
    }),
  });
  if (!res.ok) throw new Error(`productUpdate HTTP ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as {
    data?: { productUpdate?: { userErrors?: Array<{ field: string[]; message: string }> } };
    errors?: Array<{ message: string }>;
  };
  if (json.errors?.length) throw new Error(`GraphQL: ${json.errors.map((e) => e.message).join("; ")}`);
  const userErrors = json.data?.productUpdate?.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(`User errors: ${userErrors.map((e) => `${e.field?.join(".")} ${e.message}`).join("; ")}`);
  }
}

// ---------- Main ----------

async function main(): Promise<void> {
  console.log(`[enrich] Target store: ${STORE_DOMAIN}`);
  console.log(`[enrich] Public source: ${PUBLIC_DOMAIN}`);
  console.log(`[enrich] Mode: ${APPLY ? "APPLY (writes)" : "DRY RUN"}${FORCE ? " (force overwrite)" : ""}`);
  if (ONLY.length) console.log(`[enrich] Filter: handles=${ONLY.join(",")}`);

  const token = await getAdminToken();
  const products = await listAdminProducts(token);
  console.log(`[enrich] Loaded ${products.length} products from admin.`);

  let toUpdate = 0;
  let skippedRich = 0;
  let skippedFiltered = 0;
  let skippedNoMatch = 0;
  let written = 0;
  const failures: Array<{ handle: string; reason: string }> = [];

  for (const product of products) {
    if (ONLY.length && !ONLY.includes(product.handle)) {
      skippedFiltered += 1;
      continue;
    }
    if (!FORCE && looksRich(product.descriptionHtml ?? "")) {
      skippedRich += 1;
      continue;
    }
    const match = await findPublicMatch(product);
    if (!match) {
      skippedNoMatch += 1;
      console.log(`[skip:no-match] ${product.handle}  — no public match`);
      continue;
    }
    if (!APPLY) {
      const previewLen = match.body_html.length;
      const benefitMatch = match.body_html.match(/<h4[^>]*>Benefits<\/h4>[\s\S]*?<\/ul>/i);
      const benefitsHint = benefitMatch ? benefitMatch[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 140) : "(none)";
      console.log(`[plan] ${product.handle}  ←  ${PUBLIC_DOMAIN}/products/${match.handle}  (${previewLen} chars)`);
      console.log(`        benefits hint: ${benefitsHint}`);
      toUpdate += 1;
      continue;
    }
    try {
      await updateDescription(token, product.id, match.body_html);
      written += 1;
      console.log(`[ok] ${product.handle}  ←  ${match.handle}`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      failures.push({ handle: product.handle, reason });
      console.log(`[fail] ${product.handle}: ${reason}`);
    }
    // Small spacing to be polite to the public catalog endpoint.
    await new Promise((r) => setTimeout(r, 120));
  }

  console.log("");
  console.log(`[enrich] Summary:`);
  console.log(`  total admin products: ${products.length}`);
  console.log(`  skipped (filtered):   ${skippedFiltered}`);
  console.log(`  skipped (already rich): ${skippedRich}`);
  console.log(`  skipped (no match):   ${skippedNoMatch}`);
  if (APPLY) {
    console.log(`  written:              ${written}`);
    console.log(`  failures:             ${failures.length}`);
  } else {
    console.log(`  would update:         ${toUpdate}`);
    console.log(`(dry run — pass --apply to actually write)`);
  }
}

main().catch((err) => {
  console.error("[enrich] Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
