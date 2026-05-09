"use client";

import Image, { type ImageProps } from "next/image";
import { useMemo, useState } from "react";

type SafeImageProps = Omit<ImageProps, "src" | "placeholder" | "blurDataURL"> & {
  src?: string | null;
  fallbackSrc?: string;
  /**
   * Tiny base64-encoded image shown while the real image loads. Pass an explicit
   * blurDataURL when you have one; otherwise SafeImage emits a brand-tinted
   * generic shimmer so images don't pop in. Set to `false` to disable.
   */
  blurDataURL?: string | false;
};

const DEFAULT_FALLBACK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

/**
 * Brand-tinted 8×8 SVG placeholder. Resolves at the same warm-amber tint
 * used by Lab pearl accents — gives loading images a soft cream-gold glow
 * instead of the gray block Next.js generates by default.
 */
const DEFAULT_BLUR =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"><defs><radialGradient id="g" cx="50%" cy="50%" r="60%"><stop offset="0%" stop-color="#f0e1c4"/><stop offset="60%" stop-color="#e6d5b9"/><stop offset="100%" stop-color="#c8d4cb"/></radialGradient></defs><rect width="8" height="8" fill="url(#g)"/></svg>`,
  ).toString("base64");

export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  blurDataURL,
  onError,
  ...props
}: SafeImageProps) {
  const normalized = useMemo(() => {
    const trimmed = (src ?? "").trim();
    if (trimmed.length === 0) {
      return fallbackSrc;
    }

    // Shopify often returns protocol-relative URLs like //cdn.shopify.com/...
    // Next/Image treats those as local paths, so force HTTPS.
    if (trimmed.startsWith("//")) {
      return `https:${trimmed}`;
    }

    return trimmed;
  }, [src, fallbackSrc]);

  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentSrc = failedSrc === normalized ? fallbackSrc : normalized;
  const resolvedSizes =
    props.fill && typeof props.sizes === "undefined"
      ? "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      : props.sizes;

  // Blur-up placeholder behavior:
  //  - explicit blurDataURL string → use it
  //  - `false`            → disable (rare; e.g., transparent product PNGs)
  //  - undefined          → use the brand default shimmer
  const shouldBlur = blurDataURL !== false && currentSrc !== fallbackSrc;
  const blur = blurDataURL || DEFAULT_BLUR;

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      sizes={resolvedSizes}
      placeholder={shouldBlur ? "blur" : "empty"}
      blurDataURL={shouldBlur ? blur : undefined}
      onError={(event) => {
        if (failedSrc !== normalized) {
          setFailedSrc(normalized);
        }
        onError?.(event);
      }}
    />
  );
}
