import { AlertTriangle, BadgeAlert, FlaskConical } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";

const issues = [
  { title: "Low uptake", icon: AlertTriangle, color: "bg-white border-[#ea8c2f] text-[#8a4d10]" },
  { title: "Label noise", icon: BadgeAlert, color: "bg-white border-[#4e8b5b] text-[#2b5133]" },
  { title: "Weak proof", icon: FlaskConical, color: "bg-white border-[#3f7f77] text-[#2b5a55]" },
];

export function SupplementProblem() {
  return (
    <FadeIn>
      <section className="rounded-[2rem] border border-[--brand-mint]/25 bg-white p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[--brand-gold]">Why this feels better</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-[#1f3126] md:text-5xl">Less noise. Better product focus.</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {issues.map((issue) => (
            <article key={issue.title} className={`rounded-2xl border p-4 ${issue.color}`}>
              <issue.icon size={18} />
              <p className="mt-3 text-sm uppercase tracking-[0.12em]">{issue.title}</p>
            </article>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
