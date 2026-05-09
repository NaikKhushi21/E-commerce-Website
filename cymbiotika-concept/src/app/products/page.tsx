import { ProductGridClient } from "@/components/product/ProductGridClient";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getShopifyProducts } from "@/lib/shopify-products";

export default async function ProductsPage() {
  const products = await getShopifyProducts();

  return (
    <div className="space-y-12 pb-14 md:space-y-16">
      <SectionHeader
        as="h1"
        eyebrow="All Formulas"
        title="Every formula, arranged by what it does."
        right={
          <p className="max-w-md text-sm leading-relaxed text-[var(--muted)] md:text-base">
            Liposomal delivery systems and targeted compounds. Filter by zone or search ingredients — the grid reorganizes live.
          </p>
        }
      />

      <ProductGridClient products={products} />
    </div>
  );
}
