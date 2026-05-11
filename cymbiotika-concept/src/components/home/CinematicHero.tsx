"use client";

import { useRef } from "react";
import type { Product } from "@/data/products";
import { SafeImage } from "@/components/ui/SafeImage";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function CinematicHero({ products }: { products: Product[] }) {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const spotlight = products[0];
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bottleRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-8, 2, 14]);
  const bottleY = useTransform(scrollYProgress, [0, 0.5, 1], [62, 0, -86]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.55, 1], [0.92, 1.06, 0.96]);
  const titleOpacity = useTransform(scrollYProgress, [0.12, 0.34, 0.72], [0.28, 1, 0.36]);
  const copyOpacity = useTransform(scrollYProgress, [0.22, 0.44, 0.8], [0, 1, 0.2]);
  const grainY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const depthY = useTransform(scrollYProgress, [0, 1], [28, -30]);
  const backgroundShift = useTransform(scrollYProgress, [0, 1], ["20%", "74%"]);

  if (products.length === 0) {
    return (
      <section className="rounded-[2rem] bg-[var(--surface-elevated)] px-6 py-14 md:px-10">
        <p className="micro-copy text-[var(--muted)]">Cymbiotika</p>
        <h1 className="text-display mt-5 max-w-3xl text-[var(--text)]">Better energy starts with absorption.</h1>
      </section>
    );
  }

  return (
    <motion.section
      ref={sectionRef}
      className="relative isolate min-h-[92svh] overflow-hidden rounded-[2.4rem] border border-white/48 bg-[rgba(255,255,255,0.22)] text-[var(--text)] shadow-[0_32px_110px_rgba(18,22,21,0.08)] backdrop-blur-[18px]"
    >
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_var(--film-light)_12%,rgba(255,255,255,0.78)_0%,transparent_36%),linear-gradient(120deg,rgba(246,244,238,0.92)_8%,rgba(223,231,232,0.48)_56%,rgba(232,204,176,0.3)_100%)]"
        style={{ ["--film-light" as string]: backgroundShift }}
      />
      <motion.div
        className="pointer-events-none absolute inset-[-8%] opacity-[0.16] mix-blend-soft-light"
        style={reduceMotion ? undefined : { y: grainY }}
      >
        <div className="h-full w-full bg-[radial-gradient(rgba(20,20,20,0.34)_0.5px,transparent_0.5px)] [background-size:3px_3px]" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute left-[8%] top-[9%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.72),transparent_62%)] blur-2xl"
        style={reduceMotion ? undefined : { y: depthY }}
      />
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 16 }).map((_, idx) => (
          <span
            key={`hero-particle-${idx}`}
            className="state-ambient-particle absolute h-1.5 w-1.5 rounded-full bg-white/70 shadow-[0_0_14px_rgba(255,255,255,0.7)]"
            style={{
              left: `${(idx * 11.3) % 100}%`,
              top: `${(idx * 17.7) % 100}%`,
              animationDelay: `${(idx * 0.35).toFixed(2)}s`,
              animationDuration: `${12 + (idx % 4) * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative grid min-h-[92svh] items-center px-6 py-16 md:grid-cols-[0.54fr_0.46fr] md:px-12 md:py-20">
        <div className="relative z-10">
          <motion.p
            className="micro-copy text-[var(--muted)]"
            initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={reduceMotion ? undefined : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            Scroll-Controlled Routine Film
          </motion.p>
          <motion.h1
            className="display-title mt-6 max-w-3xl text-[clamp(3.2rem,8vw,8rem)]"
            style={reduceMotion ? undefined : { opacity: titleOpacity }}
          >
            Energy,
            <br />
            without volatility.
          </motion.h1>
          <motion.p
            className="text-body mt-6 max-w-lg text-base text-[color:color-mix(in_srgb,var(--text)_78%,transparent)] md:text-lg"
            style={reduceMotion ? undefined : { opacity: copyOpacity }}
          >
            Designed as a cinematic rhythm: product, light, grain, and copy move at different depths as you scroll.
          </motion.p>
          <motion.div
            className="mt-9 flex flex-wrap gap-3"
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={reduceMotion ? undefined : { duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <MagneticButton
              onClick={() => router.push("/quiz")}
              className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm uppercase tracking-[0.1em] text-[var(--on-primary)] transition-transform duration-500 [transition-timing-function:var(--easing-premium)] hover:scale-[1.02]"
            >
              Take the Quiz
            </MagneticButton>
            <MagneticButton
              onClick={() => router.push("/products")}
              className="rounded-full border border-[var(--line-strong)] bg-white/52 px-6 py-3 text-sm uppercase tracking-[0.1em] text-[var(--primary)] transition-colors duration-500 hover:border-[var(--primary)] hover:bg-white/82"
            >
              Explore formulas
            </MagneticButton>
          </motion.div>
        </div>

        <div className="pointer-events-none relative hidden h-[720px] md:block">
          <motion.div
            className="absolute left-1/2 top-1/2 h-[620px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.06)_58%,transparent_70%)]"
            style={reduceMotion ? undefined : { y: depthY }}
          />
          {spotlight ? (
            <motion.div
              className="absolute inset-y-16 right-5 w-[440px]"
              style={reduceMotion ? undefined : { rotate: bottleRotate, y: bottleY, scale: bottleScale }}
            >
              <SafeImage
                src={spotlight.featuredImage}
                alt={spotlight.title}
                fill
                className="object-contain drop-shadow-[0_42px_70px_rgba(0,0,0,0.2)]"
                priority
              />
            </motion.div>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}
