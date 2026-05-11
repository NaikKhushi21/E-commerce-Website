"use client";

import { useMemo, useState } from "react";
import { type Product } from "@/data/products";
import { GOAL_LABELS, type WellnessGoal } from "@/data/goals";

type SlotId = "morning" | "midday" | "evening";

const SLOT_ORDER: SlotId[] = ["morning", "midday", "evening"];
const SLOT_LABELS: Record<SlotId, string> = {
  morning: "Morning",
  midday: "Midday",
  evening: "Evening",
};

function createInitialAssignments(products: Product[]): Record<string, SlotId> {
  return Object.fromEntries(products.map((product, index) => [product.id, SLOT_ORDER[index % SLOT_ORDER.length]]));
}

function overlapScore(a: Product, b: Product): number {
  const goalOverlap = a.goals.filter((goal) => b.goals.includes(goal)).length;
  const tagOverlap = a.tags.filter((tag) => b.tags.includes(tag)).length;
  return goalOverlap * 2 + tagOverlap;
}

function scoreAssignments(productsBySlot: Record<SlotId, Product[]>) {
  let conflicts = 0;
  let synergySignals = 0;

  SLOT_ORDER.forEach((slot) => {
    const products = productsBySlot[slot];
    for (let i = 0; i < products.length; i += 1) {
      for (let j = i + 1; j < products.length; j += 1) {
        const score = overlapScore(products[i], products[j]);
        if (score > 0) synergySignals += 1;
        else conflicts += 1;
      }
    }
  });

  const slotCounts = SLOT_ORDER.map((slot) => productsBySlot[slot].length);
  const maxCount = Math.max(...slotCounts, 0);
  const minCount = Math.min(...slotCounts, 0);

  const concentrationPenalty = SLOT_ORDER.reduce((sum, slot) => sum + Math.max(0, productsBySlot[slot].length - 2) * 8, 0);
  const balancePenalty = (maxCount - minCount) * 5;
  const conflictPenalty = conflicts * 7;
  const synergyBonus = Math.min(12, synergySignals * 2);

  const score = Math.max(38, Math.min(98, 84 - concentrationPenalty - balancePenalty - conflictPenalty + synergyBonus));

  return { score, conflicts, synergySignals };
}

function shortGoalLabel(goal: WellnessGoal): string {
  return GOAL_LABELS[goal].replace(" Health", "");
}

