"use client";

import type { Product } from "@/data/products";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/components/cart/CartProvider";

export function StickyMobileAddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[--brand-mint]/25 bg-white p-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div>
          <p className="text-body font-medium text-[#1f3126]">{product.title}</p>
          <p className="text-small text-[#4a6a57]">{formatMoney(product.price, product.currency)}</p>
        </div>
        <button className="rounded-full bg-[--brand-gold] px-4 py-2 text-sm font-semibold text-white" onClick={() => addItem(product)}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
