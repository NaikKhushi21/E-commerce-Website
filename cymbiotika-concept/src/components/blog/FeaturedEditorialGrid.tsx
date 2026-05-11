import Link from "next/link";
import { AutoplayVideo } from "@/components/ui/AutoplayVideo";
import { SafeImage } from "@/components/ui/SafeImage";
import { type BlogPost } from "@/data/blog-posts";
import { displayCategory, formatCardDate, intentTag } from "@/components/blog/blog-utils";
import { ArticleCard } from "@/components/blog/ArticleCard";

type FeaturedEditorialGridProps = {
  featured?: BlogPost;
  secondary: BlogPost[];
};

export function FeaturedEditorialGrid({ featured, secondary }: FeaturedEditorialGridProps) {
  if (!featured) return null;

  return (
    <section className="grid gap-5 xl:grid-cols-[0.66fr_0.34fr]">
      <article className="group relative flex overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface-elevated)]">
        <div className="relative w-full min-h-[440px] flex-1 overflow-hidden md:min-h-[520px]">
          {featured.heroType === "video" ? (
            <AutoplayVideo
              src={featured.heroSrc}
              className="h-full w-full object-cover transition duration-700 [transition-timing-function:var(--easing-premium)] group-hover:scale-[1.03]"
              loop
            />
          ) : (
            <SafeImage src={featured.heroSrc} alt={featured.heroAlt} fill className="object-cover transition duration-700 [transition-timing-function:var(--easing-premium)] group-hover:scale-[1.03]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.55)_30%,rgba(0,0,0,0.2)_60%,rgba(0,0,0,0)_82%)]" />

          {/* Whole-card tap target → article. Sits above the image/gradient but
              below the bottom content panel so the inner "Explore article" button
              still works. */}
          <Link
            href={`/blog/${featured.slug}`}
            className="absolute inset-0 z-[1]"
            aria-label={featured.title}
          />

          <div className="absolute inset-x-0 bottom-0 z-[2] p-6 text-white md:p-8">
            <div
              className="mb-3 flex flex-wrap items-center gap-2 text-eyebrow tracking-[0.1em] text-white/85"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
            >
              <span className="rounded-full border border-white/45 px-2.5 py-1">Editor&apos;s pick</span>
              <span className="rounded-full border border-white/35 px-2.5 py-1">{displayCategory(featured.category)}</span>
              <span className="rounded-full border border-white/35 px-2.5 py-1">{intentTag(featured)}</span>
              <span>{featured.readTime}</span>
            </div>
            <h2
              className="text-display max-w-3xl leading-[1.02]"
              style={{
                textShadow:
                  "0 1px 2px rgba(0,0,0,0.55), 0 4px 18px rgba(0,0,0,0.5), 0 0 32px rgba(0,0,0,0.28)",
              }}
            >
              {featured.title}
            </h2>
            <p
              className="mt-3 max-w-2xl text-sm text-white/85 md:text-base"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}
            >
              {featured.excerpt}
            </p>
            <div className="mt-5 flex items-center justify-between">
              <p className="text-eyebrow tracking-[0.12em] text-white/70">{formatCardDate(featured.publishedAt)}</p>
              <Link
                href={`/blog/${featured.slug}`}
                className="rounded-full bg-white px-4 py-2 text-eyebrow tracking-[0.1em] text-[var(--forest)] transition hover:bg-[var(--accent)]"
              >
                Explore article
              </Link>
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-5">
        {secondary.map((post, idx) => (
          <ArticleCard key={post.slug} post={post} compact index={idx} />
        ))}
      </div>
    </section>
  );
}
