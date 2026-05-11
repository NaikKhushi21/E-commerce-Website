# Cymbiotika Concept

A high-fidelity, animated, headless-commerce concept storefront for Cymbiotika. Live data from Shopify (catalog, media, 3D models) and Sanity (editorial, ingredients, reviews, goal artwork). Includes an in-page AI concierge ("Cymborg") and an interactive 3D bottle viewer.

## Stack

- Next.js 16 (App Router, Webpack)
- React 19 + TypeScript strict
- Tailwind CSS v4
- Framer Motion + Lenis smooth scroll
- Three.js + `@google/model-viewer` for product 3D
- D3 (force, scale), Swiper, Zod
- Shopify Admin GraphQL — raw `fetch` (no `@shopify/*` SDK)
- Sanity — raw `fetch` GROQ (no `@sanity/client` SDK)

## Setup

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev            # http://localhost:3000
```

### Environment

| Variable                                     | Purpose                                                             |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`         | Shopify Admin domain (e.g.`supplement-recommander.myshopify.com`) |
| `NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN`      | Storefront domain used for cart permalinks                          |
| `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET` | Admin OAuth client credentials                                      |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`            | Sanity project ID                                                   |
| `NEXT_PUBLIC_SANITY_DATASET`               | Defaults to `production`                                          |
| `NEXT_PUBLIC_SANITY_API_VERSION`           | e.g.`2023-10-01`                                                  |
| `SANITY_API_READ_TOKEN`                    | Required only if dataset is private                                 |
| `SANITY_API_WRITE_TOKEN`                   | Required by content-sync scripts                                    |
| `OPENROUTER_API_KEY`                       | Powers the `/api/concierge` and `/api/product-ask` routes       |

Helpers in `src/lib/*` return empty arrays/objects when env is missing, so the UI renders graceful empty states offline.

## Scripts

```bash
npm run dev               # next dev (Webpack)
npm run build             # next build
npm run start             # next start
npm run lint              # eslint
npm run enrich:shopify    # backfill Shopify product descriptionHtml from cymbiotika.com
```

## Architecture

Two sources of truth, no hardcoded content arrays in app code:

| Data                                                                             | Source                                        | Service                           |
| -------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------- |
| Catalog, variants, prices, media, 3D models, review metafields                   | Shopify Admin                                 | `src/lib/shopify-products.ts`   |
| Blog posts (`researchFeature`, `influencerExperience`, `protocolPlaybook`) | Sanity                                        | `src/lib/sanity-blog.ts`        |
| Ingredients                                                                      | Sanity (`ingredient`)                       | `src/lib/sanity-ingredients.ts` |
| Product reviews                                                                  | Sanity (`productReview`)                    | `src/lib/sanity-reviews.ts`     |
| Editorial media + product videos                                                 | Sanity (`editorialMedia`, `productVideo`) | `src/lib/sanity-media.ts`       |
| Goal artwork (botanical photography per wellness goal)                           | Sanity (`goalArtwork`)                      | `src/lib/sanity-goal-art.ts`    |

`src/data/` holds **types only** (`goals.ts`, `products.ts`, `blog-posts.ts`) — no content. See [docs/data-architecture.md](docs/data-architecture.md) for the full contract.

The Sanity Studio lives at the sibling repo [`../product-website`](../product-website) (project ID `q4s63m5j`). Schemas under `product-website/schemaTypes/`; deploy with `cd ../product-website && npm run deploy`.

## Routes

- `/` — home (hero, best sellers, absorption explainer, video reel, reviews, blog teasers)
- `/products` — catalog
- `/products/[handle]` — product detail with 3D model, ingredient atomizer, reviews constellation, subscription mock
- `/collections/[goal]` — wellness-goal collections
- `/quiz` — routine quiz flow
- `/science` — long-form science storytelling
- `/blog` and `/blog/[slug]`
- `/api/concierge`, `/api/product-ask` — OpenRouter-backed AI endpoints

The Cymborg concierge launcher is mounted in `app/layout.tsx` and floats on every route.

## Known scope

- Cart is a local-session prototype; checkout redirects to a Shopify cart permalink.
- No auth, customer accounts, or persistent quiz state.
- Recommendations are rule-based tag + goal matching.
