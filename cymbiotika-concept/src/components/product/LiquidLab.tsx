"use client";

import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import type { Product } from "@/data/products";
import { useCart } from "@/components/cart/CartProvider";

const STAGES = [
  {
    eyebrow: "01 — The pouch",
    title: "Inside the formula.",
    body: "Scroll past the label, into the liquid where the active molecule waits.",
  },
  {
    eyebrow: "02 — Through the seal",
    title: "Past the foil.",
    body: "Opaque film protects the molecule from light, oxygen and time. Now we open it.",
  },
  {
    eyebrow: "03 — The molecule",
    title: "A single active particle.",
    body: "Unprotected, this molecule would degrade in the stomach long before reaching a cell.",
  },
  {
    eyebrow: "04 — The liposome",
    title: "Wrapped in a phospholipid shell.",
    body: "A bilayer mirroring your own cell membranes — fat-soluble, acid-resistant, body-recognised.",
  },
  {
    eyebrow: "05 — The journey",
    title: "Through the bloodstream.",
    body: "Liposomes ferry the molecule through circulation, undegraded, to where it can be used.",
  },
  {
    eyebrow: "06 — The cell",
    title: "Direct fusion. Direct delivery.",
    body: "The shell merges with the cell membrane and releases its cargo inside the cell itself.",
  },
] as const;

const STAGE_RANGES: Array<[number, number]> = [
  [0.0, 0.16],
  [0.16, 0.32],
  [0.32, 0.5],
  [0.5, 0.66],
  [0.66, 0.84],
  [0.84, 1.0],
];

function useStageOpacity(progress: MotionValue<number>, range: [number, number]) {
  // Hard cut between stages — opacity is strictly 1 inside the range and 0
  // outside, no fade window. Crossfading was making each stage linger 60–90vh
  // past its end while the next stage was already showing. Visual continuity
  // at boundaries comes from each stage's leading element matching the
  // previous stage's terminal element in size + position at the cut frame.
  return useTransform(progress, (v) => (v >= range[0] && v < range[1] ? 1 : 0));
}

function useLocalProgress(progress: MotionValue<number>, range: [number, number]) {
  return useTransform(progress, [range[0], range[1]], [0, 1]);
}

/**
 * Long-scroll liposomal absorption story. Originally used on the product
 * detail page but the content is generic — it explains the delivery system,
 * not a specific formula — so it now anchors the Science page. The optional
 * `product` prop preserves the original per-product framing if a caller
 * passes one in.
 */
export function LiquidLab({ product }: { product?: Product }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  if (reduceMotion) {
    return <LiquidLabReducedMotion product={product} />;
  }

  return (
    <section
      ref={containerRef}
      className="theme-aurora relative h-[1400vh]"
      aria-label="Liquid Lab — inside the formula"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
        {/* atmospheric base */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 50%, rgba(215,195,167,0.08), transparent 60%), radial-gradient(80% 60% at 18% 88%, rgba(140,224,214,0.06), transparent 65%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.18] bg-[radial-gradient(rgba(255,255,255,0.6)_0.5px,transparent_0.5px)] [background-size:3px_3px]" />

        {/* Stage visuals (stacked, cross-faded) */}
        <Stage1Pouch progress={scrollYProgress} />
        <Stage2Tear progress={scrollYProgress} />
        <Stage3Molecule progress={scrollYProgress} />
        <Stage4Liposome progress={scrollYProgress} />
        <Stage5Bloodstream progress={scrollYProgress} />
        <Stage6Cell progress={scrollYProgress} product={product} />

        {/* Copy overlay (left side, beat-paced) */}
        <CopyOverlay progress={scrollYProgress} productTitle={product?.title ?? "Liposomal Delivery"} />

        {/* Progress indicator (right side) */}
        <ProgressIndicator progress={scrollYProgress} />
      </div>
    </section>
  );
}

// ---------- Copy overlay ----------

