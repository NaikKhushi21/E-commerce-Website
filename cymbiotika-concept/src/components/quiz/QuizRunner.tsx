"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/products";
import type { WellnessGoal } from "@/data/goals";
import { GOAL_LABELS, WELLNESS_GOALS } from "@/data/goals";
import {
  QUIZ_SCHEMA,
  visibleQuestions,
  sectionIndexOf,
  type Question,
  type QuizAnswers,
  type Sex,
} from "@/data/quiz-schema";
import { LivingDiagnosis } from "@/components/quiz/LivingDiagnosis";
import { getRecommendedProtocolFromCatalog } from "@/lib/recommendations";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/cn";

/* ============================================================================
   QuizRunner — schema-driven multi-step quiz.
   ----------------------------------------------------------------------------
   - Walks visibleQuestions() top-to-bottom, resolving branches against the
     accumulated `answers` object on every render.
   - Renders by question type. The body-zones step delegates to the existing
     LivingDiagnosis component in embedded mode.
   - On finish, renders QuizResults using the same recommendation engine.
   ========================================================================== */

const FADE_IN = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export function QuizRunner({ products }: { products: Product[] }) {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => visibleQuestions(answers), [answers]);
  const current = questions[currentIdx];
  const total = questions.length;
  const sectionIdx = current ? sectionIndexOf(current.id) : -1;
  const section = sectionIdx >= 0 ? QUIZ_SCHEMA[sectionIdx] : null;
  const totalSections = QUIZ_SCHEMA.length;

  function setAnswer<K extends keyof QuizAnswers>(id: K, value: QuizAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function next() {
    if (currentIdx + 1 >= total) {
      setFinished(true);
      return;
    }
    setCurrentIdx((i) => i + 1);
  }

  function back() {
    if (currentIdx === 0) return;
    setCurrentIdx((i) => i - 1);
  }

  function restart() {
    setAnswers({});
    setCurrentIdx(0);
    setFinished(false);
  }

  if (finished) return <QuizResults answers={answers} products={products} onRestart={restart} />;
  if (!current) return null;

  const canAdvance = isAnswered(current, answers);

  return (
    <section className="theme-aurora relative isolate min-h-[88svh] overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[var(--bg)] text-[var(--text)]">
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 60% 38%, rgba(215,195,167,0.10), transparent 58%), radial-gradient(80% 60% at 22% 88%, rgba(140,224,214,0.08), transparent 65%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.18] bg-[radial-gradient(rgba(255,255,255,0.6)_0.5px,transparent_0.5px)] [background-size:3px_3px]" />

      <div className="relative px-6 py-8 md:px-12 md:py-10">
        {/* Progress + back */}
        <div className="flex items-center justify-between text-eyebrow tracking-[0.1em] text-white/78">
          <span>
            Section {sectionIdx + 1} of {totalSections}
            {section ? ` · ${section.title}` : null}
          </span>
          <span>
            {currentIdx + 1} / {total}
          </span>
        </div>

        <div className="mt-2 h-[2px] w-full overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-white/85 transition-[width] duration-500"
            style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={current.id} {...FADE_IN}>
            {current.type === "body-zones" ? (
              <>
                <BodyZonesStep
                  products={products}
                  value={answers.zones}
                  onChange={(goals) => setAnswer("zones", goals)}
                  prompt={current.prompt}
                />
                {/* Footer nav for body-zones — centered to match the rest
                    of the runner's question screens. */}
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={back}
                    disabled={currentIdx === 0}
                    className="text-eyebrow tracking-[0.1em] text-white/65 transition disabled:cursor-not-allowed disabled:opacity-30 hover:text-white"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canAdvance}
                    className="rounded-full bg-white px-7 py-3.5 text-eyebrow tracking-[0.1em] text-[var(--on-primary)] transition disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 hover:scale-[1.02]"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              // Centered single-column layout for generic questions so the
              // whole screen (headline → options → Next) fits one viewport
              // without scrolling.
              <div className="mx-auto mt-8 max-w-3xl text-center">
                <h1 className="text-h2 leading-[1.1] text-white">{current.prompt}</h1>

                <div className="mt-6 text-left">{renderInput(current, answers, setAnswer)}</div>

                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={back}
                    disabled={currentIdx === 0}
                    className="text-eyebrow tracking-[0.1em] text-white/65 transition disabled:cursor-not-allowed disabled:opacity-30 hover:text-white"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canAdvance}
                    className="rounded-full bg-white px-7 py-3.5 text-eyebrow tracking-[0.1em] text-[var(--on-primary)] transition disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 hover:scale-[1.02]"
                  >
                    {currentIdx + 1 === total ? "Reveal my routine" : "Next"}
                  </button>
                </div>

                {current.whyWeAsk ? (
                  <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-white/15 bg-white/[0.04] p-4 text-left">
                    <p className="text-eyebrow tracking-[0.1em] text-white">Why we ask</p>
                    <p className="mt-1.5 text-small leading-relaxed text-white/78">
                      {current.whyWeAsk}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
   Per-question renderers
   -------------------------------------------------------------------------- */

function renderInput(
  q: Question,
  answers: QuizAnswers,
  setAnswer: <K extends keyof QuizAnswers>(id: K, value: QuizAnswers[K]) => void,
) {
  switch (q.type) {
    case "visual-pick":
      return <VisualPick question={q} value={answers.sex} onPick={(v) => setAnswer("sex", v as Sex)} />;
    case "age-bracket":
      return (
        <PillRow
          options={q.options}
          value={answers.ageBracket}
          onPick={(v) => setAnswer("ageBracket", v as QuizAnswers["ageBracket"])}
        />
      );
    case "single":
      // The runner uses generic string keys for single-select answers; the
      // schema decides which answer slot via question id.
      return (
        <OptionStack
          options={q.options}
          value={readString(answers, q.id)}
          onPick={(v) => setAnswer(q.id, v as never)}
        />
      );
    case "multi":
      return (
        <OptionStack
          options={q.options}
          multi
          max={q.max}
          value={readStringArray(answers, q.id)}
          onPick={(v) => setAnswer(q.id, v as never)}
        />
      );
    case "yes-no":
      return (
        <YesNo
          value={answers[q.id] as boolean | undefined}
          onPick={(v) => setAnswer(q.id, v as never)}
        />
      );
    default:
      return null;
  }
}

// ----- Visual pick (sex selection) -----

function VisualPick({
  question,
  value,
  onPick,
}: {
  question: Extract<Question, { type: "visual-pick" }>;
  value?: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-3">
      {question.options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onPick(opt.id)}
            className={cn(
              "group relative flex h-36 flex-col items-center justify-end gap-2 rounded-2xl border bg-white/[0.04] p-4 transition",
              active
                ? "border-white bg-white/[0.10]"
                : "border-white/15 hover:border-white/35 hover:bg-white/[0.06]",
            )}
          >
            {opt.illustration ? (
              <BodySilhouette variant={opt.illustration} active={active} />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <span className="text-eyebrow tracking-[0.1em] text-white/55">Skip</span>
              </div>
            )}
            <span
              className={cn(
                "text-eyebrow tracking-[0.1em] transition",
                active ? "text-white" : "text-white/78 group-hover:text-white",
              )}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function BodySilhouette({ variant, active }: { variant: "male-body" | "female-body"; active: boolean }) {
  // Simple stylized silhouette — placeholder for proper illustration later.
  const stroke = active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.42)";
  const fill = active ? "rgba(245,212,168,0.18)" : "rgba(245,212,168,0.06)";
  return (
    <svg viewBox="0 0 100 160" className="h-20 w-auto">
      {/* Head */}
      <circle cx="50" cy="22" r="13" stroke={stroke} fill={fill} strokeWidth="1.5" />
      {variant === "male-body" ? (
        // Broader shoulders, straighter waist
        <path
          d="M28 50 Q50 42 72 50 L78 90 L66 130 L60 152 L40 152 L34 130 L22 90 Z"
          stroke={stroke}
          fill={fill}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      ) : (
        // Narrower shoulders, hourglass
        <path
          d="M32 50 Q50 44 68 50 L72 80 L58 92 L66 130 L60 152 L40 152 L34 130 L42 92 L28 80 Z"
          stroke={stroke}
          fill={fill}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// ----- Pill row (age bracket) -----

function PillRow({
  options,
  value,
  onPick,
}: {
  options: readonly string[];
  value?: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onPick(opt)}
            className={cn(
              "rounded-full border px-7 py-3.5 text-eyebrow tracking-[0.1em] transition",
              active
                ? "border-white bg-white text-[var(--on-primary)]"
                : "border-white/20 bg-white/[0.04] text-white/85 hover:border-white/45 hover:bg-white/[0.08]",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ----- Option stack (single + multi) -----

function OptionStack({
  options,
  value,
  onPick,
  multi = false,
  max,
}: {
  options: readonly string[];
  value: string | string[] | undefined;
  onPick: (v: string | string[]) => void;
  multi?: boolean;
  max?: number;
}) {
  // "None of these" acts as a mutually-exclusive option in any multi-select.
  // Picking it clears all other selections; picking any other option clears
  // "None of these" if it was set. Used by allergens + currentSupplements.
  const NONE = "None of these";
  function toggle(opt: string) {
    if (!multi) {
      onPick(opt);
      return;
    }
    const current = Array.isArray(value) ? value : [];
    const exists = current.includes(opt);
    if (exists) {
      onPick(current.filter((v) => v !== opt));
      return;
    }
    if (opt === NONE) {
      onPick([NONE]);
      return;
    }
    const filtered = current.filter((v) => v !== NONE);
    if (max && filtered.length >= max) return;
    onPick([...filtered, opt]);
  }

  function isActive(opt: string) {
    if (multi) return Array.isArray(value) && value.includes(opt);
    return value === opt;
  }

  return (
    <>
      {multi && max ? (
        <p className="mb-3 text-eyebrow tracking-[0.1em] text-white/55">
          Select up to {max}
        </p>
      ) : null}
      <div
        className={
          // Multi-select with many options → 2/3-col grid so 12+ options fit
          // in one viewport. Single-select stays stacked full-width for
          // easier reading of longer option text.
          multi ? "grid grid-cols-2 gap-2 sm:grid-cols-3" : "space-y-1.5"
        }
      >
        {options.map((opt) => {
          const active = isActive(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={cn(
                "flex items-center justify-between rounded-xl border bg-white/[0.04] px-4 py-2.5 text-left transition",
                multi ? "w-full" : "w-full",
                active
                  ? "border-white bg-white/[0.10]"
                  : "border-white/15 hover:border-white/35 hover:bg-white/[0.06]",
              )}
            >
              <span className={cn("text-small", active ? "text-white" : "text-white/85")}>
                {opt}
              </span>
              {multi ? (
                <span
                  aria-hidden
                  className={cn(
                    "ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] transition",
                    active ? "border-white bg-white text-[var(--on-primary)]" : "border-white/30",
                  )}
                >
                  {active ? "✓" : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </>
  );
}

// ----- Yes / No -----

function YesNo({
  value,
  onPick,
}: {
  value?: boolean;
  onPick: (v: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      {[
        { label: "Yes", val: true },
        { label: "No", val: false },
      ].map((opt) => {
        const active = value === opt.val;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => onPick(opt.val)}
            className={cn(
              "block w-full rounded-2xl border bg-white/[0.04] px-6 py-5 text-center text-body transition",
              active
                ? "border-white bg-white text-[var(--on-primary)]"
                : "border-white/15 text-white/85 hover:border-white/35 hover:bg-white/[0.06]",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ----- Body zones step (embedded LivingDiagnosis) -----

function BodyZonesStep({
  products,
  value,
  onChange,
  prompt,
}: {
  products: Product[];
  value?: WellnessGoal[];
  onChange: (goals: WellnessGoal[]) => void;
  prompt: string;
}) {
  // The picker tracks zone ids internally; we receive the derived
  // WellnessGoal[] via onSelectionChange and forward it up.
  return (
    <div className="mt-6">
      <LivingDiagnosis
        products={products}
        embedded
        title={prompt}
        subtitle="Light up any zones — your selection shapes the rest of the questions."
        onSelectionChange={(_zoneIds, goals) => onChange(goals)}
      />
      {value && value.length > 0 ? (
        <p className="mt-4 text-eyebrow tracking-[0.1em] text-white/65">
          {value.length} zone{value.length === 1 ? "" : "s"} active — continue when ready.
        </p>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

function readString(answers: QuizAnswers, key: keyof QuizAnswers): string | undefined {
  const v = answers[key];
  return typeof v === "string" ? v : undefined;
}

function readStringArray(answers: QuizAnswers, key: keyof QuizAnswers): string[] | undefined {
  const v = answers[key];
  return Array.isArray(v) ? (v as string[]) : undefined;
}

/** A question is "answered" when its slot in the answers object holds a
 *  truthy value. Multi questions need at least one entry. The body-zones
 *  step needs at least one selected goal. The currentSupplements step is
 *  always allowed to advance (optional). */
function isAnswered(q: Question, a: QuizAnswers): boolean {
  if (q.id === "currentSupplements") return true; // optional
  if (q.type === "body-zones") return (a.zones ?? []).length > 0;
  if (q.type === "multi") return Array.isArray(a[q.id]) && (a[q.id] as unknown[]).length > 0;
  if (q.type === "yes-no") return typeof a[q.id] === "boolean";
  return a[q.id] !== undefined && a[q.id] !== "";
}

/* ============================================================================
   Results screen
   ========================================================================== */

function QuizResults({
  answers,
  products,
  onRestart,
}: {
  answers: QuizAnswers;
  products: Product[];
  onRestart: () => void;
}) {
  const { addItem } = useCart();

  // Combine zones (from picker) + explicit goals (from multi-select) into one
  // unified goal set. The multi-select labels are display strings, so map
  // them back to WellnessGoal keys where possible.
  const goals = useMemo<WellnessGoal[]>(() => {
    const set = new Set<WellnessGoal>(answers.zones ?? []);
    (answers.goals ?? []).forEach((label) => {
      const key = WELLNESS_GOALS.find(
        (g) => GOAL_LABELS[g].toLowerCase() === label.toLowerCase(),
      );
      if (key) set.add(key);
    });
    return Array.from(set);
  }, [answers]);

  const protocol = useMemo(
    () => getRecommendedProtocolFromCatalog(products, goals),
    [products, goals],
  );

  const recommended = useMemo(() => {
    const all = [...protocol.morning, ...protocol.evening, ...protocol.targeted];
    const seen = new Set<string>();
    const unique: Product[] = [];
    for (const p of all) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        unique.push(p);
      }
      if (unique.length === 4) break;
    }
    if (unique.length < 4) {
      for (const p of products) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          unique.push(p);
        }
        if (unique.length === 4) break;
      }
    }
    return unique;
  }, [protocol, products]);

  return (
    <section className="theme-aurora relative isolate min-h-[88svh] overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[var(--bg)] text-[var(--text)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 60% 38%, rgba(215,195,167,0.10), transparent 58%), radial-gradient(80% 60% at 22% 88%, rgba(140,224,214,0.08), transparent 65%)",
        }}
      />
      <div className="relative px-6 py-12 md:px-12 md:py-14">
        <p className="text-eyebrow tracking-[0.1em] text-white/78">Your matched routine</p>
        <h1 className="text-display mt-3 max-w-3xl text-white">
          Built from {goals.length} signal{goals.length === 1 ? "" : "s"} you shared.
        </h1>
        <p className="mt-5 max-w-xl text-body leading-relaxed text-white/78">
          {recommended.length} formula{recommended.length === 1 ? "" : "s"} matched to your goals,
          challenges, and constraints. Add the full routine or start with one.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {recommended.map((product) => (
            <article
              key={product.id}
              className="flex flex-col rounded-2xl border border-white/15 bg-white/[0.04] p-5 transition hover:border-white/35"
            >
              <div className="relative h-44 w-full overflow-hidden rounded-xl bg-white/[0.04]">
                {product.featuredImage ? (
                  <SafeImage
                    src={product.featuredImage}
                    alt={product.title}
                    fill
                    className="object-contain p-2"
                  />
                ) : null}
              </div>
              <h3 className="mt-4 text-h3 text-white">{product.title}</h3>
              <p className="mt-2 text-small text-white/78">
                {product.benefits[0] ?? product.description?.slice(0, 100)}
              </p>
              {/* mt-auto pushes the price + ADD row to the bottom so every
                  card lines up its ADD button regardless of title/description
                  height variations. */}
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="text-eyebrow tracking-[0.1em] text-white/65">
                  {formatPrice(product)}
                </span>
                <button
                  type="button"
                  onClick={() => addItem(product)}
                  className="rounded-full bg-white px-4 py-2 text-eyebrow tracking-[0.1em] text-[var(--on-primary)] transition hover:scale-[1.02]"
                >
                  Add
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => {
              recommended.forEach((p) => addItem(p));
              onRestart();
            }}
            disabled={recommended.length === 0}
            className="rounded-full bg-white px-7 py-3.5 text-eyebrow tracking-[0.1em] text-[var(--on-primary)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
          >
            Add full routine
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="rounded-full border border-white/25 bg-white/[0.04] px-7 py-3.5 text-eyebrow tracking-[0.1em] text-white transition hover:border-white/55 hover:bg-white/10"
          >
            Start again
          </button>
          <Link
            href="/products"
            className="text-eyebrow tracking-[0.1em] text-white/78 hover:text-white"
          >
            Browse all →
          </Link>
        </div>
      </div>
    </section>
  );
}

function formatPrice(p: Product): string {
  const currency = p.currency ?? "USD";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(p.price);
  } catch {
    return `$${p.price.toFixed(2)}`;
  }
}
