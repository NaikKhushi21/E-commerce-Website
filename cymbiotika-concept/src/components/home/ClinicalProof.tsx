import { FadeIn } from "@/components/motion/FadeIn";

const studies = [
  { name: "Glutathione", metric: "+50%" },
  { name: "Magnesium", metric: "71%" },
  { name: "Delivery", metric: "3x" },
];

export function ClinicalProof() {
  return (
    <FadeIn>
      <section className="grid gap-5 rounded-[2rem] border border-[--brand-gold]/30 bg-white p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[--brand-mint]">Proof Snapshot</p>
          <h2 className="mt-2 font-display text-4xl leading-tight text-[#1f3126]">Data-forward. Visual-first.</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {studies.map((study, i) => (
              <article key={study.name} className={`rounded-2xl border p-4 ${i % 2 === 0 ? "bg-white border-[#4e8b5b]" : "bg-white border-[#ea8c2f]"}`}>
                <p className="text-xs text-[#34513a]">{study.name}</p>
                <p className="mt-2 font-display text-3xl text-[#1f3126]">{study.metric}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[--brand-teal]/30 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#2b5a55]">Comparison</p>
          <div className="mt-3 space-y-2 text-sm text-[#274c48]">
            <p>Transparent formulas</p>
            <p>Product-centric UX</p>
            <p>Guided wellness flow</p>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