function CopyOverlay({ progress, productTitle }: { progress: MotionValue<number>; productTitle: string }) {
  const [stageIdx, setStageIdx] = useState(0);

  useMotionValueEvent(progress, "change", (latest) => {
    const ranges = STAGE_RANGES;
    let idx = 0;
    for (let i = 0; i < ranges.length; i += 1) {
      if (latest >= ranges[i][0]) idx = i;
    }
    setStageIdx(idx);
  });

  const stage = STAGES[stageIdx];

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 z-30 flex w-full flex-col justify-start px-6 pt-16 md:left-12 md:max-w-md md:justify-center md:px-0 md:pt-0">
      <p className="text-eyebrow tracking-[0.1em] text-white/78">{productTitle}</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={stageIdx}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5"
        >
          <p className="text-eyebrow tracking-[0.1em] text-[#d7c3a7]">{stage.eyebrow}</p>
          <h2 className="text-display mt-3 leading-[0.96] text-white">{stage.title}</h2>
          <p className="mt-5 max-w-sm text-body leading-relaxed text-white/65 md:text-body">{stage.body}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------- Progress indicator ----------

function ProgressIndicator({ progress }: { progress: MotionValue<number> }) {
  const fillHeight = useTransform(progress, [0, 1], ["0%", "100%"]);
  return (
    <div className="pointer-events-none absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 md:flex md:flex-col md:items-end md:gap-3">
      <p className="text-eyebrow tracking-[0.1em] text-white/78">Liquid Lab</p>
      <div className="relative h-48 w-px overflow-hidden bg-white/15">
        <motion.div
          className="absolute left-0 top-0 w-px bg-[#d7c3a7]"
          style={{ height: fillHeight, boxShadow: "0 0 14px rgba(215,195,167,0.6)" }}
        />
      </div>
    </div>
  );
}

// ---------- Stage 1 — Pouch exterior ----------

function Stage1Pouch({ progress }: { progress: MotionValue<number> }) {
  const opacity = useStageOpacity(progress, STAGE_RANGES[0]);
  // "Coming toward the user" — pouch starts smaller and slightly below
  // center as if approaching from depth, then scales up to 1.7 at the end of
  // Stage 1 (which Stage 2 picks up at the same scale for the seal-tear zoom).
  const scale = useTransform(progress, [0, 0.16], [0.7, 1.7]);
  const y = useTransform(progress, [0, 0.16], [40, -10]);

  return (
    <motion.div
      style={{ opacity, scale, y }}
      className="absolute inset-0 z-10 flex items-center justify-center md:translate-x-[10vw]"
    >
      <svg viewBox="0 0 600 800" className="h-[80vh] max-h-[700px] w-auto" aria-hidden="true">
        <defs>
          <linearGradient id="ll-pouch-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e26b2e" />
            <stop offset="50%" stopColor="#e26b2e" />
            <stop offset="100%" stopColor="#e26b2e" />
          </linearGradient>
        </defs>
        {/* Shadow */}
        <ellipse cx="300" cy="610" rx="130" ry="14" fill="rgba(0,0,0,0.6)" />
        {/* Pouch body */}
        <path
          d="M 215 235 Q 215 218 232 218 L 268 218 L 280 200 L 320 200 L 332 218 L 368 218 Q 385 218 385 235 L 385 568 Q 385 588 365 588 L 235 588 Q 215 588 215 568 Z"
          fill="url(#ll-pouch-fill)"
          stroke="#000000"
          strokeWidth="2.5"
        />
        {/* Inner liquid sheen — lighter inset panel inside the pouch frame */}
        <path
          d="M 232 250 Q 232 240 244 240 L 356 240 Q 368 240 368 250 L 368 560 Q 368 572 356 572 L 244 572 Q 232 572 232 560 Z"
          fill="rgba(255,255,255,0.10)"
        />
        {/* Tear notch */}
        <path
          d="M 280 200 L 290 192 L 300 200 L 310 192 L 320 200"
          fill="none"
          stroke="#d7c3a7"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Logo C */}
        <g transform="translate(300 360)">
          <circle r="22" fill="none" stroke="#ffffff" strokeWidth="1.4" />
          <text textAnchor="middle" y="7" fill="#ffffff" fontSize="22" fontFamily="serif" fontWeight={700} letterSpacing="2">C</text>
        </g>
        <text x="300" y="432" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight={700} letterSpacing="4">
          CYMBIOTIKA
        </text>
        <text x="300" y="454" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight={600} letterSpacing="2.6">
          LIPOSOMAL · 30ml
        </text>
        <rect x="232" y="240" width="14" height="320" fill="rgba(255,255,255,0.10)" rx="6" />
      </svg>
    </motion.div>
  );
}

