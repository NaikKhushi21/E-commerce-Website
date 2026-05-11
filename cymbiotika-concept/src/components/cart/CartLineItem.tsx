"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { useCart, type CartItem } from "@/components/cart/CartProvider";
import { SafeImage } from "@/components/ui/SafeImage";

export function CartLineItem({ item }: { item: CartItem }) {
  const { removeItem, updateQuantity, toggleSubscription } = useCart();
  const variant = item.product.variants.find((entry) => entry.id === item.variantId);
  const price = variant?.price ?? item.product.price;

  return (
    <article className="rounded-2xl border border-[--brand-mint]/25 bg-white p-3">
      <div className="flex gap-3">
        <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-[--brand-mint]/20">
          <SafeImage src={item.product.featuredImage} alt={item.product.title} fill className="object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-[#1f3126]">{item.product.title}</h4>
            <button className="rounded-lg p-1 text-[#4a6a57] hover:bg-[#f2f2f2]" onClick={() => removeItem(item.id)} aria-label="Remove item">
              <Trash2 size={16} />
            </button>
          </div>
          <p className="mt-1 text-small text-[#4a6a57]">{variant?.title ?? "Default"}</p>
          <label className="mt-2 flex items-center gap-2 text-xs text-[#35533f]">
            <input type="checkbox" className="accent-[--brand-gold]" checked={item.subscription} onChange={() => toggleSubscription(item.id)} />
            Subscribe & save 10%
          </label>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center rounded-full border border-[--brand-mint]/30 bg-white">
              <button className="p-1.5 text-[#35533f]" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">
                <Minus size={14} />
              </button>
              <span className="min-w-8 text-center text-sm text-[#1f3126]">{item.quantity}</span>
              <button className="p-1.5 text-[#35533f]" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">
                <Plus size={14} />
              </button>
            </div>
            <p className="text-body font-semibold text-[#1f3126]">{formatMoney(price * item.quantity * (item.subscription ? 0.9 : 1))}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
