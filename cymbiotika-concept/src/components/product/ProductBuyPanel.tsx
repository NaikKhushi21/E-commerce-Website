"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/products";
import type { WellnessGoal } from "@/data/goals";
import { GOAL_LABELS } from "@/data/goals";
import { CATEGORY_COLOR, type IngredientEntry } from "@/lib/sanity-ingredients";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/components/cart/CartProvider";
import { ProductAskButton } from "@/components/product/ProductAskButton";
import { cn } from "@/lib/cn";

const GOAL_TONE: Record<WellnessGoal, { dot: string; tint: string }> = {
  energy: { dot: "#f5b75f", tint: "rgba(245,183,95,0.10)" },
  immunity: { dot: "#ff8a7e", tint: "rgba(255,138,126,0.10)" },
  "gut-health": { dot: "#74e0c2", tint: "rgba(116,224,194,0.12)" },
  "brain-health": { dot: "#95b5d3", tint: "rgba(149,181,211,0.12)" },
  sleep: { dot: "#b89cf0", tint: "rgba(184,156,240,0.12)" },
  stress: { dot: "#cbb8e8", tint: "rgba(203,184,232,0.12)" },
  skin: { dot: "#f0c8d4", tint: "rgba(240,200,212,0.14)" },
  detox: { dot: "#9bd3c2", tint: "rgba(155,211,194,0.12)" },
  longevity: { dot: "#e5b773", tint: "rgba(229,183,115,0.12)" },
};

const SEAL_LABELS: Record<string, string> = {
  "seal-gluten-free": "Gluten Free",
  "seal-gmp-certified": "GMP Certified",
  "seal-no-artificial-flavors": "No Artificial Flavors",
  "seal-no-preservatives": "No Preservatives",
  "seal-non-gmo": "Non-GMO",
  "seal-plant-based": "Plant Based",
  "seal-soy-free": "Soy Free",
  "seal-third-party-tested": "Third-Party Tested",
  "seal-zero-fillers": "Zero Fillers",
  "seal-vegan": "Vegan",
};

const SUBSCRIPTION_DISCOUNT = 0.15;
const DESCRIPTION_LIMIT = 180;

type Tab = "benefits" | "how-to" | "ingredients";

