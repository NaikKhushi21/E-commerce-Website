"use client";

import { useEffect, useRef, type VideoHTMLAttributes } from "react";

type AutoplayVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, "autoPlay"> & {
  /** When `false`, force-pause even if visible. Useful for siblings in a horizontal rail
   * where only the centered card should decode. Defaults to `true`. */
  active?: boolean;
};

export function AutoplayVideo({ active = true, ...props }: AutoplayVideoProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const visibleRef = useRef(false);
  const activeRef = useRef(active);

  // Keep activeRef synced with the latest prop without recreating the observer.
  activeRef.current = active;

  // Mount-only IntersectionObserver. Updates visibleRef and re-syncs playback.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const sync = () => {
      if (activeRef.current && visibleRef.current) {
        const promise = el.play();
        if (promise && typeof promise.catch === "function") promise.catch(() => {});
      } else {
        el.pause();
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      visibleRef.current = true;
      sync();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleRef.current = entry.isIntersecting;
          sync();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // React to `active` flips without rebuilding the observer.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active && visibleRef.current) {
      const promise = el.play();
      if (promise && typeof promise.catch === "function") promise.catch(() => {});
    } else {
      el.pause();
    }
  }, [active]);

  return <video ref={ref} muted playsInline preload="metadata" {...props} />;
}
