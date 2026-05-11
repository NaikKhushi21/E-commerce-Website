"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/cn";
import type { Product } from "@/data/products";

type MetricKey = "density" | "synergy" | "breadth";

export type IngredientMetrics = {
  ingredientCount: number;
  synergyCount: number;
  goalBreadth: number;
};

type MetricDef = {
  key: MetricKey;
  short: string;
  description: string;
  value: (p: Product, m?: IngredientMetrics) => number;
  format: (p: Product, m?: IngredientMetrics) => string;
  desc: boolean;
  summaryLabel: string;
  summary: (entries: Array<{ product: Product; metrics: IngredientMetrics }>) => string;
};

const METRICS: MetricDef[] = [
  {
    key: "density",
    short: "Density",
    description: "Clinically-active ingredients carried in each formula. Higher density = more signal per dose.",
    value: (_p, m) => m?.ingredientCount ?? 0,
    format: (_p, m) => `${m?.ingredientCount ?? 0} actives`,
    desc: true,
    summaryLabel: "Total active ingredients",
    summary: (entries) => formatNumber(entries.reduce((s, e) => s + e.metrics.ingredientCount, 0)),
  },
  {
    key: "synergy",
    short: "Synergy",
    description: "Cross-ingredient pairings that amplify absorption and downstream effect.",
    value: (_p, m) => m?.synergyCount ?? 0,
    format: (_p, m) => `${m?.synergyCount ?? 0} pairings`,
    desc: true,
    summaryLabel: "Total synergy links",
    summary: (entries) => formatNumber(entries.reduce((s, e) => s + e.metrics.synergyCount, 0)),
  },
  {
    key: "breadth",
    short: "Breadth",
    description: "Distinct wellness goals each formula targets across its ingredient profile.",
    value: (_p, m) => m?.goalBreadth ?? 0,
    format: (_p, m) => `${m?.goalBreadth ?? 0} goals`,
    desc: true,
    summaryLabel: "Average goal breadth",
    summary: (entries) => {
      if (entries.length === 0) return "0";
      const avg =
        entries.reduce((s, e) => s + e.metrics.goalBreadth, 0) / entries.length;
      return avg.toFixed(1);
    },
  },
];

const PRODUCT_TINT: Record<string, string> = {
  "vitamin-c": "#f5c98a",
  "glutathione": "#c8b8ff",
  "magnesium-complex": "#9ec9ff",
  "liquid-colostrum": "#fbd5b5",
  "shilajit-liquid-complex": "#fba973",
  "nad": "#8ce0d6",
};