// ---------- Stage 2 — Tearing through the seal ----------

function Stage2Tear({ progress }: { progress: MotionValue<number> }) {
  const opacity = useStageOpacity(progress, STAGE_RANGES[1]);
  const local = useLocalProgress(progress, STAGE_RANGES[1]);
  const scale = useTransform(local, [0, 1], [1.7, 6]);
  const tearLength = useTransform(local, [0.1, 0.7], [0, 1]);
  const lightOpacity = useTransform(local, [0.4, 1], [0, 1]);
  // The pouch body and ALL its branding (C logo, CYMBIOTIKA text, dose label,
  // highlight stripe) fade together. They live as long as the pouch itself.
  const pouchOpacity = useTransform(local, [0, 0.6], [1, 0.18]);

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 z-10 flex items-center justify-center md:translate-x-[10vw]"
    >
      <motion.svg
        viewBox="0 0 600 800"
        className="h-[80vh] max-h-[700px] w-auto"
        aria-hidden="true"
        style={{ scale }}
      >
        <defs>
          <linearGradient id="ll-tear-pouch-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e26b2e" />
            <stop offset="50%" stopColor="#e26b2e" />
            <stop offset="100%" stopColor="#e26b2e" />
          </linearGradient>
          <radialGradient id="ll-light-burst" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(255,241,209,1)" />
            <stop offset="60%" stopColor="rgba(245,201,138,0.3)" />
            <stop offset="100%" stopColor="rgba(245,201,138,0)" />
          </radialGradient>
        </defs>

        {/* Pouch body + branding — single group fading together */}
        <motion.g style={{ opacity: pouchOpacity }}>
          <path
            d="M 215 235 Q 215 218 232 218 L 268 218 L 280 200 L 320 200 L 332 218 L 368 218 Q 385 218 385 235 L 385 568 Q 385 588 365 588 L 235 588 Q 215 588 215 568 Z"
            fill="url(#ll-tear-pouch-fill)"
            stroke="#000000"
            strokeWidth="2.5"
          />
          {/* Inner liquid sheen — lighter inset panel inside the pouch frame */}
          <path
            d="M 232 250 Q 232 240 244 240 L 356 240 Q 368 240 368 250 L 368 560 Q 368 572 356 572 L 244 572 Q 232 572 232 560 Z"
            fill="rgba(255,255,255,0.10)"
          />
          {/* C logo */}
          <g transform="translate(300 360)">
            <circle r="22" fill="none" stroke="#ffffff" strokeWidth="1.4" />
            <text textAnchor="middle" y="7" fill="#ffffff" fontSize="22" fontFamily="serif" fontWeight={700} letterSpacing="2">C</text>
          </g>
          <text x="300" y="432" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight={700} letterSpacing="4">
            CYMBIOTIKA
          </text>
          <text x="300" y="454" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight={600} letterSpacing="2.6">
            LIPOSOMAL · 30ml
          </text>
          {/* Inner highlight stripe */}
          <rect x="232" y="240" width="14" height="320" fill="rgba(255,255,255,0.10)" rx="6" />
        </motion.g>

        {/* Light burst */}
        <motion.circle
          cx="300"
          cy="220"
          r="180"
          fill="url(#ll-light-burst)"
          style={{ opacity: lightOpacity }}
        />
        {/* The tear line */}
        <motion.path
          d="M 240 220 Q 270 210 300 218 Q 330 226 360 220"
          fill="none"
          stroke="#fff1d1"
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            pathLength: tearLength,
            filter: "drop-shadow(0 0 8px rgba(255,241,209,0.9))",
          }}
        />
        {/* Sparks falling from tear */}
        {SPARKS.map((s, i) => (
          <Spark key={i} cx={s[0]} cy={s[1]} index={i} local={local} />
        ))}
      </motion.svg>
    </motion.div>
  );
}

const SPARKS: Array<[number, number]> = [
  [260, 220],
  [288, 222],
  [316, 224],
  [340, 222],
];