export function AbsorptionEngine({ products }: { products: Product[] }) {
  const [assignments, setAssignments] = useState<Record<string, SlotId>>(() => createInitialAssignments(products));
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const productsBySlot = useMemo(() => {
    const grouped: Record<SlotId, Product[]> = { morning: [], midday: [], evening: [] };
    products.forEach((product) => {
      const slot = assignments[product.id] ?? "morning";
      grouped[slot].push(product);
    });
    return grouped;
  }, [assignments, products]);

  const metrics = useMemo(() => scoreAssignments(productsBySlot), [productsBySlot]);

  const guidance = useMemo(() => {
    const items: string[] = [];

    SLOT_ORDER.forEach((slot) => {
      if (productsBySlot[slot].length > 2) {
        items.push(`${SLOT_LABELS[slot]} stack is dense. Consider moving one formula to a later slot.`);
      }
    });

    if (metrics.conflicts > 0) {
      items.push("Some formulas in the same time window have low goal overlap. Spacing may improve consistency.");
    }

    if (metrics.synergySignals >= 2) {
      items.push("Good synergy detected across your stack timing.");
    }

    if (items.length === 0) {
      items.push("Your timing rhythm looks balanced. Keep this schedule for 10-14 days before adjusting.");
    }

    return items.slice(0, 3);
  }, [metrics.conflicts, metrics.synergySignals, productsBySlot]);

  function moveProduct(productId: string, slot: SlotId) {
    setAssignments((current) => ({ ...current, [productId]: slot }));
  }

  function autoBalance() {
    const next: Record<string, SlotId> = {};
    products.forEach((product, index) => {
      next[product.id] = SLOT_ORDER[index % SLOT_ORDER.length];
    });
    setAssignments(next);
  }

  const slotAtmosphere: Record<SlotId, string> = {
    morning: "radial-gradient(75% 75% at 18% 0%, color-mix(in srgb, var(--accent-orange) 18%, transparent) 0%, transparent 70%)",
    midday: "radial-gradient(75% 75% at 50% 0%, color-mix(in srgb, var(--forest) 13%, transparent) 0%, transparent 68%)",
    evening: "radial-gradient(75% 75% at 82% 0%, color-mix(in srgb, var(--accent-orange) 14%, transparent) 0%, transparent 70%)",
  };

  const scoreTint =
    metrics.score >= 78
      ? "color-mix(in srgb, var(--accent-orange) 66%, var(--forest) 34%)"
      : "color-mix(in srgb, var(--accent-orange) 42%, var(--forest) 58%)";

  return (
    <section
      className="relative overflow-hidden space-y-6 rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-elevated)]/92 p-5 md:p-7"
      style={{
        boxShadow: "0 28px 80px color-mix(in srgb, var(--forest) 11%, transparent)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-85"
        style={{
          background:
            "radial-gradient(70% 55% at 5% 0%, color-mix(in srgb, var(--accent-orange) 15%, transparent) 0%, transparent 72%), radial-gradient(75% 70% at 100% 100%, color-mix(in srgb, var(--forest) 10%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="micro-copy text-[var(--muted)]">Absorption Engine</p>
          <h3 className="mt-2 text-3xl text-[var(--forest)] md:text-4xl">Design your routine timing flow.</h3>
          <p className="mt-2 max-w-2xl text-body text-[var(--muted)] md:text-body">
            Drag formulas between windows to shape rhythm, compatibility, and daily consistency.
          </p>
        </div>

        <div
          className="relative rounded-[1rem] border border-[var(--line)] px-4 py-3 text-right"
          style={{
            background: "color-mix(in srgb, var(--surface) 84%, transparent)",
          }}
        >
          <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">Rhythm score</p>
          <p className="mt-1 text-3xl text-[var(--forest)]">{metrics.score}</p>
          <div className="mt-2 h-1.5 w-[120px] rounded-full bg-[var(--line)]/60">
            <div
              className="h-full rounded-full transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${metrics.score}%`, background: scoreTint }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {SLOT_ORDER.map((slot) => (
          <section
            key={slot}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const id = event.dataTransfer.getData("text/plain") || draggingId;
              if (id) moveProduct(id, slot);
              setDraggingId(null);
            }}
            className="rounded-[1.2rem] border border-[var(--line)] p-3 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(170deg, color-mix(in srgb, var(--surface) 88%, transparent), color-mix(in srgb, var(--surface-elevated) 84%, transparent)), ${slotAtmosphere[slot]}`,
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">{SLOT_LABELS[slot]}</p>
              <p className="text-small text-[var(--muted)]">{productsBySlot[slot].length} formula(s)</p>
            </div>

            <div className="space-y-2 min-h-[140px]">
              {productsBySlot[slot].map((product) => (
                <article
                  key={product.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", product.id);
                    setDraggingId(product.id);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  className="cursor-grab rounded-xl border border-[var(--line)] px-3 py-2 active:cursor-grabbing transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(150deg, color-mix(in srgb, var(--surface-elevated) 90%, transparent), color-mix(in srgb, var(--surface) 92%, transparent))",
                    boxShadow: "0 10px 24px color-mix(in srgb, var(--forest) 9%, transparent)",
                  }}
                >
                  <p className="text-body text-[var(--forest)]">{product.title}</p>
                  <p className="mt-1 text-eyebrow tracking-[0.11em] text-[var(--muted)]">
                    {product.goals.slice(0, 2).map((goal) => shortGoalLabel(goal)).join(" • ") || "General support"}
                  </p>
                </article>
              ))}
              {productsBySlot[slot].length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--line)] px-3 py-6 text-center text-eyebrow tracking-[0.12em] text-[var(--muted)]">
                  Drop formula here
                </p>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[0.72fr_0.28fr] md:items-start">
        <section className="space-y-2">
          <p className="micro-copy text-[var(--muted)]">Timing Guidance</p>
          <div className="space-y-2">
            {guidance.map((line) => (
              <p key={line} className="text-body leading-relaxed text-[var(--forest)] md:text-body">
                {line}
              </p>
            ))}
          </div>
        </section>

        <button
          onClick={autoBalance}
          className="rounded-full border border-[var(--line-strong)] bg-[var(--surface-elevated)]/90 px-5 py-2.5 text-eyebrow tracking-[0.1em] text-[var(--forest)] transition duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--forest)] hover:text-[var(--on-primary)]"
        >
          Auto-balance slots
        </button>
      </div>
    </section>
  );
}
