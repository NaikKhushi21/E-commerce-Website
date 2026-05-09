"use client";

import { useEffect, useMemo, useState } from "react";

type TocItem = {
  id: string;
  label: string;
};

type ArticleTocProps = {
  items: TocItem[];
};

export function ArticleToc({ items }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    if (itemIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0.15, 0.3, 0.55] },
    );

    itemIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [itemIds]);

  return (
    <aside className="sticky top-32 hidden space-y-4 lg:block">
      <div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-elevated)] p-4">
        <p className="micro-copy text-[var(--muted)]">In this article</p>
        <nav className="mt-3 space-y-1.5">
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block rounded-lg px-2 py-1.5 text-sm transition ${active ? "bg-[var(--forest)] text-[var(--on-primary)]" : "text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--forest)]"}`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
