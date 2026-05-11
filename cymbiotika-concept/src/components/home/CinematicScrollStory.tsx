"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Product } from "@/data/products";
import { SafeImage } from "@/components/ui/SafeImage";

const STORY_STEPS = [
  "Particles align",
  "Headline sharpens",
  "Bottle enters light",
  "Atmosphere warms",
  "Outcomes become visible",
];

export function CinematicScrollStory({ product }: { product?: Product }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 0.5, 1], [26, 0, -16]);
  const titleBlur = useTransform(scrollYProgress, [0, 0.3, 0.8], [7, 0, 1]);
  const titleFilter = useTransform(titleBlur, (value) => `blur(${value}px)`);
  const bottleRotate = useTransform(scrollYProgress, [0, 0.45, 1], [-9, -1, 8]);
  const bottleY = useTransform(scrollYProgress, [0, 0.5, 1], [48, 0, -36]);
  const warmthOpacity = useTransform(scrollYProgress, [0.1, 0.65, 1], [0.2, 0.56, 0.68]);
  const progress = useTransform(scrollYProgress, [0.12, 0.88], [0, 1]);
  const stepOneOpacity = useTransform(progress, [0, 1 / STORY_STEPS.length], [0.2, 1]);
  const stepTwoOpacity = useTransform(progress, [1 / STORY_STEPS.length, 2 / STORY_STEPS.length], [0.2, 1]);
  const stepThreeOpacity = useTransform(progress, [2 / STORY_STEPS.length, 3 / STORY_STEPS.length], [0.2, 1]);
  const stepFourOpacity = useTransform(progress, [3 / STORY_STEPS.length, 4 / STORY_STEPS.length], [0.2, 1]);
  const stepFiveOpacity = useTransform(progress, [4 / STORY_STEPS.length, 1], [0.2, 1]);
  const stepOpacities = [stepOneOpacity, stepTwoOpacity, stepThreeOpacity, stepFourOpacity, stepFiveOpacity];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden rounded-[2.1rem] border border-[var(--line)] bg-[var(--surface-elevated)] px-6 py-12 md:px-10 md:py-16"
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(66%_58%_at_75%_20%,rgba(215,174,128,0.34)_0%,transparent_72%)]"
          style={reduceMotion ? undefined : { opacity: warmthOpacity }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(58%_54%_at_12%_6%,rgba(171,198,228,0.26)_0%,transparent_74%)]" />
      </div>

      <div className="relative grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-end">
        <div>
          <p className="micro-copy text-[var(--muted)]">Scroll Sequence</p>
          <motion.h3
            className="display-title mt-4 max-w-2xl text-[clamp(2.2rem,6vw,4.9rem)]"
            style={reduceMotion ? undefined : { y: titleY, filter: titleFilter }}
          >
            Wellness becomes visible
            <br />
            when motion tells the story.
          </motion.h3>
          <p className="text-body mt-5 max-w-xl text-body md:text-lg">
            A cinematic progression that turns formulation logic into a sensory narrative instead of static sections.
          </p>

          <ol className="mt-8 grid gap-2 text-sm text-[var(--forest-soft)] md:max-w-[26rem]">
            {STORY_STEPS.map((step, idx) => {
              return (
                <motion.li
                  key={step}
                  className="flex items-center justify-between rounded-full border border-[var(--line)] bg-white/65 px-4 py-2"
                  style={reduceMotion ? undefined : { opacity: stepOpacities[idx] }}
                >
                  <span>{step}</span>
                  <span className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">0{idx + 1}</span>
                </motion.li>
              );
            })}
          </ol>
        </div>

        <div className="relative min-h-[360px] md:min-h-[520px]">
          <motion.div
            className="absolute inset-x-[10%] bottom-0 top-[10%] rounded-[1.8rem] border border-white/60 bg-[linear-gradient(170deg,rgba(255,255,255,0.72),rgba(255,255,255,0.08))] shadow-[0_28px_70px_rgba(0,0,0,0.12)]"
            style={reduceMotion ? undefined : { y: bottleY }}
          />
          {product ? (
            <motion.div className="absolute inset-0" style={reduceMotion ? undefined : { y: bottleY, rotate: bottleRotate }}>
              <SafeImage
                src={product.featuredImage}
                alt={product.title}
                fill
                className="object-contain px-7 pb-2 pt-10 drop-shadow-[0_34px_58px_rgba(0,0,0,0.2)] md:px-14"
              />
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
