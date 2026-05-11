"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { GOAL_LABELS, WELLNESS_GOALS, type WellnessGoal } from "@/data/goals";
import { getRecommendedProtocolFromCatalog } from "@/lib/recommendations";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { QuizResults } from "@/components/quiz/QuizResults";
import { AnimatePresence, motion } from "framer-motion";

const questions = [
  { id: "goals", title: "When do you feel least like yourself?", options: WELLNESS_GOALS.map((goal) => GOAL_LABELS[goal]), multi: true },
  { id: "time", title: "Where does your day lose its rhythm?", options: ["Morning", "Evening", "Both"] },
  { id: "style", title: "What should support feel like?", options: ["Daily essentials", "Targeted support", "Balanced mix"] },
  { id: "format", title: "What format disappears into your life?", options: ["Packets", "Capsules", "Liquids", "No preference"] },
  { id: "stack", title: "How much change can your routine hold?", options: ["Simple 2-product stack", "Complete stack"] },
] as const;

const goalFromLabel = new Map<string, WellnessGoal>(WELLNESS_GOALS.map((goal) => [GOAL_LABELS[goal], goal]));

export function QuizFlow({ products }: { products: Product[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const current = questions[step];
  const isComplete = step >= questions.length;

  const selectedGoals = useMemo(() => {
    const selected = answers.goals ?? [];
    return selected.map((label) => goalFromLabel.get(label)).filter((goal): goal is WellnessGoal => Boolean(goal));
  }, [answers.goals]);

  const protocol = useMemo(() => getRecommendedProtocolFromCatalog(products, selectedGoals), [products, selectedGoals]);
  const resultProducts = useMemo(() => {
    const base = [...protocol.morning, ...protocol.evening, ...protocol.targeted];
    return base.length > 0 ? base : products.slice(0, 4);
  }, [products, protocol]);

  function handleSelect(value: string) {
    const prev = answers[current.id] ?? [];
    if ("multi" in current && current.multi) {
      const next = prev.includes(value) ? prev.filter((entry) => entry !== value) : [...prev, value];
      setAnswers((state) => ({ ...state, [current.id]: next }));
      return;
    }
    setAnswers((state) => ({ ...state, [current.id]: [value] }));
    setTimeout(() => setStep((s) => s + 1), 180);
  }

  if (isComplete) return <QuizResults products={resultProducts.slice(0, 6)} />;

  const selected = answers[current.id] ?? [];
  const progress = ((step + 1) / questions.length) * 100;
  const sceneTone = [
    "radial-gradient(circle_at_15%_6%,rgba(220,232,219,0.62)_0%,transparent_46%),radial-gradient(circle_at_88%_80%,rgba(240,199,174,0.36)_0%,transparent_42%)",
    "radial-gradient(circle_at_88%_12%,rgba(242,210,186,0.56)_0%,transparent_45%),radial-gradient(circle_at_10%_88%,rgba(204,222,226,0.34)_0%,transparent_42%)",
    "radial-gradient(circle_at_18%_90%,rgba(205,223,208,0.5)_0%,transparent_44%),radial-gradient(circle_at_75%_16%,rgba(255,255,255,0.56)_0%,transparent_40%)",
    "radial-gradient(circle_at_80%_82%,rgba(226,213,183,0.52)_0%,transparent_44%),radial-gradient(circle_at_12%_20%,rgba(200,221,234,0.36)_0%,transparent_42%)",
    "radial-gradient(circle_at_52%_10%,rgba(240,199,174,0.48)_0%,transparent_44%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.52)_0%,transparent_48%)",
  ][step % 5];

  return (
    <motion.div
      className="relative min-h-[88svh] overflow-hidden rounded-[2.5rem] border border-white/50 px-5 py-7 shadow-[0_34px_110px_rgba(20,20,20,0.09)] backdrop-blur-xl md:px-8 md:py-9"
      animate={{ backgroundImage: sceneTone }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-65">
        <div className="absolute left-[12%] top-[12%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.64),transparent_68%)] blur-2xl" />
        <div className="absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full bg-[radial-gradient(circle,var(--rhythm-glow),transparent_70%)] blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto max-w-5xl space-y-3">
        <div className="flex items-center justify-between text-eyebrow tracking-[0.1em] text-[var(--muted)]">
          <p>Question {step + 1}</p>
          <p>{Math.round(progress)}%</p>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/54">
          <div className="h-full rounded-full bg-[var(--primary)] transition-all duration-700 [transition-timing-function:var(--easing-premium)]" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <QuizQuestion title={current.title} options={current.options} selected={selected} multi={"multi" in current && current.multi} onSelect={handleSelect} />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex max-w-5xl items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="text-eyebrow tracking-[0.1em] text-[var(--muted)] transition-opacity disabled:opacity-35"
        >
          Back
        </button>

        {"multi" in current && current.multi ? (
          <button
            disabled={selected.length === 0}
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full bg-[var(--primary)] px-6 py-2.5 text-eyebrow tracking-[0.1em] text-[var(--on-primary)] transition duration-500 [transition-timing-function:var(--easing-premium)] hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Continue
          </button>
        ) : (
          <span className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">Select one option to continue</span>
        )}
      </div>
    </motion.div>
  );
}
