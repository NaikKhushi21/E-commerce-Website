import Link from "next/link";
import { GOAL_LABELS, WELLNESS_GOALS } from "@/data/goals";
import { FadeIn } from "@/components/motion/FadeIn";

const chipClasses = [
  "bg-white border-[#7aa66b] text-[#2f5130]",
  "bg-white border-[#e6a24f] text-[#7a4a13]",
  "bg-white border-[#5f9f95] text-[#2f5b56]",
];

export function GoalSelector() {
  return (
    <FadeIn>
      <section className="rounded-[2rem] border border-[--brand-mint]/25 bg-white p-6 md:p-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-h2 text-[#1f3126]">Shop by benefit</h2>
          <p className="text-eyebrow tracking-[0.1em] text-[#5c7f66]">Feel the results</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {WELLNESS_GOALS.map((goal, index) => (
            <Link
              key={goal}
              href={`/collections/${goal}`}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition hover:bg-white ${chipClasses[index % chipClasses.length]}`}
            >
              {GOAL_LABELS[goal]}
            </Link>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
