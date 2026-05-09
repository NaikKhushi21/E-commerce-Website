"use client";

import Link from "next/link";
import { type Product } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { AbsorptionEngine } from "@/components/protocol/AbsorptionEngine";
import { useCart } from "@/components/cart/CartProvider";

export function QuizResults({ products }: { products: Product[] }) {
  const { addItem } = useCart();

  function addAllToCart() {
    const unique = new Map(products.map((product) => [product.id, product]));
    unique.forEach((product) => addItem(product));
  }

  return (
    <section className="space-y-10">
      <div className="max-w-3xl space-y-4">
        <p className="micro-copy text-[var(--muted)]">Protocol Ready</p>
        <h2 className="display-title text-5xl text-[var(--forest)] md:text-7xl">Your personalized stack direction.</h2>
        <p className="body-copy text-base md:text-lg">These formulas align with your selected goals and routine preferences.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={addAllToCart}
          className="rounded-full bg-[var(--forest)] px-6 py-3 text-xs uppercase tracking-[0.14em] text-[var(--on-primary)]"
        >
          Add full stack
        </button>
        <Link href="/products" className="rounded-full border border-[var(--line-strong)] px-6 py-3 text-xs uppercase tracking-[0.14em] text-[var(--forest)]">
          Explore all formulas
        </Link>
      </div>

      <AbsorptionEngine products={products} />

      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product, idx) => (
          <div key={product.id} className="space-y-2.5">
            <ProductCard product={product} index={idx} />
            <button
              onClick={() => addItem(product)}
              className="w-full rounded-full bg-[var(--forest)]/92 px-4 py-2.5 text-xs uppercase tracking-[0.12em] text-[var(--on-primary)]"
            >
              Add {product.title}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
