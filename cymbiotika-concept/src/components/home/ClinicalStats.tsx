import { FadeIn } from "@/components/motion/FadeIn";

const stats = [
  { label: "Products", value: "10" },
  { label: "Goals", value: "9" },
  { label: "Motion sections", value: "12" },
  { label: "Avg load", value: "<1.8s" },
];

export function ClinicalStats() {
  return (
    <FadeIn>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <article key={stat.label} className={`rounded-2xl border p-4 ${i % 2 === 0 ? "bg-white border-[#4e8b5b]" : "bg-white border-[#ea8c2f]"}`}>
            <p className="font-display text-3xl text-[#1f3126]">{stat.value}</p>
            <p className="mt-1 text-sm text-[#36533d]">{stat.label}</p>
          </article>
        ))}
      </section>
    </FadeIn>
  );
}
