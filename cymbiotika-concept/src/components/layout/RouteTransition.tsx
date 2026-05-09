"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const r2 = (v: number) => Math.round(v * 100) / 100;

const LIPID_COUNT = 14;
const LIPIDS = Array.from({ length: LIPID_COUNT }).map((_, i) => {
  const angle = (i / LIPID_COUNT) * Math.PI * 2;
  return {
    x: r2(Math.cos(angle) * 60),
    y: r2(Math.sin(angle) * 60),
    farX: r2(Math.cos(angle) * 220),
    farY: r2(Math.sin(angle) * 220),
  };
});

const ASSEMBLE_MS = 320;
const HOLD_MS = 70;
const DISPERSE_MS = 280;

export function RouteTransition() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const initialMount = useRef(true);
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    if (reduceMotion) return;

    const kickoff = window.setTimeout(() => {
      setShow(true);
      setPhase("in");
    }, 0);
    const flipTimer = window.setTimeout(() => setPhase("out"), ASSEMBLE_MS + HOLD_MS);
    const offTimer = window.setTimeout(
      () => setShow(false),
      ASSEMBLE_MS + HOLD_MS + DISPERSE_MS,
    );

    return () => {
      window.clearTimeout(kickoff);
      window.clearTimeout(flipTimer);
      window.clearTimeout(offTimer);
    };
  }, [pathname, reduceMotion]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="theme-aurora pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          aria-hidden="true"
        >
          {/* Dim veil */}
          <motion.div
            className="absolute inset-0 bg-[var(--bg)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "in" ? 0.84 : 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Liposome */}
          <div className="relative h-44 w-44">
            <svg
              viewBox="-100 -100 200 200"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="rt-core" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#fff1d1" />
                  <stop offset="100%" stopColor="#e8b886" />
                </radialGradient>
                <filter id="rt-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer bilayer ring */}
              <motion.circle
                r={60}
                fill="none"
                stroke="rgba(215,195,167,0.7)"
                strokeWidth="1"
                strokeDasharray="2 4"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={
                  phase === "in"
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 1.5 }
                }
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "center" }}
              />

              {/* Inner ring */}
              <motion.circle
                r={38}
                fill="none"
                stroke="rgba(245,212,168,0.45)"
                strokeWidth="0.8"
                strokeDasharray="1 3"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={
                  phase === "in"
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 1.4 }
                }
                transition={{ duration: 0.32, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "center" }}
              />

              {/* Active core */}
              <motion.circle
                r={14}
                fill="url(#rt-core)"
                filter="url(#rt-glow)"
                initial={{ opacity: 0, scale: 0 }}
                animate={
                  phase === "in"
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.6 }
                }
                transition={{ duration: 0.3, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "center" }}
              />

              {/* Phospholipid heads — fly in to ring, then fly out on exit */}
              {LIPIDS.map((d, i) => (
                <Lipid key={i} d={d} phase={phase} index={i} />
              ))}
            </svg>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Lipid({
  d,
  phase,
  index,
}: {
  d: { x: number; y: number; farX: number; farY: number };
  phase: "in" | "out";
  index: number;
}) {
  return (
    <motion.circle
      r={3}
      fill="#f5d4a8"
      filter="url(#rt-glow)"
      initial={{ cx: d.farX, cy: d.farY, opacity: 0 }}
      animate={
        phase === "in"
          ? { cx: d.x, cy: d.y, opacity: 1 }
          : { cx: d.farX, cy: d.farY, opacity: 0 }
      }
      transition={{
        duration: 0.32,
        delay: index * 0.012,
        ease: [0.22, 1, 0.36, 1],
      }}
    />
  );
}
