import { Suspense } from "react";
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
        title="Take a look at the Products."
        right={
          <p className="max-w-md text-body leading-relaxed text-[var(--muted)] md:text-body">
            Liposomal delivery systems and targeted compounds.
          </p>
        }
      />

      <Suspense fallback={<div className="h-[400px] w-full rounded-[2rem] bg-[var(--surface-elevated)]" />}>
        <ProductGridClient products={products} />
      </Suspense>
    </div>
  );
}
