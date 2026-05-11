"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const r2 = (v: number) => Math.round(v * 100) / 100;

export function ScienceExperiments() {
  return (
    <section className="theme-aurora grid gap-6 md:gap-7 lg:grid-cols-2">
      <ExperimentCard
        index={1}
        eyebrow="Routine Gravity"
        title="Products orbit the goal they serve."
        caption="Compatibility as spatial pull. Switch the goal — the field rearranges around it."
      >
        <ProtocolGravity />
      </ExperimentCard>

      <ExperimentCard
        index={2}
        eyebrow="Absorption Flow"
        title="Delivery moves through soft membranes."
        caption="Same molecule, two carriers. Watch how much actually reaches the cell."
      >
        <AbsorptionFlow />
      </ExperimentCard>
    </section>
  );
}

// ---------- Card shell ----------

function ExperimentCard({
  index,
  eyebrow,
  title,
  caption,
  children,
}: {
  index: number;
  eyebrow: string;
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[var(--bg)] p-6 transition-colors hover:border-[var(--line-strong)] md:p-7">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 30% 0%, rgba(215,195,167,0.08), transparent 56%)",
        }}
      />

      <div className="relative z-10 flex items-center gap-2">
        <span className="text-eyebrow tracking-[0.1em] text-[#d7c3a7]">
          0{index}
        </span>
        <span className="h-px flex-1 bg-[var(--line)]" />
        <span className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">
          {eyebrow}
        </span>
      </div>

      <h3 className="relative z-10 mt-5 font-display text-[clamp(1.55rem,2.4vw,2.1rem)] leading-[1.1] text-[var(--text)]">
        {title}
      </h3>

      <div className="relative z-10 mt-5 min-h-[260px] flex-1">{children}</div>

      <p className="relative z-10 mt-5 max-w-md text-[12px] leading-relaxed text-[var(--muted)] md:text-[13px]">
        {caption}
      </p>
    </article>
  );
}

// ---------- 2. Protocol Gravity ----------

type GravityGoal = {
  key: string;
  label: string;
  color: string;
  products: Array<{ key: string; name: string; orbit: number; speed: number }>;
};

const GRAVITY_GOALS: GravityGoal[] = [
  {
    key: "energy",
    label: "Energy",
    color: "#fba973",
    products: [
      { key: "shilajit", name: "Shilajit", orbit: 24, speed: 1 },
      { key: "b12", name: "B12", orbit: 32, speed: 0.74 },
      { key: "coq10", name: "Co-Q10", orbit: 40, speed: 0.52 },
    ],
  },
  {
    key: "sleep",
    label: "Sleep",
    color: "#9ec9ff",
    products: [
      { key: "magnesium", name: "Magnesium", orbit: 24, speed: 1 },
      { key: "apigenin", name: "Apigenin", orbit: 33, speed: 0.7 },
      { key: "theanine", name: "Theanine", orbit: 41, speed: 0.5 },
    ],
  },
  {
    key: "immunity",
    label: "Immunity",
    color: "#fbd5b5",
    products: [
      { key: "vitamin-c", name: "Vitamin C", orbit: 24, speed: 1 },
      { key: "glutathione", name: "Glutathione", orbit: 32, speed: 0.78 },
      { key: "zinc", name: "Zinc", orbit: 41, speed: 0.55 },
    ],
  },
  {
    key: "longevity",
    label: "Longevity",
    color: "#8ce0d6",
    products: [
      { key: "nad", name: "NAD+", orbit: 24, speed: 1 },
      { key: "resveratrol", name: "Resveratrol", orbit: 33, speed: 0.72 },
      { key: "coq10-l", name: "Co-Q10", orbit: 41, speed: 0.5 },
    ],
  },
];

