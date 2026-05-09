"use client";

import { useState } from "react";
import { SmoothReveal } from "@/components/motion/SmoothReveal";

const views = {
  standard: {
    label: "Standard delivery",
    copy: "Nutrients may degrade before target pathways, reducing consistency.",
    meter: 42,
  },
  liposomal: {
    label: "Liposomal delivery",
    copy: "Lipid-layer transport can support better routine consistency.",
    meter: 81,
  },
} as const;

export function AbsorptionExplainer() {
  const [mode, setMode] = useState<keyof typeof views>("liposomal");
  const active = views[mode];

  return (
    <SmoothReveal>
      <section className="grid gap-6 rounded-[2rem] border border-[--brand-mint]/25 bg-white p-6 md:grid-cols-2 md:p-7">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[--brand-gold]">Why absorption matters</p>
          <h2 className="mt-2 font-display text-3xl text-[#1f3126]">Formulation and delivery shape results.</h2>
          <div className="mt-4 flex gap-2">
            {(Object.keys(views) as Array<keyof typeof views>).map((key) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`rounded-full px-3 py-1.5 text-xs transition ${
                  mode === key ? "bg-[--brand-gold] text-white" : "border border-[--brand-mint]/30 bg-white text-[#2f5130]"
                }`}
              >
                {views[key].label}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[--brand-mint]/25 bg-white p-4">
          <p className="text-sm text-[#35533f]">{active.copy}</p>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-[--brand-gold] transition-all duration-500" style={{ width: `${active.meter}%` }} />
          </div>
          <p className="mt-2 text-xs text-[#4a6a57]">Concept score: {active.meter}/100</p>
        </div>
      </section>
    </SmoothReveal>
  );
}
