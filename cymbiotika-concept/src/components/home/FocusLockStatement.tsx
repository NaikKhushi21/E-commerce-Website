"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function FocusLockStatement() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0.15, 0.42, 0.58, 0.86], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.96, 1, 1.03]);
  const spacing = useTransform(scrollYProgress, [0, 0.5, 1], ["0.08em", "0.14em", "0.08em"]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden rounded-[2.1rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-14 md:px-10 md:py-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(200,212,228,0.22)_0%,transparent_66%)]" />
      <div className="relative mx-auto flex min-h-[42svh] max-w-4xl items-center justify-center">
        <motion.p
          className="display-title text-center text-[clamp(2.1rem,7vw,5.8rem)] leading-[0.95] text-[var(--text)]"
          style={
            reduceMotion
              ? undefined
              : {
                  opacity,
                  scale,
                  letterSpacing: spacing,
                }
          }
        >
          Absorption
          <br />
          changes outcomes.
        </motion.p>
      </div>
    </section>
  );
}
