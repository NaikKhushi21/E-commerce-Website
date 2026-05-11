"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/products";
import type { WellnessGoal } from "@/data/goals";
import { SafeImage } from "@/components/ui/SafeImage";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";

const GOAL_ANCHORS: Record<
  WellnessGoal,
  { x: number; y: number; label: string; color: string }
> = {
  energy: { x: 16, y: 22, label: "Energy", color: "#fba973" },
  immunity: { x: 50, y: 18, label: "Immunity", color: "#fbd5b5" },
  sleep: { x: 84, y: 22, label: "Sleep", color: "#9ec9ff" },
  "brain-health": { x: 16, y: 50, label: "Mind", color: "#c8b8ff" },
  detox: { x: 50, y: 50, label: "Detox", color: "#a4c8ff" },
  stress: { x: 84, y: 50, label: "Calm", color: "#cbb8e8" },
  "gut-health": { x: 16, y: 78, label: "Gut", color: "#8ce0d6" },
  skin: { x: 50, y: 82, label: "Skin", color: "#f5d4a8" },
  longevity: { x: 84, y: 78, label: "Longevity", color: "#8ce0d6" },
};

const ALL_GOALS = Object.keys(GOAL_ANCHORS) as WellnessGoal[];

type FilterKey = "all" | WellnessGoal;
type Position = { x: number; y: number };

