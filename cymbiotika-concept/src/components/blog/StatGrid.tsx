type StatGridProps = {
  stats: Array<{ value: string; label: string; detail?: string }>;
};

export function StatGrid({ stats }: StatGridProps) {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {stats.map((stat) => (
        <article key={`${stat.value}-${stat.label}`} className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-elevated)] px-4 py-4">
          <p className="text-4xl text-[var(--forest)] md:text-5xl">{stat.value}</p>
          <p className="mt-2 text-eyebrow tracking-[0.12em] text-[var(--muted)]">{stat.label}</p>
          {stat.detail ? <p className="mt-2 text-body text-[var(--muted)]">{stat.detail}</p> : null}
        </article>
      ))}
    </section>
  );
}
