"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/cn";

const subscribeNoop = () => () => {};

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/quiz", label: "Protocol Quiz" },
  { href: "/science", label: "Science" },
  { href: "/blog", label: "Journal" },
] as const;

export function Header() {
  const { itemCount, openCart } = useCart();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const pathname = usePathname() ?? "/";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_88%,white)]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between px-5 py-4 md:px-12">
        <div className="flex items-center gap-7">
          <Link href="/" className="font-display text-3xl leading-none text-[var(--forest)] md:text-[2rem]">
            Cymbiotika
          </Link>
          <nav className="hidden items-center gap-7 text-sm uppercase tracking-[0.14em] text-[var(--muted)] md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative pb-1 transition-colors duration-500",
                    active
                      ? "text-[var(--forest)] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[var(--accent)]"
                      : "hover:text-[var(--forest)]",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/quiz"
            className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm uppercase tracking-[0.13em] text-[var(--on-primary)] transition-transform duration-500 [transition-timing-function:var(--easing-premium)] hover:scale-[1.015]"
          >
            Start Protocol
          </Link>
          <button
            onClick={openCart}
            className="relative rounded-full border border-[var(--line-strong)] p-2.5 text-[var(--forest)] transition-colors duration-500 hover:bg-[var(--surface-elevated)]"
            aria-label="Open cart"
          >
            <ShoppingBag size={18} />
            {mounted && itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] text-[var(--on-primary)]">
                {itemCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