export function ProductBuyPanel({
  product,
  ingredients,
}: {
  product: Product;
  ingredients: IngredientEntry[];
}) {
  const { addItem, openCart } = useCart();
  const [subscribe, setSubscribe] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("benefits");
  const [activeIngredient, setActiveIngredient] = useState<string | null>(null);

  const seals = useMemo(() => {
    return (product.tags ?? [])
      .filter((tag) => SEAL_LABELS[tag])
      .map((tag) => SEAL_LABELS[tag])
      .slice(0, 6);
  }, [product.tags]);

  const goalsToShow = (product.goals ?? []).slice(0, 4);

  const subscribePrice = product.price * (1 - SUBSCRIPTION_DISCOUNT);
  const displayPrice = subscribe ? subscribePrice : product.price;

  const description = product.description ?? "";
  const isLongDescription = description.length > DESCRIPTION_LIMIT;
  const compactDesc = isLongDescription
    ? `${description.slice(0, DESCRIPTION_LIMIT).trimEnd()}…`
    : description;

  const ingredientPills = product.ingredientsActive ?? [];
  const otherIngredients = product.ingredientsOther ?? [];
  const howToUse = product.howToUse ?? [];

  const atlasByLooseName = useMemo(() => {
    const map = new Map<string, IngredientEntry>();
    for (const entry of ingredients) {
      map.set(entry.name.toLowerCase(), entry);
      map.set(entry.key.toLowerCase(), entry);
    }
    return map;
  }, [ingredients]);

  function findAtlasEntry(label: string): IngredientEntry | null {
    const cleaned = label.toLowerCase().replace(/\([^)]*\)/g, "").trim();
    const direct = atlasByLooseName.get(cleaned);
    if (direct) return direct;
    for (const [name, entry] of atlasByLooseName) {
      if (cleaned.includes(name) || name.includes(cleaned)) return entry;
    }
    return null;
  }

  const tabs: { id: Tab; label: string; available: boolean }[] = [
    { id: "benefits", label: "Benefits", available: product.benefits.length > 0 },
    { id: "how-to", label: "How to use", available: howToUse.length > 0 },
    { id: "ingredients", label: "Ingredients", available: ingredientPills.length > 0 },
  ];
  const availableTabs = tabs.filter((t) => t.available);
  const currentTab = availableTabs.find((t) => t.id === activeTab) ?? availableTabs[0];

  return (
    <aside className="space-y-7 lg:pt-7">
      {/* Goal chip rail */}
      {goalsToShow.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {goalsToShow.map((goal) => {
            const tone = GOAL_TONE[goal];
            return (
              <span
                key={goal}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--forest)]"
                style={{ background: tone.tint, boxShadow: `inset 0 0 0 1px ${tone.dot}33` }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone.dot, boxShadow: `0 0 6px ${tone.dot}` }} />
                {GOAL_LABELS[goal]}
              </span>
            );
          })}
        </div>
      ) : null}

      {/* Title */}
      <div>
        <p className="micro-copy text-[var(--muted)]">Formula</p>
        <h1 className="display-title mt-2 text-4xl leading-[1.04] text-[var(--forest)] md:text-5xl">
          {product.title}
        </h1>

        {description ? (
          <p className="body-copy mt-4 max-w-lg text-sm leading-relaxed md:text-base">
            {showFullDesc ? description : compactDesc}{" "}
            {isLongDescription ? (
              <button
                type="button"
                onClick={() => setShowFullDesc((v) => !v)}
                className="ml-1 text-xs uppercase tracking-[0.16em] text-[var(--muted)] underline underline-offset-4 transition hover:text-[var(--forest)]"
                aria-expanded={showFullDesc}
              >
                {showFullDesc ? "less" : "more"}
              </button>
            ) : null}
          </p>
        ) : null}
      </div>

      {/* Quality seals */}
      {seals.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {seals.map((seal) => (
            <li
              key={seal}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-elevated)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]"
            >
              <CheckIcon /> {seal}
            </li>
          ))}
        </ul>
      ) : null}

      {/* Price + subscribe */}
      <div className="space-y-3 rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface)] p-4">
        <div className="flex items-baseline gap-3">
          <span
            key={subscribe ? "sub" : "one"}
            className="text-4xl text-[var(--forest)] md:text-5xl"
            style={{ transition: "all 0.4s var(--easing-premium)" }}
          >
            {formatMoney(displayPrice, product.currency)}
          </span>
          {subscribe ? (
            <span className="text-sm text-[var(--muted)] line-through">
              {formatMoney(product.price, product.currency)}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setSubscribe((v) => !v)}
          className={cn(
            "flex w-full items-center justify-between rounded-full border px-4 py-2.5 text-xs uppercase tracking-[0.16em] transition",
            subscribe
              ? "border-[var(--accent)] bg-[var(--accent-soft)]/40 text-[var(--forest)]"
              : "border-[var(--line)] bg-[var(--surface-elevated)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--forest)]",
          )}
          aria-pressed={subscribe}
        >
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full border transition",
                subscribe ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--line-strong)] bg-transparent",
              )}
              aria-hidden="true"
            >
              {subscribe ? <CheckIcon className="h-2.5 w-2.5 text-[var(--on-primary)]" /> : null}
            </span>
            Subscribe & save 15%
          </span>
          {!subscribe ? (
            <span className="text-[10px] tracking-[0.18em] text-[var(--accent)]">
              −{formatMoney(product.price - subscribePrice, product.currency)}
            </span>
          ) : null}
        </button>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          onClick={() => {
            addItem(product);
            openCart();
          }}
          className="w-full rounded-full bg-[var(--forest)] py-3 text-xs uppercase tracking-[0.14em] text-[var(--on-primary)] transition-transform duration-500 [transition-timing-function:var(--easing-premium)] hover:scale-[1.01] sm:w-auto sm:px-9"
        >
          Add to routine
        </button>
        <ProductAskButton
          product={product}
          label="Ask about this"
          className="w-full border border-[var(--line-strong)] bg-[var(--surface)] py-3 text-center text-[var(--forest)] sm:w-auto sm:px-6"
        />
      </div>

      <p className="text-xs text-[var(--muted)]">Free US shipping over $75 · 30-day support guarantee</p>

      {/* Tabbed detail */}
      {availableTabs.length > 0 ? (
        <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-elevated)] p-5">
          <div className="flex gap-1.5 border-b border-[var(--line)] pb-3">
            {availableTabs.map((tab) => {
              const isActive = currentTab?.id === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setActiveIngredient(null);
                  }}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition",
                    isActive
                      ? "bg-[var(--forest)] text-[var(--on-primary)]"
                      : "text-[var(--muted)] hover:text-[var(--forest)]",
                  )}
                  aria-pressed={isActive}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative mt-4 min-h-[180px]">
            <AnimatePresence mode="wait">
              {currentTab?.id === "benefits" ? (
                <motion.ul
                  key="benefits"
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: -6 }}
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.05 } },
                  }}
                  className="space-y-2.5 text-sm leading-relaxed text-[var(--forest)] md:text-base"
                >
                  {product.benefits.slice(0, 6).map((benefit, idx) => (
                    <motion.li
                      key={benefit}
                      variants={{
                        hidden: { opacity: 0, x: -8 },
                        show: { opacity: 1, x: 0 },
                      }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="flex gap-3"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 inline-block h-2 w-2 flex-none rounded-full"
                        style={{
                          background:
                            GOAL_TONE[goalsToShow[idx % Math.max(goalsToShow.length, 1)] ?? "longevity"]?.dot ??
                            "var(--accent)",
                          boxShadow: `0 0 6px ${
                            GOAL_TONE[goalsToShow[idx % Math.max(goalsToShow.length, 1)] ?? "longevity"]?.dot ?? "var(--accent)"
                          }55`,
                        }}
                      />
                      <span>{benefit}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : null}

              {currentTab?.id === "how-to" ? (
                <motion.ul
                  key="how-to"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-2 text-sm leading-relaxed text-[var(--forest)]"
                >
                  {howToUse.map((line, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span aria-hidden="true" className="mt-2 inline-block h-1 w-1 flex-none rounded-full bg-[var(--accent)]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </motion.ul>
              ) : null}

              {currentTab?.id === "ingredients" ? (
                <motion.div
                  key="ingredients"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-3"
                >
                  <ul className="flex flex-wrap gap-1.5">
                    {ingredientPills.map((ingredient) => {
                      const atlas = findAtlasEntry(ingredient);
                      const color = atlas ? CATEGORY_COLOR[atlas.category] : null;
                      const isActive = activeIngredient === ingredient;
                      return (
                        <li key={ingredient}>
                          <button
                            type="button"
                            onClick={() => setActiveIngredient((prev) => (prev === ingredient ? null : ingredient))}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition",
                              isActive
                                ? "border-[var(--line-strong)] bg-[var(--surface)] text-[var(--forest)]"
                                : "border-[var(--line)] bg-[var(--surface)] text-[var(--forest)] hover:border-[var(--line-strong)]",
                            )}
                            style={isActive && color ? { boxShadow: `0 0 0 1px ${color}55, 0 4px 12px ${color}22` } : undefined}
                            aria-expanded={isActive}
                          >
                            <span
                              aria-hidden="true"
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                background: color ?? "var(--accent)",
                                boxShadow: color ? `0 0 6px ${color}` : undefined,
                              }}
                            />
                            <span>{ingredient}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <AnimatePresence initial={false}>
                    {activeIngredient ? (
                      <IngredientCard
                        key={activeIngredient}
                        label={activeIngredient}
                        atlas={findAtlasEntry(activeIngredient)}
                      />
                    ) : null}
                  </AnimatePresence>

                  {otherIngredients.length > 0 ? (
                    <details className="group">
                      <summary className="cursor-pointer text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] transition hover:text-[var(--forest)]">
                        Other ingredients
                      </summary>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                        {otherIngredients.join(", ")}
                      </p>
                    </details>
                  ) : null}

                  {product.coaUrl ? (
                    <a
                      href={product.coaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--forest)] underline underline-offset-4 transition hover:text-[var(--accent)]"
                    >
                      Certificate of Analysis →
                    </a>
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      ) : null}

      {product.proTip ? (
        <article
          className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm leading-relaxed text-[var(--forest)]"
          style={{ background: "linear-gradient(135deg, rgba(229,183,115,0.10), rgba(155,211,194,0.06))" }}
        >
          <span className="micro-copy mr-2 text-[var(--muted)]">Pro tip</span>
          {product.proTip}
        </article>
      ) : null}
    </aside>
  );
}

function CheckIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 6.5 L5 9 L9.5 3.5" />
    </svg>
  );
}

function IngredientCard({
  label,
  atlas,
}: {
  label: string;
  atlas: IngredientEntry | null;
}) {
  const color = atlas ? CATEGORY_COLOR[atlas.category] : "var(--accent)";
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-1 w-1 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
          <p className="text-[9px] uppercase tracking-[0.24em]" style={{ color }}>
            {atlas?.category ?? "Active compound"}
          </p>
        </div>
        <h4 className="mt-1 text-sm text-[var(--forest)]">{atlas?.name ?? label}</h4>
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
          {atlas?.function ?? "See the Ingredient Atomizer below for the full breakdown."}
        </p>
        {atlas?.dose ? (
          <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
            Dose · <span className="text-[var(--forest)]">{atlas.dose}</span>
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
