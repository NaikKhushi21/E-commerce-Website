import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

type QuizQuestionProps = {
  title: string;
  options: readonly string[];
  selected: string[];
  multi?: boolean;
  onSelect: (value: string) => void;
};

export function QuizQuestion({ title, options, selected, multi = false, onSelect }: QuizQuestionProps) {
  return (
    <section className="flex min-h-[58svh] flex-col items-center justify-center text-center">
      <h2 className="display-title mx-auto max-w-5xl text-[clamp(3.2rem,8vw,7.4rem)] leading-[0.9] text-[var(--primary)]">{title}</h2>
      <div className="mt-11 grid w-full max-w-4xl gap-3 md:grid-cols-2">
        {options.map((option, index) => {
          const active = selected.includes(option);
          return (
            <motion.button
              key={option}
              onClick={() => onSelect(option)}
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "group relative overflow-hidden rounded-[1.5rem] border px-5 py-6 text-center text-lg transition duration-700 [transition-timing-function:var(--easing-premium)] md:px-7 md:py-8 md:text-xl",
                active
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)] shadow-[0_22px_60px_rgba(20,20,20,0.18)]"
                  : "border-white/55 bg-white/42 text-[var(--primary)] shadow-[0_16px_48px_rgba(20,20,20,0.06)] hover:-translate-y-1 hover:bg-white/68",
              )}
            >
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.55),transparent_54%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <span className="relative z-10">{option}</span>
              {multi ? <span className="relative z-10 ml-2 text-eyebrow tracking-[0.1em] opacity-65">multi</span> : null}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