const r2 = (v: number) => Math.round(v * 100) / 100;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function hashHandle(handle: string): number {
  let h = 0;
  for (let i = 0; i < handle.length; i += 1) {
    h = (h * 31 + handle.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function deterministic(seed: number, salt: number): number {
  // Deterministic pseudo-random in [0, 1) — modulo arithmetic only, no trig.
  return ((seed * 1103515245 + 12345 + salt * 2654435761) >>> 0) / 0xffffffff;
}

function naturalPosition(product: Product): Position {
  const goals = product.goals ?? [];
  const hash = hashHandle(product.handle);

  if (goals.length === 0) {
    return {
      x: r2(30 + deterministic(hash, 1) * 40),
      y: r2(30 + deterministic(hash, 2) * 40),
    };
  }

  let x = 0;
  let y = 0;
  goals.forEach((g) => {
    const a = GOAL_ANCHORS[g];
    if (!a) return;
    x += a.x;
    y += a.y;
  });
  x /= goals.length;
  y /= goals.length;

  // Stable noise so each product has a unique offset within its centroid
  const nx = (deterministic(hash, 11) - 0.5) * 12;
  const ny = (deterministic(hash, 17) - 0.5) * 12;
  return { x: r2(clamp(x + nx, 8, 92)), y: r2(clamp(y + ny, 10, 90)) };
}

function placeWithRepulsion(products: Product[]): Array<{ product: Product; pos: Position }> {
  const placed: Array<{ product: Product; pos: Position }> = [];
  const MIN_DIST = 5;
  const MAX_ATTEMPTS = 12;

  products.forEach((product) => {
    let pos = naturalPosition(product);
    const hash = hashHandle(product.handle);

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const collision = placed.find(({ pos: other }) => {
        const dx = pos.x - other.x;
        const dy = pos.y - other.y;
        return dx * dx + dy * dy < MIN_DIST * MIN_DIST;
      });
      if (!collision) break;

      // Stable nudge
      const dirX = pos.x - collision.pos.x;
      const dirY = pos.y - collision.pos.y;
      const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
      const jitter = deterministic(hash, attempt + 100) * 2;
      pos = {
        x: r2(clamp(pos.x + (dirX / len) * (3 + jitter), 8, 92)),
        y: r2(clamp(pos.y + (dirY / len) * (3 + jitter), 10, 90)),
      };
    }

    placed.push({ product, pos });
  });

  return placed;
}

export function ProductConstellation({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [hovered, setHovered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stable natural placements (computed once for this product list)
  const naturalPlacements = useMemo(() => placeWithRepulsion(products), [products]);

  // Apply filter — when a goal is active, products with that goal get pulled toward the anchor
  const filteredPlacements = useMemo(() => {
    return naturalPlacements.map(({ product, pos }) => {
      if (filter === "all") {
        return { product, pos, dim: false, matches: true };
      }
      const matches = product.goals?.includes(filter as WellnessGoal) ?? false;
      if (!matches) {
        return { product, pos, dim: true, matches: false };
      }
      const a = GOAL_ANCHORS[filter as WellnessGoal];
      const lerp = 0.55;
      return {
        product,
        pos: {
          x: r2(pos.x + (a.x - pos.x) * lerp),
          y: r2(pos.y + (a.y - pos.y) * lerp),
        },
        dim: false,
        matches: true,
      };
    });
  }, [naturalPlacements, filter]);

  const matchCount = useMemo(
    () => filteredPlacements.filter((p) => p.matches).length,
    [filteredPlacements],
  );

  // Connection lines (one per (goal, product) pair where product has that goal)
  const connections = useMemo(() => {
    const out: Array<{
      from: Position;
      to: Position;
      color: string;
      goal: WellnessGoal;
      productHandle: string;
    }> = [];
    filteredPlacements.forEach(({ product, pos }) => {
      product.goals?.forEach((g) => {
        const a = GOAL_ANCHORS[g];
        if (!a) return;
        out.push({
          from: { x: a.x, y: a.y },
          to: pos,
          color: a.color,
          goal: g,
          productHandle: product.handle,
        });
      });
    });
    return out;
  }, [filteredPlacements]);

  const noResults = filter !== "all" && matchCount === 0;

  return (
    <section className="space-y-5">
      {/* Filter rail */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
        {ALL_GOALS.map((g) => (
          <FilterChip
            key={g}
            label={GOAL_ANCHORS[g].label}
            active={filter === g}
            color={GOAL_ANCHORS[g].color}
            onClick={() => setFilter(g)}
          />
        ))}
        <span className="ml-auto text-eyebrow tracking-[0.1em] text-[var(--muted)]">
          {filter === "all"
            ? `${products.length} formula${products.length === 1 ? "" : "s"}`
            : `${matchCount} matching`}
        </span>
      </div>

      {/* Constellation field */}
      <div
        ref={containerRef}
        className="relative h-[72vh] min-h-[640px] overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]"
      >
        {/* Atmosphere */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 50%, rgba(215,195,167,0.06), transparent 60%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.10] bg-[radial-gradient(rgba(255,255,255,0.5)_0.5px,transparent_0.5px)] [background-size:3px_3px]" />

        {/* Goal halos */}
        {ALL_GOALS.map((g) => {
          const a = GOAL_ANCHORS[g];
          const isActive = filter === g;
          const isVisible = filter === "all" || isActive;
          return (
            <motion.div
              key={`halo-${g}`}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${a.x}%`, top: `${a.y}%` }}
              animate={{ opacity: isVisible ? 1 : 0.18, scale: isActive ? 1.25 : 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="h-32 w-32 rounded-full md:h-44 md:w-44"
                style={{
                  background: `radial-gradient(circle, ${a.color}33 0%, ${a.color}00 70%)`,
                }}
              />
            </motion.div>
          );
        })}

        {/* Connection lines */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          {connections.map((c, i) => {
            const isHighlighted =
              (filter !== "all" && c.goal === filter) || hovered === c.productHandle;
            const opacity =
              filter === "all" ? (hovered === c.productHandle ? 0.45 : 0.06) : isHighlighted ? 0.5 : 0.04;
            return (
              <motion.line
                key={i}
                x1={`${c.from.x}%`}
                y1={`${c.from.y}%`}
                x2={`${c.to.x}%`}
                y2={`${c.to.y}%`}
                stroke={c.color}
                strokeWidth={isHighlighted ? 1 : 0.5}
                strokeDasharray={isHighlighted ? "0" : "2 4"}
                animate={{ opacity }}
                transition={{ duration: 0.45 }}
                style={
                  isHighlighted ? { filter: `drop-shadow(0 0 4px ${c.color}88)` } : undefined
                }
              />
            );
          })}
        </svg>

        {/* Goal labels (clickable) */}
        {ALL_GOALS.map((g) => {
          const a = GOAL_ANCHORS[g];
          const isActive = filter === g;
          return (
            <motion.button
              key={`label-${g}`}
              type="button"
              onClick={() => setFilter(filter === g ? "all" : g)}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 select-none rounded-full px-3 py-1.5 text-eyebrow tracking-[0.1em] transition"
              style={{
                left: `${a.x}%`,
                top: `${a.y}%`,
                color: isActive ? a.color : "rgba(245,244,240,0.6)",
                textShadow: isActive ? `0 0 14px ${a.color}` : undefined,
                background: isActive ? "rgba(0,0,0,0.4)" : "transparent",
                border: isActive ? `1px solid ${a.color}66` : "1px solid transparent",
              }}
              animate={{ scale: isActive ? 1.1 : 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {a.label}
            </motion.button>
          );
        })}

        {/* Product nodes */}
        {filteredPlacements.map(({ product, pos, dim, matches }) => (
          <ProductNode
            key={product.id}
            product={product}
            pos={pos}
            dim={dim}
            highlighted={!matches ? false : filter !== "all"}
            hovered={hovered === product.handle}
            onHover={() => setHovered(product.handle)}
            onLeave={() => setHovered(null)}
          />
        ))}

        {/* No-results state */}
        {noResults ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-elevated)] px-6 py-5 text-center">
              <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">
                Empty zone
              </p>
              <p className="mt-2 text-body text-[var(--text)]">
                No formulas tagged for {GOAL_ANCHORS[filter as WellnessGoal].label}.
              </p>
              <Pill
                size="sm"
                variant="secondary"
                className="mt-4"
                onClick={() => setFilter("all")}
              >
                Show all formulas
              </Pill>
            </div>
          </div>
        ) : null}
      </div>
    </section>
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
        "rounded-full border px-4 py-1.5 text-eyebrow tracking-[0.1em] transition",
        active
          ? "border-transparent bg-[var(--primary)] text-[var(--on-primary)]"
          : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--forest)]",
      )}
      style={
        active && color
          ? {
              boxShadow: `0 0 14px ${color}55`,
            }
          : undefined
      }
    >
      {label}
    </button>
  );
}

function ProductNode({
  product,
  pos,
  dim,
  highlighted,
  hovered,
  onHover,
  onLeave,
}: {
  product: Product;
  pos: Position;
  dim: boolean;
  highlighted: boolean;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const isFocused = !dim && (highlighted || hovered);
  return (
    <motion.div
      className="absolute z-10"
      animate={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        opacity: dim ? 0.18 : 1,
        scale: dim ? 0.7 : hovered ? 1.18 : isFocused ? 1.05 : 1,
      }}
      transition={{ type: "spring", stiffness: 90, damping: 20 }}
      style={{ translateX: "-50%", translateY: "-50%" }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
    >
      <Link
        href={`/products/${product.handle}`}
        className="group block focus:outline-none"
        aria-label={`View ${product.title}`}
      >
        <div
          className="relative h-16 w-16 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-elevated)] transition-shadow group-hover:border-[var(--line-strong)] group-focus-visible:border-[var(--line-strong)] md:h-20 md:w-20"
          style={
            hovered
              ? {
                  boxShadow:
                    "0 12px 28px rgba(0,0,0,0.55), 0 0 26px rgba(215,195,167,0.32)",
                }
              : undefined
          }
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.16), transparent 55%)",
            }}
          />
          <SafeImage
            src={product.featuredImage}
            alt={product.title}
            fill
            draggable={false}
            className="select-none object-contain p-1.5"
            sizes="(max-width: 768px) 64px, 80px"
          />
        </div>

        <AnimatePresence>
          {hovered ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute left-1/2 top-full z-30 mt-3 -translate-x-1/2 whitespace-nowrap rounded-xl border border-[var(--line)] bg-[var(--surface-elevated)] px-3 py-2 text-center"
              style={{ boxShadow: "0 12px 30px rgba(0,0,0,0.55)" }}
            >
              <p className="text-small leading-none text-[var(--text)]">{product.title}</p>
              <p className="mt-1 text-eyebrow tracking-[0.1em] text-[var(--muted)]">
                {formatMoney(product.price, product.currency)} · open →
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
}
