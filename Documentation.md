
````md
# Project: Cymbiotika-Inspired Animated Headless Commerce Prototype

You are my coding agent. Build a $0-budget, high-performance, animated ecommerce prototype inspired by Cymbiotika’s current website, but with a much smoother, more premium, modern interaction style.

This is a frontend/prototype project only. Do not access private systems, customer data, admin APIs, checkout data, authenticated endpoints, or anything requiring credentials. Only use public website data and public Shopify product JSON endpoints when available.

## Core Goal

Create a modern Cymbiotika-style concept site that feels more premium, animated, fast, and dynamic than the current website.

The site should demonstrate:

- smooth transitions
- animated homepage sections
- product storytelling
- protocol/bundle builder
- product detail pages
- cart drawer prototype
- quiz/protocol recommendation flow
- public product data ingestion
- clean type-safe architecture

This is not a production replacement. It is a high-fidelity prototype that can later be connected to official Shopify, Sanity, and customer systems.

## Tech Stack

Use:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Framer Motion or Motion
- Prisma or Drizzle-style type-safe patterns
- Local JSON data first
- Optional Postgres later through Supabase Free or Neon Free
- Optional Sanity Free later for content
- Vercel Hobby or Cloudflare Pages for deployment

Do not require paid services.

## Important References

Use official docs and current best practices:

- Next.js App Router supports modern React features including Server Components, layouts, pages, and file-based routing.
- Shopify Ajax Product API supports fetching public product JSON by handle using `/products/{handle}.js`.
- Shopify Storefront API is the proper future production path for custom storefronts, products, collections, cart, and checkout, but it requires store access/tokens.
- Respect `robots.txt` before crawling. Robots.txt is the standard way sites communicate crawler preferences.

## Public Data Rules

Allowed:

- Fetch public pages.
- Fetch public product JSON such as:
  - `https://cymbiotika.com/products/{handle}.js`
- Read public sitemap URLs if available.
- Read public product pages.
- Cache public product metadata locally.
- Use product names, handles, prices, public images, descriptions, tags, variants, and availability if exposed publicly.

Not allowed:

- No customer data.
- No account data.
- No order data.
- No subscription data.
- No checkout scraping.
- No Shopify Admin API.
- No private Storefront API token discovery.
- No hidden token extraction.
- No bypassing bot protections.
- No high-rate scraping.
- No scraping disallowed paths.
- No authenticated endpoints.
- No copying the site 1:1 as a production clone.

## Data Ingestion Plan

Create a script that imports public product data safely.

### Step 1: Check crawler rules

Before fetching many URLs, check:

```txt
https://cymbiotika.com/robots.txt
````

If the relevant paths are disallowed, stop and use manually provided product handles instead.

### Step 2: Discover product handles

Try these sources in this order:

1. Public sitemap:

   ```txt
   https://cymbiotika.com/sitemap.xml
   ```

2. Public collection/product links from visible pages.

3. Manual starter handles if needed.

Do not aggressively crawl. Keep it small: 20–40 products max for prototype.

### Step 3: Fetch product JSON

For each product handle:

```txt
https://cymbiotika.com/products/{handle}.js
```

Example:

```bash
curl https://cymbiotika.com/products/liposomal-vitamin-c.js
```

Shopify documents this public Ajax product pattern as a way to fetch product JSON by product handle.

### Step 4: Normalize data

Convert Shopify-style product JSON into this local type:

```ts
export type Product = {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml?: string
  vendor?: string
  productType?: string
  tags: string[]
  price: number
  compareAtPrice?: number | null
  currency?: string
  featuredImage: string
  images: string[]
  available: boolean
  variants: ProductVariant[]
  benefits: string[]
  goals: WellnessGoal[]
}

export type ProductVariant = {
  id: string
  title: string
  price: number
  compareAtPrice?: number | null
  available: boolean
  sku?: string | null
}

export type WellnessGoal =
  | "energy"
  | "immunity"
  | "gut-health"
  | "brain-health"
  | "sleep"
  | "stress"
  | "skin"
  | "detox"
  | "longevity"
