"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  forceCollide,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
} from "d3-force";
import { scaleLinear, scaleSqrt } from "d3-scale";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { CATEGORY_COLOR, type IngredientCategory, type IngredientEntry } from "@/lib/sanity-ingredients";
import { cn } from "@/lib/cn";

type Mode = "library" | "categories" | "synergy";

type Bubble = SimulationNodeDatum & {
  key: string;
  name: string;
  category: IngredientCategory;
  function: string;
  synergyCount: number;
  goalBreadth: number;
  radius: number;
  targetX: number;
  targetY: number;
};

const MODES: Array<{ id: Mode; label: string; description: string; summaryLabel: string }> = [
  {
    id: "library",
    label: "Library",
    description:
      "Every clinically-active ingredient in the formulary, suspended together as one signal field.",
    summaryLabel: "Active ingredients",
  },
  {
    id: "categories",
    label: "Categories",
    description:
      "Re-collapse the field by ingredient class — antioxidants, adaptogens, cofactors, minerals, phytocompounds.",
    summaryLabel: "Distinct categories",
  },
  {
    id: "synergy",
    label: "Synergy map",
    description:
      "Synergy connections (x) plotted against wellness-goal breadth (y). Top-right ingredients carry the most leverage.",
    summaryLabel: "Top leverage ingredient",
  },
];

const PADDING = 56;
const MIN_RADIUS = 16;
const MAX_RADIUS = 46;

// Responsive radius range based on container width. Narrow viewports get
// smaller bubbles so categories/synergy modes have room to actually cluster
// instead of just packing into a single tight blob.
function radiusRangeForWidth(w: number): readonly [number, number] {
  if (w < 480) return [9, 22] as const;
  if (w < 768) return [11, 28] as const;
  if (w < 1024) return [13, 36] as const;
  return [MIN_RADIUS, MAX_RADIUS] as const;
}

