# Data architecture

Two strict data sources, no hardcoded content arrays in the application code.

| Data type | Source of truth | Service layer | Notes |
|-----------|-----------------|---------------|-------|
| Product catalog | Shopify Admin API | `src/lib/shopify-products.ts` | Catalog, variants, prices, descriptions, media, tags |
| Product reviews summary | Shopify metafields | `src/lib/shopify-products.ts` | `metafield(namespace: "reviews", key: "rating")` and `key: "reviewCount"` |
| 3D models | Shopify product media | `src/lib/shopify-products.ts` | `Model3d` media nodes |
| Blog articles | Sanity (`researchFeature`, `influencerExperience`, `protocolPlaybook`) | `src/lib/sanity-blog.ts` | Existing — don't change |
| Ingredient atlas | Sanity (`ingredient`) | `src/lib/sanity-ingredients.ts` | Schema lives in studio repo at `../product-website/schemaTypes/ingredient.ts` |
| Product reviews (quotes) | Sanity (`productReview`) | `src/lib/sanity-reviews.ts` | Schema lives in studio repo at `../product-website/schemaTypes/productReview.ts` |
| Editorial media (images/videos) | Sanity (`editorialMedia`) | `src/lib/sanity-media.ts` | Schema lives in studio repo at `../product-website/schemaTypes/editorialMedia.ts` |
| Product video clips | Sanity (`productVideo`) | `src/lib/sanity-media.ts` | Schema lives in studio repo at `../product-website/schemaTypes/productVideo.ts` |

## Conventions

1. **Service-layer-only.** Components must not import directly from `src/data/` for content. Pages fetch via the relevant `src/lib/*.ts` helper and pass data down as props.
2. **No seed fallbacks.** Sanity helpers return Sanity data or empty (`[]` / `{}`). If Sanity is unconfigured, components render their empty states. Seed migration is one-shot — once content lives in Sanity, the fallbacks are gone.
3. **`src/data/` holds types only.** `goals.ts`, `products.ts`, `blog-posts.ts` are pure type definitions. No content arrays.
4. **Add new content schemas to the studio first.** Each new content type requires a corresponding Sanity schema document at `../product-website/schemaTypes/<name>.ts`, registered in `schemaTypes/index.ts`.

## Remaining structural rules

Two maps live in [sanity-ingredients.ts](../src/lib/sanity-ingredients.ts): `PRODUCT_INGREDIENTS` and `TITLE_KEYWORDS`. These are **linkage rules** (which ingredient keys belong to which product), not seed content. They can move to a Shopify metafield (`ingredients.keys` per product) later, or to a `linkedProducts` field on the Sanity ingredient schema.

## Required env

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Defaults to `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | e.g., `2023-10-01` |
| `SANITY_API_READ_TOKEN` | Optional — required only if dataset is private |
| `SHOPIFY_STORE_DOMAIN` | e.g., `cymbiotika.com` |
| `SHOPIFY_ACCESS_TOKEN` | Or `SHOPIFY_API_KEY` + `SHOPIFY_API_SECRET` |

When env vars are missing the helpers return seed data, so dev can run offline.

## Sanity studio location

The studio is at the **sibling repo** [`../product-website`](../../product-website) (project ID `q4s63m5j`, dataset `production`).

Schemas live at `product-website/schemaTypes/` and are registered in `product-website/schemaTypes/index.ts`. Currently registered:

- `researchFeature`, `influencerExperience`, `protocolPlaybook` (existing — blog content)
- `ingredient`, `productReview`, `editorialMedia`, `productVideo` (added in this iteration)
- `author`, `category`, `blockContent` (existing — referenced shapes)

To deploy schema changes: `cd ../product-website && npm run deploy`.

The helpers in this Next.js app (`src/lib/sanity-*.ts`) read from those schemas via the GROQ API. While the four new schemas are **registered** in the studio, **content is not yet seeded** — the helpers fall back to inline seed data until ingredient / review / media documents are created in the studio.

## Migration scripts

`scripts/sync-blog-to-sanity.ts` — pushes seed blog posts to the studio. Still used; blog seeds remain in code as the source for that script.

The ingredient / review / media sync scripts have been deleted: their seed data was pushed into Sanity once and editing now happens in the studio dashboard.

## Required Shopify metafields

Each product in the Shopify shop should have:

| Namespace | Key | Type | Example |
|-----------|-----|------|---------|
| `reviews` | `rating` | number | `4.9` |
| `reviews` | `reviewCount` | number | `5471` |

Until these are populated, [shopify-products.ts](../src/lib/shopify-products.ts) falls back to a small per-handle map (`FALLBACK_INSIGHTS`) inside the file. Once metafields are populated for all products, the fallback can be deleted.
