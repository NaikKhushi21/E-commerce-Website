"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type ScenePanelProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "light" | "dark";
  id?: string;
};

export function ScenePanel({ children, className, tone = "light", id }: ScenePanelProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section id={id} className={cn("scene-panel py-8 md:py-10", className)}>
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={reduceMotion ? undefined : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative isolate z-10 h-full text-[var(--text)]",
          tone === "dark" ? "text-[var(--text)]" : "text-[var(--forest)]",
        )}
      >
        {children}
      </motion.div>
    </section>
  );
}
