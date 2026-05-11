"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Product } from "@/data/products";
import type { WellnessGoal } from "@/data/goals";
import { getRecommendedProtocolFromCatalog } from "@/lib/recommendations";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/cn";

type Zone = {
  id: string;
  label: string;
  description: string;
  goals: WellnessGoal[];
  x: number; // viewBox 600 x 800
  y: number;
  color: string;
  side: "left" | "right";
};

const ZONES: Zone[] = [
  {
    id: "mind",
    label: "Mind",
    description: "Focus, mental clarity, calm.",
    goals: ["brain-health", "stress"],
    x: 300,
    y: 252,
    color: "#c8b8ff",
    side: "right",
  },
  {
    id: "sleep",
    label: "Sleep",
    description: "Deeper rest, smoother recovery.",
    goals: ["sleep"],
    x: 318,
    y: 290,
    color: "#9ec9ff",
    side: "right",
  },
  {
    id: "immunity",
    label: "Immunity",
    description: "Resilience to seasonal load.",
    goals: ["immunity"],
    x: 300,
    y: 332,
    color: "#fbd5b5",
    side: "left",
  },
  {
    id: "energy",
    label: "Energy",
    description: "Steady vitality, no crash.",
    goals: ["energy"],
    x: 300,
    y: 425,
    color: "#fba973",
    side: "right",
  },
  {
    id: "detox",
    label: "Detox",
    description: "Cellular clearance, liver support.",
    goals: ["detox"],
    x: 322,
    y: 478,
    color: "#c8b8ff",
    side: "right",
  },
  {
    id: "gut",
    label: "Gut",
    description: "Digestion, microbiome balance.",
    goals: ["gut-health"],
    x: 286,
    y: 514,
    color: "#8ce0d6",
    side: "left",
  },
  {
    id: "skin",
    label: "Skin",
    description: "Glow, elasticity, hydration.",
    goals: ["skin"],
    x: 412,
    y: 470,
    color: "#f5d4a8",
    side: "right",
  },
  {
    id: "longevity",
    label: "Longevity",
    description: "Cellular renewal, healthspan.",
    goals: ["longevity"],
    x: 188,
    y: 470,
    color: "#8ce0d6",
    side: "left",
  },
];

type Phase = "input" | "revealed";

type LivingDiagnosisProps = {
  products: Product[];
  /** When true, locks to the input phase, hides the "Reveal routine" controls,
   *  and reports selection upward via onSelectionChange. Used by QuizRunner
   *  to embed the picker as one step of a multi-step quiz. */
  embedded?: boolean;
  /** Initial / controlled selection (zone ids) when embedded. */
  value?: Set<string>;
  /** Fires whenever the user toggles a zone. Provides both raw zone ids and
   *  the derived WellnessGoal[] so the parent can branch off either. */
  onSelectionChange?: (zoneIds: string[], goals: WellnessGoal[]) => void;
  /** Optional title override (only used when embedded). */
  title?: string;
  /** Optional subtitle override (only used when embedded). */
  subtitle?: string;
};

