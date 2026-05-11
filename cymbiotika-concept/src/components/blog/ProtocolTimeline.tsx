type ProtocolTimelineProps = {
  steps: Array<{ title: string; body: string }>;
};

export function ProtocolTimeline({ steps }: ProtocolTimelineProps) {
  return (
    <section className="space-y-4">
      {steps.map((step, index) => (
        <article key={`${step.title}-${index}`} className="grid gap-3 rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-elevated)] p-4 md:grid-cols-[auto_1fr] md:items-start md:gap-4 md:p-5">
          <p className="text-xl text-[var(--forest)]">{String(index + 1).padStart(2, "0")}</p>
          <div>
            <h4 className="text-h3 text-[var(--forest)]">{step.title}</h4>
            <p className="mt-1 text-body leading-relaxed text-[var(--muted)] md:text-body">{step.body}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
