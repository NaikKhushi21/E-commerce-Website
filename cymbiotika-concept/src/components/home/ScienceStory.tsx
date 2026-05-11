import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

const bullets = ["Absorption", "Ingredient Quality", "Clinical Structure"];

export function ScienceStory() {
  return (
    <section className="rounded-[2rem] border border-[--brand-mint]/25 bg-white p-6 md:p-7">
      <p className="text-eyebrow tracking-[0.1em] text-[--brand-mint]">Science Story</p>
      <h2 className="mt-2 max-w-2xl text-h2 text-[#1f3126]">Simple science, beautiful presentation.</h2>
      <Stagger className="mt-5 grid gap-3 md:grid-cols-3">
        {bullets.map((bullet, i) => (
          <StaggerItem key={bullet} className={`rounded-2xl border p-4 text-sm ${i % 2 === 0 ? "bg-white border-[#4e8b5b] text-[#2f5130]" : "bg-white border-[#ea8c2f] text-[#7a4a13]"}`}>
            {bullet}
          </StaggerItem>
        ))}
      </Stagger>
      <Link href="/science" className="mt-6 inline-block rounded-full border border-[--brand-mint]/35 bg-white px-4 py-2 text-sm text-[#1f3126] hover:bg-white">
        Dive into science page
      </Link>
    </section>
  );
}