function Spark({
  cx,
  cy,
  index,
  local,
}: {
  cx: number;
  cy: number;
  index: number;
  local: MotionValue<number>;
}) {
  const opacity = useTransform(local, [0.5 + index * 0.05, 0.7, 1], [0, 1, 0]);
  const translateY = useTransform(local, [0.5 + index * 0.05, 1], [0, 80]);
  return (
    <motion.circle cx={cx} cy={cy} r="1.6" fill="#fff1d1" style={{ opacity, translateY }} />
  );
}

// ---------- Stage 3 — The molecule ----------

function Stage3Molecule({ progress }: { progress: MotionValue<number> }) {
  const opacity = useStageOpacity(progress, STAGE_RANGES[2]);
  const local = useLocalProgress(progress, STAGE_RANGES[2]);
  const moleculeScale = useTransform(local, [0, 0.5, 1], [0.5, 1.2, 1.4]);
  const ringRotate = useTransform(local, [0, 1], [0, 90]);

  // Atom positions for a stylized molecular structure
  const atoms = [
    { x: 0, y: 0, r: 18, color: "#fff1d1" }, // central
    { x: 70, y: -40, r: 9, color: "#f5d4a8" },
    { x: 70, y: 40, r: 9, color: "#f5d4a8" },
    { x: -70, y: -40, r: 9, color: "#f5d4a8" },
    { x: -70, y: 40, r: 9, color: "#f5d4a8" },
    { x: 0, y: -85, r: 7, color: "#c8b8ff" },
    { x: 0, y: 85, r: 7, color: "#c8b8ff" },
  ];

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 z-10 flex items-center justify-center md:translate-x-[10vw]"
    >
      {/* Warm liquid background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(245,201,138,0.18) 0%, rgba(245,201,138,0.06) 30%, transparent 60%)",
        }}
      />
      {/* Floating liquid particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-[#f5d4a8]/50"
          style={{
            left: `${(i * 31.7) % 100}%`,
            top: `${(i * 53.3) % 100}%`,
            boxShadow: "0 0 6px rgba(245,212,168,0.5)",
          }}
          animate={{
            y: [-12, 12, -12],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 6 + (i % 4),
            delay: (i * 0.18) % 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.svg
        viewBox="-200 -200 400 400"
        className="relative h-[60vh] w-auto"
        aria-hidden="true"
        style={{ scale: moleculeScale, rotate: ringRotate }}
      >
        <defs>
          <radialGradient id="ll-atom-core" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#fff1d1" />
            <stop offset="100%" stopColor="#e8b886" />
          </radialGradient>
          <filter id="ll-atom-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Bonds */}
        {atoms.slice(1).map((a, i) => (
          <line
            key={i}
            x1={0}
            y1={0}
            x2={a.x}
            y2={a.y}
            stroke="rgba(245,212,168,0.3)"
            strokeWidth="1"
          />
        ))}
        {/* Atoms */}
        {atoms.map((a, i) => (
          <circle
            key={i}
            cx={a.x}
            cy={a.y}
            r={a.r}
            fill={i === 0 ? "url(#ll-atom-core)" : a.color}
            filter="url(#ll-atom-glow)"
            opacity={i === 0 ? 1 : 0.85}
          />
        ))}
        {/* Outer halo */}
        <circle r="160" fill="none" stroke="rgba(215,195,167,0.18)" strokeWidth="0.8" strokeDasharray="2 5" />
      </motion.svg>
    </motion.div>
  );
}

// ---------- Stage 4 — Liposome formation ----------

