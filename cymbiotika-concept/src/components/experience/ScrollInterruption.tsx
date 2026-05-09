"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type ScrollInterruptionProps = {
  eyebrow?: string;
  statement: string;
  className?: string;
};

export function ScrollInterruption({ eyebrow = "Interruption", statement, className }: ScrollInterruptionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn("relative flex min-h-[92svh] items-center justify-center overflow-hidden rounded-[2.4rem] border border-white/45 bg-[linear-gradient(135deg,rgba(247,244,236,0.78),rgba(224,231,232,0.48))] px-6 text-center shadow-[0_32px_100px_rgba(20,25,24,0.08)]", className)}>
      <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]">
        <div className="absolute left-[12%] top-[18%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.86),transparent_64%)] blur-2xl" />
        <div className="absolute bottom-[14%] right-[14%] h-64 w-64 rounded-full bg-[radial-gradient(circle,var(--rhythm-glow),transparent_68%)] blur-3xl" />
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className="state-ambient-particle absolute h-1.5 w-1.5 rounded-full bg-white/75 shadow-[0_0_18px_rgba(255,255,255,0.8)]"
            style={{
              left: `${(index * 19) % 94}%`,
              top: `${(index * 31) % 88}%`,
              animationDelay: `${index * 0.28}s`,
              animationDuration: `${14 + (index % 5) * 3}s`,
            }}
          />
        ))}
      </div>
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 28 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-25%" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        <p className="micro-copy text-[var(--muted)]">{eyebrow}</p>
        <h2 className="display-title mx-auto mt-6 max-w-5xl text-[clamp(3.2rem,9vw,8.5rem)] uppercase text-[var(--primary)]">
          {statement}
        </h2>
      </motion.div>
    </section>
  );
}
