"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AutoplayVideo } from "@/components/ui/AutoplayVideo";
import type { ProductVideoClip } from "@/lib/sanity-media";

type ProductCoverflowCarouselProps = {
  clips: ProductVideoClip[];
  initialIndex: number;
};

export function ProductCoverflowCarousel({ clips, initialIndex }: ProductCoverflowCarouselProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), Math.max(clips.length - 1, 0)),
  );

  const scrollToIndex = useCallback((idx: number, behavior: ScrollBehavior = "smooth") => {
    const rail = railRef.current;
    if (!rail) return;
    const target = rail.children[idx] as HTMLElement | undefined;
    if (!target) return;
    const targetCenter = target.offsetLeft + target.clientWidth / 2;
    const left = targetCenter - rail.clientWidth / 2;
    rail.scrollTo({ left, behavior });
  }, []);

  useEffect(() => {
    scrollToIndex(activeIndex, "auto");
  }, [scrollToIndex]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const railCenter = rail.scrollLeft + rail.clientWidth / 2;
      const slides = rail.children;
      let closest = 0;
      let closestDist = Infinity;
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i] as HTMLElement;
        const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
        const dist = Math.abs(slideCenter - railCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }
      setActiveIndex((prev) => (prev === closest ? prev : closest));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    rail.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      rail.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [clips.length]);

  if (clips.length === 0) return null;

  return (
    <>
      <div ref={railRef} className="video-rail">
        {clips.map((clip, idx) => {
          const isActive = idx === activeIndex;
          return (
            <article
              key={clip.id}
              data-active={isActive}
              onClick={() => scrollToIndex(idx)}
              className="video-rail-slide"
            >
              <div className="relative h-[360px] overflow-hidden rounded-t-[1.8rem] bg-[var(--surface-elevated)]">
                <AutoplayVideo
                  src={clip.src}
                  className="pointer-events-none h-full w-full select-none object-cover transition duration-700 [transition-timing-function:var(--easing-premium)]"
                  loop
                  active={isActive}
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(16,22,17,0.38)_0%,rgba(16,22,17,0)_42%)]" />
              </div>
              <div className="space-y-2 px-5 py-4">
                <p className="text-xl text-[var(--forest)]">{clip.title}</p>
                <span className="micro-copy text-[var(--muted)]">{clip.category}</span>
              </div>
            </article>
          );
        })}
      </div>

      <style jsx global>{`
        .video-rail {
          display: flex;
          gap: 24px;
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scroll-snap-stop: always;
          scroll-behavior: smooth;
          overscroll-behavior-x: contain;
          padding-block: 12px;
          padding-inline: max(calc((100vw - min(78vw, 620px)) / 2), 16px);
          scrollbar-width: none;
          -ms-overflow-style: none;
          touch-action: pan-x;
        }
        .video-rail::-webkit-scrollbar {
          display: none;
        }

        .video-rail-slide {
          flex: 0 0 min(78vw, 620px);
          height: 460px;
          scroll-snap-align: center;
          scroll-snap-stop: always;
          overflow: hidden;
          border-radius: 1.8rem;
          background: var(--surface-elevated);
          opacity: 0.18;
          transform: scale(0.9);
          transition:
            transform 420ms var(--easing-premium),
            opacity 420ms var(--easing-premium);
          cursor: pointer;
        }
        .video-rail-slide[data-active="true"] {
          opacity: 1;
          transform: scale(1);
          cursor: default;
        }

        @media (min-width: 768px) {
          .video-rail {
            padding-inline: max(calc((100vw - min(62vw, 760px)) / 2), 16px);
          }
          .video-rail-slide {
            flex: 0 0 min(62vw, 760px);
            height: 510px;
          }
        }

        @media (min-width: 1280px) {
          .video-rail {
            padding-inline: max(calc((100vw - min(52vw, 780px)) / 2), 16px);
          }
          .video-rail-slide {
            flex: 0 0 min(52vw, 780px);
            height: 530px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .video-rail {
            scroll-behavior: auto;
          }
          .video-rail-slide {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
