"use client";

import { useMemo, useState } from "react";
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
  { key: "weekly", label: "Weekly", intervalDays: 7, discountPct: 0, hint: "Higher-frequency dosing protocols." },
  { key: "biweekly", label: "Bi-weekly", intervalDays: 14, discountPct: 10, hint: "The sweet spot for most stacks." },
  { key: "monthly", label: "Monthly", intervalDays: 30, discountPct: 15, hint: "One pouch, monthly delivery." },
];

const DAYS = 35; // 5 weeks
const TODAY_INDEX = 6; // Today sits at the end of week 1

const r2 = (v: number) => Math.round(v * 100) / 100;

export function SubscriptionRitual({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [cadenceKey, setCadenceKey] = useState<Cadence>("biweekly");

  const cadence = CADENCES.find((c) => c.key === cadenceKey) ?? CADENCES[1];

  // Delivery indices (0..DAYS-1) — first delivery = today, then every interval
  const deliveryIndices = useMemo(() => {
    const out: number[] = [];
    for (let i = TODAY_INDEX; i < DAYS; i += cadence.intervalDays) {
      out.push(i);
    }
    return out;
  }, [cadence.intervalDays]);

  // The next future delivery (first index > today)
  const nextDeliveryDelta = useMemo(() => {
    const next = deliveryIndices.find((i) => i > TODAY_INDEX);
    if (next === undefined) return cadence.intervalDays;
    return next - TODAY_INDEX;
  }, [deliveryIndices, cadence.intervalDays]);

  const oneTimePrice = product.price;
  const subPrice = r2(oneTimePrice * (1 - cadence.discountPct / 100));
  const monthlySavings = r2((oneTimePrice - subPrice) * (30 / cadence.intervalDays));

  // Format day labels
  const dayLabel = (i: number) => {
    if (i === TODAY_INDEX) return "TODAY";
    const delta = i - TODAY_INDEX;
    if (delta < 0) return `${-delta}d ago`;
    return `+${delta}d`;
  };

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
        subhead="Pick a cadence — pouches arrive on the days that suit your protocol. Skip, swap, or pause from the cart."
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
            {Array.from({ length: DAYS }).map((_, i) => (
              <CalendarCell
                key={i}
                index={i}
                isDelivery={deliveryIndices.includes(i)}
                isToday={i === TODAY_INDEX}
                label={dayLabel(i)}
                cadenceKey={cadenceKey}
              />
            ))}
          </div>

          <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
            Showing 5 weeks. Delivery dates auto-adjust if you skip from the cart.
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
                  key={cadenceKey}
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
                vs one-time orders.
              </p>
            ) : (
              <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
                Standard cadence — no discount, full flexibility.
              </p>
            )}
          </div>

          <Pill variant="primary" size="lg" onClick={() => addItem(product)}>
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
  label,
  cadenceKey,
}: {
  index: number;
  isDelivery: boolean;
  isToday: boolean;
  label: string;
  cadenceKey: Cadence;
}) {
  return (
    <motion.div
      layout
      className={cn(
        "relative aspect-square rounded-xl border transition-colors",
        isDelivery
          ? "border-[var(--line-strong)] bg-[var(--surface-elevated)]"
          : "border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_85%,transparent)]",
      )}
    >
      {/* Day label */}
      <span className="absolute left-1.5 top-1.5 text-[8px] uppercase tracking-[0.2em] text-[var(--muted)]/70">
        {isToday ? "TODAY" : index < TODAY_INDEX ? `${TODAY_INDEX - index}d` : `+${index - TODAY_INDEX}`}
      </span>

      {/* Delivery pouch icon */}
      <AnimatePresence>
        {isDelivery ? (
          <motion.div
            key={`pouch-${cadenceKey}-${index}`}
            initial={{ opacity: 0, scale: 0.4, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4, y: -4 }}
            transition={{
              duration: 0.45,
              delay: ((index - TODAY_INDEX) * 0.04) % 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <PouchGlyph isToday={isToday} />
          </motion.div>
        ) : null}
      </AnimatePresence>

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

      {/* Subtle label for hover users */}
      <span className="sr-only">{label}</span>
    </motion.div>
  );
}

function PouchGlyph({ isToday }: { isToday: boolean }) {
  const color = isToday ? "#d7c3a7" : "#f5d4a8";
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
