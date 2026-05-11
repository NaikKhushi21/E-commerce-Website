"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type Props = {
  src: string;
  alt: string;
  poster?: string;
  className?: string;
  autoRotate?: boolean;
  /**
   * Initial camera position the model is shown from on mount and snapped back
   * to whenever auto-rotation turns off (e.g., when the mouse leaves a card).
   * Format: "theta phi radius". When omitted, ProductModelViewer first
   * consults MODEL_ORBITS for a per-file override (each scan was exported
   * with a different forward axis), then falls back to DEFAULT_FRONT_ORBIT.
   */
  defaultOrbit?: string;
  onLoaded?: () => void;
};

const DEFAULT_FRONT_ORBIT = "-90deg 90deg auto";

/**
 * Per-file front-facing orbit. Each scan was authored with a different
 * forward axis, so a single global default rotates some models to the back
 * or the side seam. Keys match the basename of the Shopify MODEL_3D URL,
 * which preserves the upload filename.
 */
const MODEL_ORBITS: Record<string, string> = {
  "colestrum.glb": "-270deg 90deg auto",
  "glutathione_left.glb": "90deg 90deg auto",
  "vitamin-c.glb": "0deg 90deg auto",
  "seamoss_left.glb": "90deg 90deg auto",
};

function resolveOrbit(src: string, explicit: string | undefined): string {
  if (explicit && explicit !== DEFAULT_FRONT_ORBIT) return explicit;
  const basename = src.split("/").pop()?.split("?")[0] ?? "";
  return MODEL_ORBITS[basename] ?? explicit ?? DEFAULT_FRONT_ORBIT;
}

let modelViewerReady = false;
let modelViewerLoader: Promise<void> | null = null;
const MODEL_VIEWER_STYLE: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "block",
  pointerEvents: "none",
  cursor: "default",
  contain: "content",
  transform: "translateZ(0)",
};

function ensureModelViewerReady() {
  if (modelViewerReady) {
    return Promise.resolve();
  }
  if (!modelViewerLoader) {
    modelViewerLoader = import("@google/model-viewer").then(() => {
      modelViewerReady = true;
    });
  }
  return modelViewerLoader;
}

export function ProductModelViewer({
  src,
  alt,
  poster,
  className,
  autoRotate = true,
  defaultOrbit,
  onLoaded,
}: Props) {
  const [ready, setReady] = useState(modelViewerReady);
  const ref = useRef<HTMLElement | null>(null);
  const orbit = resolveOrbit(src, defaultOrbit);

  useEffect(() => {
    let mounted = true;
    ensureModelViewerReady()
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch(() => {
        if (mounted) setReady(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // model-viewer dispatches a `load` event when the .glb is fully parsed and
  // rendered. Wire it back up so the parent can hide its skeleton at the
  // exact moment pixels are ready.
  useEffect(() => {
    if (!ready || !onLoaded) return;
    const el = ref.current;
    if (!el) return;
    const handler = () => onLoaded();
    el.addEventListener("load", handler);
    return () => el.removeEventListener("load", handler);
  }, [onLoaded, ready, src]);

  // Snap the camera back to the front-facing orbit whenever auto-rotation
  // stops (i.e., the user's cursor left the card). model-viewer animates the
  // transition via its own interpolation, so this looks like a smooth reset.
  useEffect(() => {
    if (!ready) return;
    const el = ref.current as (HTMLElement & {
      cameraOrbit?: string;
      resetTurntableRotation?: () => void;
    }) | null;
    if (!el) return;
    if (!autoRotate) {
      el.resetTurntableRotation?.();
      if (orbit) el.cameraOrbit = orbit;
    }
  }, [autoRotate, ready, orbit]);

  if (!ready) return null;

  return (
    <model-viewer
      ref={ref}
      src={src}
      alt={alt}
      poster={poster}
      auto-rotate={autoRotate}
      auto-rotate-delay="0"
      camera-orbit={orbit}
      interpolation-decay="180"
      bounds="tight"
      disable-zoom
      disable-pan
      disable-tap
      rotation-per-second="22deg"
      shadow-intensity="0"
      exposure="1"
      interaction-prompt="none"
      loading="lazy"
      reveal="auto"
      className={className}
      style={MODEL_VIEWER_STYLE}
    >
      <div slot="progress-bar" style={{ display: "none" }} />
    </model-viewer>
  );
}
