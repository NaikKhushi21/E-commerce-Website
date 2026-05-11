"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/products";
import type { WellnessGoal } from "@/data/goals";
import { ProductCard } from "@/components/product/ProductCard";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";

const GOAL_LABEL: Record<WellnessGoal, string> = {
  energy: "Energy",
  immunity: "Immunity",
  "gut-health": "Gut",
  "brain-health": "Mind",
  sleep: "Sleep",
  stress: "Calm",
  skin: "Skin",
  detox: "Detox",
  longevity: "Longevity",
};

const GOAL_COLOR: Record<WellnessGoal, string> = {
  energy: "#fba973",
  immunity: "#fbd5b5",
  "gut-health": "#8ce0d6",
  "brain-health": "#c8b8ff",
  sleep: "#9ec9ff",
  stress: "#cbb8e8",
  skin: "#f5d4a8",
  detox: "#a4c8ff",
  longevity: "#8ce0d6",
};

const ALL_GOALS: WellnessGoal[] = [
  "energy",
  "immunity",
  "sleep",
  "brain-health",
  "detox",
  "stress",
  "gut-health",
  "skin",
  "longevity",
];

type FilterKey = "all" | WellnessGoal;

type Props = {
  products: Product[];
};

export function ProductGridClient({ products }: Props) {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState(() => searchParams?.get("q") ?? "");

  // Sync the local search box when a new ?q= arrives (e.g. the user submits
  // the nav search again while already on /products).
  useEffect(() => {
    const next = searchParams?.get("q") ?? "";
    setSearch((prev) => (prev === next ? prev : next));
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      if (filter !== "all" && !(product.goals ?? []).includes(filter as WellnessGoal)) {
        return false;
      }
      if (q) {
        const haystack = [
          product.title,
          product.handle,
          product.description,
          ...(product.benefits ?? []),
          ...(product.ingredients ?? []),
          ...(product.tags ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [products, filter, search]);

  const isFiltered = filter !== "all" || search.trim().length > 0;

  function reset() {
    setFilter("all");
    setSearch("");
  }

  return (
    <div className="space-y-8">
      {/* Sticky filter rail */}
      <div className="sticky top-[68px] z-30 -mx-5 md:-mx-12">
        <div className="px-5 md:px-12">
          <div className="flex items-center gap-3 overflow-hidden rounded-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_82%,white)]/88 p-2.5">
            <div data-lenis-prevent className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto">
              <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
              {ALL_GOALS.map((g) => (
                <FilterChip
                  key={g}
                  label={GOAL_LABEL[g]}
                  active={filter === g}
                  color={GOAL_COLOR[g]}
                  onClick={() => setFilter(g)}
                />
              ))}
            </div>
            <div className="hidden h-8 w-px shrink-0 bg-[var(--line)] md:block" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ingredients, benefits…"
              className="hidden w-96 shrink-0 bg-transparent px-5 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] md:block"
              aria-label="Search formulas"
            />
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search ingredients, benefits…"
          className="h-11 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--line-strong)]"
          aria-label="Search formulas"
        />
      </div>

      {/* Live counter */}
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          {filtered.length} of {products.length} formula{products.length === 1 ? "" : "s"}
          {filter !== "all" ? ` · ${GOAL_LABEL[filter]}` : ""}
          {search.trim() ? ` · "${search.trim()}"` : ""}
        </p>
        {isFiltered ? (
          <button
            type="button"
            onClick={reset}
            className="text-xs uppercase tracking-[0.28em] text-[var(--muted)] transition hover:text-[var(--forest)]"
          >
            Reset
          </button>
        ) : null}
      </div>

      {/* Grid (or empty state) */}
      {filtered.length === 0 ? (
        <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">Empty zone</p>
          <p className="mt-3 text-base text-[var(--text)]">
            No formulas match the current filter.
          </p>
          <Pill variant="secondary" size="sm" className="mt-5" onClick={reset}>
            Reset filters
          </Pill>
        </div>
      ) : (
        <motion.section layout className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.section>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-6 py-2.5 text-xs uppercase tracking-[0.24em] transition",
        active
          ? "bg-[var(--primary)] text-[var(--on-primary)]"
          : "text-[var(--muted)] hover:text-[var(--forest)]",
      )}
      style={active && color ? { boxShadow: `0 0 18px ${color}66` } : undefined}
    >
      {label}
    </button>
  );
}
