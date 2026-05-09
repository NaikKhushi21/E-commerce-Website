"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AutoplayVideo } from "@/components/ui/AutoplayVideo";
import { SafeImage } from "@/components/ui/SafeImage";
import { type BlogPost } from "@/data/blog-posts";
import type { IngredientEntry } from "@/lib/sanity-ingredients";
import { BlogArticleHero } from "@/components/blog/BlogArticleHero";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ArticleToc } from "@/components/blog/ArticleToc";
import { ContentBlockRenderer } from "@/components/blog/ContentBlockRenderer";
import { MediaGallery } from "@/components/blog/MediaGallery";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { ArticleCTA } from "@/components/blog/ArticleCTA";
import { ReadingLens } from "@/components/blog/ReadingLens";
import {
  type Lens,
  blockVisibleAtLens,
  galleryVisibleAtLens,
} from "@/components/blog/reading-lens";

type BlogArticleClientProps = {
  post: BlogPost;
  related: BlogPost[];
  ingredientAtlas?: Record<string, IngredientEntry>;
};

export function BlogArticleClient({ post, related, ingredientAtlas }: BlogArticleClientProps) {
  const [lens, setLens] = useState<Lens>("standard");

  const tocItems = useMemo(() => {
    const items: Array<{ id: string; label: string }> = [{ id: "article-overview", label: "Overview" }];

    const blocks = post.contentBlocks ?? [];
    if (blocks.length > 0) {
      const visible = blocks.filter((block) => blockVisibleAtLens(block.type, lens));
      visible.forEach((block, index) => {
        const id = `block-${index + 1}`;
        if (block.type === "richText") {
          items.push({ id, label: block.heading });
          return;
        }
        const labelMap = {
          quote: "Quote",
          statGrid: "Stats",
          productCallout: "Product callout",
          comparison: "Comparison",
          timeline: "Protocol timeline",
          faq: "FAQ",
          callout: "Callout",
          inlineImage: "Image",
          citations: "References",
        } as const;
        items.push({ id, label: labelMap[block.type] });
      });
    } else {
      const fallback = post.sections && post.sections.length > 0
        ? post.sections
        : post.bullets.map((bullet, index) => ({ heading: `Section ${index + 1}`, body: bullet }));
      fallback.forEach((section, index) => {
        items.push({ id: `story-${index + 1}`, label: section.heading });
      });
    }

    const showGallery = post.gallery && post.gallery.length > 0 && galleryVisibleAtLens(lens);
    if (showGallery) items.push({ id: "media-gallery", label: "Media gallery" });
    if (post.bullets.length > 0) items.push({ id: "takeaways", label: "Takeaways" });

    return items;
  }, [post.bullets, post.contentBlocks, post.gallery, post.sections, lens]);

  const showGallery = Boolean(post.gallery && post.gallery.length > 0) && galleryVisibleAtLens(lens);

  return (
    <article className="space-y-12 pb-16 md:space-y-16">
      <ReadingProgress />

      <div>
        <Link href="/blog" className="text-xs uppercase tracking-[0.12em] text-[var(--forest)] underline underline-offset-4">
          Back to Journal
        </Link>
      </div>

      <section id="article-overview">
        <BlogArticleHero post={post} />
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface-elevated)]">
        <div className="relative h-[52svh] min-h-[360px] md:h-[72svh] md:min-h-[540px]">
          {post.heroType === "video" ? (
            <AutoplayVideo src={post.heroSrc} className="h-full w-full object-cover" loop />
          ) : (
            <SafeImage src={post.heroSrc} alt={post.heroAlt} fill className="object-cover" />
          )}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[0.3fr_0.7fr] lg:items-start">
        <ArticleToc items={tocItems} />

        <div className="space-y-10">
          <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-elevated)]/60 px-5 py-4 md:px-6">
            <ReadingLens lens={lens} onChange={setLens} />
          </div>

          <ContentBlockRenderer post={post} ingredientAtlas={ingredientAtlas} lens={lens} />

          {showGallery ? <MediaGallery gallery={post.gallery!} /> : null}

          {post.bullets.length > 0 ? (
            <section id="takeaways" className="space-y-4">
              <p className="micro-copy text-[var(--muted)]">Key Takeaways</p>
              <div className="space-y-3">
                {post.bullets.map((bullet, index) => (
                  <article key={bullet} className="grid gap-2 border-b border-[var(--line)] pb-3 md:grid-cols-[auto_1fr] md:gap-4">
                    <p className="text-2xl text-[var(--forest)]">{String(index + 1).padStart(2, "0")}</p>
                    <p className="text-base leading-relaxed text-[var(--muted)] md:text-lg">{bullet}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>

      <RelatedArticles posts={related} />
      <ArticleCTA />
    </article>
  );
}
