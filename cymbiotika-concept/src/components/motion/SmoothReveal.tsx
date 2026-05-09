"use client";

import { motion, useReducedMotion } from "framer-motion";

export function SmoothReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? undefined : { opacity: 0, clipPath: "inset(0 0 100% 0 round 24px)" }}
      whileInView={
        reduceMotion
          ? undefined
          : {
              opacity: 1,
              clipPath: "inset(0 0 0% 0 round 24px)",
            }
      }
      viewport={{ once: true, margin: "-10%" }}
      transition={reduceMotion ? undefined : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
