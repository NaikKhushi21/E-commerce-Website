"use client";

import { useMemo, useState } from "react";
import type { ProductVideoClip } from "@/lib/sanity-media";
import { motion } from "framer-motion";
import { ProductCoverflowCarousel } from "@/components/home/ProductCoverflowCarousel";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "bottles", label: "Bottles" },
  { id: "capsules", label: "Capsules" },
  { id: "lab", label: "Lab" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export function InteractiveVideoReel({ clips: allClips }: { clips: ProductVideoClip[] }) {
  const [active, setActive] = useState<FilterId>("all");
  const clips = useMemo(
    () => (active === "all" ? allClips : allClips.filter((clip) => clip.category === active)),
    [active, allClips],
  );
  const initialIndex = Math.floor(clips.length / 2);

  return (
    <section className="space-y-8">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="micro-copy text-[var(--muted)]">Interactive Product Story</p>
          <h2 className="text-display mt-3 max-w-3xl text-[var(--forest)]">Discover formulas as objects, not tiles.</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActive(filter.id)}
              className={`relative overflow-hidden rounded-full px-4 py-2 text-eyebrow tracking-[0.1em] transition duration-500 [transition-timing-function:var(--easing-premium)] ${
                active === filter.id
                  ? "text-[var(--on-primary)]"
                  : "bg-[var(--surface-elevated)] text-[var(--forest)] hover:bg-[var(--forest)] hover:text-[var(--on-primary)]"
              }`}
            >
              {active === filter.id ? (
                <motion.span
                  layoutId="active-filter-pill"
                  className="absolute inset-0 rounded-full bg-[var(--forest)]"
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
              ) : null}
              <span className="relative z-10">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      <ProductCoverflowCarousel key={`swiper-${active}`} clips={clips} initialIndex={initialIndex} />
    </section>
  );
}
