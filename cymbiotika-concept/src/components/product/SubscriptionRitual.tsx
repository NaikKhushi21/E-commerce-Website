"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/data/products";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";

type Cadence = "weekly" | "biweekly" | "monthly";

const CADENCES: Array<{
  key: Cadence;
  label: string;
  intervalDays: number;
  discountPct: number;
  hint: string;
}> = [
  { key: "weekly", label: "Weekly", intervalDays: 7, discountPct: 0, hint: "Higher-frequency dosing routines." },
  { key: "biweekly", label: "Bi-weekly", intervalDays: 14, discountPct: 10, hint: "The sweet spot for most stacks." },
  { key: "monthly", label: "Monthly", intervalDays: 30, discountPct: 15, hint: "One pouch, monthly delivery." },
];

const DAYS = 35; // 5 weeks
const TODAY_INDEX = 6; // Today sits at the end of week 1
const MAX_QUANTITY = 5;

const r2 = (v: number) => Math.round(v * 100) / 100;

/**
 * Compute the absolute date for a given grid index, treating TODAY_INDEX as
 * "today." Used for the hover tooltip so users see the real arrival day, not
 * just a relative offset.
 */
function dateForIndex(today: Date, i: number): Date {
  const out = new Date(today);
  out.setDate(out.getDate() + (i - TODAY_INDEX));
  return out;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function SubscriptionRitual({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [cadenceKey, setCadenceKey] = useState<Cadence>("biweekly");
  const [anchorIndex, setAnchorIndex] = useState(TODAY_INDEX);
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [quantity, setQuantity] = useState(1);

  // Today's actual calendar date — captured client-side so SSR/hydration is stable.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    setToday(new Date());
  }, []);

  const cadence = CADENCES.find((c) => c.key === cadenceKey) ?? CADENCES[1];

  // Resetting cadence or anchor invalidates the skip list — the same index now
  // refers to a different delivery, so we clear it to avoid stale toggles.
  useEffect(() => {
    setSkipped(new Set());
  }, [cadenceKey, anchorIndex]);

  // Delivery indices stepping out from the anchor cell at the cadence interval.
  const deliveryIndices = useMemo(() => {
    const out: number[] = [];
    for (let i = anchorIndex; i < DAYS; i += cadence.intervalDays) {
      out.push(i);
    }
    return out;
  }, [cadence.intervalDays, anchorIndex]);

  const activeDeliveries = useMemo(
    () => deliveryIndices.filter((i) => !skipped.has(i)),
    [deliveryIndices, skipped],
  );

  // The next future delivery (first non-skipped index >= today).
  const nextDeliveryDelta = useMemo(() => {
    const next = activeDeliveries.find((i) => i >= TODAY_INDEX);
    if (next === undefined) return cadence.intervalDays;
    return next - TODAY_INDEX;
  }, [activeDeliveries, cadence.intervalDays]);

  const oneTimePrice = product.price * quantity;
  const subPrice = r2(oneTimePrice * (1 - cadence.discountPct / 100));
  // Use the active delivery cadence (excluding skips) to project monthly savings —
  // skipped deliveries lower both spend and savings proportionally.
  const monthlySavings = r2(
    (oneTimePrice - subPrice) *
      (30 / cadence.intervalDays) *
      (deliveryIndices.length > 0 ? activeDeliveries.length / deliveryIndices.length : 0),
  );

  function handleCellClick(index: number, isDelivery: boolean) {
    if (isDelivery) {
      // Anchor cell can't be skipped — that's the start of the routine.
      if (index === anchorIndex) return;
      setSkipped((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    } else {
      // Empty cells anchor the routine — first delivery moves here.
      setAnchorIndex(index);
    }
  }

  // Format day labels
  const dayLabel = (i: number) => {
    if (i === TODAY_INDEX) return "TODAY";
    const delta = i - TODAY_INDEX;
    if (delta < 0) return `${-delta}d ago`;
    return `+${delta}d`;
  };

  const skippedCount = skipped.size;

  return (
    <section
      className="theme-aurora relative isolate overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[var(--bg)] p-7 md:p-12"
      aria-label="Subscription Ritual"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 50% at 22% 18%, rgba(215,195,167,0.08), transparent 58%)",
        }}
      />

      <SectionHeader
        eyebrow="06 — Subscription Ritual"
        title="Routine, scheduled to your rhythm."
        subhead="Pick a cadence — pouches arrive on the days that suit your routine. Skip, swap, or pause from the cart."
        right={
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--muted)]">
              Next delivery
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={nextDeliveryDelta}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.32 }}
                className="mt-2 font-display text-5xl text-[var(--text)]"
              >
                {nextDeliveryDelta}
                <span className="ml-1 text-2xl text-[var(--muted)]">d</span>
              </motion.p>
            </AnimatePresence>
          </div>
        }
      />

      <div className="relative z-10 mt-8 grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
        {/* LEFT — calendar */}
        <div className="flex flex-col">
          {/* Cadence toggle */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CADENCES.map((c) => {
              const active = cadenceKey === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCadenceKey(c.key)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] transition",
                    active
                      ? "border-transparent bg-[var(--primary)] text-[var(--on-primary)]"
                      : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]",
                  )}
                  style={
                    active
                      ? { boxShadow: "0 0 16px rgba(215,195,167,0.45)" }
                      : undefined
                  }
                >
                  {c.label}
                  {c.discountPct > 0 ? (
                    <span className="ml-2 text-[var(--muted)]/85">
                      –{c.discountPct}%
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Day-of-week labels */}
          <div className="mt-6 grid grid-cols-7 gap-2 text-center text-[9px] uppercase tracking-[0.28em] text-[var(--muted)]/65">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="mt-2 grid grid-cols-7 gap-2">
            {Array.from({ length: DAYS }).map((_, i) => {
              const isDelivery = deliveryIndices.includes(i);
              return (
                <CalendarCell
                  key={i}
                  index={i}
                  isDelivery={isDelivery}
                  isToday={i === TODAY_INDEX}
                  isAnchor={i === anchorIndex}
                  isSkipped={skipped.has(i)}
                  label={dayLabel(i)}
                  dateLabel={today ? formatDate(dateForIndex(today, i)) : null}
                  cadenceKey={cadenceKey}
                  onClick={() => handleCellClick(i, isDelivery)}
                />
              );
            })}
          </div>

          <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
            Tap any day to anchor your first delivery · tap a pouch to skip it
          </p>
        </div>

        {/* RIGHT — savings + CTA */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-elevated)] p-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
              Cadence
            </p>
            <p className="mt-2 font-display text-2xl text-[var(--text)]">
              {cadence.label}
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--muted)]">
              {cadence.hint}
            </p>
          </div>

          {/* Quantity stepper */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-elevated)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
                  Pouches per delivery
                </p>
                <p className="mt-1 text-[11px] text-[var(--muted)]/80">
                  Stack one box, or stock up.
                </p>
              </div>
              <div className="flex items-center gap-1">
                <StepperButton
                  ariaLabel="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </StepperButton>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={quantity}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22 }}
                    className="w-8 text-center font-display text-xl tabular-nums text-[var(--text)]"
                  >
                    {quantity}×
                  </motion.span>
                </AnimatePresence>
                <StepperButton
                  ariaLabel="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                  disabled={quantity >= MAX_QUANTITY}
                >
                  +
                </StepperButton>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-elevated)] p-5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
                One-time
              </p>
              <p className="text-[15px] tabular-nums text-[var(--muted)] line-through">
                {formatMoney(oneTimePrice, product.currency)}
              </p>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#d7c3a7]">
                Subscription
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${cadenceKey}-${quantity}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.32 }}
                  className="font-display text-3xl text-[var(--text)]"
                >
                  {formatMoney(subPrice, product.currency)}
                </motion.p>
              </AnimatePresence>
            </div>
            {monthlySavings > 0 ? (
              <p className="mt-3 text-[11px] leading-relaxed text-[#8ce0d6]">
                Saves ~{formatMoney(monthlySavings, product.currency)} per month
                {skippedCount > 0 ? ` · ${skippedCount} skipped` : ""}
                {" "}vs one-time orders.
              </p>
            ) : (
              <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
                Standard cadence — no discount, full flexibility.
              </p>
            )}
          </div>

          <Pill
            variant="primary"
            size="lg"
            onClick={() => {
              for (let q = 0; q < quantity; q += 1) addItem(product);
            }}
          >
            Start subscription
          </Pill>
          <p className="text-center text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
            Cancel anytime · skip any delivery
          </p>
        </div>
      </div>
    </section>
  );
}

