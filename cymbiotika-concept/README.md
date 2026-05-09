# Cymbiotika Concept Prototype

A high-fidelity, animated, headless-commerce prototype inspired by modern premium wellness UX patterns.

## Project Purpose

This project demonstrates a frontend-only commerce concept with:
- smooth animated homepage storytelling
- product detail experiences from local data
- protocol-builder recommendation flow
- quiz-driven protocol direction
- local cart drawer prototype
- public-data-safe product import script

This is a prototype and not a production storefront replacement.

## Stack

- Next.js App Router
- React + TypeScript (strict)
- Tailwind CSS
- Framer Motion
- Local JSON product data
- Zod for safe import parsing

## Setup

```bash
npm install
```

Optional environment variables:

```bash
SHOPIFY_STORE_DOMAIN=cymbiotika.com
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=cymbiotika.com
NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN=cymbiotika.com
```

## Run Dev Server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Import Public Product Data

```bash
npm run import:products -- liposomal-vitamin-c liposomal-glutathione magnesium-l-threonate
```

Behavior:
- checks `https://cymbiotika.com/robots.txt`
- fetches only public Shopify Ajax product JSON from `https://cymbiotika.com/products/{handle}.js`
- waits between requests
- normalizes output into local schema
- writes to `src/data/products.json`
- logs skipped/failed products

## Public-Data-Only Rules

Allowed:
- public pages
- public product JSON endpoints
- public product metadata

Not allowed:
- private APIs
- Shopify Admin API
- customer/account/order/subscription/checkout data
- authenticated endpoints
- hidden token extraction or bot bypassing

## Deployment

### Vercel Hobby

1. Push this repo to GitHub.
2. Import project in Vercel.
3. Framework preset: Next.js.
4. Build command: `npm run build`.
5. Output: default Next.js output.

### Cloudflare Pages

1. Connect repo in Cloudflare Pages.
2. Build command: `npm run build`.
3. Use Next.js Pages integration/workers adapter as needed.
4. Set Node compatibility flags per current Cloudflare Next.js guidance.

## Known Limitations

- cart state is local to this app session
- checkout redirects to Shopify cart permalink
- recommendations are rule-based tag matching
- science content includes placeholders and non-clinical narrative
- no real CMS, auth, analytics, or backend persistence

## Future Production Path

1. Replace local JSON with official Shopify Storefront API.
2. Add Sanity or Payload CMS for content modeling.
3. Add Supabase/Neon for quiz + customer preference storage.
4. Add official auth and customer identity flows.
5. Integrate real Shopify checkout/cart workflows.
6. Add analytics and event pipelines.
7. Add A/B testing + performance monitoring.

## Feature Status

Completed:
- animated homepage with hero, absorption explainer, best sellers, protocol preview, stat cards, science story, quiz CTA
- product detail route (`/products/[handle]`) with gallery, variant select, subscription toggle mock, add-to-cart, benefits, pairings, sticky mobile CTA
- protocol builder (`/protocol-builder`)
- quiz flow (`/quiz`)
- science storytelling page (`/science`)
- collections by goal (`/collections/[goal]`)
- animated local cart drawer with quantity, remove, subscription mock, free-shipping progress, add-on recommendation
- safe public-data import script

TODO:
- hook to real Shopify Storefront API
- add CMS-backed science/marketing content
- add persistent cart and customer sessions
- add real checkout and webhook pipelines
- add tests and production observability

## Assumptions

- prototype-first architecture is preferred over perfect content fidelity
- local starter product data is acceptable before live public import
- design direction prioritizes premium motion and responsive performance
