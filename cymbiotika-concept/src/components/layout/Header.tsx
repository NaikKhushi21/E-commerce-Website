"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/cn";

const subscribeNoop = () => () => {};

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/science", label: "Science" },
  { href: "/blog", label: "Journal" },
] as const;

export function Header() {
  const { itemCount, openCart } = useCart();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchFormRef = useRef<HTMLFormElement | null>(null);

  function handleNavSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = navSearch.trim();
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
    setSearchOpen(false);
  }

  // Focus the input as soon as the search expands.
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Collapse on outside click or ESC. Skip when the input has a value so the
  // user doesn't lose what they're typing if they accidentally click away.
  useEffect(() => {
    if (!searchOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (!searchFormRef.current?.contains(event.target as Node)) {
        if (!navSearch) setSearchOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [searchOpen, navSearch]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_88%,white)]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-3 px-5 py-4 md:px-12">
        <div className="flex items-center gap-3 md:gap-7">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-full border border-[var(--line-strong)] p-2.5 text-[var(--forest)] transition-colors duration-300 hover:bg-[var(--surface-elevated)] md:hidden"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            <Menu size={18} />
          </button>

          <Link
            href="/"
            className="font-display text-2xl leading-none text-[var(--forest)] md:text-[2rem]"
          >
            Cymbiotika
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)] md:flex">
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

        <div className="flex items-center gap-2 md:gap-2.5">
          {/* Collapses to an icon-only pill by default; clicking expands it
              into a full search field. Width animation keeps the surrounding
              nav items from jumping. */}
          <form
            ref={searchFormRef}
            onSubmit={handleNavSearch}
            role="search"
            className={cn(
              "flex items-center overflow-hidden rounded-full border border-[var(--line-strong)] bg-[var(--surface-elevated)] transition-[width,border-color] duration-400 [transition-timing-function:var(--easing-premium)] focus-within:border-[var(--forest)]",
              searchOpen ? "w-60 lg:w-72" : "w-11",
            )}
          >
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              className="flex h-11 w-11 shrink-0 items-center justify-center text-[var(--forest)] transition-colors duration-300 hover:bg-[var(--surface)]"
            >
              <Search size={18} aria-hidden />
            </button>
            <input
              ref={searchInputRef}
              type="search"
              value={navSearch}
              onChange={(event) => setNavSearch(event.target.value)}
              placeholder="Search formulas…"
              aria-label="Search formulas"
              tabIndex={searchOpen ? 0 : -1}
              className={cn(
                "w-full min-w-0 bg-transparent pr-4 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] transition-opacity duration-300",
                searchOpen ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            />
          </form>
          <Link
            href="/quiz"
            className="hidden rounded-full bg-[var(--primary)] px-4 py-2 text-sm uppercase tracking-[0.13em] text-[var(--on-primary)] transition-transform duration-500 [transition-timing-function:var(--easing-premium)] hover:scale-[1.015] sm:inline-flex"
          >
            Start Routine
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

    {/* Mobile drawer — sibling of <header> so the header's backdrop-filter
        doesn't create a containing block that clips fixed positioning. */}
    <div
      className={cn(
        "fixed inset-0 z-[60] md:hidden",
        mobileOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!mobileOpen}
    >
        <div
          className={cn(
            "absolute inset-0 bg-[var(--primary)]/55 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className={cn(
            "absolute left-0 top-0 flex h-full w-[88%] max-w-[360px] flex-col bg-[var(--bg)] shadow-[0_20px_40px_rgba(12,31,28,0.18)] transition-transform duration-400 [transition-timing-function:var(--easing-premium)]",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
            <span className="font-display text-2xl text-[var(--forest)]">Cymbiotika</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-full border border-[var(--line-strong)] p-2.5 text-[var(--forest)] transition-colors duration-300 hover:bg-[var(--surface-elevated)]"
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-4 text-base font-semibold uppercase tracking-[0.14em] transition-colors duration-300",
                        active
                          ? "bg-[var(--surface-elevated)] text-[var(--forest)]"
                          : "text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--forest)]",
                      )}
                    >
                      <span>{link.label}</span>
                      {active ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-[var(--line)] px-5 py-5">
            <Link
              href="/quiz"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center rounded-full bg-[var(--primary)] px-5 py-3 text-sm uppercase tracking-[0.13em] text-[var(--on-primary)]"
            >
              Start Routine
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
