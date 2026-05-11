"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/data/products";
import type { WellnessGoal } from "@/data/goals";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCart } from "@/components/cart/CartProvider";

const FREE_SHIPPING_THRESHOLD = 75;

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

const r2 = (v: number) => Math.round(v * 100) / 100;

type CartItem = ReturnType<typeof useCart>["items"][number];

export function CartDrawer() {
  const reduceMotion = useReducedMotion();
  const { isOpen, closeCart, items, subtotal, removeItem, updateQuantity, shopifyCartUrl } =
    useCart();

  // Lock the underlying page scroll while the cart is open. Compensates for
  // the disappearing scrollbar so the page doesn't shift behind the drawer.
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousPaddingRight = root.style.paddingRight;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      root.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      root.style.overflow = previousOverflow;
      root.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen]);

  const cartProducts: Product[] = useMemo(() => items.map((entry) => entry.product), [items]);

  // Constellation node positions in % of container
  const positions = useMemo(() => {
    const n = cartProducts.length;
    if (n === 0) return [];
    if (n === 1) return [{ x: 50, y: 50 }];
    return cartProducts.map((_, i) => {
      const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
      const radius = n > 4 ? 36 : 32;
      return {
        x: r2(50 + Math.cos(angle) * radius),
        y: r2(50 + Math.sin(angle) * radius * 0.78),
      };
    });
  }, [cartProducts]);

  // Synergy pairs
  const pairs = useMemo(() => {
    const result: Array<{
      a: number;
      b: number;
      shared: WellnessGoal[];
      color: string;
    }> = [];
    for (let i = 0; i < cartProducts.length; i += 1) {
      for (let j = i + 1; j < cartProducts.length; j += 1) {
        const goalsA = cartProducts[i].goals ?? [];
        const goalsB = cartProducts[j].goals ?? [];
        const shared = goalsA.filter((g) => goalsB.includes(g));
        const color =
          shared.length > 0 ? GOAL_COLOR[shared[0]] ?? "#d7c3a7" : "rgba(255,255,255,0.16)";
        result.push({ a: i, b: j, shared, color });
      }
    }
    return result;
  }, [cartProducts]);

  // Goal coverage
  const coverage = useMemo(() => {
    const counts = new Map<WellnessGoal, number>();
    cartProducts.forEach((p) => p.goals.forEach((g) => counts.set(g, (counts.get(g) ?? 0) + 1)));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [cartProducts]);

  const fallbackDomain =
    process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN ??
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ??
    "cymbiotika.com";
  const checkoutHref =
    shopifyCartUrl ?? (items.length > 0 ? `https://${fallbackDomain}/cart?storefront=true` : null);

  const shipFraction = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1);
  const shipRemaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            data-lenis-prevent
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
            onClick={closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.aside
            role="dialog"
            aria-label="Your protocol"
            data-lenis-prevent
            className="theme-aurora fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col overflow-hidden border-l border-[var(--line)] bg-[var(--bg)] text-[var(--text)] shadow-[0_0_140px_rgba(0,0,0,0.8)]"
            initial={reduceMotion ? undefined : { x: "100%" }}
            animate={reduceMotion ? undefined : { x: 0 }}
            exit={reduceMotion ? undefined : { x: "100%" }}
            transition={reduceMotion ? undefined : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Atmosphere */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(80% 60% at 50% 0%, rgba(215,195,167,0.10), transparent 55%), radial-gradient(60% 40% at 50% 100%, rgba(140,224,214,0.06), transparent 55%)",
              }}
            />
            <div className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.14] bg-[radial-gradient(rgba(255,255,255,0.6)_0.5px,transparent_0.5px)] [background-size:3px_3px]" />

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between gap-4 px-6 pt-6">
              <div>
                <p className="text-eyebrow tracking-[0.1em] text-white/78">
                  Your Protocol
                </p>
                <p className="mt-1.5 font-display text-2xl leading-none text-white">
                  {items.length === 0
                    ? "Empty field"
                    : `${items.length} formula${items.length === 1 ? "" : "s"}`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-full border border-white/15 p-2 transition hover:border-white/45 hover:text-white"
                aria-label="Close cart"
              >
                <X size={16} />
              </button>
            </div>

            <div
              data-lenis-prevent
              className="relative z-10 flex-1 overflow-y-auto px-6 pb-2 pt-5"
            >
              {items.length === 0 ? (
                <EmptyState onClose={closeCart} />
              ) : (
                <>
                  {/* Free shipping bar */}
                  <ShippingMeter
                    subtotal={subtotal}
                    fraction={shipFraction}
                    remaining={shipRemaining}
                  />

                  {/* Constellation */}
                  <div className="mt-7">
                    <p className="text-eyebrow tracking-[0.1em] text-white/78">
                      Synergy field
                    </p>
                    <Constellation
                      cartProducts={cartProducts}
                      items={items}
                      positions={positions}
                      pairs={pairs}
                    />
                  </div>

                  {/* Coverage */}
                  {coverage.length > 0 ? (
                    <div className="mt-5">
                      <p className="text-eyebrow tracking-[0.1em] text-white/78">
                        Stack delivers
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {coverage.slice(0, 6).map(([goal, count]) => (
                          <CoverageBar
                            key={goal}
                            label={GOAL_LABEL[goal] ?? goal}
                            count={count}
                            total={items.length}
                            color={GOAL_COLOR[goal] ?? "#d7c3a7"}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Line items */}
                  <div className="mt-6 pb-4">
                    <p className="text-eyebrow tracking-[0.1em] text-white/78">Items</p>
                    <ul className="mt-3 space-y-2">
                      {items.map((item) => (
                        <CartLine
                          key={item.id}
                          item={item}
                          onRemove={() => removeItem(item.id)}
                          onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                          onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                        />
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 ? (
              <div className="relative z-10 border-t border-white/8 px-6 py-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-eyebrow tracking-[0.1em] text-white/78">
                      Subtotal
                    </p>
                  </div>
                  <p className="font-display text-3xl leading-none text-white">
                    {formatMoney(subtotal)}
                  </p>
                </div>
                {checkoutHref ? (
                  <a
                    href={checkoutHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeCart}
                    className="mt-4 block w-full rounded-full bg-white py-3.5 text-center text-eyebrow tracking-[0.1em] text-[var(--on-primary)] transition hover:scale-[1.01]"
                  >
                    Checkout →
                  </a>
                ) : null}
                <Link
                  href="/quiz"
                  onClick={closeCart}
                  className="mt-3 block text-center text-eyebrow tracking-[0.1em] text-white/78 transition hover:text-white"
                >
                  Build a different protocol →
                </Link>
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

// ---------- Empty state ----------

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <svg viewBox="0 0 200 200" className="h-32 w-32 opacity-60" aria-hidden="true">
        <defs>
          <radialGradient id="cd-empty-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(215,195,167,0.4)" />
            <stop offset="100%" stopColor="rgba(215,195,167,0)" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill="url(#cd-empty-glow)" />
        <circle
          cx="100"
          cy="100"
          r="60"
          fill="none"
          stroke="rgba(215,195,167,0.4)"
          strokeWidth="0.8"
          strokeDasharray="2 5"
        />
        <circle
          cx="100"
          cy="100"
          r="40"
          fill="none"
          stroke="rgba(215,195,167,0.25)"
          strokeWidth="0.6"
          strokeDasharray="1 4"
        />
      </svg>
      <p className="mt-2 text-eyebrow tracking-[0.1em] text-white/78">No formulas yet</p>
      <p className="mt-3 max-w-[260px] text-body leading-relaxed text-white/60">
        Light up zones in the Protocol Quiz, drop formulas into The Stack on the home page, or
        browse the catalog.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/quiz"
          onClick={onClose}
          className="rounded-full bg-white px-5 py-2.5 text-eyebrow tracking-[0.1em] text-[var(--on-primary)] transition hover:scale-[1.02]"
        >
          Take the quiz
        </Link>
        <Link
          href="/products"
          onClick={onClose}
          className="rounded-full border border-white/20 px-5 py-2.5 text-eyebrow tracking-[0.1em] text-white transition hover:border-white/45"
        >
          Browse formulas
        </Link>
      </div>
    </div>
  );
}

// ---------- Shipping meter ----------

function ShippingMeter({
  subtotal,
  fraction,
  remaining,
}: {
  subtotal: number;
  fraction: number;
  remaining: number;
}) {
  const reached = remaining === 0 && subtotal > 0;
  return (
    <div>
      <div className="flex items-center justify-between text-eyebrow tracking-[0.1em] text-white/78">
        <span>{reached ? "Free shipping unlocked" : "Free shipping"}</span>
        <span className="text-white/65">
          {reached ? "✓" : `$${remaining.toFixed(0)} away`}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          initial={false}
          animate={{ width: `${fraction * 100}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: reached ? "#8ce0d6" : "#d7c3a7",
            boxShadow: `0 0 10px ${reached ? "#8ce0d6" : "#d7c3a7"}66`,
          }}
        />
      </div>
    </div>
  );
}

// ---------- Constellation ----------

function Constellation({
  cartProducts,
  items,
  positions,
  pairs,
}: {
  cartProducts: Product[];
  items: CartItem[];
  positions: Array<{ x: number; y: number }>;
  pairs: Array<{ a: number; b: number; shared: WellnessGoal[]; color: string }>;
}) {
  return (
    <div className="relative mt-3 h-[240px] w-full overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
      {/* Soft halo behind constellation */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(215,195,167,0.10) 0%, rgba(215,195,167,0) 65%)",
        }}
      />

      {/* Synergy lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        {pairs.map((pair) => {
          const p1 = positions[pair.a];
          const p2 = positions[pair.b];
          const isSynergy = pair.shared.length > 0;
          return (
            <motion.line
              key={`${pair.a}-${pair.b}`}
              x1={`${p1.x}%`}
              y1={`${p1.y}%`}
              x2={`${p2.x}%`}
              y2={`${p2.y}%`}
              stroke={pair.color}
              strokeWidth={isSynergy ? 1.4 : 0.6}
              strokeDasharray={isSynergy ? "0" : "3 5"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: isSynergy ? 0.7 : 0.28 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={
                isSynergy
                  ? { filter: `drop-shadow(0 0 6px ${pair.color}88)` }
                  : undefined
              }
            />
          );
        })}
      </svg>

      {/* Constellation nodes */}
      {cartProducts.map((product, i) => {
        const pos = positions[i];
        const item = items[i];
        return (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, left: `${pos.x}%`, top: `${pos.y}%` }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 240, damping: 28 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative">
              <div
                className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/15 bg-white/[0.06]"
                style={{ boxShadow: "0 8px 22px rgba(0,0,0,0.45), 0 0 18px rgba(215,195,167,0.12)" }}
              >
                <SafeImage
                  src={product.featuredImage}
                  alt={product.title}
                  fill
                  draggable={false}
                  className="select-none object-contain p-1"
                />
              </div>
              {item.quantity > 1 ? (
                <span
                  className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-white/30 bg-black/85 px-1 text-[9px] tabular-nums text-white"
                  aria-label={`Quantity ${item.quantity}`}
                >
                  {item.quantity}
                </span>
              ) : null}
            </div>
          </motion.div>
        );
      })}
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
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
      <div className="flex items-center justify-between">
        <p className="text-eyebrow tracking-[0.1em] text-white/75">{label}</p>
        <span className="text-[10px] tabular-nums text-white/78">
          {count}/{total}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={false}
          animate={{ width: `${fraction * 100}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 10px ${color}66` }}
        />
      </div>
    </div>
  );
}

// ---------- Cart line ----------

function CartLine({
  item,
  onRemove,
  onIncrement,
  onDecrement,
}: {
  item: CartItem;
  onRemove: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3"
    >
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
        <SafeImage
          src={item.product.featuredImage}
          alt={item.product.title}
          fill
          draggable={false}
          className="select-none object-contain p-1"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-white">{item.product.title}</p>
        <p className="mt-0.5 text-eyebrow tracking-[0.1em] text-white/78">
          {formatMoney(item.product.price * item.quantity)}
          {item.subscription ? " · subscribed" : ""}
        </p>
      </div>
      <div className="flex items-center gap-2 text-white/65">
        <button
          type="button"
          onClick={onDecrement}
          className="h-6 w-6 rounded-full border border-white/12 text-[12px] leading-none transition hover:border-white/45 hover:text-white"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="min-w-[14px] text-center text-xs tabular-nums text-white/85">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="h-6 w-6 rounded-full border border-white/12 text-[12px] leading-none transition hover:border-white/45 hover:text-white"
          aria-label="Increase quantity"
        >
          +
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 text-[14px] leading-none text-white/78 transition hover:text-white"
          aria-label="Remove from cart"
        >
          ×
        </button>
      </div>
    </motion.li>
  );
}
