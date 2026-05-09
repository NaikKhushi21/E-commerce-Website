"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import type { HTMLMotionProps } from "framer-motion";

type MagneticButtonProps = HTMLMotionProps<"button"> & {
  strength?: number;
};

export function MagneticButton({ className, strength = 0.2, children, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 240, damping: 16 });
  const springY = useSpring(y, { stiffness: 240, damping: 16 });

  function onMove(event: React.MouseEvent<HTMLButtonElement>) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    x.set(offsetX * strength);
    y.set(offsetY * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      className={cn(className)}
      style={reduceMotion ? undefined : { x: springX, y: springY }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...props}
    >
      {children}
    </motion.button>
  );
}
