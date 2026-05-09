"use client";

/**
 * Lenis smooth-scroll wrapper. Currently a no-op — every route uses native
 * browser scroll. Reported lag was traced to Lenis's wheel-event interpolation
 * adding latency on top of an already paint-heavy page. Native scroll is
 * snappier and free.
 *
 * Kept as a component (not deleted) so re-enabling is a one-edit change if we
 * ever revisit per-route smooth scroll.
 */
export function SmoothScroll() {
  return null;
}
