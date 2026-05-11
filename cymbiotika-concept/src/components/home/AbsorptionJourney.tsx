"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

const STAGES = [
  "Liposomal shell protects payload",
  "Transport channels activate",
  "Uptake pathways illuminate",
  "Steady delivery reaches targets",
];

export function AbsorptionJourney() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const pathProgress = useTransform(scrollYProgress, [0.1, 0.9], [0.06, 1]);
  const glowOpacity = useTransform(scrollYProgress, [0.2, 0.62, 1], [0.18, 0.7, 0.4]);
  const pathOffset = useTransform(pathProgress, (value) => 1 - value);
  const stageOneOpacity = useTransform(pathProgress, [0, 1 / STAGES.length], [0.36, 1]);
  const stageTwoOpacity = useTransform(pathProgress, [1 / STAGES.length, 2 / STAGES.length], [0.36, 1]);
  const stageThreeOpacity = useTransform(pathProgress, [2 / STAGES.length, 3 / STAGES.length], [0.36, 1]);
  const stageFourOpacity = useTransform(pathProgress, [3 / STAGES.length, 1], [0.36, 1]);
  const stageOpacities = [stageOneOpacity, stageTwoOpacity, stageThreeOpacity, stageFourOpacity];
  const particleOneOpacity = useTransform(pathProgress, [0.22, 0.24], [0.18, 0.95]);
  const particleTwoOpacity = useTransform(pathProgress, [0.42, 0.44], [0.18, 0.95]);
  const particleThreeOpacity = useTransform(pathProgress, [0.62, 0.64], [0.18, 0.95]);
  const particleOneScale = useTransform(pathProgress, [0.22, 0.24], [0.75, 1.18]);
  const particleTwoScale = useTransform(pathProgress, [0.42, 0.44], [0.75, 1.18]);
  const particleThreeScale = useTransform(pathProgress, [0.62, 0.64], [0.75, 1.18]);
  const particleOpacities = [particleOneOpacity, particleTwoOpacity, particleThreeOpacity];
  const particleScales = [particleOneScale, particleTwoScale, particleThreeScale];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden rounded-[2.1rem] border border-[var(--line)] bg-[var(--surface-elevated)] px-6 py-12 md:px-10 md:py-16"
    >
      <motion.div
        className="pointer-events-none absolute -left-10 top-0 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(171,216,196,0.28)_0%,transparent_72%)] blur-[2px]"
        style={reduceMotion ? undefined : { opacity: glowOpacity }}
      />
      <div className="relative grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div>
          <p className="micro-copy text-[var(--muted)]">Absorption Journey</p>
          <h3 className="display-title mt-4 max-w-2xl text-[clamp(2rem,5.2vw,4.5rem)]">A biological pathway, rendered as art.</h3>
          <p className="text-body mt-5 max-w-xl text-body md:text-lg">
            Nutrient transport visualized as a responsive system so users feel sequence, timing, and flow.
          </p>
          <ol className="mt-8 grid gap-2 text-sm text-[var(--forest-soft)] md:max-w-[30rem]">
            {STAGES.map((stage, idx) => {
              return (
                <motion.li
                  key={stage}
                  className="rounded-full border border-[var(--line)] bg-white/72 px-4 py-2"
                  style={reduceMotion ? undefined : { opacity: stageOpacities[idx] }}
                >
                  {stage}
                </motion.li>
              );
            })}
          </ol>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-[1.8rem] border border-white/70 bg-[linear-gradient(165deg,rgba(255,255,255,0.7),rgba(245,250,255,0.25))] md:min-h-[470px]">
          <svg viewBox="0 0 480 460" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <linearGradient id="tubeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(108,172,205,0.16)" />
                <stop offset="100%" stopColor="rgba(131,213,168,0.22)" />
              </linearGradient>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(118,209,255,0.1)" />
                <stop offset="55%" stopColor="rgba(121,229,196,0.82)" />
                <stop offset="100%" stopColor="rgba(248,205,148,0.9)" />
              </linearGradient>
            </defs>
            <path
              d="M40 386 C106 332 124 284 172 252 C217 222 265 236 302 192 C332 156 352 114 430 82"
              fill="none"
              stroke="url(#tubeGradient)"
              strokeWidth="50"
              strokeLinecap="round"
            />
            <motion.path
              d="M40 386 C106 332 124 284 172 252 C217 222 265 236 302 192 C332 156 352 114 430 82"
              fill="none"
              stroke="url(#flowGradient)"
              strokeWidth="18"
              strokeLinecap="round"
              style={
                reduceMotion
                  ? { pathLength: 0.96, opacity: 0.84 }
                  : { pathLength: pathProgress, pathOffset, opacity: glowOpacity }
              }
            />
            {[0, 1, 2].map((idx) => (
              <motion.circle
                key={idx}
                cx={72 + idx * 92}
                cy={362 - idx * 76}
                r="9"
                fill="rgba(241,253,255,0.92)"
                style={
                  reduceMotion
                    ? { opacity: 0.72 }
                    : { opacity: particleOpacities[idx], scale: particleScales[idx] }
                }
              />
            ))}
          </svg>

          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 8 }).map((_, idx) => (
              <span
                key={`journey-particle-${idx}`}
                className="absorption-particle absolute h-1.5 w-1.5 rounded-full bg-[rgba(120,211,193,0.8)]"
                style={{
                  left: `${18 + idx * 8}%`,
                  top: `${64 - idx * 3}%`,
                  animationDelay: `${(idx * 0.29).toFixed(2)}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
