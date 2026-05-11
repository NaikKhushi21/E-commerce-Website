import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subhead?: ReactNode;
  /** Optional right-side column (stats, link, button, updated-on label, etc.) */
  right?: ReactNode;
  align?: "left" | "center";
  /** Additional classes for the outer container. */
  className?: string;
  /** Additional classes for the title element. */
  titleClassName?: string;
  /** Render the title as h1 instead of h2. Use once per page for the page-level header. */
  as?: "h1" | "h2" | "h3";
};

export function SectionHeader({
  eyebrow,
  title,
  subhead,
  right,
  align = "left",
  className,
  titleClassName,
  as: Tag = "h2",
}: Props) {
  const isCenter = align === "center";

  const heading = (
    <div className={cn("max-w-3xl", isCenter && "mx-auto text-center")}>
      {eyebrow ? (
        <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">{eyebrow}</p>
      ) : null}
      <Tag
        className={cn(
          "display-title leading-[0.96] text-[var(--forest)]",
          Tag === "h1"
            ? "mt-4 text-[clamp(2.6rem,6vw,5.6rem)]"
            : "mt-4 text-[clamp(2rem,4.4vw,4rem)]",
          titleClassName,
        )}
      >
        {title}
      </Tag>
      {subhead ? (
        <p className="mt-4 max-w-xl text-body leading-relaxed text-[var(--muted)] md:text-body">
          {subhead}
        </p>
      ) : null}
    </div>
  );

  if (!right) {
    return <header className={cn("w-full", className)}>{heading}</header>;
  }

  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-6 md:gap-10",
        className,
      )}
    >
      {heading}
      <div className="md:text-right">{right}</div>
    </header>
  );
}
