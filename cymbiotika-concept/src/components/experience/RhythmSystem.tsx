"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const routeTones = [
  { match: "/products", orb: "#d7dad7", glow: "rgba(215,218,215,0.64)" },
  { match: "/science", orb: "#c8ddea", glow: "rgba(200,221,234,0.62)" },
  { match: "/quiz", orb: "#f0c7ae", glow: "rgba(240,199,174,0.66)" },
  { match: "/blog", orb: "#d9c9ae", glow: "rgba(217,201,174,0.58)" },
];

function toneForPath(pathname: string) {
  return routeTones.find((tone) => pathname.startsWith(tone.match)) ?? {
    orb: "#d7c3a7",
    glow: "rgba(215,195,167,0.62)",
  };
}

export function RhythmSystem() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const tone = useMemo(() => toneForPath(pathname), [pathname]);

  useEffect(() => {
    document.documentElement.style.setProperty("--rhythm-orb", tone.orb);
    document.documentElement.style.setProperty("--rhythm-glow", tone.glow);
  }, [tone.glow, tone.orb]);

  return (
    <>
      <div className="rhythm-background" aria-hidden="true">
        <div className="rhythm-background__light rhythm-background__light--one" />
        <div className="rhythm-background__light rhythm-background__light--two" />
        <div className="rhythm-background__grain" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          className="pointer-events-none fixed inset-0 z-[95] bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.74)_42%,transparent_76%)]"
          initial={reduceMotion ? { opacity: 0 } : { x: "-120%", opacity: 0 }}
          animate={reduceMotion ? { opacity: 0 } : { x: "120%", opacity: [0, 0.8, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>
    </>
  );
}
