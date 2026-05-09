"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const list = useMemo(() => images.filter((entry) => entry.trim().length > 0), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const intervalRef = useRef<number | null>(null);

  const frameRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 190, damping: 16 });
  const springY = useSpring(rotateY, { stiffness: 190, damping: 16 });
  const transform = useMotionTemplate`perspective(1000px) rotateX(${springX}deg) rotateY(${springY}deg)`;

  const active = list[activeIndex] ?? list[0] ?? "";

  function goNext() {
    setActiveIndex((current) => (current + 1) % list.length);
  }

  function goPrev() {
    setActiveIndex((current) => (current - 1 + list.length) % list.length);
  }

  function onEnter() {
    if (reduceMotion || list.length <= 1 || intervalRef.current !== null) return;
    intervalRef.current = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % list.length);
    }, 900);
  }

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 14);
    rotateX.set((0.5 - py) * 11);
  }

  function onLeave() {
    rotateX.set(0);
    rotateY.set(0);
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  return (
    <div className="space-y-3">
      <motion.div
        ref={frameRef}
        className="relative h-[420px] overflow-hidden rounded-3xl border border-[--brand-mint]/25 bg-white"
        style={reduceMotion ? undefined : { transformStyle: "preserve-3d", transform }}
        onMouseEnter={onEnter}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${active}-${activeIndex}`}
            className="absolute inset-0"
            initial={reduceMotion ? undefined : { opacity: 0, rotateY: -20, scale: 0.97 }}
            animate={reduceMotion ? undefined : { opacity: 1, rotateY: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, rotateY: 20, scale: 1.02 }}
            transition={{ duration: 0.35 }}
          >
            {active ? <SafeImage src={active} alt={title} fill className="object-cover" priority /> : null}
          </motion.div>
        </AnimatePresence>

        {list.length > 1 ? (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-[--brand-mint]/30 bg-white p-2 text-[#1f3126] hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[--brand-mint]/30 bg-white p-2 text-[#1f3126] hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={goNext}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full border border-[--brand-mint]/30 bg-white px-2.5 py-1 text-xs text-[#1f3126] hover:bg-white"
              aria-label="Rotate image"
            >
              <RefreshCw size={12} /> Rotate
            </button>
          </>
        ) : null}
      </motion.div>

      <div className="grid grid-cols-4 gap-2">
        {list.slice(0, 8).map((image, index) => (
          <button
            key={`${image}-${index}`}
            onClick={() => setActiveIndex(index)}
            className={`relative h-20 overflow-hidden rounded-2xl border ${
              index === activeIndex ? "border-[--brand-gold]" : "border-[--brand-mint]/25"
            }`}
          >
            <SafeImage src={image} alt={title} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