function ProtocolGravity() {
  const [goalKey, setGoalKey] = useState("energy");
  const [t, setT] = useState(0);

  // Continuous time for orbital motion
  useEffect(() => {
    const id = window.setInterval(() => {
      setT((prev) => prev + 0.012);
    }, 30);
    return () => window.clearInterval(id);
  }, []);

  const goal = GRAVITY_GOALS.find((g) => g.key === goalKey) ?? GRAVITY_GOALS[0];

  return (
    <div className="flex h-full flex-col">
      {/* Goal toggle */}
      <div className="flex flex-wrap gap-1.5">
        {GRAVITY_GOALS.map((g) => {
          const isActive = goalKey === g.key;
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => setGoalKey(g.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-eyebrow tracking-[0.1em] transition",
                isActive
                  ? "border-transparent text-[var(--on-primary)]"
                  : "border-[var(--line)] bg-[var(--surface-elevated)] text-[var(--muted)] hover:text-[var(--text)]",
              )}
              style={
                isActive
                  ? {
                      background: g.color,
                      boxShadow: `0 0 14px ${g.color}66`,
                    }
                  : undefined
              }
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Field */}
      <div className="relative mt-4 flex-1 min-h-[230px]">
        {/* Halo */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={{ background: `radial-gradient(circle, ${goal.color}26 0%, ${goal.color}00 65%)` }}
          transition={{ duration: 0.6 }}
        />

        {/* Orbital rings */}
        {goal.products.map((p) => (
          <div
            key={`ring-${p.key}`}
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              width: `${p.orbit * 2}%`,
              height: `${p.orbit * 1.7}%`,
              borderColor: `${goal.color}22`,
            }}
          />
        ))}

        {/* Center anchor */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-eyebrow tracking-[0.1em]"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${goal.color}, ${goal.color}88)`,
              boxShadow: `0 0 30px ${goal.color}88`,
              color: "var(--bg)",
            }}
          >
            {goal.label}
          </div>
        </motion.div>

        {/* Orbiting products */}
        {goal.products.map((p, i) => {
          const angle = t * p.speed + (i * Math.PI * 2) / goal.products.length;
          const x = 50 + Math.cos(angle) * p.orbit;
          const y = 50 + Math.sin(angle) * p.orbit * 0.85;
          return (
            <motion.div
              key={`${goal.key}-${p.key}`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${r2(x)}%`, top: `${r2(y)}%` }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div
                className="rounded-full border px-2.5 py-1 text-eyebrow tracking-[0.1em]"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: `${goal.color}55`,
                  color: "rgba(245,244,240,0.92)",
                  boxShadow: `0 0 12px ${goal.color}55`,
                }}
              >
                {p.name}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- 3. Absorption Flow ----------

type FlowMode = "liposomal" | "traditional";

const FLOW_PARTICLES = Array.from({ length: 18 }).map((_, i) => ({
  delay: r2((i * 0.36) % 6),
  laneSeed: i,
}));

function AbsorptionFlow() {
  const [mode, setMode] = useState<FlowMode>("liposomal");
  const isLipo = mode === "liposomal";

  return (
    <div className="flex h-full flex-col">
      {/* Mode toggle */}
      <div className="flex items-center gap-1.5 self-start rounded-full border border-[var(--line)] bg-[var(--surface-elevated)] p-1">
        <button
          type="button"
          onClick={() => setMode("liposomal")}
          className={cn(
            "rounded-full px-3 py-1 text-eyebrow tracking-[0.1em] transition",
            isLipo
              ? "bg-[var(--primary)] text-[var(--on-primary)]"
              : "text-[var(--muted)] hover:text-[var(--text)]",
          )}
        >
          Liposomal
        </button>
        <button
          type="button"
          onClick={() => setMode("traditional")}
          className={cn(
            "rounded-full px-3 py-1 text-eyebrow tracking-[0.1em] transition",
            !isLipo
              ? "bg-[var(--primary)] text-[var(--on-primary)]"
              : "text-[var(--muted)] hover:text-[var(--text)]",
          )}
        >
          Traditional
        </button>
      </div>

      {/* Cross-section */}
      <div className="relative mt-4 flex-1 min-h-[200px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)]">
        {/* Layers — labels on the right */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-between py-3 pl-3 text-[8px] uppercase tracking-[0.1em] text-[var(--muted)]">
          <span>Stomach</span>
          <span>Gut wall</span>
          <span>Bloodstream</span>
          <span>Cell</span>
        </div>

        {/* Stomach wash */}
        <div
          className="absolute inset-x-0 top-0 h-[26%]"
          style={{
            background:
              "linear-gradient(180deg, rgba(180,40,55,0.15) 0%, rgba(180,40,55,0.04) 100%)",
          }}
        />
        {/* Gut wall band */}
        <div
          className="absolute inset-x-0 top-[26%] h-[26%]"
          style={{
            background:
              "linear-gradient(180deg, rgba(140,224,214,0.10) 0%, rgba(140,224,214,0.02) 100%)",
          }}
        />
        {/* Bloodstream */}
        <div
          className="absolute inset-x-0 top-[52%] h-[28%]"
          style={{
            background:
              "linear-gradient(180deg, rgba(215,195,167,0.10) 0%, rgba(215,195,167,0.02) 100%)",
          }}
        />
        {/* Cell base */}
        <div
          className="absolute inset-x-0 bottom-0 h-[20%]"
          style={{
            background:
              "linear-gradient(0deg, rgba(140,224,214,0.18) 0%, rgba(140,224,214,0.04) 100%)",
          }}
        />

        {/* Layer divider lines */}
        {[26, 52, 80].map((y) => (
          <div
            key={y}
            className="absolute inset-x-0 h-px"
            style={{ top: `${y}%`, background: "rgba(255,255,255,0.08)" }}
          />
        ))}

        {/* Particles */}
        {FLOW_PARTICLES.map((p, idx) => (
          <FlowParticle key={`${mode}-${idx}`} idx={idx} delay={p.delay} mode={mode} />
        ))}

        {/* Bioavailability stat */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-3 right-3 rounded-xl border border-[var(--line)] bg-[var(--surface-elevated)] px-3 py-2 text-right"
        >
          <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">
            Bioavailability
          </p>
          <p
            className="mt-0.5 font-display text-2xl leading-none"
            style={{ color: isLipo ? "#8ce0d6" : "rgba(245,244,240,0.55)" }}
          >
            {isLipo ? "3×" : "1×"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function FlowParticle({
  idx,
  delay,
  mode,
}: {
  idx: number;
  delay: number;
  mode: FlowMode;
}) {
  // Lateral lane (15-85% horizontal range)
  const x = r2(15 + ((idx * 31) % 70));
  const isLipo = mode === "liposomal";

  return (
    <motion.span
      className="absolute h-2 w-2 rounded-full"
      style={{
        left: `${x}%`,
        background: isLipo ? "#fff1d1" : "rgba(245,212,168,0.45)",
        boxShadow: isLipo
          ? "0 0 10px rgba(255,241,209,0.85)"
          : "0 0 4px rgba(245,212,168,0.4)",
      }}
      animate={
        isLipo
          ? {
              top: ["0%", "26%", "52%", "80%", "92%"],
              opacity: [0, 1, 1, 1, 0.85],
              scale: [0.6, 1, 1, 1, 1.2],
            }
          : {
              // Most traditional particles fade out at the gut wall
              top: ["0%", "26%", "40%"],
              opacity: [0, 0.7, 0],
              scale: [0.6, 0.9, 0.7],
            }
      }
      transition={{
        duration: isLipo ? 5.4 : 3.4,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}
