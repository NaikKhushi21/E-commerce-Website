import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-[var(--line)]">
      <div className="mx-auto grid max-w-[1680px] gap-6 px-5 py-7 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:gap-8 md:px-12 md:py-9">
        <div>
          <p className="font-display text-2xl text-[var(--forest)]">Cymbiotika</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            A visual concept for premium, clinically designed daily wellness routines.
          </p>
        </div>
        <div>
          <p className="micro-copy text-[var(--muted)]">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--forest)]">
            <li><Link href="/products" className="transition-opacity hover:opacity-70">Products</Link></li>
            <li><Link href="/science" className="transition-opacity hover:opacity-70">Science</Link></li>
            <li><Link href="/blog" className="transition-opacity hover:opacity-70">Journal</Link></li>
          </ul>
        </div>
        <div>
          <p className="micro-copy text-[var(--muted)]">Note</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Product data syncs from Shopify. Checkout and fulfillment continue in Shopify.
          </p>
        </div>
      </div>
    </footer>
  );
}