function CalendarCell({
  index,
  isDelivery,
  isToday,
  isAnchor,
  isSkipped,
  label,
  dateLabel,
  cadenceKey,
  onClick,
}: {
  index: number;
  isDelivery: boolean;
  isToday: boolean;
  isAnchor: boolean;
  isSkipped: boolean;
  label: string;
  dateLabel: string | null;
  cadenceKey: Cadence;
  onClick: () => void;
}) {
  const cellTitle = isDelivery
    ? isSkipped
      ? "Tap to un-skip this delivery"
      : isAnchor
        ? "First delivery — anchor cell"
        : "Tap to skip this delivery"
    : "Tap to make this your first delivery";

  return (
    <motion.button
      layout
      type="button"
      onClick={onClick}
      aria-label={`${label}${dateLabel ? `, ${dateLabel}` : ""} — ${cellTitle}`}
      className={cn(
        "group relative aspect-square cursor-pointer rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
        isDelivery
          ? "border-[var(--line-strong)] bg-[var(--surface-elevated)] hover:border-[var(--accent)]/60"
          : "border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-elevated)]/40",
        isAnchor && "ring-1 ring-[var(--accent)]/55",
      )}
    >
      {/* Day label */}
      <span className="pointer-events-none absolute left-1.5 top-1.5 text-[8px] uppercase tracking-[0.2em] text-[var(--muted)]/70">
        {isToday ? "TODAY" : index < TODAY_INDEX ? `${TODAY_INDEX - index}d` : `+${index - TODAY_INDEX}`}
      </span>

      {/* Delivery pouch icon */}
      <AnimatePresence>
        {isDelivery ? (
          <motion.div
            key={`pouch-${cadenceKey}-${index}`}
            initial={{ opacity: 0, scale: 0.4, y: 6 }}
            animate={{ opacity: isSkipped ? 0.35 : 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4, y: -4 }}
            transition={{
              duration: 0.45,
              delay: ((index - TODAY_INDEX) * 0.04) % 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={isSkipped ? { filter: "grayscale(1)" } : undefined}
          >
            <PouchGlyph isToday={isToday} isAnchor={isAnchor} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Skipped strike-through */}
      {isDelivery && isSkipped ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-2 right-2 top-1/2 h-px -translate-y-1/2 rotate-[-12deg] bg-[var(--muted)]/70"
        />
      ) : null}

      {/* Anchor marker dot */}
      {isAnchor ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-1.5 top-1.5 h-1 w-1 rounded-full"
          style={{ background: "#d7c3a7", boxShadow: "0 0 6px #d7c3a7" }}
        />
      ) : null}

      {/* Today ring */}
      {isToday ? (
        <span
          className="pointer-events-none absolute inset-0 rounded-xl border"
          style={{
            borderColor: "rgba(215,195,167,0.65)",
            boxShadow: "inset 0 0 12px rgba(215,195,167,0.18)",
          }}
        />
      ) : null}

      {/* Hover tooltip — real arrival date */}
      {dateLabel ? (
        <span
          className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--line-strong)] bg-[var(--surface-elevated)] px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-[var(--text)] opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {dateLabel}
        </span>
      ) : null}

      <span className="sr-only">{label}</span>
    </motion.button>
  );
}

