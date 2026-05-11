"use client";

type BlogHeroProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

export function BlogHero({ query, onQueryChange }: BlogHeroProps) {
  return (
    <section className="grid gap-6 md:grid-cols-[0.7fr_0.3fr] md:items-end">
      <div>
        <p className="micro-copy text-[var(--muted)]">Journal</p>
        <h1 className="text-display mt-3 max-w-5xl text-[var(--forest)]">Editorial wellness intelligence for modern routines.</h1>
        <p className="text-body mt-4 max-w-2xl text-body md:text-lg">
          Research-backed explainers, ingredient deep dives, and protocol guides designed for practical daily implementation.
        </p>
      </div>

      <div className="md:justify-self-end md:w-full md:max-w-sm">
        <label htmlFor="blog-search" className="micro-copy text-[var(--muted)]">Search Journal</label>
        <input
          id="blog-search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Try magnesium, energy, gut..."
          className="mt-2 h-12 w-full rounded-full border border-[var(--line)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--forest)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--line-strong)]"
        />
      </div>
    </section>
  );
}
