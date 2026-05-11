import { IngredientCloud } from "@/components/science/IngredientCloud";
import { LiquidLab } from "@/components/product/LiquidLab";
import { ScienceExperiments } from "@/components/science/ScienceExperiments";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getIngredientAtlas } from "@/lib/sanity-ingredients";

export default async function SciencePage() {
  const atlas = await getIngredientAtlas();

  return (
    <div className="space-y-12 pb-14 md:space-y-16">
      <SectionHeader
        as="h1"
        eyebrow="Science"
        title="Research you move through."
        right={
          <p className="max-w-md text-body leading-relaxed text-[var(--muted)] md:text-body">
            A living field of ingredient signals, review density, routine gravity, and absorption behavior.
          </p>
        }
      />

      <IngredientCloud atlas={atlas} />

      <ScienceExperiments atlas={atlas} />

      <LiquidLab />
    </div>
  );
}