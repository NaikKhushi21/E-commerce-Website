"use client";

import { motion } from "framer-motion";
import { CATEGORIES, type Category } from "@/components/blog/blog-utils";

type BlogTopicRailProps = {
  category: Category;
  onChange: (next: Category) => void;
};

export function BlogTopicRail({ category, onChange }: BlogTopicRailProps) {
  return (
    <section className="sticky top-[70px] z-30 -mx-5 bg-transparent px-5 py-3 md:-mx-12 md:px-12">
      <div data-lenis-prevent className="no-scrollbar overflow-x-auto">
        <div className="inline-flex min-w-full items-center gap-2 rounded-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-elevated)_62%,transparent)] p-1 backdrop-blur-sm">
          {CATEGORIES.map((entry) => {
            const active = category === entry;
            return (
              <button
                key={entry}
                onClick={() => onChange(entry)}
                className="relative rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em]"
              >
                {active ? (
                  <motion.span
                    layoutId="blog-topic-pill"
                    className="absolute inset-0 rounded-full bg-[var(--forest)]"
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : null}
                <span className={`relative z-10 ${active ? "text-[var(--on-primary)]" : "text-[var(--muted)] hover:text-[var(--forest)]"}`}>{entry}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
