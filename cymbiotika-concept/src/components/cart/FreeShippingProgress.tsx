import { formatMoney } from "@/lib/money";

const FREE_SHIPPING_THRESHOLD = 120;

export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="rounded-2xl border border-[--brand-mint]/25 bg-white p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-[#35533f]">
        <span>Free shipping progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#ececec]">
        <div className="h-full rounded-full bg-[--brand-gold]" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-xs text-[#35533f]">
        {remaining > 0 ? `${formatMoney(remaining)} away from free shipping.` : "Free shipping unlocked."}
      </p>
    </div>
  );
}