function Stage4Liposome({ progress }: { progress: MotionValue<number> }) {
  const opacity = useStageOpacity(progress, STAGE_RANGES[3]);
  const local = useLocalProgress(progress, STAGE_RANGES[3]);
  const shellRadius = useTransform(local, [0, 0.7], [180, 90]);
  const shellOpacity = useTransform(local, [0.1, 0.7], [0, 0.85]);
  const moleculeScale = useTransform(local, [0, 1], [1, 0.6]);

  // Phospholipids — heads (circles) + tails (lines)
  const phospholipids = Array.from({ length: 28 }).map((_, i) => {
    const angle = (i / 28) * Math.PI * 2;
    return { angle };
  });

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 z-10 flex items-center justify-center md:translate-x-[10vw]"
    >
      <svg viewBox="-200 -200 400 400" className="h-[70vh] w-auto" aria-hidden="true">
        <defs>
          <radialGradient id="ll-liposome-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,212,168,0)" />
            <stop offset="55%" stopColor="rgba(245,212,168,0.08)" />
            <stop offset="100%" stopColor="rgba(245,212,168,0.22)" />
          </radialGradient>
          <radialGradient id="ll-active-mol" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#fff1d1" />
            <stop offset="100%" stopColor="#e8b886" />
          </radialGradient>
        </defs>

        {/* Outer shell */}
        <motion.circle
          r={shellRadius}
          fill="url(#ll-liposome-fill)"
          stroke="rgba(245,212,168,0.6)"
          strokeWidth="1"
          strokeDasharray="3 4"
          style={{ opacity: shellOpacity }}
        />
        {/* Inner shell */}
        <motion.circle
          r={useTransform(local, [0, 0.7], [120, 60])}
          fill="none"
          stroke="rgba(245,212,168,0.4)"
          strokeWidth="0.8"
          strokeDasharray="2 4"
          style={{ opacity: shellOpacity }}
        />

        {/* Phospholipid molecules — heads and tails arranging into bilayer */}
        {phospholipids.map((p, i) => (
          <Phospholipid key={i} angle={p.angle} index={i} local={local} />
        ))}

        {/* Active molecule shrinking inside */}
        <motion.g style={{ scale: moleculeScale }}>
          <circle r="22" fill="url(#ll-active-mol)" filter="url(#ll-atom-glow)" />
          <circle r="22" fill="none" stroke="rgba(255,241,209,0.3)" strokeWidth="0.5" />
        </motion.g>
      </svg>
    </motion.div>
  );
}

// Round to 2 decimals for stable SSR <-> client serialization
function r2(v: number): number {
  return Math.round(v * 100) / 100;
}

function Phospholipid({
  angle,
  index,
  local,
}: {
  angle: number;
  index: number;
  local: MotionValue<number>;
}) {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const startRadius = 180 + (index % 5) * 16;
  const targetX = r2(cosA * 90);
  const targetY = r2(sinA * 90);
  const startX = r2(cosA * startRadius);
  const startY = r2(sinA * startRadius);

  const x = useTransform(local, [0, 0.7], [startX, targetX]);
  const y = useTransform(local, [0, 0.7], [startY, targetY]);
  const opacity = useTransform(local, [0, 0.2, 0.7], [0, 1, 1]);

  const tailDx = r2(cosA * 14);
  const tailDy = r2(sinA * 14);
  const tailDxShort = r2(tailDx * 0.7);
  const tailDyShort = r2(tailDy * 0.7);

  return (
    <motion.g style={{ x, y, opacity }}>
      <line x1={0} y1={0} x2={tailDxShort} y2={tailDyShort} stroke="rgba(215,195,167,0.5)" strokeWidth="0.8" />
      <line x1={0} y1={0} x2={tailDx} y2={tailDy} stroke="rgba(215,195,167,0.5)" strokeWidth="0.8" />
      <circle r="3" fill="#f5d4a8" filter="url(#ll-atom-glow)" />
    </motion.g>
  );
}

// ---------- Stage 5 — Bloodstream ----------

const BLOODSTREAM_LIPOSOMES = Array.from({ length: 7 }).map((_, i) => ({
  yOffset: (i % 3) * 20 - 20,
  delay: i * 0.12,
  size: 14 + (i % 3) * 4,
}));

const BLOODSTREAM_RBCS = Array.from({ length: 9 }).map((_, i) => ({
  x: -350 + i * 90,
  y: (i % 3) * 22 - 22 + ((i * 17) % 30) - 15,
}));

