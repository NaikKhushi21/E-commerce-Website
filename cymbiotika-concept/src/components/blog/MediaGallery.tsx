"use client";

import { useState } from "react";
import { AutoplayVideo } from "@/components/ui/AutoplayVideo";
import { SafeImage } from "@/components/ui/SafeImage";
import { type BlogPost } from "@/data/blog-posts";

type MediaGalleryProps = {
  gallery: NonNullable<BlogPost["gallery"]>;
};

export function MediaGallery({ gallery }: MediaGalleryProps) {
  const [active, setActive] = useState<string | null>(null);
  const featured = gallery[0];
  const stack = gallery.slice(1, 3);

  return (
    <section id="media-gallery" className="space-y-4">
      <h2 className="text-2xl text-[var(--forest)] sm:text-3xl md:text-4xl lg:text-5xl">Media gallery</h2>

      <div className="grid gap-3 md:grid-cols-[0.64fr_0.36fr]">
        {featured ? (
          <button onClick={() => setActive(featured.src)} className="relative h-[420px] overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface-elevated)] text-left">
            {featured.type === "video" ? (
              <AutoplayVideo src={featured.src} className="h-full w-full object-cover" loop />
            ) : (
              <SafeImage src={featured.src} alt={featured.alt} fill className="object-cover" />
            )}
            <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1 text-eyebrow tracking-[0.12em] text-white">View media</span>
          </button>
        ) : null}

        <div className="grid gap-3">
          {stack.map((media, idx) => (
            <button key={`${media.src}-${idx}`} onClick={() => setActive(media.src)} className="relative h-[204px] overflow-hidden rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-elevated)] text-left">
              {media.type === "video" ? (
                <AutoplayVideo src={media.src} className="h-full w-full object-cover" loop />
              ) : (
                <SafeImage src={media.src} alt={media.alt} fill className="object-cover" />
              )}
              <span className="absolute bottom-2 left-2 rounded-full bg-black/45 px-2.5 py-1 text-eyebrow tracking-[0.1em] text-white">
                {idx === 0 ? "Watch protocol demo" : "Ingredient close-up"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div data-lenis-prevent className="no-scrollbar -mx-5 overflow-x-auto px-5 md:hidden">
        <div className="flex w-max gap-3 pb-1">
          {gallery.map((media, idx) => (
            <button key={`${media.src}-${idx}-mobile`} onClick={() => setActive(media.src)} className="relative h-44 w-[78vw] overflow-hidden rounded-[1.2rem] border border-[var(--line)]">
              {media.type === "video" ? (
                <AutoplayVideo src={media.src} className="h-full w-full object-cover" loop />
              ) : (
                <SafeImage src={media.src} alt={media.alt} fill className="object-cover" />
              )}
            </button>
          ))}
        </div>
      </div>

      {active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 p-6" onClick={() => setActive(null)}>
          <div className="relative h-[78vh] w-full max-w-5xl overflow-hidden rounded-[1.4rem] bg-black">
            {gallery.find((entry) => entry.src === active)?.type === "video" ? (
              <video src={active} className="h-full w-full object-contain" controls autoPlay playsInline />
            ) : (
              <SafeImage src={active} alt="Selected gallery media" fill className="object-contain" />
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
