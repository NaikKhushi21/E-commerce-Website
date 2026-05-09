"use client";

import { motion, useReducedMotion } from "framer-motion";

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  amount?: number;
};

export function Stagger({ children, className, amount = 0.08 }: StaggerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? undefined : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={{ once: true, margin: "-12%" }}
      variants={
        reduceMotion
          ? undefined
          : {
              hidden: {},
              show: { transition: { staggerChildren: amount } },
            }
      }
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        reduceMotion
          ? undefined
          : {
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
            }
      }
    >
      {children}
    </motion.div>
  );
}
