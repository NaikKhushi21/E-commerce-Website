"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Product } from "@/data/products";
import type { IngredientEntry } from "@/lib/sanity-ingredients";
import type { Review } from "@/lib/sanity-reviews";
import { formatMoney } from "@/lib/money";
import { SafeImage } from "@/components/ui/SafeImage";
import { ProductAskButton } from "@/components/product/ProductAskButton";
import { useCart } from "@/components/cart/CartProvider";

const ProductModelViewer = dynamic(
  () => import("@/components/ui/ProductModelViewer").then((m) => m.ProductModelViewer),
  { ssr: false, loading: () => <div className="h-full w-full bg-[var(--surface-elevated)]" /> },
);

const LiquidLab = dynamic(
  () => import("@/components/product/LiquidLab").then((m) => m.LiquidLab),
  { ssr: false, loading: () => <div className="h-[420px] w-full rounded-[2.4rem] bg-[var(--surface-elevated)]" /> },
);

const IngredientAtomizer = dynamic(
  () => import("@/components/product/IngredientAtomizer").then((m) => m.IngredientAtomizer),
  { loading: () => <div className="h-[400px] w-full rounded-[2.4rem] bg-[var(--surface-elevated)]" /> },
);

const ReviewsConstellation = dynamic(
  () => import("@/components/product/ReviewsConstellation").then((m) => m.ReviewsConstellation),
  { loading: () => <div className="h-[400px] w-full rounded-[2.4rem] bg-[var(--surface-elevated)]" /> },
);

const SubscriptionRitual = dynamic(
  () => import("@/components/product/SubscriptionRitual").then((m) => m.SubscriptionRitual),
  { loading: () => <div className="h-[300px] w-full rounded-[2.4rem] bg-[var(--surface-elevated)]" /> },
);

export function ProductDetailClient({
  product,
  ingredients,
  reviews,
}: {
  product: Product;
  ingredients: IngredientEntry[];
  reviews: Review[];
}) {
  const images = useMemo(() => (product.images.length > 0 ? product.images : [product.featuredImage]), [product]);
  const [active, setActive] = useState(images[0]);
  const { addItem, openCart } = useCart();

  return (
    <div className="space-y-20 pb-14 md:space-y-24">
      <div className="grid gap-9 lg:grid-cols-[0.58fr_0.42fr]">
        <section className="lg:self-start">
          <div className="relative h-[66svh] min-h-[520px] overflow-hidden rounded-[2.2rem] border border-[var(--line)] bg-[radial-gradient(circle_at_20%_20%,rgba(215,195,167,0.10)_0%,rgba(140,224,214,0.05)_45%,rgba(255,255,255,0.02)_100%)] shadow-[0_26px_90px_rgba(0,0,0,0.45)] md:h-[760px]">
            <div
              className="absolute inset-0"
              style={{
                viewTransitionName: `ph-${product.handle.replace(/[^a-z0-9]/gi, "-")}`,
              }}
            >
              <SafeImage src={active} alt={product.title} fill className="object-contain p-5 md:p-8" priority />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5 md:gap-3">
            {images.slice(0, 3).map((image) => (
              <button
                key={image}
                onClick={() => setActive(image)}
                className={`relative h-24 overflow-hidden rounded-[1rem] md:h-28 ${
                  active === image ? "ring-2 ring-[var(--forest)]" : "opacity-88 hover:opacity-100"
                }`}
              >
                <SafeImage src={image} alt={product.title} fill className="object-cover" />
              </button>
            ))}
          </div>

          {product.modelPath ? (
            <div className="mt-4 overflow-hidden rounded-[1.3rem] bg-[var(--surface-elevated)]">
              <div className="flex items-center justify-between px-4 py-3 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                <span>Interactive bottle</span>
                <span>drag to rotate</span>
              </div>
              <div className="h-[300px]">
                <ProductModelViewer src={product.modelPath} alt={`${product.title} 3D model`} poster={active} autoRotate={false} />
              </div>
            </div>
          ) : null}
        </section>

        <aside className="space-y-9 lg:pt-7">
          <div>
            <p className="micro-copy text-[var(--muted)]">Formula</p>
            <h1 className="display-title mt-3 text-5xl text-[var(--forest)] md:text-6xl">{product.title}</h1>
            <p className="body-copy mt-5 max-w-lg text-base md:text-lg">Daily cellular support designed for better nutrient uptake and consistent routine adherence.</p>
          </div>

          <div className="space-y-4">
            <p className="text-4xl text-[var(--forest)] md:text-5xl">{formatMoney(product.price, product.currency)}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  addItem(product);
                  openCart();
                }}
                className="w-full rounded-full bg-[var(--forest)] py-3 text-xs uppercase tracking-[0.14em] text-[var(--on-primary)] transition-transform duration-500 [transition-timing-function:var(--easing-premium)] hover:scale-[1.01] sm:w-auto sm:px-9"
              >
                Add to routine
              </button>
              <ProductAskButton
                product={product}
                label="Ask about this"
                className="w-full border border-[var(--line-strong)] bg-[var(--surface)] py-3 text-center text-[var(--forest)] sm:w-auto sm:px-6"
              />
            </div>
            <p className="text-sm text-[var(--muted)]">Free US shipping over $75. 30-day support guarantee.</p>
          </div>

          <div className="space-y-4 pt-1">
            <article>
              <p className="micro-copy text-[var(--muted)]">Benefits</p>
              <ul className="mt-3 space-y-2 text-base leading-relaxed text-[var(--forest)] md:text-lg">
                {product.benefits.slice(0, 4).map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </article>

            {product.datasetSource ? (
              <article className="space-y-1 text-sm text-[var(--muted)]">
                <p>Dataset source: {product.datasetSource}</p>
                {product.license ? <p>License: {product.license}</p> : null}
              </article>
            ) : null}

            {product.sourceUrl ? (
              <a href={product.sourceUrl} target="_blank" rel="noreferrer" className="inline-block text-sm text-[var(--forest)] underline underline-offset-4">
                View source asset
              </a>
            ) : null}
          </div>
        </aside>
      </div>

      <LiquidLab product={product} />

      <IngredientAtomizer product={product} ingredients={ingredients} />

      <ReviewsConstellation product={product} reviews={reviews} />

      <SubscriptionRitual product={product} />
    </div>
  );
}
