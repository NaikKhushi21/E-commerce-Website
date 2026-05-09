"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/products";
import {
  CATEGORY_COLOR,
  type IngredientEntry,
} from "@/lib/sanity-ingredients";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";

const r2 = (v: number) => Math.round(v * 100) / 100;

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const GOAL_PRETTY: Record<string, string> = {
  energy: "energy",
  immunity: "immunity",
  "gut-health": "gut",
  "brain-health": "mind",
  sleep: "sleep",
  stress: "calm",
  skin: "skin",
  detox: "detox",
  longevity: "longevity",
};

function whyInFormula(ing: IngredientEntry, product: Product): string {
  const productGoals = product.goals ?? [];
  const overlap = ing.goals.filter((g) => productGoals.includes(g));
  if (overlap.length > 0) {
    const labels = overlap.map((g) => GOAL_PRETTY[g] ?? g);
    if (labels.length === 1) {
      return `Anchors the ${labels[0]} arc of ${product.title}.`;
    }
    return `Anchors the ${labels.slice(0, -1).join(", ")} & ${labels[labels.length - 1]} arcs of ${product.title}.`;
  }
  return `Active in the ${product.title} formula.`;
}

export function IngredientAtomizer({
  product,
  ingredients,
}: {
  product: Product;
  ingredients: IngredientEntry[];
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(
    ingredients[0]?.key ?? null,
  );
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Atom positions in % of the field, deterministic per ingredient
  const positions = useMemo(() => {
    const N = ingredients.length;
    if (N === 0) return [];
    if (N === 1) return [{ x: 50, y: 50 }];

    return ingredients.map((ing, i) => {
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
      const hash = hashStr(ing.key);
      const noiseR = ((hash % 100) / 100 - 0.5) * 8; // ±4
      const noiseAngle = (((hash * 31) % 100) / 100 - 0.5) * 0.35;
      const radius = N >= 5 ? 30 : 24;
      const r = radius + noiseR;
      return {
        x: r2(50 + Math.cos(angle + noiseAngle) * r),
        y: r2(50 + Math.sin(angle + noiseAngle) * r * 0.85),
      };
    });
  }, [ingredients]);

  // Synergy edges (i < j only; bidirectional matches collapse)
  const synergyEdges = useMemo(() => {
    const edges: Array<{ a: number; b: number; color: string }> = [];
    const idx = new Map(ingredients.map((ing, i) => [ing.key, i]));
    for (let i = 0; i < ingredients.length; i += 1) {
      const ai = ingredients[i];
      (ai.synergies ?? []).forEach((sk) => {
        const j = idx.get(sk);
        if (j !== undefined && j > i) {
          edges.push({ a: i, b: j, color: CATEGORY_COLOR[ai.category] });
        }
      });
    }
    return edges;
  }, [ingredients]);

  if (ingredients.length === 0) return null;

  const selected =
    ingredients.find((i) => i.key === selectedKey) ?? ingredients[0];
  const focusKey = hoveredKey ?? selectedKey;

  return (
    <section
      className="theme-aurora relative isolate overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[var(--bg)] p-7 md:p-12"
      aria-label="Ingredient Atomizer"
    >
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 30% 22%, rgba(215,195,167,0.08), transparent 58%), radial-gradient(60% 50% at 78% 82%, rgba(140,224,214,0.06), transparent 60%)",
        }}
      />

      <SectionHeader
        eyebrow="04 — Ingredient Atomizer"
        title="The active compounds inside this pouch."
        subhead="Each ingredient suspended in solution. Hover to read it, click to enter."
      />

      <div className="relative z-10 mt-10 grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
        {/* LEFT — molecule field */}
        <div className="relative h-[500px] overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] md:h-[560px]">
          {/* soft halo */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(215,195,167,0.10) 0%, rgba(215,195,167,0) 65%)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.10] bg-[radial-gradient(rgba(255,255,255,0.5)_0.5px,transparent_0.5px)] [background-size:3px_3px]" />

          {/* Synergy lines */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            {synergyEdges.map((edge, i) => {
              const aPos = positions[edge.a];
              const bPos = positions[edge.b];
              const isFocused =
                focusKey === ingredients[edge.a].key ||
                focusKey === ingredients[edge.b].key;
              return (
                <motion.line
                  key={i}
                  x1={`${aPos.x}%`}
                  y1={`${aPos.y}%`}
                  x2={`${bPos.x}%`}
                  y2={`${bPos.y}%`}
                  stroke={edge.color}
                  strokeWidth={isFocused ? 1.4 : 0.6}
                  strokeDasharray={isFocused ? "0" : "3 5"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isFocused ? 0.7 : 0.18 }}
                  transition={{ duration: 0.45 }}
                  style={
                    isFocused
                      ? { filter: `drop-shadow(0 0 6px ${edge.color}88)` }
                      : undefined
                  }
                />
              );
            })}
          </svg>

          {/* Atoms */}
          {ingredients.map((ing, i) => (
            <Atom
              key={ing.key}
              ing={ing}
              pos={positions[i]}
              hovered={hoveredKey === ing.key}
              selected={selectedKey === ing.key}
              onHover={() => setHoveredKey(ing.key)}
              onLeave={() => setHoveredKey(null)}
              onSelect={() => setSelectedKey(ing.key)}
            />
          ))}
        </div>

        {/* RIGHT — detail panel */}
        <DetailPanel ingredient={selected} product={product} />
      </div>

      {/* Bottom rail — chip nav */}
      <div className="relative z-10 mt-8 flex flex-wrap gap-2">
        {ingredients.map((ing) => {
          const color = CATEGORY_COLOR[ing.category];
          const isActive = selectedKey === ing.key;
          return (
            <button
              key={ing.key}
              type="button"
              onClick={() => setSelectedKey(ing.key)}
              onMouseEnter={() => setHoveredKey(ing.key)}
              onMouseLeave={() => setHoveredKey(null)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] uppercase tracking-[0.22em] transition",
                isActive
                  ? "border-[var(--line-strong)] bg-[var(--surface-elevated)] text-[var(--text)]"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]",
              )}
              style={isActive ? { boxShadow: `0 0 14px ${color}55` } : undefined}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: color, boxShadow: `0 0 8px ${color}` }}
              />
              {ing.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ---------- Atom button ----------

function Atom({
  ing,
  pos,
  hovered,
  selected,
  onHover,
  onLeave,
  onSelect,
}: {
  ing: IngredientEntry;
  pos: { x: number; y: number };
  hovered: boolean;
  selected: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  const color = CATEGORY_COLOR[ing.category];
  const driftDur = 4 + ((hashStr(ing.key) % 30) / 10);
  const driftDelay = (hashStr(ing.key) % 20) / 10;
  const showLabel = hovered || selected;

  return (
    <motion.button
      type="button"
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      onClick={onSelect}
      animate={{ scale: selected ? 1.18 : hovered ? 1.12 : 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      aria-label={`${ing.name} — ${ing.category}`}
      aria-pressed={selected}
    >
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{
          duration: driftDur,
          delay: driftDelay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          style={{
            filter: showLabel
              ? `drop-shadow(0 0 16px ${color})`
              : `drop-shadow(0 0 6px ${color}55)`,
            transition: "filter 0.4s ease",
          }}
        >
          <svg
            width="84"
            height="84"
            viewBox="-42 -42 84 84"
            className="overflow-visible"
            aria-hidden="true"
          >
            {/* Bonds + electron dots */}
            {[0, 90, 180, 270].map((deg) => {
              const a = (deg * Math.PI) / 180;
              const ex = r2(Math.cos(a) * 28);
              const ey = r2(Math.sin(a) * 28);
              return (
                <g key={deg}>
                  <line
                    x1={0}
                    y1={0}
                    x2={ex}
                    y2={ey}
                    stroke={color}
                    strokeWidth="0.8"
                    opacity="0.55"
                  />
                  <circle cx={ex} cy={ey} r="2.4" fill={color} opacity="0.85" />
                </g>
              );
            })}
            {/* Soft outer halo */}
            <circle r="22" fill={color} opacity="0.12" />
            {/* Core */}
            <circle r="14" fill={color} opacity="0.95" />
            {/* Top highlight */}
            <circle cx="-3" cy="-4" r="5" fill="white" opacity="0.34" />
          </svg>
        </div>
      </motion.div>

      <AnimatePresence>
        {showLabel ? (
          <motion.span
            key="label"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--line)] bg-[var(--surface-elevated)] px-3 py-1 text-[10px] uppercase tracking-[0.22em]"
            style={{ color: selected ? color : "rgba(245,244,240,0.85)" }}
          >
            {ing.name}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}

// ---------- Detail panel ----------

function DetailPanel({
  ingredient,
  product,
}: {
  ingredient: IngredientEntry;
  product: Product;
}) {
  const color = CATEGORY_COLOR[ingredient.category];

  return (
    <div className="relative h-[500px] overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface-elevated)] p-6 md:h-[560px] md:p-8">
      <div
        className="pointer-events-none absolute -top-20 right-0 h-56 w-56 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={ingredient.key}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full overflow-y-auto"
        >
          {/* Category eyebrow */}
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: color, boxShadow: `0 0 10px ${color}` }}
            />
            <p
              className="text-[10px] uppercase tracking-[0.32em]"
              style={{ color }}
            >
              {ingredient.category}
            </p>
          </div>

          {/* Title */}
          <h3 className="display-title mt-3 text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] text-[var(--text)]">
            {ingredient.name}
          </h3>

          {/* Function */}
          <p className="mt-5 text-sm leading-relaxed text-[var(--muted)] md:text-[15px]">
            {ingredient.function}
          </p>

          {/* Stats */}
          <div className="mt-7 grid gap-3 md:grid-cols-2">
            {ingredient.dose ? (
              <Stat label="Dose per serving" value={ingredient.dose} />
            ) : null}
            <Stat
              label="Serves"
              value={
                ingredient.goals
                  .slice(0, 3)
                  .map((g) => GOAL_PRETTY[g] ?? g)
                  .join(", ") || "—"
              }
            />
          </div>

          {/* Why this formula */}
          <div className="mt-7 rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] p-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
              Why it&apos;s in this formula
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--text)]">
              {whyInFormula(ingredient, product)}
            </p>
          </div>

          {/* Synergies */}
          {ingredient.synergies && ingredient.synergies.length > 0 ? (
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
                Pairs with
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-[var(--text)]/80">
                {ingredient.synergies
                  .map((k) => k.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
                  .join(" · ")}
              </p>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1.5 text-base capitalize text-[var(--text)]">{value}</p>
    </div>
  );
}
