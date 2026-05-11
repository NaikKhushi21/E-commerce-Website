"use client";

import { useMemo, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Product } from "@/data/products";

export function MicroLabExperience({ product }: { product: Product }) {
  const ref = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const membraneScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1.04, 0.98]);
  const threadDraw = useTransform(scrollYProgress, [0.12, 0.7], [0, 1]);
  const particleY = useTransform(scrollYProgress, [0, 1], [80, -120]);
  const ingredients = useMemo(() => product.ingredients?.slice(0, 5) ?? product.benefits.slice(0, 5), [product]);

  return (
    <section ref={ref} className="relative min-h-[92svh] overflow-hidden rounded-[2.4rem] border border-white/45 bg-[linear-gradient(145deg,rgba(238,244,244,0.74),rgba(250,245,236,0.48))] px-6 py-16 shadow-[0_34px_100px_rgba(19,32,34,0.1)] md:px-10 md:py-20">
      <div className="grid min-h-[72svh] gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-center">
        <div className="relative z-10">
          <p className="micro-copy text-[var(--muted)]">Micro Lab</p>
          <h2 className="text-display mt-4 max-w-xl text-[var(--primary)]">Absorption, rendered as atmosphere.</h2>
          <p className="text-body mt-5 max-w-md text-body md:text-lg">
            {product.title} is shown as a cellular path: threads connect, nutrients drift, and the membrane opens without turning science into a dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {ingredients.map((ingredient) => (
              <span key={ingredient} className="rounded-full border border-white/55 bg-white/48 px-3 py-1.5 text-eyebrow tracking-[0.1em] text-[var(--muted)]">
                {ingredient}
              </span>
            ))}
          </div>
        </div>

        <div className="relative h-[560px] overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.72),transparent_34%),radial-gradient(circle_at_50%_50%,rgba(195,218,224,0.38),transparent_56%)]">
          <motion.div
            className="absolute left-1/2 top-1/2 h-[340px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/70 bg-white/18 shadow-[inset_0_0_42px_rgba(255,255,255,0.6),0_0_80px_rgba(181,205,209,0.28)]"
            style={reduceMotion ? undefined : { scale: membraneScale }}
          />

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 900 620" aria-hidden="true">
            <defs>
              <linearGradient id="lab-thread" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="rgba(195,154,111,0.05)" />
                <stop offset="48%" stopColor="rgba(255,255,255,0.94)" />
                <stop offset="100%" stopColor="rgba(147,183,199,0.28)" />
              </linearGradient>
              <filter id="lab-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {[120, 210, 300, 390, 480].map((y, index) => (
              <motion.path
                key={y}
                d={`M 70 ${y} C 260 ${y - 90}, 360 ${y + 110}, 520 ${y - 8} S 690 ${y - 72}, 830 ${y + 26}`}
                fill="none"
                stroke="url(#lab-thread)"
                strokeWidth={index === 2 ? 3 : 1.7}
                strokeLinecap="round"
                filter="url(#lab-glow)"
                style={reduceMotion ? undefined : { pathLength: threadDraw }}
              />
            ))}
          </svg>

          {Array.from({ length: 34 }).map((_, index) => (
            <motion.span
              key={index}
              className="absolute rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.9)]"
              style={{
                left: `${8 + ((index * 23) % 84)}%`,
                top: `${14 + ((index * 17) % 72)}%`,
                width: `${3 + (index % 4)}px`,
                height: `${3 + (index % 4)}px`,
                y: reduceMotion ? undefined : particleY,
                opacity: 0.32 + (index % 5) * 0.08,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
