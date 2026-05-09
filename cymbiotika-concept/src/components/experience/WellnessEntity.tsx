"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

const ENTITY_BY_STATE: Record<string, { glow: string; core: string; opacity: number; speed: number }> = {
  focus: {
    glow: "rgba(117, 199, 255, 0.3)",
    core: "rgba(206, 228, 255, 0.56)",
    opacity: 0.85,
    speed: 0.6,
  },
  recover: {
    glow: "rgba(244, 168, 104, 0.28)",
    core: "rgba(255, 225, 184, 0.58)",
    opacity: 0.82,
    speed: 0.5,
  },
  sleep: {
    glow: "rgba(102, 118, 170, 0.24)",
    core: "rgba(166, 188, 245, 0.48)",
    opacity: 0.72,
    speed: 0.32,
  },
  perform: {
    glow: "rgba(126, 227, 181, 0.26)",
    core: "rgba(196, 247, 223, 0.58)",
    opacity: 0.84,
    speed: 0.68,
  },
  balance: {
    glow: "rgba(187, 174, 230, 0.24)",
    core: "rgba(233, 220, 255, 0.58)",
    opacity: 0.8,
    speed: 0.46,
  },
};

function getEntityState(): keyof typeof ENTITY_BY_STATE {
  if (typeof document === "undefined") {
    return "focus";
  }

  const state = document.body.dataset.wellnessState ?? "focus";
  if (state in ENTITY_BY_STATE) {
    return state as keyof typeof ENTITY_BY_STATE;
  }

  return "focus";
}

export function WellnessEntity() {
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.35);
  const entityScaleBase = useMotionValue(1);
  const entityOpacityBase = useMotionValue(0.82);

  const x = useSpring(mouseX, { stiffness: 40, damping: 16, mass: 0.8 });
  const y = useSpring(mouseY, { stiffness: 36, damping: 15, mass: 0.85 });
  const scale = useSpring(entityScaleBase, { stiffness: 42, damping: 17, mass: 0.92 });
  const opacity = useSpring(entityOpacityBase, { stiffness: 40, damping: 15, mass: 0.8 });

  const { scrollYProgress } = useScroll();
  const driftY = useTransform(scrollYProgress, [0, 0.5, 1], [-16, 0, 18]);
  const pulse = useTransform(scrollYProgress, [0, 1], [0.96, 1.04]);

  const positionX = useTransform(x, (value) => `${12 + value * 72}%`);
  const positionY = useTransform(y, (value) => `${5 + value * 72}%`);

  const gradient = useMotionTemplate`radial-gradient(circle at 48% 44%, var(--entity-core) 0%, color-mix(in srgb, var(--entity-glow) 70%, transparent) 32%, transparent 67%)`;

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const handleMove = (event: MouseEvent) => {
      mouseX.set(event.clientX / window.innerWidth);
      mouseY.set(event.clientY / window.innerHeight);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });

    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY, reduceMotion]);

  useEffect(() => {
    let frame = 0;

    const syncState = () => {
      const mapped = ENTITY_BY_STATE[getEntityState()];
      document.documentElement.style.setProperty("--entity-glow", mapped.glow);
      document.documentElement.style.setProperty("--entity-core", mapped.core);
      entityOpacityBase.set(mapped.opacity);
      entityScaleBase.set(0.98 + mapped.speed * 0.08);
    };

    syncState();

    const observer = new MutationObserver(syncState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-wellness-state"],
    });

    const animateBreath = () => {
      const t = Date.now() * 0.00042;
      const breath = reduceMotion ? 1 : 1 + Math.sin(t) * 0.036;
      entityScaleBase.set(entityScaleBase.get() * 0.9 + breath * 0.1);
      frame = window.requestAnimationFrame(animateBreath);
    };

    if (!reduceMotion) {
      frame = window.requestAnimationFrame(animateBreath);
    }

    return () => {
      observer.disconnect();
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [entityOpacityBase, entityScaleBase, reduceMotion]);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden>
      <motion.div
        className="wellness-entity"
        style={
          reduceMotion
            ? { left: "75%", top: "18%", opacity: 0.62 }
            : {
                left: positionX,
                top: positionY,
                y: driftY,
                scale,
                opacity,
                background: gradient,
              }
        }
      >
        <motion.div className="wellness-entity-inner" style={reduceMotion ? undefined : { scale: pulse }} />
      </motion.div>
    </div>
  );
}
