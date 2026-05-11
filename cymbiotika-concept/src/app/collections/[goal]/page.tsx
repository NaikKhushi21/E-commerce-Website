import { Suspense } from "react";
import { notFound } from "next/navigation";
import { GOAL_LABELS, WELLNESS_GOALS, type WellnessGoal } from "@/data/goals";
import { getProductsByGoalFromCatalog } from "@/lib/recommendations";
import { ProductGridClient } from "@/components/product/ProductGridClient";
import { getShopifyProducts } from "@/lib/shopify-products";

export function generateStaticParams() {
  return WELLNESS_GOALS.map((goal) => ({ goal }));
}

function isGoal(value: string): value is WellnessGoal {
  return WELLNESS_GOALS.includes(value as WellnessGoal);
}

export default async function CollectionPage({ params }: { params: Promise<{ goal: string }> }) {
  const { goal } = await params;
  if (!isGoal(goal)) notFound();

  const products = await getShopifyProducts();
  const matched = getProductsByGoalFromCatalog(products, goal);

  return (
    <div className="space-y-8 pb-12">
      <section className="rounded-[2rem] bg-[var(--primary)] px-6 py-8 text-[var(--on-primary)] md:px-8 md:py-10">
        <p className="text-eyebrow tracking-[0.1em] text-white/75">Collection</p>
        <h1 className="mt-2 font-sans text-6xl font-medium leading-tight md:text-7xl">{GOAL_LABELS[goal]}</h1>
        <p className="mt-3 max-w-3xl text-xl text-white/90 md:text-2xl">
          Focused support products curated for {GOAL_LABELS[goal].toLowerCase()} goals.
        </p>
      </section>

      <Suspense fallback={<div className="h-[400px] w-full rounded-[2rem] bg-[var(--surface-elevated)]" />}>
        <ProductGridClient products={matched} />
      </Suspense>
    </div>
  );
}