const FALLBACK_TINT = "#d1c2a8";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function CymbiotikaDataCharts({
  products,
  ingredientMetrics,
}: {
  products: Product[];
  ingredientMetrics: Record<string, IngredientMetrics>;
}) {
  const [metricKey, setMetricKey] = useState<MetricKey>("density");
  const [expandedHandle, setExpandedHandle] = useState<string | null>(null);

  const metric = METRICS.find((m) => m.key === metricKey) ?? METRICS[0];

  const fetchedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const eligibleEntries = useMemo(
    () =>
      products
        .map((product) => ({ product, metrics: ingredientMetrics[product.handle] }))
        .filter(
          (entry): entry is { product: Product; metrics: IngredientMetrics } =>
            Boolean(entry.metrics) && entry.metrics.ingredientCount > 0,
        ),
    [products, ingredientMetrics],
  );

  const sortedEntries = useMemo(() => {
    const arr = [...eligibleEntries];
    arr.sort((a, b) => {
      const va = metric.value(a.product, a.metrics);
      const vb = metric.value(b.product, b.metrics);
      return metric.desc ? vb - va : va - vb;
    });
    return arr;
  }, [eligibleEntries, metric]);

  const { maxValue, minValue } = useMemo(() => {
    if (sortedEntries.length === 0) return { maxValue: 0, minValue: 0 };
    const values = sortedEntries.map((e) => metric.value(e.product, e.metrics));
    return { maxValue: Math.max(...values), minValue: Math.min(...values) };
  }, [sortedEntries, metric]);

  const barFraction = (entry: { product: Product; metrics: IngredientMetrics }) => {
    const v = metric.value(entry.product, entry.metrics);
    if (maxValue === minValue) return 1;
    return metric.desc
      ? (v - minValue) / (maxValue - minValue)
      : (maxValue - v) / (maxValue - minValue);
  };

  const summaryValue = metric.summary(eligibleEntries);

  return (
    <section className="space-y-10 md:space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <p className="micro-copy text-[var(--muted)]">Formulation Intelligence</p>
          <h2 className="text-display mt-4 max-w-3xl text-[var(--forest)]">
            One signal at a time.
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={metric.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)] md:text-base"
            >
              {metric.description}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-end text-right">
          <p className="micro-copy text-[var(--muted)]">{metric.summaryLabel}</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={metric.key + summaryValue}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 font-display text-5xl leading-none text-[var(--forest)] md:text-6xl"
            >
              {summaryValue}
            </motion.p>
          </AnimatePresence>
          <p className="mt-3 text-eyebrow tracking-[0.1em] text-[var(--muted)]">
            Updated {fetchedDate}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1.5">
          {METRICS.map((m) => {
            const isActive = m.key === metricKey;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setMetricKey(m.key)}
                className={cn(
                  "relative rounded-full px-5 py-2 text-eyebrow tracking-[0.1em] transition",
                  isActive ? "text-[var(--on-primary)]" : "text-[var(--muted)] hover:text-[var(--forest)]",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="metric-pill"
                    className="absolute inset-0 rounded-full bg-[var(--forest)]"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{m.short}</span>
              </button>
            );
          })}
        </div>
        <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">
          {sortedEntries.length} formulas · {metric.desc ? "highest" : "lowest"} first
        </p>
      </div>

      <LayoutGroup>
        <ol className="space-y-3 md:space-y-4">
          {sortedEntries.map((entry, rank) => {
            const { product, metrics } = entry;
            const tint = PRODUCT_TINT[product.handle] ?? FALLBACK_TINT;
            const fraction = barFraction(entry);
            const isExpanded = expandedHandle === product.handle;
            return (
              <motion.li
                key={product.handle}
                layout
                transition={{ type: "spring", stiffness: 240, damping: 28 }}
                className={cn(
                  "overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] transition-shadow",
                  isExpanded
                    ? "shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
                    : "hover:shadow-[0_18px_50px_rgba(0,0,0,0.35)]",
                )}
              >
                <button
                  type="button"
                  onClick={() => setExpandedHandle(isExpanded ? null : product.handle)}
                  className="group block w-full px-5 py-5 text-left md:px-7 md:py-6"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-baseline justify-between gap-6">
                    <div className="flex items-baseline gap-4 md:gap-5">
                      <span className="text-xs tabular-nums text-[var(--muted)]">
                        {String(rank + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-display text-xl leading-none text-[var(--forest)] md:text-2xl">
                          {product.title}
                        </p>
                        <p className="mt-2 text-eyebrow tracking-[0.1em] text-[var(--muted)]">
                          {product.productType}
                        </p>
                      </div>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={metric.key + product.handle}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="font-display text-2xl tabular-nums text-[var(--forest)] md:text-3xl"
                      >
                        {metric.format(product, metrics)}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--forest)_8%,transparent)]">
                    <motion.div
                      initial={false}
                      animate={{ width: `${Math.max(fraction * 100, 2)}%` }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${tint}aa 0%, ${tint} 78%)`,
                        boxShadow: `0 0 22px ${tint}55`,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-eyebrow tracking-[0.1em] text-[var(--muted)]">
                    <span>{metrics.ingredientCount} actives</span>
                    <span>{metrics.synergyCount} synergies</span>
                    <span>{metrics.goalBreadth} goals · {formatCurrency(product.price)}</span>
                    <span className="ml-auto text-[var(--muted)] transition group-hover:text-[var(--forest)]">
                      {isExpanded ? "Close" : "Open"} →
                    </span>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="detail"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="border-t border-[var(--line)] px-5 py-6 md:px-7 md:py-7">
                        <div className="grid gap-6 md:grid-cols-3">
                          <div>
                            <p className="micro-copy text-[var(--muted)]">Density</p>
                            <p className="mt-2 font-display text-3xl text-[var(--forest)]">
                              {metrics.ingredientCount}
                            </p>
                            <p className="mt-1 text-small leading-relaxed text-[var(--muted)]">
                              Clinically-active ingredients carried in this formula.
                            </p>
                          </div>
                          <div>
                            <p className="micro-copy text-[var(--muted)]">Synergy</p>
                            <p className="mt-2 font-display text-3xl text-[var(--forest)]">
                              {metrics.synergyCount}
                            </p>
                            <p className="mt-1 text-small leading-relaxed text-[var(--muted)]">
                              Cross-ingredient pairings amplifying absorption and effect.
                            </p>
                          </div>
                          <div>
                            <p className="micro-copy text-[var(--muted)]">Breadth</p>
                            <p className="mt-2 font-display text-3xl text-[var(--forest)]">
                              {metrics.goalBreadth}
                            </p>
                            <p className="mt-1 text-small leading-relaxed text-[var(--muted)]">
                              Distinct wellness goals this formula targets · {formatCurrency(product.price)} entry.
                            </p>
                          </div>
                        </div>
                        <a
                          href={product.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-6 inline-flex items-center gap-2 text-eyebrow tracking-[0.1em] text-[var(--forest)] transition hover:gap-3"
                        >
                          Enter formula
                          <span aria-hidden>→</span>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ol>
      </LayoutGroup>
    </section>
  );
}
