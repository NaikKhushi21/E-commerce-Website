type QuoteBlockProps = {
  quote: string;
  author?: string;
};

export function QuoteBlock({ quote, author }: QuoteBlockProps) {
  return (
    <blockquote className="space-y-3 rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-elevated)] px-5 py-6 md:px-7">
      <p className="text-2xl leading-tight text-[var(--forest)] md:text-4xl">“{quote}”</p>
      {author ? <footer className="text-eyebrow tracking-[0.12em] text-[var(--muted)]">{author}</footer> : null}
    </blockquote>
  );
}