function StepperButton({
  onClick,
  disabled,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border text-lg transition",
        "border-[var(--line)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-elevated)]",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--line)] disabled:hover:bg-[var(--surface)]",
      )}
    >
      {children}
    </button>
  );
}

function PouchGlyph({ isToday, isAnchor = false }: { isToday: boolean; isAnchor?: boolean }) {
  const color = isAnchor ? "#f5d4a8" : isToday ? "#d7c3a7" : "#f5d4a8";
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true">
      <defs>
        <linearGradient id="ritual-pouch-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1a1620" />
          <stop offset="50%" stopColor="#0a0a0c" />
          <stop offset="100%" stopColor="#16131a" />
        </linearGradient>
      </defs>
      <path
        d="M 3 5 Q 3 3 5 3 L 7.5 3 L 9 1 L 13 1 L 14.5 3 L 17 3 Q 19 3 19 5 L 19 22 Q 19 24 17 24 L 5 24 Q 3 24 3 22 Z"
        fill="url(#ritual-pouch-fill)"
        stroke={color}
        strokeWidth="0.6"
        opacity="0.95"
      />
      <path
        d="M 9 1 L 10 0 L 11 1 L 12 0 L 13 1"
        fill="none"
        stroke={color}
        strokeWidth="0.5"
      />
      <text
        x="11"
        y="14"
        textAnchor="middle"
        fontSize="6"
        fill={color}
        fontFamily="serif"
        opacity="0.85"
      >
        C
      </text>
      <text
        x="11"
        y="20"
        textAnchor="middle"
        fontSize="2.6"
        fill={color}
        opacity="0.55"
        letterSpacing="0.4"
      >
        DOSE
      </text>
    </svg>
  );
}