export function LivingDiagnosis({
  products,
  embedded = false,
  value,
  onSelectionChange,
  title,
  subtitle,
}: LivingDiagnosisProps) {
  const reduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const [phase, setPhase] = useState<Phase>("input");
  const [selected, setSelected] = useState<Set<string>>(value ?? new Set());
  const [hovered, setHovered] = useState<string | null>(null);

  const selectedZones = useMemo(() => ZONES.filter((z) => selected.has(z.id)), [selected]);

  const selectedGoals = useMemo(() => {
    const goals = new Set<WellnessGoal>();
    selectedZones.forEach((z) => z.goals.forEach((g) => goals.add(g)));
    return Array.from(goals);
  }, [selectedZones]);

  const protocol = useMemo(
    () => getRecommendedProtocolFromCatalog(products, selectedGoals),
    [products, selectedGoals],
  );

  const recommended = useMemo(() => {
    const all = [...protocol.morning, ...protocol.evening, ...protocol.targeted];
    const seen = new Set<string>();
    const unique: Product[] = [];
    for (const p of all) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        unique.push(p);
      }
      if (unique.length === 3) break;
    }
    if (unique.length < 3) {
      for (const p of products) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          unique.push(p);
        }
        if (unique.length === 3) break;
      }
    }
    return unique;
  }, [protocol, products]);

  function toggleZone(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Notify parent of selection changes via effect — calling onSelectionChange
  // synchronously inside the setSelected updater would trip React's "setState
  // during render" warning. The callback is held in a ref so a parent passing
  // an inline arrow each render doesn't re-fire this effect (which would
  // infinitely loop: parent setState → re-render → new callback → effect
  // fires → parent setState …).
  const onSelectionChangeRef = useRef(onSelectionChange);
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  });
  useEffect(() => {
    if (!onSelectionChangeRef.current) return;
    const goalSet = new Set<WellnessGoal>();
    selectedZones.forEach((z) => z.goals.forEach((g) => goalSet.add(g)));
    onSelectionChangeRef.current(Array.from(selected), Array.from(goalSet));
  }, [selected, selectedZones]);

  function reveal() {
    if (selected.size === 0 || embedded) return;
    setPhase("revealed");
  }

  function refine() {
    setPhase("input");
  }

  return (
    <section
      className={
        embedded
          ? "relative isolate overflow-hidden text-[var(--text)]"
          : "theme-aurora relative isolate min-h-[88svh] overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] shadow-[0_40px_140px_rgba(7,6,8,0.45)]"
      }
    >
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 60% 38%, rgba(215,195,167,0.10), transparent 58%), radial-gradient(80% 60% at 22% 88%, rgba(140,224,214,0.08), transparent 65%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.18] bg-[radial-gradient(rgba(255,255,255,0.6)_0.5px,transparent_0.5px)] [background-size:3px_3px]" />

      <div
        className={cn(
          "relative space-y-6 md:grid md:grid-cols-[0.46fr_0.54fr] md:gap-4 md:space-y-0",
          embedded ? "py-0 md:items-start md:py-0" : "min-h-[88svh] px-6 py-12 md:items-center md:px-12 md:py-14",
        )}
      >
        {/* LEFT — copy + controls */}
        <div className="relative z-20 max-w-xl">
          {!embedded ? (
            <p className="text-eyebrow tracking-[0.1em] text-white/78">
              Cymbiotika · Take the Quiz
            </p>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {phase === "input" ? (
                <>
                  <h1
                    className={cn(
                      "display-title leading-[0.98] text-white",
                      embedded
                        ? "mt-2 text-[clamp(1.75rem,3.6vw,2.75rem)]"
                        : "mt-6 text-[clamp(2.6rem,5.6vw,5.5rem)] leading-[0.96]",
                    )}
                  >
                    {title ?? "Tap where you want to feel different."}
                  </h1>
                  <p
                    className={cn(
                      "max-w-md leading-relaxed text-white/65",
                      embedded ? "mt-3 text-small" : "mt-5 text-body md:text-body",
                    )}
                  >
                    {subtitle ??
                      "Your body is the input. Light up any zones — one or all eight — and your routine assembles."}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="display-title mt-6 text-[clamp(2.6rem,5.6vw,5.5rem)] leading-[0.96] text-white">
                    Your routine.
                  </h1>
                  <p className="mt-5 max-w-md text-body leading-relaxed text-white/65 md:text-body">
                    {recommended.length} formulas matched to{" "}
                    <span className="text-[#d7c3a7]">{selectedZones.length}</span> active zone
                    {selectedZones.length === 1 ? "" : "s"}.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Selected zones list */}
          <div className="mt-9 max-w-md">
            <p className="text-eyebrow tracking-[0.1em] text-white/78">
              {phase === "input" ? "Active zones" : "Listening to"}
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              <AnimatePresence>
                {selectedZones.map((z) => (
                  <motion.li
                    key={z.id}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-eyebrow tracking-[0.1em] text-white/85"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: z.color, boxShadow: `0 0 10px ${z.color}` }}
                    />
                    {z.label}
                  </motion.li>
                ))}
              </AnimatePresence>
              {selectedZones.length === 0 && phase === "input" && (
                <motion.li
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2 rounded-full border border-[#d7c3a7]/40 bg-[#d7c3a7]/[0.06] px-3.5 py-1.5 text-eyebrow tracking-[0.1em] text-[#d7c3a7]"
                >
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden
                  >
                    →
                  </motion.span>
                  Tap any glowing dot on the body
                </motion.li>
              )}
            </ul>
          </div>

          {/* Controls — hidden in embedded mode (parent QuizRunner provides
              its own Back/Next navigation). */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {phase === "input" && !embedded ? (
              <>
                <button
                  type="button"
                  onClick={reveal}
                  disabled={selected.size === 0}
                  className="rounded-full bg-white px-7 py-3.5 text-eyebrow tracking-[0.1em] text-[var(--on-primary)] transition disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 hover:scale-[1.02]"
                >
                  Reveal routine
                </button>
                <span className="text-eyebrow tracking-[0.1em] text-white/78">
                  {selected.size} / {ZONES.length} lit
                </span>
              </>
            ) : phase === "input" && embedded ? (
              <span className="text-eyebrow tracking-[0.1em] text-white/78">
                {selected.size} / {ZONES.length} lit
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => recommended.forEach((p) => addItem(p))}
                  disabled={recommended.length === 0}
                  className="rounded-full bg-white px-7 py-3.5 text-eyebrow tracking-[0.1em] text-[var(--on-primary)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
                >
                  Add full routine
                </button>
                <button
                  type="button"
                  onClick={refine}
                  className="rounded-full border border-white/25 bg-white/[0.04] px-7 py-3.5 text-eyebrow tracking-[0.1em] text-white transition hover:border-white/55 hover:bg-white/10"
                >
                Clear
                </button>
                <Link
                  href="/products"
                  className="text-eyebrow tracking-[0.1em] text-white/78 hover:text-white"
                >
                  Browse all →
                </Link>
              </>
            )}
          </div>
        </div>

        {/* RIGHT — body. In embedded mode, cap the figure width so it fits
            inside the runner shell without crowding the question column. */}
        <div
          className={cn(
            "relative",
            embedded && "mx-auto -mt-10 w-full max-w-[420px] md:-mt-36",
          )}
        >
          <BodyStage
            phase={phase}
            selected={selected}
            hovered={hovered}
            onZoneToggle={toggleZone}
            onZoneHover={setHovered}
            recommended={recommended}
            onAddProduct={addItem}
            reduceMotion={!!reduceMotion}
          />
        </div>
      </div>
    </section>
  );
}

// ---------- Body stage ----------

function BodyStage({
  phase,
  selected,
  hovered,
  onZoneToggle,
  onZoneHover,
  recommended,
  onAddProduct,
  reduceMotion,
}: {
  phase: Phase;
  selected: Set<string>;
  hovered: string | null;
  onZoneToggle: (id: string) => void;
  onZoneHover: (id: string | null) => void;
  recommended: Product[];
  onAddProduct: (product: Product) => void;
  reduceMotion: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div className="relative aspect-[3/4] w-full">
      <svg viewBox="0 0 600 800" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="ld-body-glow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(215,195,167,0.32)" />
            <stop offset="100%" stopColor="rgba(215,195,167,0)" />
          </radialGradient>
          <filter id="ld-soft-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ambient halo */}
        <ellipse cx={300} cy={480} rx={180} ry={260} fill="url(#ld-body-glow)" />

        {/* Body silhouette */}
        <BodyFigure />

        {/* Zone glows (under markers) */}
        {ZONES.map((z) => (
          <ZoneGlow
            key={z.id}
            zone={z}
            active={selected.has(z.id)}
            hovered={hovered === z.id}
            reduceMotion={reduceMotion}
          />
        ))}

        {/* Connection lines from zones to product cards (only on revealed) */}
        {phase === "revealed" &&
          recommended.map((product, i) => {
            const angle = -45 + i * 45; // -45, 0, 45 degrees
            const rad = (angle * Math.PI) / 180;
            const radius = 280;
            const px = 300 + Math.cos(rad) * radius;
            const py = 480 + Math.sin(rad) * radius;
            const targetZone = ZONES.find((z) => selected.has(z.id)) ?? ZONES[0];
            return (
              <motion.line
                key={product.id}
                x1={targetZone.x}
                y1={targetZone.y}
                x2={px}
                y2={py}
                stroke="rgba(215,195,167,0.4)"
                strokeWidth="0.8"
                strokeDasharray="2 5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
              />
            );
          })}
      </svg>

      {/* Zone markers (HTML overlays for accessibility) */}
      {ZONES.map((zone) => (
        <ZoneMarker
          key={zone.id}
          zone={zone}
          active={selected.has(zone.id)}
          hovered={hovered === zone.id}
          phase={phase}
          onClick={() => onZoneToggle(zone.id)}
          onHover={() => onZoneHover(zone.id)}
          onLeave={() => onZoneHover(null)}
        />
      ))}

      {/* Orbiting product cards (desktop only — see ProductOrbit for the
          `hidden md:block` constraint that keeps these out of mobile flow). */}
      <AnimatePresence>
        {phase === "revealed" &&
          recommended.map((product, i) => (
            <ProductOrbit
              key={product.id}
              product={product}
              index={i}
              total={recommended.length}
              onAdd={() => onAddProduct(product)}
            />
          ))}
      </AnimatePresence>
      </div>

      {/* Mobile match list — orbital layout collapses on narrow viewports,
          so render the matches as a normal vertical stack below the body. */}
      {phase === "revealed" ? (
        <div className="mt-6 flex flex-col gap-3 md:hidden">
          {recommended.map((product, i) => (
            <motion.article
              key={`mobile-${product.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full min-w-0 items-center gap-3 rounded-[1.2rem] border border-white/12 bg-white/[0.06] p-3"
            >
              <Link
                href={`/products/${product.handle}`}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[0.8rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]"
              >
                <SafeImage
                  src={product.featuredImage}
                  alt={product.title}
                  fill
                  className="object-contain p-1.5"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-eyebrow tracking-[0.1em] text-[#d7c3a7]">Match</p>
                <Link href={`/products/${product.handle}`} className="block">
                  <p className="mt-1 truncate font-display text-body leading-tight text-white">
                    {product.title}
                  </p>
                </Link>
              </div>
              <button
                type="button"
                onClick={() => onAddProduct(product)}
                className="shrink-0 rounded-full bg-white/95 px-3 py-2 text-eyebrow tracking-[0.1em] text-[var(--on-primary)] transition hover:bg-white"
              >
                Add
              </button>
            </motion.article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ---------- Body figure (silhouette only; no animations) ----------

function BodyFigure() {
  const fill = "rgba(245,212,168,0.08)";
  const stroke = "rgba(245,212,168,0.45)";
  const sw = 0.9;

  return (
    <g>
      <ellipse cx={300} cy={272} rx={26} ry={32} fill={fill} stroke={stroke} strokeWidth={sw} />
      <path
        d="M 290 300 C 290 312 290 320 286 322 L 314 322 C 310 320 310 312 310 300 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path
        d="M 286 322 C 274 326 256 336 244 354 C 250 372 254 388 256 408 C 258 432 260 454 262 472 C 262 488 260 500 258 514 C 256 524 254 534 254 544 L 346 544 C 346 534 344 524 342 514 C 340 500 338 488 338 472 C 340 454 342 432 344 408 C 346 388 350 372 356 354 C 344 336 326 326 314 322 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path
        d="M 356 354 C 370 358 382 372 390 388 C 398 410 404 440 406 472 C 408 510 408 550 406 580 C 406 594 404 604 398 610 C 392 614 384 610 380 604 C 376 594 374 580 374 568 C 374 550 376 510 376 472 C 374 442 372 414 366 392 C 362 384 358 380 354 380 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path
        d="M 244 354 C 230 358 218 372 210 388 C 202 410 196 440 194 472 C 192 510 192 550 194 580 C 194 594 196 604 202 610 C 208 614 216 610 220 604 C 224 594 226 580 226 568 C 226 550 224 510 224 472 C 226 442 228 414 234 392 C 238 384 242 380 246 380 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path
        d="M 300 544 L 346 544 C 350 590 354 640 352 690 L 350 720 L 312 720 L 310 690 C 306 640 304 590 302 544 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path
        d="M 300 544 L 254 544 C 250 590 246 640 248 690 L 250 720 L 288 720 L 290 690 C 294 640 296 590 298 544 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </g>
  );
}

// ---------- Zone glow (SVG, behind marker) ----------

function ZoneGlow({
  zone,
  active,
  hovered,
  reduceMotion,
}: {
  zone: Zone;
  active: boolean;
  hovered: boolean;
  reduceMotion: boolean;
}) {
  const intensity = active ? 1 : hovered ? 0.5 : 0;
  return (
    <>
      <motion.circle
        cx={zone.x}
        cy={zone.y}
        r={26}
        fill={zone.color}
        filter="url(#ld-soft-glow)"
        animate={{ opacity: intensity * 0.5 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      />
      {active && !reduceMotion && (
        <motion.circle
          cx={zone.x}
          cy={zone.y}
          r={26}
          fill="none"
          stroke={zone.color}
          strokeWidth="0.6"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.6, 0, 0.6], scale: [0.6, 1.6, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          style={{ transformOrigin: `${zone.x}px ${zone.y}px` }}
        />
      )}
    </>
  );
}

// ---------- Zone marker (HTML button, on top) ----------

function ZoneMarker({
  zone,
  active,
  hovered,
  phase,
  onClick,
  onHover,
  onLeave,
}: {
  zone: Zone;
  active: boolean;
  hovered: boolean;
  phase: Phase;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const leftPct = (zone.x / 600) * 100;
  const topPct = (zone.y / 800) * 100;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      disabled={phase === "revealed"}
      className="group absolute -translate-x-1/2 -translate-y-1/2 disabled:cursor-default"
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
      aria-label={`${zone.label} — ${zone.description}`}
      aria-pressed={active}
    >
      <span className="relative block h-12 w-12">
        {/* Idle attention pulse — only shown in the input phase on dots that
            haven't been selected/hovered yet. Signals "tap me" without
            requiring the user to read instructions. */}
        {phase === "input" && !active && !hovered && (
          <motion.span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 12,
              height: 12,
              border: "1px solid rgba(255,255,255,0.7)",
              transformOrigin: "center",
            }}
            animate={{ scale: [1, 2.4, 1], opacity: [0.65, 0, 0.65] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            aria-hidden
          />
        )}
        {/* outer pulse */}
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500"
          style={{
            width: active ? 22 : hovered ? 16 : 12,
            height: active ? 22 : hovered ? 16 : 12,
            border: `1px solid ${active ? zone.color : "rgba(255,255,255,0.5)"}`,
            opacity: active ? 0.9 : 0.7,
            boxShadow: active ? `0 0 18px ${zone.color}` : "none",
          }}
        />
        {/* core dot */}
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500"
          style={{
            width: active ? 8 : 6,
            height: active ? 8 : 6,
            background: active ? zone.color : "rgba(255,255,255,0.95)",
            boxShadow: active
              ? `0 0 12px ${zone.color}`
              : "0 0 8px rgba(255,255,255,0.45)",
          }}
        />
      </span>

      {/* Label */}
      <AnimatePresence>
        {(hovered || active) && (
          <motion.span
            key={`${zone.id}-label`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/12 bg-black/70 px-3 py-1 text-eyebrow tracking-[0.1em] ${
              zone.side === "right" ? "left-[calc(100%+10px)]" : "right-[calc(100%+10px)]"
            }`}
            style={{ color: active ? zone.color : "rgba(255,255,255,0.9)" }}
          >
            {zone.label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ---------- Orbiting product card ----------

function ProductOrbit({
  product,
  index,
  total,
  onAdd,
}: {
  product: Product;
  index: number;
  total: number;
  onAdd: () => void;
}) {
  // Distribute cards along an arc on the right side
  const baseAngle = -55 + index * (110 / Math.max(total - 1, 1));
  const rad = (baseAngle * Math.PI) / 180;
  const radius = 46;
  const left = Math.round((50 + Math.cos(rad) * radius) * 100) / 100;
  const top = Math.round((60 + Math.sin(rad) * radius * 0.78) * 100) / 100;

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.55, delay: 0.5 + index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="absolute z-30 hidden w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-[1.4rem] border border-white/12 bg-white/[0.06] p-3 md:block md:w-[208px]"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(215,195,167,0.18)",
      }}
    >
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative h-24 w-full overflow-hidden rounded-[1rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]">
          <SafeImage
            src={product.featuredImage}
            alt={product.title}
            fill
            className="object-contain p-2"
          />
        </div>
        <div className="mt-3">
          <p className="text-eyebrow tracking-[0.1em] text-[#d7c3a7]">Match</p>
          <p className="mt-1.5 font-display text-body leading-tight text-white">{product.title}</p>
          <p className="mt-1.5 line-clamp-2 text-small leading-relaxed text-white/65">
            {product.benefits[0] ?? "Liposomal delivery for daily support."}
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 w-full rounded-full bg-white/95 px-3 py-2 text-eyebrow tracking-[0.1em] text-[var(--on-primary)] transition hover:bg-white"
      >
        Add to cart
      </button>
    </motion.article>
  );
}
