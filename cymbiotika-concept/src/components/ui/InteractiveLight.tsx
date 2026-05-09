"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

type InteractiveLightProps = {
  children: React.ReactNode;
  className?: string;
};

export function InteractiveLight({ children, className }: InteractiveLightProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty("--lx", `${x}%`);
    ref.current.style.setProperty("--ly", `${y}%`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn(
        "interactive-light relative",
        className,
      )}
      style={{
        // Default focal point when there is no pointer interaction.
        ["--lx" as string]: "50%",
        ["--ly" as string]: "50%",
      }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_var(--lx)_var(--ly),rgba(255,255,255,0.42),transparent_46%)] opacity-0 transition-opacity duration-700 [transition-timing-function:var(--easing-premium)] interactive-light-glow" />
      {children}
    </div>
  );
}
