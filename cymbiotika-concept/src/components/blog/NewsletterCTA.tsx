import Link from "next/link";

export function NewsletterCTA() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--forest)] px-6 py-10 text-[var(--on-primary)] md:px-10 md:py-12">
      <div className="pointer-events-none absolute -left-10 -top-16 h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(228,236,220,0.22)_0%,transparent_70%)]" />
      <p className="micro-copy text-white/70">Continue your routine intelligence</p>
      <h2 className="mt-3 max-w-3xl text-4xl md:text-6xl">Get weekly editorial insights or build your personalized stack now.</h2>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/quiz" className="rounded-full bg-white px-5 py-3 text-xs uppercase tracking-[0.14em] text-[var(--forest)]">
          Start Routine Quiz
        </Link>
        <Link href="/science" className="rounded-full border border-white/45 px-5 py-3 text-xs uppercase tracking-[0.14em] text-white">
          Explore science
        </Link>
      </div>
    </section>
  );
}
