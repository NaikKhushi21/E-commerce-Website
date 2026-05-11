import Link from "next/link";

export function ArticleCTA() {
  return (
    <section className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--forest)] px-6 py-10 text-[var(--on-primary)] md:px-9">
      <p className="micro-copy text-white/68">Protocol CTA</p>
      <h2 className="mt-3 max-w-3xl text-4xl md:text-5xl">Translate this insight into a personalized daily stack.</h2>
      <p className="mt-3 max-w-2xl text-body text-white/84 md:text-body">
        Use the protocol quiz to build a routine based on your outcomes, schedule, and preferred format.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/quiz" className="rounded-full bg-white px-5 py-2.5 text-eyebrow tracking-[0.1em] text-[var(--forest)]">
          Start quiz
        </Link>
        <Link href="/products" className="rounded-full border border-white/45 px-5 py-2.5 text-eyebrow tracking-[0.1em] text-white">
          Browse formulas
        </Link>
      </div>
    </section>
  );
}