function Stage5Bloodstream({ progress }: { progress: MotionValue<number> }) {
  const opacity = useStageOpacity(progress, STAGE_RANGES[4]);
  const local = useLocalProgress(progress, STAGE_RANGES[4]);

  // Vessel + ambient elements fade in over the first third of the stage so
  // they appear AROUND the lead liposome rather than replacing Stage 4's
  // composition outright.
  const vesselOpacity = useTransform(local, [0, 0.3], [0, 1]);
  const arrowOpacity = useTransform(local, [0.45, 0.7], [0, 1]);
  const labelOpacity = useTransform(local, [0.15, 0.4], [0, 1]);

  // Lead liposome — direct continuation of Stage 4's center-formed shell.
  // At local=0 it matches Stage 4's end exactly (outer 90, inner 60, core 13).
  // Stays planted at center while Stage 4 finishes fading out (local 0→0.2),
  // shrinking in place to a regular liposome size, then carries forward
  // through the vessel to x=+440 over the remaining travel.
  const leadX = useTransform(local, [0.2, 1], [0, 440]);
  const leadOuterR = useTransform(local, [0, 0.25], [90, 26]);
  const leadInnerR = useTransform(local, [0, 0.25], [60, 18]);
  const leadDashR = useTransform(local, [0, 0.25], [60, 18]);
  const leadCoreR = useTransform(local, [0, 0.25], [13, 7]);

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 z-10 flex items-center justify-center md:translate-x-[10vw]"
    >
      <svg viewBox="-400 -200 800 400" className="h-[36vh] max-h-[320px] w-auto max-w-[min(44vw,640px)]" aria-hidden="true">
        <defs>
          <linearGradient id="ll-bs-vessel-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(180,40,55,0)" />
            <stop offset="50%" stopColor="rgba(180,40,55,0.22)" />
            <stop offset="100%" stopColor="rgba(180,40,55,0)" />
          </linearGradient>
          <radialGradient id="ll-bs-rbc" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(220,80,90,0.55)" />
            <stop offset="100%" stopColor="rgba(160,40,55,0.85)" />
          </radialGradient>
          <radialGradient id="ll-bs-lipo" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
            <stop offset="40%" stopColor="rgba(255,241,209,0.95)" />
            <stop offset="100%" stopColor="rgba(245,184,95,0.85)" />
          </radialGradient>
          <filter id="ll-bs-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Vessel walls fade in around the lead liposome */}
        <motion.g style={{ opacity: vesselOpacity }}>
          <path
            d="M -400 -120 Q -200 -135 0 -120 Q 200 -105 400 -120"
            fill="none"
            stroke="rgba(245,212,168,0.6)"
            strokeWidth="2"
          />
          <path
            d="M -400 120 Q -200 105 0 120 Q 200 135 400 120"
            fill="none"
            stroke="rgba(245,212,168,0.6)"
            strokeWidth="2"
          />
          <path
            d="M -400 -120 Q -200 -135 0 -120 Q 200 -105 400 -120 L 400 120 Q 200 135 0 120 Q -200 105 -400 120 Z"
            fill="url(#ll-bs-vessel-fill)"
          />
        </motion.g>

        {/* Red blood cells fade in with the vessel */}
        <motion.g style={{ opacity: vesselOpacity }}>
          {BLOODSTREAM_RBCS.map((rbc, i) => (
            <Rbc key={i} {...rbc} local={local} />
          ))}
        </motion.g>

        {/* Follow-on liposomes — enter from far-left, delayed so the lead
            liposome is the first thing the eye registers */}
        <motion.g style={{ opacity: vesselOpacity }}>
          {BLOODSTREAM_LIPOSOMES.map((l, i) => (
            <Liposome key={i} {...l} local={local} />
          ))}
        </motion.g>

        {/* Lead liposome — direct continuation of Stage 4's formed shell.
            At local=0 it matches Stage 4's end size (outer 90 / inner 60 /
            core 13). Over local 0→0.25 it shrinks to a regular traveling
            liposome and rides forward through the vessel. */}
        <motion.g style={{ x: leadX }}>
          <motion.circle r={leadOuterR} fill="rgba(255,241,209,0.18)" filter="url(#ll-bs-glow)" />
          <motion.circle r={leadInnerR} fill="url(#ll-bs-lipo)" filter="url(#ll-bs-glow)" />
          <motion.circle
            r={leadDashR}
            fill="none"
            stroke="rgba(255,241,209,0.95)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <motion.circle r={leadCoreR} fill="#ffffff" opacity="0.95" />
        </motion.g>

        {/* Flow direction arrow */}
        <motion.g style={{ opacity: arrowOpacity }}>
          <line
            x1={340}
            y1={0}
            x2={386}
            y2={0}
            stroke="rgba(245,212,168,0.8)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 380 -6 L 388 0 L 380 6"
            stroke="rgba(245,212,168,0.8)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>

        {/* "Bloodstream" anchor label */}
        <motion.text
          x={-380}
          y={-150}
          fill="rgba(245,212,168,0.55)"
          fontSize="11"
          letterSpacing="3"
          style={{ opacity: labelOpacity }}
        >
          BLOODSTREAM
        </motion.text>
      </svg>
    </motion.div>
  );
}

