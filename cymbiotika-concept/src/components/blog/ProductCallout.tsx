import Link from "next/link";

type ProductCalloutProps = {
  productSlug: string;
  title: string;
  description: string;
};

export function ProductCallout({ productSlug, title, description }: ProductCalloutProps) {
  return (
    <section className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--forest)] px-5 py-6 text-[var(--on-primary)] md:px-6">
      <p className="micro-copy text-white/70">Recommended Formula</p>
      <h3 className="mt-2 text-3xl md:text-4xl">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm text-white/85 md:text-base">{description}</p>
      <Link href={`/products/${productSlug}`} className="mt-5 inline-block rounded-full bg-white px-4 py-2 text-xs uppercase tracking-[0.14em] text-[var(--forest)]">
        View formula
      </Link>
    </section>
  );
}
