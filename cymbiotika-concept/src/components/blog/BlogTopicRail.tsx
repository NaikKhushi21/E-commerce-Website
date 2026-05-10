"use client";

import { motion } from "framer-motion";
import { CATEGORIES, type Category } from "@/components/blog/blog-utils";

type BlogTopicRailProps = {
  category: Category;
  onChange: (next: Category) => void;
};

export function BlogTopicRail({ category, onChange }: BlogTopicRailProps) {
  return (
    <section className="sticky top-[70px] z-30 bg-transparent py-3">
      <div className="flex flex-wrap items-center gap-1.5 rounded-[1.4rem] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-elevated)_62%,transparent)] p-1 backdrop-blur-sm md:inline-flex md:flex-nowrap md:gap-2 md:rounded-full">
        {CATEGORIES.map((entry) => {
          const active = category === entry;
          return (
            <button
              key={entry}
              onClick={() => onChange(entry)}
              className="relative rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.14em] sm:text-xs md:px-4"
            >
              {active ? (
                <motion.span
                  layoutId="blog-topic-pill"
                  className="absolute inset-0 rounded-full bg-[var(--forest)]"
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              ) : null}
              <span
                className={`relative z-10 ${
                  active ? "text-[var(--on-primary)]" : "text-[var(--muted)] hover:text-[var(--forest)]"
                }`}
              >
                {entry}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
