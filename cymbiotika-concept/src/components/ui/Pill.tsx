"use client";

import Link from "next/link";
import type { ReactNode, MouseEventHandler } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  children: ReactNode;
  /** Optional label override for accessibility when children are non-text. */
  "aria-label"?: string;
};

type ButtonProps = CommonProps & {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  href?: never;
  external?: never;
  type?: "button" | "submit" | "reset";
};

type LinkProps = CommonProps & {
  href: string;
  /** When true, render as native anchor with target="_blank". */
  external?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  type?: never;
};

type PillProps = ButtonProps | LinkProps;

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--on-primary)] hover:scale-[1.02] active:scale-[0.99]",
  secondary:
    "border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--text)]/40 hover:bg-[var(--surface-elevated)]",
  ghost:
    "text-[var(--muted)] hover:text-[var(--text)]",
  accent:
    "bg-[color-mix(in_srgb,var(--accent)_92%,white)] text-[var(--on-primary)] hover:scale-[1.02]",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-4 py-2 text-[10px] tracking-[0.22em]",
  md: "px-6 py-2.5 text-[11px] tracking-[0.24em]",
  lg: "px-7 py-3.5 text-xs tracking-[0.24em]",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full uppercase font-medium transition disabled:cursor-not-allowed disabled:opacity-40";

export function Pill(props: PillProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    disabled,
    children,
  } = props;
  const computed = cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className);

  if ("href" in props && props.href !== undefined) {
    if (props.external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noreferrer noopener"
          className={computed}
          aria-disabled={disabled || undefined}
          aria-label={props["aria-label"]}
          onClick={props.onClick}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={props.href}
        className={computed}
        aria-label={props["aria-label"]}
        onClick={props.onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={disabled}
      className={computed}
      aria-label={props["aria-label"]}
    >
      {children}
    </button>
  );
}