```

### Step 5: Store locally

Save normalized data to:

```txt
/src/data/products.json
```

Also generate:

```txt
/src/data/products.ts
```

with typed imports or helper functions.

## Project Structure

Create this structure:

```txt
src/
  app/
    page.tsx
    products/
      [handle]/
        page.tsx
    collections/
      [goal]/
        page.tsx
    quiz/
      page.tsx
    protocol-builder/
      page.tsx
    science/
      page.tsx
  components/
    layout/
      Header.tsx
      Footer.tsx
      AnimatedNav.tsx
    home/
      CinematicHero.tsx
      AbsorptionExplainer.tsx
      ClinicalStats.tsx
      GoalSelector.tsx
      BestSellers.tsx
      ScienceStory.tsx
    product/
      ProductCard.tsx
      ProductGallery.tsx
      ProductBenefits.tsx
      ProductSubscribeBox.tsx
      ProductPairings.tsx
    cart/
      CartDrawer.tsx
      CartLineItem.tsx
      FreeShippingProgress.tsx
    quiz/
      QuizFlow.tsx
      QuizQuestion.tsx
      QuizResults.tsx
    protocol/
      ProtocolBuilder.tsx
      ProtocolStack.tsx
      ProtocolProductCard.tsx
    motion/
      FadeIn.tsx
      Stagger.tsx
      MagneticButton.tsx
      SmoothReveal.tsx
  data/
    products.json
    products.ts
    goals.ts
  lib/
    product-utils.ts
    recommendations.ts
    money.ts
    safe-fetch.ts
  scripts/
    import-public-products.ts
```

## Pages To Build

### 1. Homepage

Build a premium animated homepage.

Sections:

1. Animated cinematic hero
2. Product/benefit navigation
3. “Why absorption matters” interactive section
4. Best sellers carousel
5. Protocol builder preview
6. Clinical proof/stat cards
7. Science/ingredient story section
8. Quiz CTA
9. Footer

Homepage style:

* premium wellness
* clean but cinematic
* smooth transitions
* warm gradients
* glassy cards where appropriate
* strong typography
* product imagery
* subtle parallax
* no janky scroll hijacking

### 2. Product Detail Page

Route:

```txt
/products/[handle]
```

Each PDP should include:

* product gallery
* title
* price
* variant selector if variants exist
* subscription toggle mock
* add-to-cart mock
* benefit chips
* ingredient/storytelling area
* “pairs well with” recommendations
* sticky mobile CTA
* animated cart drawer on add

### 3. Protocol Builder

Route:

```txt
/protocol-builder
```

Build an interactive protocol builder.

User selects wellness goals:

* Energy
* Immunity
* Gut Health
* Brain Health
* Sleep
* Stress
* Skin
* Detox
* Longevity

Then show:

* recommended morning stack
* recommended evening stack
* estimated monthly price
* animated product cards
* “add full protocol” mock button

Recommendation logic can be rule-based using product tags and goals.

### 4. Quiz Flow

Route:

```txt
/quiz
```

Build a smooth animated quiz.

Questions:

1. What are your top goals?
2. What time of day do you want support?
3. Are you looking for daily essentials or targeted support?
4. Do you prefer packets, capsules, liquids, or no preference?
5. Do you want a simple 2-product stack or complete protocol?

Then show animated result.

No real medical claims. Use wellness-oriented language.

### 5. Science Page

Route:

```txt
/science
```

Create a premium storytelling page explaining:

* absorption
* liposomal delivery
* ingredient quality
* clinical proof placeholders
* comparison cards

Do not make unsupported medical claims.

## Animation Requirements

Use animation intentionally.

Use:

* Framer Motion / Motion
* CSS transitions
* transform and opacity animations
* lazy-loaded heavy animation components
* reduced-motion support

Avoid:

* scroll hijacking
* animations that change layout constantly
* large unoptimized videos
* huge 3D scenes on mobile
* slow first load
* animation that blocks product browsing

Implement reusable motion components:

```tsx
<FadeIn />
<Stagger />
<MagneticButton />
<SmoothReveal />
```

All motion components must respect:

```css
@media (prefers-reduced-motion: reduce)
```

## Performance Requirements

Target:

* fast first load
* mobile-first
* no layout shift from animations
* optimized images
* lazy-load below-the-fold sections
* static generation where possible
* no paid analytics
* no unnecessary libraries

Use:

* `next/image`
* route-level code splitting
* dynamic import for heavy visual sections
* local JSON data
* minimal dependencies

## Design Direction

Inspired by:

* Seed.com for science storytelling and premium wellness feel
* Music/artist stores for bold campaign energy and motion
* Cymbiotika’s existing product/category language

But do not copy exact layouts, assets, or branding 1:1. Make an original concept.

Desired feeling:

* premium
* science-backed
* smooth
* modern
* editorial
* cinematic
* trustworthy
* fast

## Cart Drawer Prototype

Build a mock cart drawer using local state.

Features:

* add item
* remove item
* quantity stepper
* subscription toggle mock
* free shipping progress
* recommended add-on
* checkout button shown but not functional

No real checkout integration.

## Product Data Import Script

Create:

```txt
scripts/import-public-products.ts
```

It should:

1. Accept a list of handles.
2. Fetch `/products/{handle}.js`.
3. Wait between requests.
4. Normalize product data.
5. Save to `src/data/products.json`.
6. Log skipped/failed products.
7. Never fetch private/authenticated URLs.

Pseudo behavior:

```ts
const handles = [
  "liposomal-vitamin-c",
  "liposomal-glutathione",
  "magnesium-l-threonate"
]

