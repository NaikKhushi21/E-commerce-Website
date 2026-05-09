import { ProductCard } from "@/components/product/ProductCard";
import { type Product } from "@/data/products";

export function ProductPairings({ products }: { products: Product[] }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-[#1f3126]">Pairs well with</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
