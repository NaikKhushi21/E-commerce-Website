import { type Product } from "@/data/products";
import { ProtocolProductCard } from "@/components/protocol/ProtocolProductCard";

export function ProtocolStack({
  title,
  products,
  selectedIds,
  onToggleSelection,
}: {
  title: string;
  products: Product[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-4xl text-[var(--primary)]">{title}</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {products.length > 0 ? (
          products.map((product, idx) => (
            <ProtocolProductCard
              key={product.id}
              product={product}
              index={idx}
              selected={selectedIds.has(product.id)}
              onToggle={onToggleSelection}
            />
          ))
        ) : (
          <p className="rounded-2xl border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">No products selected yet.</p>
        )}
      </div>
    </section>
  );
}
