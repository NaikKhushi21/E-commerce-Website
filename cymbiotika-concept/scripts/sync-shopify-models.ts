/**
 * Upload the 4 local .glb files in public/models/ to supplement-recommander
 * Shopify, then for every product:
 *   1. Delete any existing MODEL_3D media (cleans up old placeholders).
 *   2. Attach the .glb assigned by HANDLE_TO_MODEL or the deterministic fallback.
 *
 * Defaults to dry-run. Pass --apply to actually mutate Shopify.
 *
 * Usage:
 *   npx tsx scripts/sync-shopify-models.ts            # dry run
 *   npx tsx scripts/sync-shopify-models.ts --apply    # write changes
 *   npx tsx scripts/sync-shopify-models.ts --apply --only=vitamin-c,nad
 */

import { readFileSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

// ---------- Env loading (no external deps) ----------

const env: Record<string, string> = {};
{
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
}

function readEnv(name: string): string | undefined {
  return env[name] || process.env[name];
}

const STORE_DOMAIN =
  readEnv("SHOPIFY_STORE_DOMAIN") ??
  readEnv("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN") ??
  "cymbiotika.com";
const API_VERSION = "2024-01";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const ONLY = args
  .find((a) => a.startsWith("--only="))
  ?.slice("--only=".length)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean) ?? [];

// ---------- Mapping (mirrors src/lib/shopify-products.ts) ----------

const MODEL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../public/models");
const LOCAL_MODEL_POOL = [
  "vitamin-c.glb",
  "colestrum.glb",
  "glutathione_left.glb",
  "seamoss_left.glb",
];
const HANDLE_TO_MODEL: Record<string, string> = {
  "vitamin-c": "vitamin-c.glb",
  "liposomal-vitamin-c": "vitamin-c.glb",
  "vitamin-c-2": "vitamin-c.glb",
  "liquid-colostrum": "colestrum.glb",
  glutathione: "glutathione_left.glb",
  "glutathione-2": "glutathione_left.glb",
};