for each handle:
  fetch(`https://cymbiotika.com/products/${handle}.js`)
  normalize
  wait 500-1000ms
write products.json
```

Add a clear comment:

```ts
/**
 * This script only fetches public Shopify Ajax product JSON.
 * It does not use private APIs, customer data, admin APIs, or authenticated endpoints.
 * Use for local prototyping only.
 */
```

## Recommendation Engine

Create:

```txt
src/lib/recommendations.ts
```

Implement:

```ts
getProductsByGoal(goal: WellnessGoal): Product[]
getRecommendedProtocol(goals: WellnessGoal[]): {
  morning: Product[]
  evening: Product[]
  targeted: Product[]
}
getPairings(product: Product): Product[]
```

Use simple tag matching first.

## Acceptance Criteria

The project is complete when:

* Next.js app runs locally.
* Homepage is animated and polished.
* Product pages work from local product data.
* Protocol builder works.
* Quiz flow works.
* Cart drawer works with local state.
* Product import script works for public product JSON.
* No paid service is required.
* No private data is accessed.
* Animations are smooth and respect reduced motion.
* Layout is responsive.
* Code is TypeScript strict.
* Components are clean and reusable.
* README explains setup and data import.

## Commands

Set up with:

```bash
npx create-next-app@latest cymbiotika-concept --ts --tailwind --eslint --app --src-dir
```

Install:

```bash
npm install framer-motion clsx tailwind-merge lucide-react
```

Optional:

```bash
npm install zod
```

Use Zod to validate imported product JSON if useful.

## README Requirements

The README must include:

* project purpose
* setup commands
* how to run dev server
* how to import product data
* public-data-only rules
* deployment instructions for Vercel Hobby or Cloudflare Pages
* known limitations
* future production path

Future production path:

1. Replace local JSON with official Shopify Storefront API.
2. Add Sanity or Payload CMS.
3. Add Supabase/Neon for quiz and customer preference storage.
4. Add official auth/customer identity.
5. Add real checkout through Shopify.
6. Add real analytics/events.
7. Add A/B testing and performance monitoring.

## Final Output Expected

Build the app and provide:

* complete code
* short setup instructions
* list of completed features
* list of remaining TODOs
* any assumptions made

```

---

A few source-backed notes you can keep with the prompt:

Shopify’s Ajax Product API officially supports fetching product JSON by handle using `/products/{handle}.js`, which is the cleanest no-token path for public product prototype data. :contentReference[oaicite:0]{index=0}

For a real production storefront, Shopify’s Storefront API is the right direction because it supports custom storefront commerce experiences including products, collections, carts, and checkout, but it requires proper store access. :contentReference[oaicite:1]{index=1}

Next.js App Router is a good fit because it supports the modern file-based app structure, layouts, pages, Server Components, and TypeScript setup through `create-next-app`. :contentReference[oaicite:2]{index=2}

The agent should respect `robots.txt`; Google’s crawler documentation describes fetching and parsing robots.txt before crawling to determine what may be crawled. :contentReference[oaicite:3]{index=3}
::contentReference[oaicite:4]{index=4}
```