export function IngredientCloud({ atlas }: { atlas: Record<string, IngredientEntry> }) {
  const [mode, setMode] = useState<Mode>("library");
  const [size, setSize] = useState({ width: 800, height: 540 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [tickCounter, setTickCounter] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<Simulation<Bubble, undefined> | null>(null);
  const bubblesRef = useRef<Bubble[]>([]);

  const ingredients = useMemo(() => Object.values(atlas), [atlas]);

  const stats = useMemo(() => {
    const synergyCounts = ingredients.map((i) => i.synergies?.length ?? 0);
    const goalBreadths = ingredients.map((i) => new Set(i.goals).size);
    return {
      maxSynergy: Math.max(1, ...synergyCounts),
      maxBreadth: Math.max(1, ...goalBreadths),
      categories: Array.from(new Set(ingredients.map((i) => i.category))),
    };
  }, [ingredients]);

  const radiusScale = useMemo(() => {
    const [minR, maxR] = radiusRangeForWidth(size.width);
    return scaleSqrt().domain([0, stats.maxSynergy]).range([minR, maxR]);
  }, [stats.maxSynergy, size.width]);

  // Initialize bubbles once when ingredients change.
  // size + radiusScale intentionally excluded — initial only. Re-running on
  // resize would scramble x/y positions every time the viewport changes.
  useEffect(() => {
    bubblesRef.current = ingredients.map((ing) => ({
      key: ing.key,
      name: ing.name,
      category: ing.category,
      function: ing.function,
      synergyCount: ing.synergies?.length ?? 0,
      goalBreadth: new Set(ing.goals).size,
      radius: radiusScale(ing.synergies?.length ?? 0),
      x: Math.random() * size.width,
      y: Math.random() * size.height,
      targetX: size.width / 2,
      targetY: size.height / 2,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredients]);

  // When the viewport resizes (and therefore the radius scale changes),
  // update each bubble's radius in place so the cloud re-packs at the new
  // size — without resetting positions.
  useEffect(() => {
    const synergyByKey = new Map(ingredients.map((i) => [i.key, i.synergies?.length ?? 0]));
    bubblesRef.current.forEach((b) => {
      const synergyCount = synergyByKey.get(b.key);
      if (synergyCount !== undefined) {
        b.radius = radiusScale(synergyCount);
      }
    });
    simulationRef.current?.alpha(0.5).restart();
  }, [radiusScale, ingredients]);

  // Track container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 320);
        // Narrower viewports get a taller-relative-to-width canvas so the
        // bubbles have vertical room to spread into category clusters.
        const aspect = w < 480 ? 1.4 : w < 768 ? 1.0 : 0.62;
        const h = Math.min(Math.max(w * aspect, 460), 720);
        setSize({ width: w, height: h });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute layout targets per mode + size, then drive the simulation
  useEffect(() => {
    const bubbles = bubblesRef.current;
    if (bubbles.length === 0) return;

    if (mode === "library") {
      const cx = size.width / 2;
      const cy = size.height / 2;
      bubbles.forEach((b) => {
        b.targetX = cx;
        b.targetY = cy;
      });
    } else if (mode === "categories") {
      const cats = stats.categories;
      const cols = Math.min(cats.length, cats.length <= 4 ? cats.length : Math.ceil(Math.sqrt(cats.length)));
      const rows = Math.ceil(cats.length / cols);
      const topPad = 24;
      const bottomPad = 48;
      const rowGap = rows > 1 ? 64 : 0;
      const cellW = size.width / cols;
      const cellH = (size.height - topPad - bottomPad - (rows - 1) * rowGap) / rows;
      const positions = new Map<IngredientCategory, { x: number; y: number }>();
      cats.forEach((cat, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        positions.set(cat, {
          x: col * cellW + cellW / 2,
          y: topPad + row * (cellH + rowGap) + cellH / 2,
        });
      });
      bubbles.forEach((b) => {
        const pos = positions.get(b.category);
        if (pos) {
          b.targetX = pos.x;
          b.targetY = pos.y;
        }
      });
    } else {
      const xScale = scaleLinear()
        .domain([0, stats.maxSynergy])
        .range([PADDING, size.width - PADDING]);
      const yScale = scaleLinear()
        .domain([0, stats.maxBreadth])
        .range([size.height - PADDING, PADDING]);
      bubbles.forEach((b) => {
        b.targetX = xScale(b.synergyCount);
        b.targetY = yScale(b.goalBreadth);
      });
    }

    const xStrength = mode === "synergy" ? 0.32 : 0.12;
    const yStrength = mode === "synergy" ? 0.32 : mode === "categories" ? 0.24 : 0.12;

    if (!simulationRef.current) {
      simulationRef.current = forceSimulation<Bubble>(bubbles)
        .alphaDecay(0.035)
        .velocityDecay(0.32)
        .on("tick", () => setTickCounter((n) => (n + 1) % 1_000_000));
    }

    // Custom containment force — runs every tick after collide and clamps each
    // bubble's center so its full radius stays inside the container bounds.
    // Without this, collide can push bubbles past the container edge on narrow
    // viewports and they get clipped by `overflow-hidden`.
    const containmentForce = () => {
      const w = size.width;
      const h = size.height;
      bubbles.forEach((b) => {
        const r = b.radius + 1;
        if (typeof b.x === "number") b.x = Math.max(r, Math.min(w - r, b.x));
        if (typeof b.y === "number") b.y = Math.max(r, Math.min(h - r, b.y));
      });
    };

    simulationRef.current
      .nodes(bubbles)
      .force("x", forceX<Bubble>((b) => b.targetX).strength(xStrength))
      .force("y", forceY<Bubble>((b) => b.targetY).strength(yStrength))
      .force("collide", forceCollide<Bubble>((b) => b.radius + 2).strength(0.9))
      .force("contain", containmentForce)
      .alpha(0.7)
      .restart();
  }, [mode, size, stats.categories, stats.maxBreadth, stats.maxSynergy]);

  useEffect(() => {
    return () => {
      simulationRef.current?.stop();
      simulationRef.current = null;
    };
  }, []);

  const activeMode = MODES.find((m) => m.id === mode) ?? MODES[0];

  const summaryValue = useMemo(() => {
    if (mode === "library") return String(ingredients.length);
    if (mode === "categories") return String(stats.categories.length);
    const sorted = [...ingredients].sort(
      (a, b) =>
        (b.synergies?.length ?? 0) + new Set(b.goals).size -
        ((a.synergies?.length ?? 0) + new Set(a.goals).size),
    );
    return sorted[0]?.name ?? "—";
  }, [mode, ingredients, stats.categories.length]);

  const fetchedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

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
              key={activeMode.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)] md:text-base"
            >
              {activeMode.description}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-end text-right">
          <p className="micro-copy text-[var(--muted)]">{activeMode.summaryLabel}</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={mode + summaryValue}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 font-display text-4xl leading-none text-[var(--forest)] md:text-5xl"
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
        <LayoutGroup id="ingredient-cloud-modes">
          <div className="relative inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1.5">
            {MODES.map((m) => {
              const isActive = m.id === mode;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "relative rounded-full px-5 py-2 text-eyebrow tracking-[0.1em] transition",
                    isActive ? "text-[var(--on-primary)]" : "text-[var(--muted)] hover:text-[var(--forest)]",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="cloud-mode-pill"
                      className="absolute inset-0 rounded-full bg-[var(--forest)]"
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{m.label}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">
          {ingredients.length} ingredients · radius = synergy weight
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-[280px_minmax(0,1fr)] md:items-start md:gap-6">
        <aside className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-elevated)] p-5 md:sticky md:top-24 md:self-start">
          <AnimatePresence mode="wait" initial={false}>
            {hovered && (() => {
              const b = bubblesRef.current.find((node) => node.key === hovered);
              if (!b) return null;
              const tint = CATEGORY_COLOR[b.category];
              return (
                <motion.div
                  key={`detail-${b.key}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ background: tint }}
                      aria-hidden
                    />
                    <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">{b.category}</p>
                  </div>
                  <p className="mt-2 font-display text-2xl text-[var(--forest)] md:text-3xl">{b.name}</p>
                  <p className="mt-3 text-body leading-relaxed text-[var(--muted)]">{b.function}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-4 text-eyebrow tracking-[0.1em] text-[var(--muted)]">
                    <div>
                      <p>Synergy</p>
                      <p className="mt-1 font-display text-2xl text-[var(--forest)] normal-case tracking-normal">
                        {b.synergyCount}
                      </p>
                    </div>
                    <div>
                      <p>Goals</p>
                      <p className="mt-1 font-display text-2xl text-[var(--forest)] normal-case tracking-normal">
                        {b.goalBreadth}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
            {!hovered && (
              <motion.div
                key="legend"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">Hover an ingredient</p>
                <p className="mt-2 font-display text-xl leading-tight text-[var(--forest)]">
                  Read its function, synergy, and goal coverage.
                </p>
                <ul className="mt-5 space-y-2 border-t border-[var(--line)] pt-4">
                  {stats.categories.map((cat) => (
                    <li key={cat} className="flex items-center gap-2.5 text-eyebrow tracking-[0.1em] text-[var(--muted)]">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: CATEGORY_COLOR[cat] }}
                      />
                      {cat}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        <MobileChart
          ingredients={ingredients}
          categories={stats.categories}
          mode={mode}
          hovered={hovered}
          setHovered={setHovered}
        />

        <div
          ref={containerRef}
          className="relative hidden w-full overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] md:block"
          style={{ height: size.height }}
        >
        {/* axes (synergy mode) */}
        <AnimatePresence>
          {mode === "synergy" && (
            <motion.div
              key="axes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none absolute inset-0"
            >
              <div
                className="absolute left-0 right-0 border-t border-dashed border-[var(--line-strong)]"
                style={{ top: size.height - PADDING + 0.5 }}
              />
              <div
                className="absolute bottom-0 top-0 border-l border-dashed border-[var(--line-strong)]"
                style={{ left: PADDING - 0.5 }}
              />
              <span
                className="absolute whitespace-nowrap text-eyebrow tracking-[0.1em] text-[var(--muted)]"
                style={{ left: PADDING + 8, bottom: 18 }}
              >
                Synergy connections →
              </span>
              <span
                className="absolute whitespace-nowrap text-eyebrow tracking-[0.1em] text-[var(--muted)]"
                style={{
                  left: 18,
                  top: "50%",
                  transform: "translate(-50%, -50%) rotate(-90deg)",
                  transformOrigin: "center",
                }}
              >
                Goal breadth →
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* bubbles */}
        {bubblesRef.current.map((b) => {
          const tint = CATEGORY_COLOR[b.category];
          const isHovered = hovered === b.key;
          return (
            <div
              key={b.key}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setHovered(b.key)}
              onMouseLeave={() => setHovered((prev) => (prev === b.key ? null : prev))}
              onFocus={() => setHovered(b.key)}
              onBlur={() => setHovered((prev) => (prev === b.key ? null : prev))}
              className="absolute flex select-none items-center justify-center rounded-full text-center transition-shadow duration-300 [transition-timing-function:var(--easing-premium)]"
              style={{
                width: b.radius * 2,
                height: b.radius * 2,
                transform: `translate3d(${(b.x ?? 0) - b.radius}px, ${(b.y ?? 0) - b.radius}px, 0)`,
                background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${tint} 92%, white) 0%, ${tint} 70%, color-mix(in srgb, ${tint} 70%, var(--forest)) 100%)`,
                color: "var(--forest)",
                boxShadow: isHovered
                  ? `0 14px 38px color-mix(in srgb, ${tint} 60%, transparent), 0 0 0 2px color-mix(in srgb, ${tint} 80%, transparent)`
                  : `0 6px 18px color-mix(in srgb, ${tint} 32%, transparent)`,
                zIndex: isHovered ? 10 : 1,
                willChange: "transform",
              }}
            >
              <span
                className="px-1 leading-tight"
                style={{
                  fontSize: Math.max(8, Math.min(12, b.radius * 0.42)),
                  letterSpacing: "0.02em",
                  opacity: b.radius < 13 ? 0 : 0.92,
                }}
              >
                {compactName(b.name)}
              </span>
            </div>
          );
        })}

        {/* category labels (categories mode) — rendered after bubbles so they sit above in z-order */}
        <AnimatePresence>
          {mode === "categories" && (
            <motion.div
              key="cat-labels"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none absolute inset-0"
              style={{ zIndex: 30 }}
            >
              {stats.categories.map((cat) => {
                const positioned = bubblesRef.current.filter((b) => b.category === cat);
                if (positioned.length === 0) return null;
                const meanX = positioned.reduce((s, b) => s + (b.x ?? b.targetX ?? 0), 0) / positioned.length;
                const maxY = Math.max(
                  ...positioned.map((b) => (b.y ?? b.targetY ?? 0) + b.radius),
                );
                return (
                  <span
                    key={cat}
                    className="absolute -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--surface-elevated)] px-2.5 py-1 text-eyebrow tracking-[0.1em] text-[var(--muted)] shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
                    style={{ left: meanX, top: maxY + 18 }}
                  >
                    {cat}
                  </span>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <span className="sr-only" aria-live="polite">
          Tick {tickCounter}
        </span>
        </div>
      </div>
    </section>
  );
}

function compactName(name: string): string {
  if (name.length <= 14) return name;
  const trimmed = name
    .replace(/\b(Liposomal|Bioavailable|Active)\b\s*/gi, "")
    .trim();
  if (trimmed.length <= 14) return trimmed;
  return trimmed.slice(0, 12) + "…";
}

// ---------- Mobile chart view ----------
// The bubble cloud is a desktop idiom. Below md we render proper charts with
// axes — one chart per mode, each picked for the insight that mode conveys:
//
//   Library      → Donut chart of category distribution (5–6 slices, count)
//   Categories   → Vertical bar chart, x=category, y=ingredient count + total score
//   Synergy map  → Vertical bar chart, x=top 12 ingredients (rotated labels),
//                  y=synergy + goal-breadth score
//
// Each chart updates the shared `hovered` state on tap so the desktop aside
// stays in sync if the viewport changes mid-session.

function ingredientScore(i: IngredientEntry): number {
  return Math.max(1, (i.synergies?.length ?? 0) + new Set(i.goals).size);
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
}

function donutSlicePath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number,
) {
  const [x1, y1] = polarToCartesian(cx, cy, rOuter, startAngle);
  const [x2, y2] = polarToCartesian(cx, cy, rOuter, endAngle);
  const [x3, y3] = polarToCartesian(cx, cy, rInner, endAngle);
  const [x4, y4] = polarToCartesian(cx, cy, rInner, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;
}

function MobileChart({
  ingredients,
  categories,
  mode,
}: {
  ingredients: IngredientEntry[];
  categories: IngredientCategory[];
  mode: Mode;
  hovered: string | null;
  setHovered: (next: string | null | ((prev: string | null) => string | null)) => void;
}) {
  if (mode === "library") {
    return <CategoryDonut ingredients={ingredients} categories={categories} />;
  }
  if (mode === "categories") {
    return <CategoryBarChart ingredients={ingredients} categories={categories} />;
  }
  return <TopIngredientsBarChart ingredients={ingredients} />;
}

function CategoryDonut({
  ingredients,
  categories,
}: {
  ingredients: IngredientEntry[];
  categories: IngredientCategory[];
}) {
  const data = categories
    .map((cat) => ({
      cat,
      count: ingredients.filter((i) => i.category === cat).length,
    }))
    .filter((d) => d.count > 0);
  const total = data.reduce((s, d) => s + d.count, 0);

  const cx = 0;
  const cy = 0;
  const rOuter = 90;
  const rInner = 56;

  let runningAngle = 0;
  const slices = data.map((d) => {
    const sweep = (d.count / total) * 360;
    const start = runningAngle;
    const end = runningAngle + sweep - 0.5; // tiny gap between slices
    runningAngle += sweep;
    const midAngle = (start + end) / 2;
    const [labelX, labelY] = polarToCartesian(cx, cy, (rOuter + rInner) / 2, midAngle);
    return {
      cat: d.cat,
      count: d.count,
      pct: Math.round((d.count / total) * 100),
      start,
      end,
      midAngle,
      labelX,
      labelY,
      path: donutSlicePath(cx, cy, rOuter, rInner, start, end),
      color: CATEGORY_COLOR[d.cat],
    };
  });

  return (
    <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-elevated)] p-4 md:hidden">
      <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">
        Library composition
      </p>
      <div className="mt-3 flex flex-col items-center gap-4">
        <svg viewBox="-110 -110 220 220" className="h-auto w-full max-w-[280px]" aria-hidden>
          {slices.map((s) => (
            <path key={s.cat} d={s.path} fill={s.color} stroke="var(--bg)" strokeWidth={1.5} />
          ))}
          {/* slice labels (count) — only render if slice is wide enough */}
          {slices.map((s) =>
            s.end - s.start > 18 ? (
              <text
                key={`l-${s.cat}`}
                x={s.labelX}
                y={s.labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="9"
                fill="var(--forest)"
                style={{ fontWeight: 600 }}
              >
                {s.count}
              </text>
            ) : null,
          )}
          {/* center: total */}
          <text
            x={0}
            y={-4}
            textAnchor="middle"
            fontSize="22"
            fill="var(--forest)"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {total}
          </text>
          <text
            x={0}
            y={14}
            textAnchor="middle"
            fontSize="8"
            letterSpacing="2"
            fill="var(--muted)"
          >
            INGREDIENTS
          </text>
        </svg>

        <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-1.5">
          {slices.map((s) => (
            <li
              key={`legend-${s.cat}`}
              className="flex items-center gap-2 text-eyebrow tracking-[0.1em] text-[var(--muted)]"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: s.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-[var(--forest)]">{s.cat}</span>
              <span className="shrink-0 font-mono tabular-nums">{s.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CategoryBarChart({
  ingredients,
  categories,
}: {
  ingredients: IngredientEntry[];
  categories: IngredientCategory[];
}) {
  const data = categories
    .map((cat) => ({
      cat,
      count: ingredients.filter((i) => i.category === cat).length,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(1, ...data.map((d) => d.count));
  // Y-axis ticks: 0 → maxCount, evenly spaced
  const tickCount = Math.min(maxCount, 5);
  const tickValues = Array.from({ length: tickCount + 1 }, (_, i) =>
    Math.round((maxCount * i) / tickCount),
  );

  const padLeft = 26;
  const padBottom = 70; // leave room for rotated labels
  const padTop = 12;
  const barW = 36;
  const gap = 14;
  const chartH = 170;
  const chartW = data.length * (barW + gap);
  const totalW = padLeft + chartW + 8;
  const totalH = padTop + chartH + padBottom;

  return (
    <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-elevated)] p-4 md:hidden">
      <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">
        Ingredients per category
      </p>
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="mt-3 h-auto w-full"
        role="img"
        aria-label="Ingredient count by category"
      >
        {/* Y-axis grid lines + labels */}
        {tickValues.map((v) => {
          const y = padTop + chartH - (v / maxCount) * chartH;
          return (
            <g key={v}>
              <line
                x1={padLeft}
                x2={padLeft + chartW}
                y1={y}
                y2={y}
                stroke="var(--line)"
                strokeDasharray={v === 0 ? "0" : "2 3"}
              />
              <text
                x={padLeft - 5}
                y={y + 3}
                textAnchor="end"
                fontSize="8"
                fill="var(--muted)"
                fontFamily="var(--font-mono, monospace)"
              >
                {v}
              </text>
            </g>
          );
        })}
        {/* Y-axis line */}
        <line
          x1={padLeft}
          x2={padLeft}
          y1={padTop}
          y2={padTop + chartH}
          stroke="var(--line-strong)"
        />
        {/* Bars */}
        {data.map((d, i) => {
          const x = padLeft + i * (barW + gap) + gap / 2;
          const h = (d.count / maxCount) * chartH;
          const y = padTop + chartH - h;
          const labelX = x + barW / 2;
          const labelY = padTop + chartH + 8;
          return (
            <g key={d.cat}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={4}
                fill={CATEGORY_COLOR[d.cat]}
                opacity={0.85}
              />
              <text
                x={x + barW / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize="9"
                fill="var(--forest)"
                fontWeight={600}
              >
                {d.count}
              </text>
              {/* X-axis label, rotated -45° around its anchor */}
              <text
                x={labelX}
                y={labelY}
                textAnchor="end"
                fontSize="9"
                fill="var(--muted)"
                transform={`rotate(-40 ${labelX} ${labelY})`}
              >
                {d.cat}
              </text>
            </g>
          );
        })}
        {/* Y-axis title */}
        <text
          x={6}
          y={padTop + chartH / 2}
          textAnchor="middle"
          fontSize="8"
          fill="var(--muted)"
          letterSpacing="2"
          transform={`rotate(-90 6 ${padTop + chartH / 2})`}
        >
          COUNT
        </text>
      </svg>
    </div>
  );
}

function TopIngredientsBarChart({ ingredients }: { ingredients: IngredientEntry[] }) {
  const TOP_N = 12;
  const data = [...ingredients]
    .sort((a, b) => ingredientScore(b) - ingredientScore(a))
    .slice(0, TOP_N);

  const maxScore = Math.max(1, ...data.map(ingredientScore));
  const tickCount = Math.min(maxScore, 4);
  const tickValues = Array.from({ length: tickCount + 1 }, (_, i) =>
    Math.round((maxScore * i) / tickCount),
  );

  const padLeft = 26;
  const padBottom = 92; // longer ingredient names need more rotation room
  const padTop = 12;
  const barW = 18;
  const gap = 8;
  const chartH = 200;
  const chartW = data.length * (barW + gap);
  const totalW = padLeft + chartW + 8;
  const totalH = padTop + chartH + padBottom;

  return (
    <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-elevated)] p-4 md:hidden">
      <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">
        Top {TOP_N} ingredients · synergy + goal score
      </p>
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="mt-3 h-auto w-full"
        role="img"
        aria-label="Top ingredients by combined synergy and goal score"
      >
        {/* Y-axis grid + labels */}
        {tickValues.map((v) => {
          const y = padTop + chartH - (v / maxScore) * chartH;
          return (
            <g key={v}>
              <line
                x1={padLeft}
                x2={padLeft + chartW}
                y1={y}
                y2={y}
                stroke="var(--line)"
                strokeDasharray={v === 0 ? "0" : "2 3"}
              />
              <text
                x={padLeft - 5}
                y={y + 3}
                textAnchor="end"
                fontSize="8"
                fill="var(--muted)"
              >
                {v}
              </text>
            </g>
          );
        })}
        {/* Y-axis line */}
        <line
          x1={padLeft}
          x2={padLeft}
          y1={padTop}
          y2={padTop + chartH}
          stroke="var(--line-strong)"
        />
        {/* Bars */}
        {data.map((ing, i) => {
          const score = ingredientScore(ing);
          const x = padLeft + i * (barW + gap) + gap / 2;
          const h = (score / maxScore) * chartH;
          const y = padTop + chartH - h;
          const labelX = x + barW / 2;
          const labelY = padTop + chartH + 8;
          return (
            <g key={ing.key}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={3}
                fill={CATEGORY_COLOR[ing.category]}
                opacity={0.85}
              />
              <text
                x={x + barW / 2}
                y={y - 3}
                textAnchor="middle"
                fontSize="8"
                fill="var(--forest)"
                fontWeight={600}
              >
                {score}
              </text>
              <text
                x={labelX}
                y={labelY}
                textAnchor="end"
                fontSize="8"
                fill="var(--muted)"
                transform={`rotate(-55 ${labelX} ${labelY})`}
              >
                {compactName(ing.name)}
              </text>
            </g>
          );
        })}
        {/* Y-axis title */}
        <text
          x={6}
          y={padTop + chartH / 2}
          textAnchor="middle"
          fontSize="8"
          fill="var(--muted)"
          letterSpacing="2"
          transform={`rotate(-90 6 ${padTop + chartH / 2})`}
        >
          SCORE
        </text>
      </svg>
    </div>
  );
}

