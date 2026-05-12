"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

/* ============================================================================
   OverlayContext — counts how many full-screen overlays are currently open.
   ----------------------------------------------------------------------------
   Used so floating UI (e.g. VialChat) can hide when a drawer, modal, or
   mobile nav is on top of it. Each overlay calls `acquire()` on open and the
   returned `release()` on close. The hook returns `isOpen` (count > 0).
   ========================================================================== */

type OverlayCtx = {
  count: number;
  /** Increment the overlay counter and return a release fn that decrements
   *  it. Pair calls inside a useEffect so cleanup runs on unmount. */
  acquire: () => () => void;
};

const Ctx = createContext<OverlayCtx | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const acquire = useCallback(() => {
    setCount((c) => c + 1);
    return () => setCount((c) => Math.max(0, c - 1));
  }, []);

  return <Ctx.Provider value={{ count, acquire }}>{children}</Ctx.Provider>;
}

export function useOverlay() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOverlay must be used inside OverlayProvider");
  return v;
}

/** Convenience: true when any overlay is currently registered. */
export function useAnyOverlayOpen() {
  return useOverlay().count > 0;
}
