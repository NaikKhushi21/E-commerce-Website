"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { Lens } from "./reading-lens";

const OPTIONS: Array<{ key: Lens; label: string; sub: string }> = [
  { key: "quick", label: "Quick", sub: "TL;DR · stats only" },
  { key: "standard", label: "Standard", sub: "Full read" },
  { key: "deep", label: "Deep", sub: "+ citations" },
];

export function ReadingLens({
  lens,
  onChange,
}: {
  lens: Lens;
  onChange: (next: Lens) => void;
}) {
  const activeIdx = OPTIONS.findIndex((o) => o.key === lens);
  const activeOption = OPTIONS[activeIdx] ?? OPTIONS[1];

  return (
    <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--muted)]">
          Reading lens
        </p>
        <p className="text-[11px] text-[var(--muted)]/85">
          {activeOption.sub}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Reading depth"
        className="relative flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface-elevated)] p-1"
      >
        {OPTIONS.map((opt) => {
          const active = lens === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.key)}
              className={cn(
                "relative z-10 rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] transition-colors",
                active
                  ? "text-[var(--on-primary)]"
                  : "text-[var(--muted)] hover:text-[var(--forest)]",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="reading-lens-pill"
                  className="absolute inset-0 rounded-full bg-[var(--forest)]"
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                />
              ) : null}
              <span className="relative z-10">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
