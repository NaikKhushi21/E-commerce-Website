import Link from "next/link";
import { type Product } from "@/data/products";
import { formatMoney } from "@/lib/money";
import { SafeImage } from "@/components/ui/SafeImage";

const PALETTE = ["#3f683a", "#486f41", "#4d7545", "#43683c"];

export function ProtocolProductCard({
  product,
  index = 0,
  selected,
  onToggle,
}: {
  product: Product;
  index?: number;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <article
      className={`rounded-2xl border p-4 text-white ${selected ? "border-white/90" : "border-white/20"}`}
      style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-white/85">{selected ? "Selected" : "Not selected"}</span>
        <button
          onClick={() => onToggle(product.id)}
          className={`rounded-full px-3 py-1 text-sm font-semibold ${selected ? "bg-white text-[var(--primary)]" : "bg-white/20 text-white"}`}
        >
          {selected ? "Remove" : "Select"}
        </button>
      </div>
      <h3 className="text-2xl font-medium">{product.title}</h3>
      <div className="relative mt-3 h-48 w-full">
        <SafeImage src={product.featuredImage} alt={product.title} fill className="object-contain" />
      </div>
      <p className="mt-2 text-sm text-white/85">{product.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-2xl font-semibold">{formatMoney(product.price, product.currency)}</p>
        <Link href={`/products/${product.handle}`} className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--on-primary)]">
          View
        </Link>
      </div>
    </article>
  );
}
