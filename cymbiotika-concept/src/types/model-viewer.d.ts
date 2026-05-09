import type { CSSProperties, DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        poster?: string;
        "camera-controls"?: boolean | string;
        "camera-orbit"?: string;
        bounds?: "tight" | "legacy";
        "auto-rotate"?: boolean | string;
        "rotation-per-second"?: string;
        "field-of-view"?: string;
        "min-field-of-view"?: string;
        "max-field-of-view"?: string;
        "disable-zoom"?: boolean | string;
        "disable-pan"?: boolean | string;
        "disable-tap"?: boolean | string;
        exposure?: string;
        "shadow-intensity"?: string;
        "interaction-prompt"?: string;
        loading?: "auto" | "eager" | "lazy";
        reveal?: "auto" | "interaction" | "manual";
        style?: CSSProperties;
      };
    }
  }
}

export {};
