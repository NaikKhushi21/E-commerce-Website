import Link from "next/link";

export default function NotFound() {
  return (
    <section className="space-y-6 rounded-[2rem] bg-[var(--primary)] p-8 text-[var(--on-primary)] md:p-10">
      <p className="text-eyebrow tracking-[0.1em] text-white/75">404</p>
      <h1 className="font-sans text-6xl font-medium leading-tight md:text-7xl">Page not found</h1>
      <p className="max-w-xl text-lg text-white/90 md:text-xl">Try browsing products or taking the quiz.</p>
      <Link href="/" className="inline-block rounded-full bg-white px-6 py-3 text-base font-semibold text-[var(--primary)]">
        Back to Products
      </Link>
    </section>
  );
}