function hashHandle(handle: string): number {
  let h = 0;
  for (let i = 0; i < handle.length; i += 1) {
    h = (h * 31 + handle.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickModelFile(handle: string): string {
  return HANDLE_TO_MODEL[handle] ?? LOCAL_MODEL_POOL[hashHandle(handle) % LOCAL_MODEL_POOL.length];
}

// ---------- Auth ----------

async function getAdminToken(): Promise<string> {
  const staticToken = readEnv("SHOPIFY_ACCESS_TOKEN");
  if (staticToken) return staticToken;
  const key = readEnv("SHOPIFY_API_KEY");
  const secret = readEnv("SHOPIFY_API_SECRET");
  if (!key || !secret) {
    throw new Error("Missing Shopify creds.");
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

async function graphql<T>(token: string, query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) throw new Error(`GraphQL: ${json.errors.map((e) => e.message).join("; ")}`);
  if (!json.data) throw new Error("GraphQL returned empty data.");
  return json.data;
}

// ---------- Product list ----------

type ProductMedia = {
  id: string;
  mediaContentType: string;
};

type AdminProduct = {
  id: string;
  handle: string;
  title: string;
  media: ProductMedia[];
};

type ProductsPageResponse = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    edges: Array<{
      node: {
        id: string;
        handle: string;
        title: string;
        media: { nodes: Array<{ id: string; mediaContentType: string }> };
      };
    }>;
  };
};

async function listProducts(token: string): Promise<AdminProduct[]> {
  const all: AdminProduct[] = [];
  let after: string | null = null;
  for (let page = 0; page < 30; page += 1) {
    const data: ProductsPageResponse = await graphql<ProductsPageResponse>(
      token,
      `query Products($after: String) {
        products(first: 100, after: $after) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              id handle title
              media(first: 50) { nodes { id mediaContentType } }
            }
          }
        }
      }`,
      { after },
    );
    for (const edge of data.products.edges) {
      all.push({
        id: edge.node.id,
        handle: edge.node.handle,
        title: edge.node.title,
        media: edge.node.media.nodes,
      });
    }
    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
  }
  return all;
}

// ---------- Staged upload ----------

type StagedTarget = {
  url: string;
  resourceUrl: string;
  parameters: Array<{ name: string; value: string }>;
};

async function stageUpload(token: string, filename: string, fileSize: number): Promise<StagedTarget> {
  const data = await graphql<{
    stagedUploadsCreate: {
      stagedTargets: StagedTarget[];
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }>(
    token,
    `mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    {
      input: [
        {
          resource: "MODEL_3D",
          filename,
          mimeType: "model/gltf-binary",
          fileSize: String(fileSize),
          httpMethod: "POST",
        },
      ],
    },
  );
  if (data.stagedUploadsCreate.userErrors.length > 0) {
    throw new Error(
      `stagedUploadsCreate: ${data.stagedUploadsCreate.userErrors.map((e) => e.message).join("; ")}`,
    );
  }
  const target = data.stagedUploadsCreate.stagedTargets[0];
  if (!target) throw new Error("No staged target returned.");
  return target;
}

async function uploadToStaged(target: StagedTarget, fileBuffer: Buffer, filename: string): Promise<void> {
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append("file", new Blob([new Uint8Array(fileBuffer)], { type: "model/gltf-binary" }), filename);
  const res = await fetch(target.url, { method: "POST", body: form });
  if (!res.ok && res.status !== 201 && res.status !== 204) {
    throw new Error(`Staged upload failed (${res.status}): ${await res.text()}`);
  }
}

// ---------- Media mutations ----------

async function deleteMedia(token: string, productId: string, mediaIds: string[]): Promise<void> {
  if (mediaIds.length === 0) return;
  const data = await graphql<{
    productDeleteMedia: {
      deletedMediaIds: string[];
      mediaUserErrors: Array<{ field: string[]; message: string }>;
    };
  }>(
    token,
    `mutation ProductDeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
      productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
        deletedMediaIds
        mediaUserErrors { field message }
      }
    }`,
    { productId, mediaIds },
  );
  if (data.productDeleteMedia.mediaUserErrors.length > 0) {
    throw new Error(
      `productDeleteMedia: ${data.productDeleteMedia.mediaUserErrors.map((e) => e.message).join("; ")}`,
    );
  }
}

async function createModelMedia(
  token: string,
  productId: string,
  resourceUrl: string,
  alt: string,
): Promise<void> {
  const data = await graphql<{
    productCreateMedia: {
      mediaUserErrors: Array<{ field: string[]; message: string }>;
    };
  }>(
    token,
    `mutation ProductCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { id mediaContentType status }
        mediaUserErrors { field message }
      }
    }`,
    {
      productId,
      media: [
        {
          originalSource: resourceUrl,
          mediaContentType: "MODEL_3D",
          alt,
        },
      ],
    },
  );
  if (data.productCreateMedia.mediaUserErrors.length > 0) {
    throw new Error(
      `productCreateMedia: ${data.productCreateMedia.mediaUserErrors.map((e) => e.message).join("; ")}`,
    );
  }
}

// ---------- Main ----------

async function main(): Promise<void> {
  console.log(`[sync] Target store: ${STORE_DOMAIN}`);
  console.log(`[sync] Mode: ${APPLY ? "APPLY (writes)" : "DRY RUN"}`);

  // Read .glb files from disk
  const fileBuffers = new Map<string, Buffer>();
  for (const filename of LOCAL_MODEL_POOL) {
    const path = resolve(MODEL_DIR, filename);
    const buf = readFileSync(path);
    fileBuffers.set(filename, buf);
    console.log(`[sync] loaded ${filename}  (${(buf.length / (1024 * 1024)).toFixed(2)} MB)`);
  }

  const token = await getAdminToken();
  const products = await listProducts(token);
  console.log(`[sync] Loaded ${products.length} products.`);

  // Build the per-product plan
  const plan = products
    .filter((p) => ONLY.length === 0 || ONLY.includes(p.handle))
    .map((p) => {
      const targetFile = pickModelFile(p.handle);
      const existingModelIds = p.media.filter((m) => m.mediaContentType === "MODEL_3D").map((m) => m.id);
      return { product: p, targetFile, existingModelIds };
    });

  console.log("");
  console.log(`[sync] Plan (${plan.length} products):`);
  for (const entry of plan) {
    const explicit = HANDLE_TO_MODEL[entry.product.handle] ? "[match]" : "[rand]";
    console.log(
      `  ${explicit} ${entry.product.handle.padEnd(36)} ← ${entry.targetFile}  ` +
        `(delete ${entry.existingModelIds.length} existing)`,
    );
  }

  if (!APPLY) {
    console.log("");
    console.log("(dry run — pass --apply to upload + attach)");
    return;
  }

  // For each product: stage + upload fresh, then delete existing + attach new.
  // Shopify's productCreateMedia consumes the staged URL; the same staged URL
  // cannot be reused for a second product (returns "duplicate external_model3d_id").
  // So we pay the upload cost per product. ~14MB average × 28 products ≈ 400MB total.
  console.log("");
  console.log("[sync] Staging + attaching per product…");
  let success = 0;
  const failures: Array<{ handle: string; reason: string }> = [];

  for (const entry of plan) {
    const { product, targetFile, existingModelIds } = entry;
    try {
      const buf = fileBuffers.get(targetFile)!;
      const target = await stageUpload(token, basename(targetFile), buf.length);
      await uploadToStaged(target, buf, basename(targetFile));

      if (existingModelIds.length > 0) {
        await deleteMedia(token, product.id, existingModelIds);
      }
      await createModelMedia(token, product.id, target.resourceUrl, `${product.title} 3D model`);
      success += 1;
      console.log(`  [ok] ${product.handle}  ←  ${targetFile}`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      failures.push({ handle: product.handle, reason });
      console.log(`  [fail] ${product.handle}: ${reason}`);
    }
    // small spacing to keep Shopify happy
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log("");
  console.log(`[sync] Done. attached: ${success}  failed: ${failures.length}`);
  if (failures.length > 0) {
    for (const f of failures) console.log(`  - ${f.handle}: ${f.reason}`);
  }
  console.log("");
  console.log(
    "Note: MODEL_3D media is processed asynchronously by Shopify. Newly attached models may take a few minutes to finish processing before they render on the live storefront.",
  );
}

main().catch((err) => {
  console.error("[sync] Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
