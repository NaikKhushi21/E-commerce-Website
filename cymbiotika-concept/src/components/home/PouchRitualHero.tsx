"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MagneticButton } from "@/components/motion/MagneticButton";

const BEAT_DURATION = 2600;
const BEATS = [
  {
    label: "01 — The pouch",
    copy: "A precision-dosed liquid pouch — black-out for stability, single-serve for ritual.",
  },
  {
    label: "02 — The opening",
    copy: "Tear, don't dissolve. Each pouch is one perfect dose, calibrated to the molecule.",
  },
  {
    label: "03 — The drop",
    copy: "A single golden droplet — micron-sized, fat-soluble, ready for absorption.",
  },
  {
    label: "04 — The bloom",
    copy: "Each molecule wraps in a liposome — a delivery shell that survives the gut.",
  },
  {
    label: "05 — The journey",
    copy: "Liposomes ferry the active compound through the bloodstream, intact.",
  },
  {
    label: "06 — The cells",
    copy: "Cells receive the molecule directly. This is bioavailability you can feel.",
  },
] as const;

const HEADLINE = "Science you can feel.";
const SUBHEAD = "A six-beat ritual from pouch to cell. The whole protocol, in one frame.";

export function PouchRitualHero() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setBeat((b) => (b + 1) % BEATS.length);
    }, BEAT_DURATION);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const currentBeat = BEATS[beat];

  // Stable random positions for ambient particles
  const ambientParticles = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, idx) => ({
        x: ((idx * 137.5) % 100),
        y: ((idx * 53.3) % 100),
        delay: (idx * 0.31) % 6,
        duration: 9 + (idx % 5) * 1.6,
        size: 1 + (idx % 3) * 0.4,
      })),
    [],
  );

  return (
    <section
      className="theme-aurora relative isolate min-h-[92svh] overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] shadow-[0_40px_140px_rgba(7,6,8,0.45)]"
      aria-label="The pouch ritual"
    >
      {/* Background atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 78% 22%, rgba(215,195,167,0.16), transparent 58%), radial-gradient(80% 60% at 18% 88%, rgba(140,224,214,0.08), transparent 65%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-soft-light bg-[radial-gradient(rgba(255,255,255,0.6)_0.5px,transparent_0.5px)] [background-size:3px_3px]" />

      {/* Ambient floating dust */}
      <div className="pointer-events-none absolute inset-0">
        {ambientParticles.map((p, idx) => (
          <motion.span
            key={idx}
            className="absolute rounded-full bg-white/45"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              boxShadow: "0 0 6px rgba(255,255,255,0.4)",
            }}
            animate={
              reduceMotion
                ? undefined
                : { y: [-8, 8, -8], opacity: [0.2, 0.7, 0.2] }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: p.duration,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          />
        ))}
      </div>

      <div className="relative grid min-h-[92svh] gap-10 px-6 py-14 md:grid-cols-[0.52fr_0.48fr] md:items-center md:gap-6 md:px-12 md:py-16">
        {/* LEFT — copy */}
        <div className="relative z-10 max-w-xl">
          <motion.p
            className="text-[10px] uppercase tracking-[0.36em] text-white/55"
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Cymbiotika · Liquid Science
          </motion.p>

          <motion.h1
            className="display-title mt-6 text-[clamp(3rem,7.6vw,7.5rem)] leading-[0.94] text-white"
            initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {HEADLINE}
          </motion.h1>

          <motion.p
            className="body-copy mt-6 max-w-md text-base leading-relaxed text-white/65 md:text-lg"
            initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.9, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {SUBHEAD}
          </motion.p>

          {/* Beat narration */}
          <div className="mt-10 max-w-md border-l border-white/15 pl-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={beat}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-[10px] uppercase tracking-[0.32em] text-[#d7c3a7]">{currentBeat.label}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/82 md:text-[15px]">{currentBeat.copy}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Beat progress dots */}
          <div className="mt-8 flex items-center gap-2">
            {BEATS.map((_, idx) => {
              const isActive = idx === beat;
              return (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Jump to beat ${idx + 1}`}
                  onClick={() => setBeat(idx)}
                  className="group relative h-3 px-1"
                >
                  <span
                    className={`block h-px w-9 rounded-full transition-all duration-500 ${
                      isActive ? "bg-[#d7c3a7]" : "bg-white/20 group-hover:bg-white/45"
                    }`}
                    style={isActive ? { boxShadow: "0 0 14px rgba(215,195,167,0.6)" } : undefined}
                  />
                </button>
              );
            })}
            <span className="ml-3 text-[10px] uppercase tracking-[0.28em] text-white/35">
              {String(beat + 1).padStart(2, "0")} / {String(BEATS.length).padStart(2, "0")}
            </span>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <MagneticButton
              onClick={() => router.push("/quiz")}
              className="rounded-full bg-white px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-[var(--on-primary)] transition hover:scale-[1.02]"
            >
              Start your protocol
            </MagneticButton>
            <MagneticButton
              onClick={() => router.push("/products")}
              className="rounded-full border border-white/25 bg-white/[0.04] px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-white transition hover:border-white/55 hover:bg-white/10"
            >
              Explore formulas
            </MagneticButton>
          </div>
        </div>

        {/* RIGHT — the ritual */}
        <div className="relative h-[460px] w-full md:h-[640px] lg:h-[720px]">
          <PouchRitualScene beat={beat} reduceMotion={!!reduceMotion} />
        </div>
      </div>
    </section>
  );
}

// ---------- The 6-beat SVG scene ----------

function PouchRitualScene({ beat, reduceMotion }: { beat: number; reduceMotion: boolean }) {
  return (
    <div className="absolute inset-0">
      {/* Soft halo behind the action */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(215,195,167,0.14) 0%, rgba(215,195,167,0.04) 38%, transparent 68%)",
        }}
      />

      <svg viewBox="0 0 600 800" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="pouch-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1a1620" />
            <stop offset="50%" stopColor="#0a0a0c" />
            <stop offset="100%" stopColor="#16131a" />
          </linearGradient>
          <linearGradient id="pouch-edge" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#2a2128" />
            <stop offset="50%" stopColor="#3d3138" />
            <stop offset="100%" stopColor="#2a2128" />
          </linearGradient>
          <radialGradient id="droplet-fill" cx="50%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#fff1d1" />
            <stop offset="50%" stopColor="#f1c98a" />
            <stop offset="100%" stopColor="#c9925a" />
          </radialGradient>
          <radialGradient id="liposome-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,212,168,0.0)" />
            <stop offset="60%" stopColor="rgba(245,212,168,0.28)" />
            <stop offset="100%" stopColor="rgba(245,212,168,0.55)" />
          </radialGradient>
          <radialGradient id="body-glow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(245,212,168,0.45)" />
            <stop offset="100%" stopColor="rgba(245,212,168,0)" />
          </radialGradient>
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <BeatPouch beat={beat} reduceMotion={reduceMotion} />
        <BeatTear beat={beat} />
        <BeatDroplet beat={beat} />
        <BeatBloom beat={beat} />
        <BeatBody beat={beat} />
        <BeatCells beat={beat} />
      </svg>
    </div>
  );
}

// ---------- Beat 1: floating pouch ----------
function BeatPouch({ beat, reduceMotion }: { beat: number; reduceMotion: boolean }) {
  const visible = beat <= 1;
  return (
    <motion.g
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.95 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: "300px 400px" }}
    >
      <motion.g
        animate={reduceMotion ? undefined : { y: [-8, 8, -8] }}
        transition={reduceMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Pouch shadow */}
        <ellipse cx="300" cy="600" rx="120" ry="14" fill="rgba(0,0,0,0.45)" filter="url(#soft-glow)" />

        {/* Pouch body */}
        <path
          d="M 215 235 Q 215 218 232 218 L 268 218 L 280 200 L 320 200 L 332 218 L 368 218 Q 385 218 385 235 L 385 568 Q 385 588 365 588 L 235 588 Q 215 588 215 568 Z"
          fill="url(#pouch-fill)"
          stroke="url(#pouch-edge)"
          strokeWidth="1.4"
        />
        {/* Inner liquid sheen */}
        <path
          d="M 232 250 Q 232 240 244 240 L 356 240 Q 368 240 368 250 L 368 560 Q 368 572 356 572 L 244 572 Q 232 572 232 560 Z"
          fill="rgba(215,195,167,0.04)"
        />
        {/* Tear notch */}
        <path d="M 280 200 L 290 192 L 300 200 L 310 192 L 320 200" fill="none" stroke="#d7c3a7" strokeWidth="1.2" strokeLinejoin="round" />

        {/* Cymbiotika label */}
        <g transform="translate(300 360)">
          <circle r="22" fill="none" stroke="rgba(215,195,167,0.6)" strokeWidth="0.8" />
          <text textAnchor="middle" y="6" fill="#d7c3a7" fontSize="20" fontFamily="serif" letterSpacing="2">C</text>
        </g>
        <text x="300" y="430" textAnchor="middle" fill="rgba(215,195,167,0.55)" fontSize="9" letterSpacing="4">CYMBIOTIKA</text>
        <text x="300" y="450" textAnchor="middle" fill="rgba(215,195,167,0.32)" fontSize="7" letterSpacing="2.4">LIPOSOMAL · 30ml</text>

        {/* Subtle highlight stripe */}
        <rect x="232" y="240" width="14" height="320" fill="rgba(255,255,255,0.04)" rx="6" />
      </motion.g>
    </motion.g>
  );
}

// ---------- Beat 2: tearing ----------
function BeatTear({ beat }: { beat: number }) {
  const active = beat === 1;
  const past = beat >= 2;
  return (
    <motion.g
      initial={false}
      animate={{ opacity: active ? 1 : past ? 0 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Tear glow */}
      <motion.line
        x1="252"
        y1="218"
        x2="348"
        y2="218"
        stroke="#f1c98a"
        strokeWidth="1.5"
        strokeLinecap="round"
        filter="url(#soft-glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Top piece tilts left */}
      <motion.g
        initial={false}
        animate={active ? { rotate: -16, x: -22, y: -14, opacity: 1 } : { rotate: 0, x: 0, y: 0, opacity: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "270px 218px" }}
      >
        <path d="M 215 235 Q 215 218 232 218 L 268 218 L 280 200 L 300 200 L 300 218 L 215 218 Z" fill="#1a1620" stroke="#3d3138" strokeWidth="1" />
      </motion.g>
      {/* Top piece tilts right */}
      <motion.g
        initial={false}
        animate={active ? { rotate: 18, x: 24, y: -16, opacity: 1 } : { rotate: 0, x: 0, y: 0, opacity: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "330px 218px" }}
      >
        <path d="M 300 200 L 320 200 L 332 218 L 368 218 Q 385 218 385 235 L 385 218 L 300 218 Z" fill="#1a1620" stroke="#3d3138" strokeWidth="1" />
      </motion.g>
      {/* Sparks at the tear */}
      {[
        [292, 210, -1],
        [308, 210, 1],
        [284, 214, -0.6],
        [316, 214, 0.6],
      ].map(([cx, cy, dir], i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r={1.4}
          fill="#fff1d1"
          filter="url(#soft-glow)"
          initial={{ opacity: 0, y: 0 }}
          animate={active ? { opacity: [0, 1, 0], y: [0, -22, -36], x: [0, dir * 6, dir * 12] } : { opacity: 0 }}
          transition={{ duration: 1.4, delay: 0.2 + i * 0.06, ease: "easeOut" }}
        />
      ))}
    </motion.g>
  );
}

// ---------- Beat 3: droplet falling ----------
function BeatDroplet({ beat }: { beat: number }) {
  const active = beat === 2;
  return (
    <motion.g
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.g
        initial={false}
        animate={active ? { y: [0, 240], opacity: [0, 1, 1, 0] } : { y: 0, opacity: 0 }}
        transition={{ duration: 1.9, ease: [0.32, 0, 0.68, 1], times: [0, 0.18, 0.78, 1] }}
      >
        <path
          d="M 300 200 C 290 218 282 232 282 246 C 282 258 290 268 300 268 C 310 268 318 258 318 246 C 318 232 310 218 300 200 Z"
          fill="url(#droplet-fill)"
          filter="url(#soft-glow)"
        />
        {/* Droplet inner highlight */}
        <ellipse cx="294" cy="238" rx="5" ry="9" fill="rgba(255,255,255,0.6)" />
      </motion.g>
      {/* Trail */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.circle
          key={i}
          cx={300}
          cy={200 + i * 10}
          r={1.4 - i * 0.2}
          fill="#f1c98a"
          initial={{ opacity: 0 }}
          animate={active ? { opacity: [0, 0.6, 0], y: [0, 220, 240] } : { opacity: 0 }}
          transition={{ duration: 1.9, delay: i * 0.05, ease: "easeOut" }}
        />
      ))}
    </motion.g>
  );
}

// ---------- Beat 4: molecule bloom (liposome forms) ----------
// Pre-computed at module load — same values on server and client, identical
// string serialization on both sides (no SSR/hydration precision drift).
const BLOOM_MOLECULES = Array.from({ length: 16 }).map((_, i) => {
  const angle = (i / 16) * Math.PI * 2;
  return {
    angle,
    x: Math.round(Math.cos(angle) * 11000) / 100,
    y: Math.round(Math.sin(angle) * 11000) / 100,
  };
});

function BeatBloom({ beat }: { beat: number }) {
  const active = beat === 3;
  const molecules = BLOOM_MOLECULES;
  return (
    <motion.g
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <g transform="translate(300 460)">
        {/* Impact ring */}
        <motion.circle
          r={70}
          fill="none"
          stroke="#f1c98a"
          strokeWidth="1.5"
          filter="url(#soft-glow)"
          initial={{ opacity: 0, scale: 0.2 }}
          animate={active ? { opacity: [0, 0.9, 0], scale: [0.2, 1.4, 1.6] } : { opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Liposome shell */}
        <motion.circle
          r={62}
          fill="url(#liposome-fill)"
          stroke="rgba(245,212,168,0.55)"
          strokeWidth="1.2"
          strokeDasharray="2 4"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={active ? { opacity: [0, 1, 1], scale: [0.4, 1, 1] } : { opacity: 0 }}
          transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Inner active molecule */}
        <motion.circle
          r={14}
          fill="url(#droplet-fill)"
          filter="url(#soft-glow)"
          initial={{ opacity: 0, scale: 0 }}
          animate={active ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />
        {/* Orbiting smaller molecules */}
        {molecules.map((m, i) => (
          <motion.circle
            key={i}
            cx={m.x}
            cy={m.y}
            r={2.2}
            fill="#f5d4a8"
            filter="url(#soft-glow)"
            initial={{ opacity: 0, scale: 0 }}
            animate={
              active
                ? {
                    opacity: [0, 1, 0.7],
                    scale: [0, 1, 1],
                    cx: [0, m.x],
                    cy: [0, m.y],
                  }
                : { opacity: 0 }
            }
            transition={{ duration: 1.2, delay: 0.6 + i * 0.025, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
        {/* Connecting lines (molecular bonds) */}
        {molecules.slice(0, 8).map((m, i) => (
          <motion.line
            key={i}
            x1={0}
            y1={0}
            x2={m.x}
            y2={m.y}
            stroke="rgba(245,212,168,0.28)"
            strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={active ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          />
        ))}
      </g>
    </motion.g>
  );
}

// ---------- Beat 5: body silhouette + journey ----------
function BeatBody({ beat }: { beat: number }) {
  const active = beat === 4;
  const visible = beat >= 4;

  // Streams of molecules traveling toward the body center
  const streams = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        startX: 60 + ((i * 37) % 480),
        startY: 100 + ((i * 53) % 200),
        delay: (i * 0.08) % 1.5,
      })),
    [],
  );

  const fill = "rgba(245,212,168,0.16)";
  const stroke = "rgba(245,212,168,0.55)";
  const sw = 0.9;

  return (
    <motion.g
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Soft body glow */}
      <motion.ellipse
        cx={300}
        cy={480}
        rx={160}
        ry={240}
        fill="url(#body-glow)"
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.0 }}
      />

      {/* Head */}
      <motion.ellipse
        cx={300}
        cy={272}
        rx={26}
        ry={32}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.7, delay: 0, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "300px 272px" }}
      />

      {/* Neck */}
      <motion.path
        d="M 290 300 C 290 312 290 320 286 322 L 314 322 C 310 320 310 312 310 300 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      />

      {/* Torso */}
      <motion.path
        d="M 286 322
           C 274 326 256 336 244 354
           C 250 372 254 388 256 408
           C 258 432 260 454 262 472
           C 262 488 260 500 258 514
           C 256 524 254 534 254 544
           L 346 544
           C 346 534 344 524 342 514
           C 340 500 338 488 338 472
           C 340 454 342 432 344 408
           C 346 388 350 372 356 354
           C 344 336 326 326 314 322 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.9, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "300px 430px" }}
      />

      {/* Right arm */}
      <motion.path
        d="M 356 354
           C 370 358 382 372 390 388
           C 398 410 404 440 406 472
           C 408 510 408 550 406 580
           C 406 594 404 604 398 610
           C 392 614 384 610 380 604
           C 376 594 374 580 374 568
           C 374 550 376 510 376 472
           C 374 442 372 414 366 392
           C 362 384 358 380 354 380
           Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        initial={{ opacity: 0, x: 6 }}
        animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: 6 }}
        transition={{ duration: 0.8, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Left arm */}
      <motion.path
        d="M 244 354
           C 230 358 218 372 210 388
           C 202 410 196 440 194 472
           C 192 510 192 550 194 580
           C 194 594 196 604 202 610
           C 208 614 216 610 220 604
           C 224 594 226 580 226 568
           C 226 550 224 510 224 472
           C 226 442 228 414 234 392
           C 238 384 242 380 246 380
           Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        initial={{ opacity: 0, x: -6 }}
        animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
        transition={{ duration: 0.8, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Right leg */}
      <motion.path
        d="M 300 544
           L 346 544
           C 350 590 354 640 352 690
           L 350 720
           L 312 720
           L 310 690
           C 306 640 304 590 302 544
           Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        initial={{ opacity: 0, y: 10 }}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.8, delay: 0.46, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Left leg */}
      <motion.path
        d="M 300 544
           L 254 544
           C 250 590 246 640 248 690
           L 250 720
           L 288 720
           L 290 690
           C 294 640 296 590 298 544
           Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        initial={{ opacity: 0, y: 10 }}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.8, delay: 0.46, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Streaming molecules entering the body (only beat 4) */}
      {streams.map((s, i) => (
        <motion.circle
          key={i}
          r={2}
          fill="#f5d4a8"
          filter="url(#soft-glow)"
          initial={{ opacity: 0 }}
          animate={
            active
              ? {
                  opacity: [0, 1, 1, 0],
                  cx: [s.startX, 300],
                  cy: [s.startY, 460],
                }
              : { opacity: 0 }
          }
          transition={{ duration: 1.6, delay: 0.8 + s.delay, ease: [0.32, 0, 0.68, 1] }}
        />
      ))}
    </motion.g>
  );
}

// ---------- Beat 6: cells light up ----------
function BeatCells({ beat }: { beat: number }) {
  const active = beat === 5;

  // Cells positioned across the silhouette
  const cells = useMemo(
    () => [
      { x: 300, y: 268, delay: 0.0, size: 3 }, // head crown
      { x: 290, y: 288, delay: 0.05, size: 2 }, // forehead L
      { x: 310, y: 288, delay: 0.05, size: 2 }, // forehead R
      { x: 256, y: 366, delay: 0.14, size: 2.5 }, // shoulder L
      { x: 344, y: 366, delay: 0.16, size: 2.5 }, // shoulder R
      { x: 290, y: 400, delay: 0.20, size: 2.5 }, // chest L
      { x: 310, y: 400, delay: 0.22, size: 2.5 }, // chest R
      { x: 388, y: 446, delay: 0.24, size: 2.2 }, // upper arm R
      { x: 212, y: 446, delay: 0.26, size: 2.2 }, // upper arm L
      { x: 300, y: 442, delay: 0.30, size: 4 }, // heart
      { x: 280, y: 478, delay: 0.34, size: 2.3 }, // ribs L
      { x: 320, y: 478, delay: 0.36, size: 2.3 }, // ribs R
      { x: 392, y: 568, delay: 0.32, size: 2 }, // forearm R
      { x: 208, y: 568, delay: 0.34, size: 2 }, // forearm L
      { x: 290, y: 506, delay: 0.42, size: 2.6 }, // gut L
      { x: 310, y: 506, delay: 0.44, size: 2.6 }, // gut R
      { x: 300, y: 538, delay: 0.50, size: 2.4 }, // pelvis
      { x: 282, y: 600, delay: 0.55, size: 2.4 }, // thigh L
      { x: 318, y: 600, delay: 0.58, size: 2.4 }, // thigh R
      { x: 280, y: 670, delay: 0.65, size: 2 }, // shin L
      { x: 320, y: 670, delay: 0.67, size: 2 }, // shin R
    ],
    [],
  );

  return (
    <motion.g
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {cells.map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y})`}>
          <motion.circle
            r={c.size}
            fill="#fff1d1"
            filter="url(#soft-glow)"
            initial={{ opacity: 0, scale: 0 }}
            animate={
              active
                ? {
                    opacity: [0, 1, 0.85, 1, 0.7],
                    scale: [0, 1.4, 1, 1.2, 1],
                  }
                : { opacity: 0, scale: 0 }
            }
            transition={{ duration: 1.4, delay: c.delay, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.circle
            r={c.size * 3}
            fill="none"
            stroke="rgba(255,241,209,0.4)"
            strokeWidth="0.6"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={
              active
                ? { opacity: [0, 0.5, 0], scale: [0.4, 2, 2.4] }
                : { opacity: 0, scale: 0.4 }
            }
            transition={{ duration: 1.6, delay: c.delay + 0.1, ease: "easeOut" }}
          />
        </g>
      ))}
    </motion.g>
  );
}