function Rbc({
  x,
  y,
  local,
}: {
  x: number;
  y: number;
  local: MotionValue<number>;
}) {
  const cx = useTransform(local, [0, 1], [x - 80, x + 240]);
  return (
    <motion.g style={{ x: cx, y }}>
      <ellipse cx={0} cy={0} rx={14} ry={10} fill="url(#ll-bs-rbc)" opacity="0.85" />
      <ellipse cx={0} cy={0} rx={6} ry={4} fill="rgba(120,30,40,0.4)" />
    </motion.g>
  );
}

function Liposome({
  yOffset,
  delay,
  size,
  local,
}: {
  yOffset: number;
  delay: number;
  size: number;
  local: MotionValue<number>;
}) {
  const x = useTransform(local, [0, 1], [-440 - delay * 80, 440]);
  return (
    <motion.g style={{ x, y: yOffset }}>
      {/* Outer halo */}
      <circle r={size + 8} fill="rgba(255,241,209,0.16)" filter="url(#ll-bs-glow)" />
      {/* Bilayer fill */}
      <circle r={size} fill="url(#ll-bs-lipo)" filter="url(#ll-bs-glow)" />
      {/* Dashed bilayer outline */}
      <circle
        r={size}
        fill="none"
        stroke="rgba(255,241,209,0.9)"
        strokeWidth="0.8"
        strokeDasharray="2 3"
      />
      {/* Active molecule core */}
      <circle r={size * 0.38} fill="#ffffff" opacity="0.95" />
    </motion.g>
  );
}

// ---------- Stage 6 — Cell uptake + stats ----------

