"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { formatMoney } from "@/lib/money";
import { SafeImage } from "@/components/ui/SafeImage";
import { ProductModelViewer } from "@/components/ui/ProductModelViewer";
import { useCart } from "@/components/cart/CartProvider";
import { ProductAskButton } from "@/components/product/ProductAskButton";

type Props = {
  product: Product;
  index?: number;
  rotateModelOnHover?: boolean;
};

const STAGE_TONES = [
  "radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.92)_0%,rgba(234,232,224,0.42)_38%,transparent_70%)",
  "radial-gradient(circle_at_52%_24%,rgba(255,255,255,0.9)_0%,rgba(219,228,229,0.44)_40%,transparent_72%)",
  "radial-gradient(circle_at_46%_24%,rgba(255,255,255,0.9)_0%,rgba(235,218,201,0.4)_42%,transparent_72%)",
  "radial-gradient(circle_at_48%_28%,rgba(255,255,255,0.88)_0%,rgba(221,226,215,0.44)_40%,transparent_72%)",
];

export function ProductCard({ product, index = 0, rotateModelOnHover = false }: Props) {
  const { addItem } = useCart();
  const images = useMemo(() => (product.images.length > 0 ? product.images : [product.featuredImage]), [product]);
  const [modelRotating, setModelRotating] = useState(false);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const hasModel = Boolean(product.modelPath);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const image = images[0] ?? product.featuredImage ?? "";
  const shouldRenderModel = hasModel && isNearViewport;
  const benefit = product.benefits[0] ?? product.description;
  const stageTone = STAGE_TONES[index % STAGE_TONES.length];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasModel) return;

    const node = mediaRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setIsNearViewport(entry.isIntersecting), {
      root: null,
      rootMargin: "300px 0px",
      threshold: 0.01,
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasModel]);

  function handleEnter() {
    if (hasModel && rotateModelOnHover) setModelRotating(true);
  }

  function handleLeave() {
    if (hasModel && rotateModelOnHover) setModelRotating(false);
  }

  return (
    <article
      className="group relative min-h-[520px] overflow-hidden rounded-[2.25rem] border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] shadow-[0_8px_28px_rgba(28,39,48,0.06)] transition duration-700 [transition-timing-function:var(--easing-premium)] hover:-translate-y-2 hover:bg-[var(--surface-elevated)] hover:border-[var(--line-strong)] hover:shadow-[0_16px_40px_rgba(28,39,48,0.10)]"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: stageTone }} />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, dustIndex) => (
          <span
            key={dustIndex}
            className="museum-dust absolute h-1 w-1 rounded-full bg-white/55 shadow-[0_0_14px_rgba(255,255,255,0.55)]"
            style={{
              left: `${(dustIndex * 17 + index * 11) % 96}%`,
              top: `${(dustIndex * 29 + 9) % 88}%`,
              animationDelay: `${dustIndex * 0.24}s`,
              animationDuration: `${12 + (dustIndex % 4) * 3}s`,
            }}
          />
        ))}
      </div>

      <div ref={mediaRef} className="relative flex h-[385px] items-center justify-center px-6 pt-12">
        <div className="museum-object relative h-full w-full max-w-[310px]">
          <div className="museum-object-spin relative h-full w-full">
            {/* Skeleton — visible until the model or image actually paints.
                Fades out once mediaReady flips, so the model/image arrives
                without an intermediate "image first, then model" flash. */}
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 [transition-timing-function:var(--easing-premium)]"
              style={{ opacity: mediaReady ? 0 : 1 }}
              aria-hidden="true"
            >
              <div className="h-3/5 w-3/5 animate-pulse rounded-[2rem] bg-[linear-gradient(135deg,#f0e8d8_0%,#e3dccd_55%,#d2cdbf_100%)]" />
            </div>

            {hasModel && product.modelPath ? (
              shouldRenderModel ? (
                <div
                  className="absolute inset-0 transition-opacity duration-500 [transition-timing-function:var(--easing-premium)]"
                  style={{ opacity: mediaReady ? 1 : 0 }}
                >
                  <ProductModelViewer
                    src={product.modelPath}
                    alt={`${product.title} 3D model`}
                    autoRotate={modelRotating}
                    className="h-full w-full"
                    onLoaded={() => setMediaReady(true)}
                  />
                </div>
              ) : null
            ) : image ? (
              <div
                className="absolute inset-0 transition-opacity duration-500 [transition-timing-function:var(--easing-premium)]"
                style={{
                  viewTransitionName: `ph-${product.handle.replace(/[^a-z0-9]/gi, "-")}`,
                  opacity: mediaReady ? 1 : 0,
                }}
              >
                <SafeImage
                  src={image}
                  alt={product.title}
                  fill
                  className="object-contain p-2 drop-shadow-[0_34px_48px_rgba(20,20,20,0.18)] transition duration-700 [transition-timing-function:var(--easing-premium)] group-hover:scale-[1.045]"
                  onLoad={() => setMediaReady(true)}
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">Media unavailable</div>
            )}
          </div>
        </div>
      </div>

      {/* Whole-card tap target → product detail. Sits above the gradient/dust
          but below the info panel so the buttons inside the panel still work. */}
      <Link
        href={`/products/${product.handle}`}
        className="absolute inset-0 z-[1]"
        aria-label={`Open ${product.title}`}
      />

      <div className="absolute inset-x-0 bottom-0 z-[2] p-4 md:p-6">
        <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-elevated)] p-4 shadow-[0_10px_28px_rgba(28,39,48,0.10)] transition duration-700 [transition-timing-function:var(--easing-premium)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="micro-copy text-[var(--muted)]">Museum Object {String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 line-clamp-2 text-xl leading-tight text-[var(--text)] md:text-3xl md:leading-none">{product.title}</h3>
            </div>
            <p className="whitespace-nowrap text-sm text-[var(--muted)]">{formatMoney(product.price, product.currency)}</p>
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{benefit}</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => addItem(product)}
              className="rounded-full bg-[var(--primary)] px-4 py-2.5 text-xs uppercase tracking-[0.14em] text-[var(--on-primary)] transition duration-500 [transition-timing-function:var(--easing-premium)] hover:scale-[1.02]"
            >
              Add
            </button>
            <ProductAskButton product={product} />
            <Link
              href={`/products/${product.handle}`}
              className="rounded-full border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-2.5 text-xs uppercase tracking-[0.14em] text-[var(--text)] transition duration-500 [transition-timing-function:var(--easing-premium)] hover:bg-[var(--surface-elevated)]"
            >
              Study
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
