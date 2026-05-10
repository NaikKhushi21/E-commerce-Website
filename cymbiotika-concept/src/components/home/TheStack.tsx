"use client";

import { useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import type { Product } from "@/data/products";
import type { WellnessGoal } from "@/data/goals";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCart } from "@/components/cart/CartProvider";

const STACK_LIMIT = 6;

const GOAL_COLOR: Record<WellnessGoal, string> = {
  energy: "#fba973",
  immunity: "#fbd5b5",
  "gut-health": "#8ce0d6",
  "brain-health": "#c8b8ff",
  sleep: "#9ec9ff",
  stress: "#c8b8ff",
  skin: "#f5d4a8",
  detox: "#c8b8ff",
  longevity: "#8ce0d6",
};

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

function shortName(title: string) {
  return title
    .replace(/Liposomal\s+/i, "")
    .replace(/Liquid\s+/i, "")
    .replace(/Complex/i, "")
    .trim()
    .slice(0, 14);
}

export function TheStack({ products }: { products: Product[] }) {
  const reduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const trayRef = useRef<HTMLDivElement | null>(null);
  const [stack, setStack] = useState<Product[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [trayActive, setTrayActive] = useState(false);

  function addStackToCart() {
    stack.forEach((p) => addItem(p));
  }

  const available = useMemo(() => products.slice(0, STACK_LIMIT), [products]);
  const remaining = useMemo(
    () => available.filter((p) => !stack.find((s) => s.id === p.id)),
    [available, stack],
  );

  function pointInRect(point: { x: number; y: number }, rect: DOMRect) {
    return (
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom
    );
  }

  function handleDrag(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    const tray = trayRef.current;
    if (!tray) return;
    setTrayActive(pointInRect(info.point, tray.getBoundingClientRect()));
  }

  function handleDragEnd(
    product: Product,
    _: PointerEvent | MouseEvent | TouchEvent,
    info: PanInfo,
  ) {
    setDragging(null);
    setTrayActive(false);
    const tray = trayRef.current;
    if (!tray) return;
    if (pointInRect(info.point, tray.getBoundingClientRect())) {
      setStack((prev) =>
        prev.find((p) => p.id === product.id) ? prev : [...prev, product],
      );
    }
  }

  function removeFromStack(id: string) {
    setStack((prev) => prev.filter((p) => p.id !== id));
  }

  function clearStack() {
    setStack([]);
  }

  // Goal coverage aggregated from stack
  const coverage = useMemo(() => {
    const counts = new Map<WellnessGoal, number>();
    stack.forEach((p) => {
      p.goals.forEach((g) => counts.set(g, (counts.get(g) ?? 0) + 1));
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [stack]);

  const totalPrice = stack.reduce((sum, p) => sum + p.price, 0);

  return (
    <section
      className="theme-aurora relative isolate overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[var(--bg)] p-6 text-[var(--text)] shadow-[0_30px_90px_rgba(12,31,28,0.35)] md:p-12"
      aria-label="The Stack — routine mixer"
    >
      {/* Atmosphere — gold + teal accent washes only; the green base shows through */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 22% 20%, rgba(245,183,95,0.12), transparent 56%), radial-gradient(80% 60% at 82% 78%, rgba(140,224,214,0.08), transparent 64%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.16] bg-[radial-gradient(rgba(255,255,255,0.6)_0.5px,transparent_0.5px)] [background-size:3px_3px]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.36em] text-white/55">The Stack</p>
            <h2 className="display-title mt-4 text-[clamp(2.2rem,5vw,4.4rem)] leading-[0.98] text-white">
              Drag formulas in. Watch them work together.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/65 md:text-base">
              A routine mixer. Drop any combination into the tray — synergy threads draw between
              compatible pairs, coverage bars show what your stack delivers.
            </p>
          </div>
          {stack.length > 0 && (
            <div className="flex flex-col items-end gap-3 text-right">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-white/45">Stack value</p>
                <p className="mt-2 font-display text-3xl text-white md:text-4xl">
                  ${totalPrice.toFixed(0)}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/35">
                  {stack.length} formula{stack.length === 1 ? "" : "s"} stacked
                </p>
              </div>
              <button
                type="button"
                onClick={addStackToCart}
                className="rounded-full bg-white px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-[var(--on-primary)] transition hover:scale-[1.02]"
              >
                Add stack to cart
              </button>
            </div>
          )}
        </div>

        {/* Available row */}
        <div className="mt-10">
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/40">
            Available formulas — drag any in
          </p>
          <div className="mt-5 flex flex-wrap gap-3 md:gap-4">
            <AnimatePresence>
              {remaining.map((product) => (
                <DraggablePuck
                  key={product.id}
                  product={product}
                  reduceMotion={!!reduceMotion}
                  isDragging={dragging === product.id}
                  trayActive={trayActive && dragging === product.id}
                  onDragStart={() => setDragging(product.id)}
                  onDrag={handleDrag}
                  onDragEnd={(e, info) => handleDragEnd(product, e, info)}
                  onTap={() =>
                    setStack((prev) =>
                      prev.find((p) => p.id === product.id) ? prev : [...prev, product],
                    )
                  }
                />
              ))}
            </AnimatePresence>
            {remaining.length === 0 && (
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                All formulas in your stack.
              </p>
            )}
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-white/30">
            Drag into the tray below — or tap to add.
          </p>
        </div>

        {/* Tray */}
        <motion.div
          ref={trayRef}
          className="relative mt-8 overflow-hidden rounded-[2rem] border border-dashed transition-colors"
          animate={{
            borderColor: trayActive
              ? "rgba(215,195,167,0.65)"
              : stack.length > 0
                ? "rgba(255,255,255,0.18)"
                : "rgba(255,255,255,0.12)",
            backgroundColor: trayActive
              ? "rgba(215,195,167,0.06)"
              : "rgba(255,255,255,0.02)",
          }}
          transition={{ duration: 0.25 }}
        >
          {stack.length === 0 ? (
            <div className="flex h-[420px] items-center justify-center text-center md:h-[460px]">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-white/40">Drop formulas here</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-white/25">
                  Synergy threads will appear between compatible pairs
                </p>
              </div>
            </div>
          ) : (
            <StackTray
              stack={stack}
              hovered={hovered}
              onHover={setHovered}
              onRemove={removeFromStack}
              onAdd={addItem}
              reduceMotion={!!reduceMotion}
            />
          )}
        </motion.div>

        {/* Stack delivers */}
        {stack.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-10"
          >
            <div className="flex items-end justify-between">
              <p className="text-[10px] uppercase tracking-[0.32em] text-white/40">
                Stack delivers
              </p>
              <button
                type="button"
                onClick={clearStack}
                className="text-[10px] uppercase tracking-[0.28em] text-white/50 transition hover:text-white"
              >
                Clear stack
              </button>
            </div>
            {coverage.length === 0 ? (
              <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-white/35">
                No tagged goals — drop more formulas to see coverage.
              </p>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {coverage.slice(0, 8).map(([goal, count]) => (
                  <CoverageBar
                    key={goal}
                    label={GOAL_LABEL[goal] ?? goal}
                    count={count}
                    total={stack.length}
                    color={GOAL_COLOR[goal] ?? "#d7c3a7"}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ---------- Draggable puck (available row) ----------

function DraggablePuck({
  product,
  reduceMotion,
  isDragging,
  trayActive,
  onDragStart,
  onDrag,
  onDragEnd,
  onTap,
}: {
  product: Product;
  reduceMotion: boolean;
  isDragging: boolean;
  trayActive: boolean;
  onDragStart: () => void;
  onDrag: (e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => void;
  onDragEnd: (e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => void;
  onTap: () => void;
}) {
  const shadow =
    isDragging && trayActive
      ? "0 0 36px rgba(215,195,167,0.55), 0 18px 50px rgba(0,0,0,0.45)"
      : "0 8px 26px rgba(0,0,0,0.35)";

  return (
    <motion.div
      drag={!reduceMotion}
      dragSnapToOrigin
      dragMomentum={false}
      dragElastic={0.2}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      onTap={onTap}
      whileHover={reduceMotion ? undefined : { scale: 1.04, y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      whileDrag={{ scale: 1.12, zIndex: 60, cursor: "grabbing" }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-28 w-28 cursor-grab select-none overflow-hidden rounded-2xl border border-white/12 bg-white/[0.05] md:h-32 md:w-32"
      style={{ touchAction: "none", boxShadow: shadow, WebkitUserSelect: "none" }}
      title={`Drag or tap ${product.title} to add`}
    >
      {/* All inner content is non-interactive so pointer events go to the motion.div */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18), transparent 55%)",
          }}
        />
        <div className="relative h-full w-full p-2 pb-7">
          <SafeImage
            src={product.featuredImage}
            alt={product.title}
            fill
            draggable={false}
            className="select-none object-contain p-1"
            style={{ WebkitUserDrag: "none", userDrag: "none" } as React.CSSProperties}
          />
        </div>
        <span className="absolute bottom-1.5 left-0 right-0 truncate px-2 text-center text-[9px] uppercase tracking-[0.18em] text-white/65">
          {shortName(product.title)}
        </span>
      </div>
    </motion.div>
  );
}

// ---------- Stack tray (laid-out items + synergy SVG) ----------

function StackTray({
  stack,
  hovered,
  onHover,
  onRemove,
  onAdd,
  reduceMotion,
}: {
  stack: Product[];
  hovered: string | null;
  onHover: (id: string | null) => void;
  onRemove: (id: string) => void;
  onAdd: (product: Product) => void;
  reduceMotion: boolean;
}) {
  // Position items in a circle inside the tray
  const positions = useMemo(() => {
    if (stack.length === 1) {
      return [{ x: 50, y: 50 }];
    }
    const angleOffset = -Math.PI / 2;
    return stack.map((_, i) => {
      const angle = angleOffset + (i / stack.length) * Math.PI * 2;
      const radius = stack.length > 4 ? 34 : 30;
      return {
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius * 0.8, // squash vertically
      };
    });
  }, [stack]);

  // Find pairs with shared goals (synergy)
  const pairs = useMemo(() => {
    const result: Array<{
      a: number;
      b: number;
      shared: WellnessGoal[];
      color: string;
    }> = [];
    for (let i = 0; i < stack.length; i += 1) {
      for (let j = i + 1; j < stack.length; j += 1) {
        const shared = stack[i].goals.filter((g) => stack[j].goals.includes(g));
        const color =
          shared.length > 0 ? GOAL_COLOR[shared[0]] ?? "#d7c3a7" : "rgba(255,255,255,0.16)";
        result.push({ a: i, b: j, shared, color });
      }
    }
    return result;
  }, [stack]);

  return (
    <div className="relative h-[420px] md:h-[460px]">
      {/* Synergy lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        {pairs.map((pair) => {
          const p1 = positions[pair.a];
          const p2 = positions[pair.b];
          const isSynergy = pair.shared.length > 0;
          const isHighlighted =
            hovered !== null &&
            (stack[pair.a].id === hovered || stack[pair.b].id === hovered);
          const opacity = isSynergy
            ? isHighlighted
              ? 1
              : 0.7
            : isHighlighted
              ? 0.5
              : 0.25;
          return (
            <motion.line
              key={`${stack[pair.a].id}-${stack[pair.b].id}`}
              x1={`${p1.x}%`}
              y1={`${p1.y}%`}
              x2={`${p2.x}%`}
              y2={`${p2.y}%`}
              stroke={pair.color}
              strokeWidth={isSynergy ? (isHighlighted ? 1.8 : 1.2) : 0.6}
              strokeDasharray={isSynergy ? "0" : "3 5"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={
                isSynergy && !reduceMotion
                  ? { filter: `drop-shadow(0 0 8px ${pair.color}88)` }
                  : undefined
              }
            />
          );
        })}
      </svg>

      {/* Stacked product chips */}
      <AnimatePresence>
        {stack.map((product, i) => {
          const pos = positions[i];
          return (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, left: `${pos.x}%`, top: `${pos.y}%` }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              onMouseEnter={() => onHover(product.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(product.id)}
              onBlur={() => onHover(null)}
            >
              <div
                className="group relative h-24 w-24 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] transition hover:border-white/45 md:h-28 md:w-28"
                aria-label={product.title}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18), transparent 55%)",
                  }}
                />
                <div className="pointer-events-none relative h-full w-full p-2 pb-7">
                  <SafeImage
                    src={product.featuredImage}
                    alt={product.title}
                    fill
                    draggable={false}
                    className="select-none object-contain p-1"
                  />
                </div>
                <span className="pointer-events-none absolute bottom-1.5 left-0 right-0 truncate px-2 text-center text-[9px] uppercase tracking-[0.18em] text-white/65">
                  {shortName(product.title)}
                </span>

                {/* Hover overlay with Add + Remove */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => onAdd(product)}
                    className="rounded-full bg-white px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-[var(--on-primary)] transition hover:scale-[1.04]"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(product.id)}
                    className="text-[9px] uppercase tracking-[0.22em] text-white/70 transition hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ---------- Coverage bar ----------

function CoverageBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const fraction = Math.min(count / Math.max(total, 1), 1);
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/75">{label}</p>
        <span className="text-[10px] tabular-nums text-white/45">
          {count}/{total}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={false}
          animate={{ width: `${fraction * 100}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 14px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}
