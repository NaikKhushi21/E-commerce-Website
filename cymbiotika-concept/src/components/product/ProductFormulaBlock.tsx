"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/products";
import type { WellnessGoal } from "@/data/goals";
import { BotanicalAccent } from "@/components/product/BotanicalAccent";
import { cn } from "@/lib/cn";

type Botanical = { src: string; subject: string; credit: string };

function pickBotanical(
  goals: WellnessGoal[] | undefined,
  map: Partial<Record<WellnessGoal, Botanical>> | undefined,
): Botanical | null {
  if (!map) return null;
  const goal = goals?.[0] ?? "longevity";
  return map[goal] ?? map.longevity ?? null;
}

const VISIBLE_PARAGRAPHS = 1;

/**
 * Editorial "About this formula" band shown below the hero. Pairs a
 * photographic botanical image with the product's long-form description.
 * Benefits, how-to-use, and ingredients now live in the buy panel above
 * (see {@link ProductBuyPanel}).
 */
export function ProductFormulaBlock({
  product,
  botanicalMap,
}: {
  product: Product;
  botanicalMap?: Partial<Record<WellnessGoal, Botanical>>;
}) {
  const [expanded, setExpanded] = useState(false);
  const descriptionRich = product.descriptionRich ?? [];

  if (descriptionRich.length === 0) return null;

  const botanical = pickBotanical(product.goals, botanicalMap);
  const visibleDescription = expanded ? descriptionRich : descriptionRich.slice(0, VISIBLE_PARAGRAPHS);
  const hiddenCount = Math.max(0, descriptionRich.length - VISIBLE_PARAGRAPHS);

  return (
    <section
      className="relative isolate overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[var(--surface)]"
      aria-label="About this formula"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(85% 60% at 12% 8%, rgba(229,183,115,0.10), transparent 55%), radial-gradient(60% 50% at 92% 100%, rgba(155,211,194,0.10), transparent 60%)",
        }}
      />
      <BotanicalAccent
        goals={product.goals}
        className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 text-[var(--accent)] opacity-[0.10] md:-right-6 md:-top-6 md:h-96 md:w-96"
      />
      <BotanicalAccent
        goals={product.goals}
        variant="leaf"
        className="pointer-events-none absolute -bottom-12 -left-10 h-56 w-56 text-[var(--accent-mint)] opacity-[0.10] md:-bottom-8 md:-left-6 md:h-72 md:w-72"
      />

      {/* Two-column band — photo left, text right — feels like a magazine spread. */}
      <div
        className={cn(
          "relative grid items-stretch gap-0",
          botanical ? "md:grid-cols-[0.42fr_0.58fr]" : "md:grid-cols-1",
        )}
      >
        {botanical ? (
          <figure className="relative h-[260px] overflow-hidden md:h-auto md:min-h-[420px]">
            <Image
              src={botanical.src}
              alt={`${botanical.subject} — botanical imagery related to ${product.title}`}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.0) 70%, var(--surface) 100%)",
              }}
            />
            <figcaption className="absolute bottom-3 left-4 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/85 backdrop-blur-md">
              <span className="h-1 w-1 rounded-full bg-[var(--accent-soft)]" />
              {botanical.subject}
            </figcaption>
          </figure>
        ) : null}

        <div className="relative px-7 py-9 md:px-10 md:py-12">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-[var(--accent)]" />
            <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--muted)]">About this formula</p>
          </div>

          <div className="mt-5 space-y-5 text-base leading-relaxed text-[var(--forest)] md:text-lg">
            {visibleDescription.map((paragraph, idx) => (
              <p
                key={idx}
                className={cn(
                  idx === 0 &&
                    "first-letter:font-display first-letter:text-5xl first-letter:font-medium first-letter:leading-[0.95] first-letter:mr-2 first-letter:float-left first-letter:mt-1 first-letter:text-[var(--forest)]",
                )}
              >
                {paragraph}
              </p>
            ))}

            <AnimatePresence initial={false}>
              {expanded && descriptionRich.length > VISIBLE_PARAGRAPHS ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                  aria-hidden={!expanded}
                />
              ) : null}
            </AnimatePresence>
          </div>

          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--surface-elevated)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--forest)] transition hover:bg-[var(--accent-soft)]/40"
              aria-expanded={expanded}
            >
              {expanded ? "Show less" : "Read more"}
              <span aria-hidden="true" className={cn("transition-transform", expanded ? "rotate-180" : "")}>
                ⌄
              </span>
            </button>
          ) : null}

          {botanical?.credit ? (
            <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]/70">
              Botanical photo · {botanical.credit}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
