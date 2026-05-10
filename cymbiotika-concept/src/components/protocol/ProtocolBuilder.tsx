"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { GOAL_LABELS, WELLNESS_GOALS, type WellnessGoal } from "@/data/goals";
import { getRecommendedProtocolFromCatalog } from "@/lib/recommendations";
import { formatMoney } from "@/lib/money";
import { ProtocolStack } from "@/components/protocol/ProtocolStack";
import { useCart } from "@/components/cart/CartProvider";

export function ProtocolBuilder({ products }: { products: Product[] }) {
  const { addItem } = useCart();
  const [selectedGoals, setSelectedGoals] = useState<WellnessGoal[]>([]);
  const [deselectedProductIds, setDeselectedProductIds] = useState<string[]>([]);

  const protocol = useMemo(
    () => getRecommendedProtocolFromCatalog(products, selectedGoals),
    [products, selectedGoals],
  );

  const protocolProducts = useMemo(() => {
    const merged = [...protocol.morning, ...protocol.evening, ...protocol.targeted];
    const unique = new Map(merged.map((product) => [product.id, product]));
    return [...unique.values()];
  }, [protocol]);

  const deselectedIdSet = useMemo(() => new Set(deselectedProductIds), [deselectedProductIds]);

  const selectedProducts = useMemo(
    () => protocolProducts.filter((product) => !deselectedIdSet.has(product.id)),
    [protocolProducts, deselectedIdSet],
  );
  const selectedIdSet = useMemo(() => new Set(selectedProducts.map((product) => product.id)), [selectedProducts]);

  const monthlyTotal = useMemo(
    () => selectedProducts.reduce((sum, product) => sum + product.price, 0),
    [selectedProducts],
  );

  const hasSelectedProducts = selectedProducts.length > 0;

  function toggleGoal(goal: WellnessGoal) {
    setSelectedGoals((current) => {
      return current.includes(goal) ? current.filter((entry) => entry !== goal) : [...current, goal];
    });
  }

  function toggleProductSelection(id: string) {
    setDeselectedProductIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  }

  function addSelectedProtocol() {
    selectedProducts.forEach((product) => addItem(product));
  }

  return (
    <div className="space-y-8 pb-12">
      <section className="rounded-[2rem] bg-[var(--primary)] px-6 py-8 text-[var(--on-primary)] md:px-8 md:py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-white/75">Routine Builder</p>
        <h1 className="mt-2 font-sans text-6xl font-medium leading-tight md:text-7xl">Build your daily stack.</h1>
        <p className="mt-3 max-w-3xl text-xl text-white/90 md:text-2xl">
          Select your goals and generate a practical morning and evening routine.
        </p>
      </section>

      <section className="rounded-3xl border border-[var(--line)] bg-white p-5 md:p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">Step 1</p>
        <h2 className="mt-1 font-display text-4xl text-[var(--primary)]">Select wellness goals</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {WELLNESS_GOALS.map((goal) => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`rounded-2xl border px-3 py-2 text-sm transition ${
                selectedGoals.includes(goal)
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]"
                  : "border-[var(--line)] bg-[var(--bg)] text-[var(--primary)]"
              }`}
            >
              {GOAL_LABELS[goal]}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-3xl border border-[var(--line)] bg-white p-5 md:grid-cols-3 md:p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">Step 2</p>
          <p className="mt-1 text-base text-[var(--muted)]">Recommended monthly routine</p>
        </div>
        <div>
          <p className="text-sm text-[var(--muted)]">Estimated monthly total</p>
          <p className="font-display text-4xl text-[var(--primary)]">{formatMoney(monthlyTotal)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{selectedProducts.length} product(s) selected</p>
        </div>
        <button
          onClick={addSelectedProtocol}
          disabled={!hasSelectedProducts}
          className="rounded-full bg-[var(--primary)] px-5 py-3 text-base font-semibold text-[var(--on-primary)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add selected products
        </button>
      </section>

      <ProtocolStack
        title="Morning Stack"
        products={protocol.morning}
        selectedIds={selectedIdSet}
        onToggleSelection={toggleProductSelection}
      />
      <ProtocolStack
        title="Evening Stack"
        products={protocol.evening}
        selectedIds={selectedIdSet}
        onToggleSelection={toggleProductSelection}
      />
      <ProtocolStack
        title="Targeted Support"
        products={protocol.targeted}
        selectedIds={selectedIdSet}
        onToggleSelection={toggleProductSelection}
      />
    </div>
  );
}