function Stage6Cell({ progress, product }: { progress: MotionValue<number>; product?: Product }) {
  // Final stage stays visible after its range ends so the cell + stats card
  // don't vanish when the user scrolls to the absolute end of the section.
  const opacity = useTransform(progress, (v) => (v >= STAGE_RANGES[5][0] ? 1 : 0));
  const local = useLocalProgress(progress, STAGE_RANGES[5]);
  const { addItem, openCart } = useCart();
  const liposomeX = useTransform(local, [0, 0.45], [-280, -80]);
  const liposomeOpacity = useTransform(local, [0.4, 0.55], [1, 0]);
  const cellGlow = useTransform(local, [0.5, 0.85], [0, 1]);
  const moleculeReleaseOpacity = useTransform(local, [0.5, 0.7], [0, 1]);
  const statsOpacity = useTransform(local, [0.65, 0.9], [0, 1]);

  const moleculeAtoms = [
    { x: 0, y: 0, r: 5 },
    { x: 12, y: -6, r: 3 },
    { x: -12, y: -6, r: 3 },
    { x: 0, y: 12, r: 3 },
  ];

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 z-10 flex items-center justify-center md:translate-x-[10vw]"
    >
      <svg viewBox="-300 -260 600 520" className="h-[54vh] max-h-[480px] w-auto max-w-[min(40vw,480px)]" aria-hidden="true">
        <defs>
          <radialGradient id="ll-cell-fill" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(140,224,214,0.10)" />
            <stop offset="60%" stopColor="rgba(140,224,214,0.04)" />
            <stop offset="100%" stopColor="rgba(140,224,214,0)" />
          </radialGradient>
          <radialGradient id="ll-cell-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,212,168,0.6)" />
            <stop offset="100%" stopColor="rgba(245,212,168,0)" />
          </radialGradient>
        </defs>

        {/* Cell glow halo */}
        <motion.circle r="220" fill="url(#ll-cell-glow)" style={{ opacity: cellGlow }} />

        {/* Cell membrane */}
        <circle r="160" fill="url(#ll-cell-fill)" stroke="rgba(140,224,214,0.5)" strokeWidth="1.2" strokeDasharray="3 5" />
        <circle r="158" fill="none" stroke="rgba(140,224,214,0.2)" strokeWidth="0.6" />

        {/* Nucleus */}
        <circle cx="20" cy="-10" r="36" fill="rgba(140,224,214,0.08)" stroke="rgba(140,224,214,0.4)" strokeWidth="0.8" />
        <circle cx="20" cy="-10" r="6" fill="rgba(140,224,214,0.5)" />

        {/* Approaching liposome */}
        <motion.g style={{ x: liposomeX, opacity: liposomeOpacity }}>
          <circle r="20" fill="url(#ll-lipo)" filter="url(#ll-atom-glow)" />
          <circle r="20" fill="none" stroke="rgba(245,212,168,0.7)" strokeWidth="0.6" strokeDasharray="2 3" />
          <circle r="6" fill="#fff1d1" />
        </motion.g>

        {/* Released molecule (appears post-fusion, drifts inside cell) */}
        <motion.g style={{ opacity: moleculeReleaseOpacity, x: useTransform(local, [0.5, 1], [-60, 30]) }}>
          {moleculeAtoms.map((a, i) => (
            <circle key={i} cx={a.x} cy={a.y} r={a.r} fill="#fff1d1" filter="url(#ll-atom-glow)" />
          ))}
          {moleculeAtoms.slice(1).map((a, i) => (
            <line key={i} x1={0} y1={0} x2={a.x} y2={a.y} stroke="rgba(255,241,209,0.4)" strokeWidth="0.6" />
          ))}
        </motion.g>

        {/* Cell label */}
        <text x={0} y={-180} textAnchor="middle" fill="rgba(140,224,214,0.7)" fontSize="9" letterSpacing="3">
          TARGET CELL
        </text>
      </svg>

      {/* Stats overlay — counter-translates the parent's right shift so it stays
          anchored to the viewport's actual right edge, not past it. */}
      <motion.div
        className="pointer-events-auto absolute bottom-12 right-6 z-30 max-w-xs rounded-[1.6rem] border border-white/12 bg-white/[0.04] p-6 md:bottom-16 md:right-12 md:-translate-x-[10vw]"
        style={{ opacity: statsOpacity }}
      >
        <p className="text-eyebrow tracking-[0.1em] text-[#d7c3a7]">Bioavailability</p>
        <p className="mt-3 font-display text-5xl text-white">8×</p>
        <p className="mt-2 text-small leading-relaxed text-white/78">
          Estimated absorption uplift vs. uncoated equivalent — measured by serum concentration over time.
        </p>
        {product ? (
          <button
            type="button"
            onClick={() => {
              addItem(product);
              openCart();
            }}
            className="mt-5 inline-flex items-center gap-2 text-eyebrow tracking-[0.1em] text-white transition hover:gap-3"
          >
            Add to routine
            <span aria-hidden>→</span>
          </button>
        ) : (
          <a
            href="/products"
            className="mt-5 inline-flex items-center gap-2 text-eyebrow tracking-[0.1em] text-white transition hover:gap-3"
          >
            Explore formulas
            <span aria-hidden>→</span>
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}

// ---------- Reduced-motion fallback ----------

function LiquidLabReducedMotion({ product }: { product?: Product }) {
  return (
    <section className="theme-aurora relative overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[var(--bg)] p-10 text-[var(--text)] md:p-14">
      <p className="text-eyebrow tracking-[0.1em] text-white/78">{product?.title ?? "Liposomal Delivery"}</p>
      <h2 className="text-display mt-4 text-white">Inside the formula.</h2>
      <p className="mt-5 max-w-md text-body leading-relaxed text-white/65 md:text-body">
        Pouch → seal → molecule → liposome → bloodstream → cell. The full delivery journey, summarised.
      </p>
      <ul className="mt-10 grid gap-4 md:grid-cols-2">
        {STAGES.map((s) => (
          <li key={s.eyebrow} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-eyebrow tracking-[0.1em] text-[#d7c3a7]">{s.eyebrow}</p>
            <p className="mt-2 font-display text-xl text-white">{s.title}</p>
            <p className="mt-2 text-small text-white/78">{s.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
