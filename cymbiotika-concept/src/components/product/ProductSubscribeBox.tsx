"use client";

import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Product } from "@/data/products";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/components/cart/CartProvider";

export function ProductSubscribeBox({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [subscribe, setSubscribe] = useState(true);
  const { addItem } = useCart();

  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === variantId) ?? product.variants[0],
    [product.variants, variantId],
  );

  const basePrice = selectedVariant?.price ?? product.price;
  const finalPrice = subscribe ? basePrice * 0.9 : basePrice;

  return (
    <aside className="space-y-4 rounded-3xl border border-[--brand-mint]/25 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-[#5a7f68]">Price</p>
          <p className="font-display text-3xl text-[#1f3126]">{formatMoney(finalPrice, product.currency)}</p>
        </div>
        <div className="rounded-xl border border-[--brand-gold]/45 bg-white px-2 py-1 text-[11px] font-medium text-[#8d5518]">
          Free shipping $120+
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          onClick={() => setSubscribe(false)}
          className={`rounded-2xl border p-3 text-left text-sm transition ${
            !subscribe ? "border-[--brand-gold] bg-white text-[#7a4a13]" : "border-[--brand-mint]/30 bg-white text-[#2f5130]"
          }`}
        >
          One-time purchase
        </button>
        <button
          onClick={() => setSubscribe(true)}
          className={`rounded-2xl border p-3 text-left text-sm transition ${
            subscribe ? "border-[--brand-gold] bg-white text-[#7a4a13]" : "border-[--brand-mint]/30 bg-white text-[#2f5130]"
          }`}
        >
          Subscribe & save 10%
        </button>
      </div>

      <div>
        <label className="mb-1 block text-xs text-[#5a7f68]">Select variant</label>
        <select
          className="w-full rounded-xl border border-[--brand-mint]/30 bg-white p-2 text-sm text-[#1f3126]"
          value={variantId}
          onChange={(event) => setVariantId(event.target.value)}
        >
          {product.variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.title} - {formatMoney(variant.price, product.currency)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1 rounded-xl border border-[--brand-mint]/25 bg-white p-3 text-xs text-[#35533f]">
        <p className="inline-flex items-center gap-1"><CheckCircle2 size={14} /> Pause or cancel anytime (mock)</p>
        <p className="inline-flex items-center gap-1"><CheckCircle2 size={14} /> Priority support and early product drops (mock)</p>
      </div>

      <button className="w-full rounded-full bg-[--brand-gold] px-4 py-3 text-sm font-semibold text-white" onClick={() => addItem(product, selectedVariant?.id)}>
        Add to cart
      </button>
    </aside>
  );
}
