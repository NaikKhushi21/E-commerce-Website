import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Register our custom typography classes (defined in globals.css @layer
// components) under the `font-size` group so tailwind-merge keeps them
// alongside text-{color} utilities instead of treating them as conflicts.
// Without this, `text-eyebrow text-[var(--primary)]` gets deduplicated to
// just `text-[var(--primary)]`, silently stripping the eyebrow class.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display",
        "text-h1",
        "text-h2",
        "text-h3",
        "text-body",
        "text-large-body",
        "text-small",
        "text-eyebrow",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
