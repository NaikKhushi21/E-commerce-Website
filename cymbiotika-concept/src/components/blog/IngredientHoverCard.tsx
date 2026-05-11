"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { IngredientEntry } from "@/lib/sanity-ingredients";
import { CATEGORY_COLOR } from "@/lib/sanity-ingredients";

export function IngredientHoverCard({
  slug,
  entry,
  children,
}: {
  slug: string;
  entry?: IngredientEntry;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!entry) {
    return (
      <Link
        href={`/science#${slug}`}
        className="rounded-[0.25rem] bg-[rgba(215,195,167,0.16)] px-1 text-[var(--forest)] underline decoration-dotted underline-offset-4 transition-colors hover:bg-[rgba(215,195,167,0.28)]"
      >
        {children}
      </Link>
    );
  }

  const color = CATEGORY_COLOR[entry.category];

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="rounded-[0.25rem] px-1 text-[var(--forest)] underline decoration-dotted underline-offset-[5px] transition-colors hover:bg-[rgba(215,195,167,0.18)]"
        style={{
          textDecorationColor: color,
          background: `${color}1a`,
        }}
        aria-expanded={open}
        aria-label={`Ingredient: ${entry.name}`}
      >
        {children}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-full z-40 mt-2 block w-[300px] -translate-x-1/2 rounded-[1rem] border border-[var(--line)] bg-[var(--surface-elevated)] p-4 text-left shadow-[0_22px_50px_rgba(0,0,0,0.22)]"
          >
            <span className="flex items-center gap-2">
              <span
                className="block h-1.5 w-1.5 rounded-full"
                style={{ background: color, boxShadow: `0 0 8px ${color}` }}
              />
              <span
                className="font-mono text-eyebrow tracking-[0.1em]"
                style={{ color }}
              >
                {entry.category}
              </span>
            </span>

            <span className="mt-2 block text-[15px] leading-tight text-[var(--forest)]">
              {entry.name}
            </span>

            <span className="mt-1.5 block text-[12px] leading-relaxed text-[var(--muted)]">
              {entry.function}
            </span>

            {entry.dose ? (
              <span className="mt-2 block text-eyebrow tracking-[0.1em] text-[var(--muted)]">
                Dose · <span className="text-[var(--forest)]">{entry.dose}</span>
              </span>
            ) : null}

            {entry.synergies && entry.synergies.length > 0 ? (
              <span className="mt-3 flex flex-wrap gap-1">
                {entry.synergies.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-[var(--line)] px-2 py-0.5 text-eyebrow tracking-[0.1em] text-[var(--muted)]"
                  >
                    {s.replace(/-/g, " ")}
                  </span>
                ))}
              </span>
            ) : null}

            <Link
              href={`/science#${slug}`}
              className="mt-3 block text-eyebrow tracking-[0.1em] text-[var(--forest)] underline underline-offset-4"
            >
              Open atlas →
            </Link>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
