"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type Props = {
  src: string;
  alt: string;
  poster?: string;
  className?: string;
  autoRotate?: boolean;
  onLoaded?: () => void;
};

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
  onLoaded,
}: Props) {
  const [ready, setReady] = useState(modelViewerReady);
  const ref = useRef<HTMLElement | null>(null);

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

  if (!ready) return null;

  return (
    <model-viewer
      ref={ref}
      src={src}
      alt={alt}
      poster={poster}
      auto-rotate={autoRotate}
      auto-rotate-delay="0"
      camera-orbit="auto auto auto"
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
