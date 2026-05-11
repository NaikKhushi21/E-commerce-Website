"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type BlogPost } from "@/data/blog-posts";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { BlogHero } from "@/components/blog/BlogHero";
import { BlogTopicRail } from "@/components/blog/BlogTopicRail";
import { FeaturedEditorialGrid } from "@/components/blog/FeaturedEditorialGrid";
import { ReadingPathCards } from "@/components/blog/ReadingPathCards";
import { IngredientSpotlight } from "@/components/blog/IngredientSpotlight";
import { NewsletterCTA } from "@/components/blog/NewsletterCTA";
import { CATEGORIES, type Category, matchesCategory } from "@/components/blog/blog-utils";

const POPULAR_TOPICS = ["Energy", "Sleep", "Stress", "Magnesium", "Glutathione", "Longevity"];

type BlogIndexClientProps = {
  posts: BlogPost[];
};

export function BlogIndexClient({ posts }: BlogIndexClientProps) {
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return posts.filter((post) => {
      if (!matchesCategory(post, category)) return false;
      if (!q) return true;

      const target = `${post.title} ${post.excerpt} ${post.category} ${post.bullets.join(" ")}`.toLowerCase();
      return target.includes(q);
    });
  }, [category, posts, query]);

  const featured = filtered[0];
  const secondary = filtered.slice(1, 3);
  const ingredientPosts = filtered.filter((post) => post.category === "Ingredients");
  const continueLearning = filtered.slice(0, 8);

  const emptySuggestions = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    if (!lowered) return [];

    return CATEGORIES.filter((item) => item !== "All").filter((entry) =>
      posts.some((post) => {
        if (!matchesCategory(post, entry as Category)) return false;
        const target = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase();
        return target.includes(lowered);
      }),
    ).slice(0, 3);
  }, [posts, query]);

  const popularTopicLinks = useMemo(() => {
    return POPULAR_TOPICS.map((topic) => {
      const targetPost = posts.find((post) => {
        const text = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase();
        return text.includes(topic.toLowerCase());
      });

      return {
        topic,
        slug: targetPost?.slug,
      };
    });
  }, [posts]);

  return (
    <div className="space-y-12 pb-10 md:space-y-16">
      <BlogHero query={query} onQueryChange={setQuery} />

      <BlogTopicRail category={category} onChange={setCategory} />

      <section className="space-y-4">
        <p className="micro-copy text-[var(--muted)]">Popular Topics</p>
        <div className="flex flex-wrap gap-2.5">
          {popularTopicLinks.map((item) => (
            <Link
              key={item.topic}
              href={item.slug ? `/blog/${item.slug}` : "/blog"}
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-eyebrow tracking-[0.1em] text-[var(--forest)] transition duration-500 [transition-timing-function:var(--easing-premium)] hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:bg-[var(--surface-elevated)]"
            >
              {item.topic}
            </Link>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="space-y-5 rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-elevated)] p-6 md:p-8">
          <h2 className="text-3xl text-[var(--forest)] md:text-4xl">No articles found for “{query.trim() || "your current filters"}”.</h2>
          <p className="text-body text-[var(--muted)] md:text-body">
            Try {emptySuggestions.length > 0 ? emptySuggestions.join(", ") : "Energy, Ingredients, or Research"}.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
              className="rounded-full bg-[var(--forest)] px-5 py-2 text-eyebrow tracking-[0.1em] text-[var(--on-primary)]"
            >
              Reset filters
            </button>
            <button
              onClick={() => setQuery("")}
              className="rounded-full border border-[var(--line)] px-5 py-2 text-eyebrow tracking-[0.1em] text-[var(--forest)]"
            >
              Clear search
            </button>
          </div>
        </section>
      ) : (
        <>
          <FeaturedEditorialGrid featured={featured} secondary={secondary} />

          <ReadingPathCards posts={filtered} />

          <section className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="micro-copy text-[var(--muted)]">Continue Learning</p>
                <h2 className="mt-2 text-4xl text-[var(--forest)] md:text-5xl">Keep building your protocol literacy.</h2>
              </div>
            </div>

            <div
              data-lenis-prevent
              className="no-scrollbar -mx-5 overflow-x-auto px-5 pb-10 pt-3 md:-mx-12 md:px-12 md:pb-12"
            >
              <div className="flex w-max gap-4">
                {continueLearning.map((post, idx) => (
                  <div key={post.slug} className="w-[min(84vw,420px)] md:w-[430px]">
                    <ArticleCard post={post} compact index={idx} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <IngredientSpotlight posts={ingredientPosts} />

          <NewsletterCTA />
        </>
      )}
    </div>
  );
}
