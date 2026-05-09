import type { Product } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Pill } from "@/components/ui/Pill";

export function BestSellers({ featured }: { featured: Product[] }) {
  if (featured.length === 0) {
    return (
      <section className="rounded-[2rem] bg-[var(--surface-elevated)] p-8">
        <h2 className="display-title text-4xl text-[var(--forest)] md:text-5xl">Featured products will appear after Shopify sync.</h2>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <SectionHeader
        eyebrow="Curated Formulas"
        title="Daily protocols, curated for momentum."
        right={
          <Pill href="/products" variant="secondary" size="sm">
            Explore all formulas
          </Pill>
        }
      />

      <div
        data-lenis-prevent
        className="no-scrollbar -mx-5 overflow-x-auto px-5 pb-10 pt-3 md:-mx-12 md:px-12 md:pb-12"
      >
        <div className="flex w-max gap-5 md:gap-7">
          {featured.map((product, idx) => (
            <div key={product.id} className="w-[min(82vw,420px)] md:w-[min(44vw,470px)] xl:w-[430px]">
              <ProductCard product={product} index={idx} rotateModelOnHover />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
