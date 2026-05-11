import type { WellnessGoal } from "@/data/goals";

type Variant = "leaf" | "citrus" | "drop" | "rays" | "mountain" | "bloom";

const GOAL_TO_VARIANT: Record<WellnessGoal, Variant> = {
  energy: "rays",
  immunity: "citrus",
  "gut-health": "leaf",
  "brain-health": "bloom",
  sleep: "drop",
  stress: "leaf",
  skin: "bloom",
  detox: "leaf",
  longevity: "mountain",
};

function pickVariant(goals: WellnessGoal[] | undefined): Variant {
  if (!goals || goals.length === 0) return "leaf";
  return GOAL_TO_VARIANT[goals[0]] ?? "leaf";
}

/**
 * Soft inline SVG ornaments used as low-opacity background accents on the
 * product detail formula block. Variant is picked from the product's first
 * wellness goal so e.g. immunity products get a citrus sprig and longevity
 * products get a mountain silhouette.
 */
export function BotanicalAccent({
  goals,
  className,
  variant: overrideVariant,
}: {
  goals?: WellnessGoal[];
  className?: string;
  variant?: Variant;
}) {
  const variant = overrideVariant ?? pickVariant(goals);

  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {variant === "citrus" ? <Citrus /> : null}
      {variant === "leaf" ? <LeafSprig /> : null}
      {variant === "drop" ? <Moonflower /> : null}
      {variant === "rays" ? <SunRays /> : null}
      {variant === "mountain" ? <Mountain /> : null}
      {variant === "bloom" ? <Bloom /> : null}
    </svg>
  );
}

function Citrus() {
  return (
    <g>
      <circle cx="120" cy="80" r="42" strokeWidth="1.4" />
      <path d="M120 80 L120 38 M120 80 L162 80 M120 80 L150 110 M120 80 L90 110 M120 80 L150 50 M120 80 L90 50" strokeWidth="0.8" opacity="0.7" />
      <path d="M70 50 C 60 60, 56 78, 64 88 C 72 98, 92 96, 96 84 C 98 76, 90 64, 78 56 Z" strokeWidth="1.2" />
      <path d="M70 50 Q 90 70, 96 84" strokeWidth="0.8" opacity="0.6" />
    </g>
  );
}

function LeafSprig() {
  return (
    <g>
      <path d="M30 170 Q 100 130, 170 30" strokeWidth="1.4" />
      {[
        { t: 0.18, side: 1 },
        { t: 0.34, side: -1 },
        { t: 0.5, side: 1 },
        { t: 0.66, side: -1 },
        { t: 0.82, side: 1 },
      ].map(({ t, side }, i) => {
        const x1 = 30 + (170 - 30) * t;
        const y1 = 170 - (170 - 30) * Math.pow(t, 0.92);
        const dx = side * 22;
        const dy = -side * 12;
        return (
          <path
            key={i}
            d={`M ${x1} ${y1} q ${dx * 0.6} ${dy * 0.4}, ${dx} ${dy} q ${-dx * 0.4} ${-dy * 1.2}, ${-dx} ${-dy * 0.4} Z`}
            strokeWidth="1.1"
          />
        );
      })}
    </g>
  );
}

function Moonflower() {
  return (
    <g>
      <circle cx="100" cy="100" r="48" strokeWidth="1.2" />
      <path d="M100 52 C 70 70, 70 130, 100 148" strokeWidth="1.1" opacity="0.6" />
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const x1 = 100 + Math.cos(a) * 22;
        const y1 = 100 + Math.sin(a) * 22;
        const x2 = 100 + Math.cos(a) * 46;
        const y2 = 100 + Math.sin(a) * 46;
        return (
          <path
            key={i}
            d={`M ${x1} ${y1} Q ${100 + Math.cos(a) * 32} ${100 + Math.sin(a) * 32 - 6}, ${x2} ${y2}`}
            strokeWidth="1"
            opacity="0.8"
          />
        );
      })}
      <circle cx="100" cy="100" r="6" strokeWidth="1.2" />
    </g>
  );
}

function SunRays() {
  return (
    <g>
      <circle cx="100" cy="100" r="22" strokeWidth="1.3" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x1 = 100 + Math.cos(a) * 32;
        const y1 = 100 + Math.sin(a) * 32;
        const x2 = 100 + Math.cos(a) * (i % 2 === 0 ? 60 : 50);
        const y2 = 100 + Math.sin(a) * (i % 2 === 0 ? 60 : 50);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1.1" />;
      })}
      <circle cx="100" cy="100" r="6" strokeWidth="1" opacity="0.8" />
    </g>
  );
}

function Mountain() {
  return (
    <g>
      <path d="M20 160 L70 90 L100 130 L140 60 L180 160 Z" strokeWidth="1.4" />
      <path d="M70 90 L92 116 M140 60 L122 90" strokeWidth="0.9" opacity="0.55" />
      <circle cx="148" cy="50" r="10" strokeWidth="1" opacity="0.75" />
    </g>
  );
}

function Bloom() {
  return (
    <g>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const cx = 100 + Math.cos(a) * 18;
        const cy = 100 + Math.sin(a) * 18;
        return <ellipse key={i} cx={cx} cy={cy} rx="22" ry="12" transform={`rotate(${(i * 60) + 30} ${cx} ${cy})`} strokeWidth="1.1" />;
      })}
      <circle cx="100" cy="100" r="8" strokeWidth="1.2" />
      <path d="M100 108 Q 96 150, 88 180" strokeWidth="1.1" opacity="0.65" />
      <path d="M100 108 Q 104 150, 112 180" strokeWidth="1.1" opacity="0.65" />
    </g>
  );
}
