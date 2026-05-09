export function ProductBenefits({ benefits }: { benefits: string[] }) {
  return (
    <section className="rounded-3xl border border-[--brand-mint]/25 bg-white p-5">
      <h2 className="font-display text-2xl text-[#1f3126]">Why customers choose this</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {benefits.map((benefit) => (
          <li key={benefit} className="rounded-2xl border border-[--brand-mint]/25 bg-white px-3 py-3 text-sm text-[#2f5130]">
            {benefit}
          </li>
        ))}
      </ul>
    </section>
  );
}
