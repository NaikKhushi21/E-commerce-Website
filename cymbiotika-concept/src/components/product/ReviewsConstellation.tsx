"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/products";
import type { Review } from "@/lib/sanity-reviews";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";

type Sentiment = "praise" | "considered" | "concerns";

const FILTERS: Array<{ key: "all" | Sentiment; label: string; count?: (revs: Review[]) => number }> = [
  { key: "all", label: "All" },
  { key: "praise", label: "Praise" },
  { key: "considered", label: "Considered" },
  { key: "concerns", label: "Concerns" },
];

function sentimentOf(r: Review): Sentiment {
  if (r.rating === 5) return "praise";
  if (r.rating === 4) return "considered";
  return "concerns";
}

const SENTIMENT_COLOR: Record<Sentiment, string> = {
  praise: "#8ce0d6",
  considered: "#d7c3a7",
  concerns: "#cbb8e8",
};

const r2 = (v: number) => Math.round(v * 100) / 100;

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function ReviewsConstellation({
  product,
  reviews,
}: {
  product: Product;
  reviews: Review[];
}) {
  const [filter, setFilter] = useState<"all" | Sentiment>("all");

  const VISIBLE_LIMIT = 3;
  const filtered = useMemo(() => {
    const pool = filter === "all" ? reviews : reviews.filter((r) => sentimentOf(r) === filter);
    return pool.slice(0, VISIBLE_LIMIT);
  }, [filter, reviews]);

  const counts = useMemo(() => {
    const c = { praise: 0, considered: 0, concerns: 0 };
    reviews.forEach((r) => {
      c[sentimentOf(r)] += 1;
    });
    return c;
  }, [reviews]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  // Stable per-review animation seeds
  const driftSeeds = useMemo(
    () =>
      reviews.reduce<Record<string, { duration: number; delay: number }>>(
        (acc, r) => {
          const h = hashStr(r.id);
          acc[r.id] = {
            duration: r2(7 + (h % 30) / 10),
            delay: r2(((h * 17) % 30) / 10),
          };
          return acc;
        },
        {},
      ),
    [reviews],
  );

  return (
    <section
      className="theme-aurora relative isolate overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[var(--bg)] p-7 md:p-12"
      aria-label="Reviews"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 50% at 70% 12%, rgba(140,224,214,0.06), transparent 58%), radial-gradient(60% 50% at 24% 88%, rgba(215,195,167,0.06), transparent 60%)",
        }}
      />

      <SectionHeader
        eyebrow="05 — Reviews Constellation"
        title="The community's verdict, one signal at a time."
        subhead="A few verified voices. Filter by sentiment to see what people lead with."
        right={
          <div>
            <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">
              Average rating
            </p>
            <p className="mt-2 font-display text-5xl text-[var(--text)]">
              {avgRating.toFixed(2)}
            </p>
            <p className="mt-1 text-eyebrow tracking-[0.1em] text-[var(--muted)]">
              {product.title}
            </p>
          </div>
        }
      />

      {/* Filters */}
      <div className="relative z-10 mt-8 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const color =
            f.key === "all" ? "#d7c3a7" : SENTIMENT_COLOR[f.key as Sentiment];
          const count =
            f.key === "all"
              ? reviews.length
              : counts[f.key as Sentiment];
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-eyebrow tracking-[0.1em] transition",
                active
                  ? "border-transparent bg-[var(--surface-elevated)] text-[var(--text)]"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]",
              )}
              style={active ? { boxShadow: `0 0 16px ${color}55` } : undefined}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: color, boxShadow: `0 0 8px ${color}` }}
              />
              {f.label}
              <span className="text-[var(--muted)]">· {count}</span>
            </button>
          );
        })}
      </div>

      {/* Constellation grid (CSS columns for designed scatter) */}
      <motion.div
        layout
        className="relative z-10 mt-8 [column-fill:_balance] sm:columns-2 lg:columns-3 [&>*]:break-inside-avoid"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((review, i) => {
            const sentiment = sentimentOf(review);
            const color = SENTIMENT_COLOR[sentiment];
            const seed = driftSeeds[review.id];
            return (
              <motion.article
                key={review.id}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.03,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative mb-4 rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-elevated)] p-5"
                style={{
                  boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
                }}
              >
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-[1.2rem] opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(60% 100% at 50% 0%, ${color}18, transparent 70%)`,
                  }}
                  animate={{
                    y: [-2, 2, -2],
                  }}
                  transition={{
                    duration: seed.duration,
                    delay: seed.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                    />
                    <p
                      className="text-eyebrow tracking-[0.1em]"
                      style={{ color }}
                    >
                      {review.tag}
                    </p>
                  </div>
                  <p className="text-[10px] tabular-nums text-[var(--muted)]">
                    {"★".repeat(review.rating)}
                    <span className="text-[var(--muted)]">
                      {"★".repeat(5 - review.rating)}
                    </span>
                  </p>
                </div>

                <p className="relative z-10 mt-3 text-[14px] leading-relaxed text-[var(--text)]">
                  &ldquo;{review.quote}&rdquo;
                </p>

                <p className="relative z-10 mt-4 text-eyebrow tracking-[0.1em] text-[var(--muted)]">
                  — {review.author}
                </p>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 ? (
        <p className="relative z-10 mt-8 text-center text-eyebrow tracking-[0.1em] text-[var(--muted)]">
          No reviews in this sentiment.
        </p>
      ) : null}
    </section>
  );
}
