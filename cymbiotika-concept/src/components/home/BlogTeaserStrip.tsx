import { ArticleCard } from "@/components/blog/ArticleCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Pill } from "@/components/ui/Pill";
import type { BlogPost } from "@/data/blog-posts";

export function BlogTeaserStrip({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;
  const top = posts.slice(0, 3);

  return (
    <section className="space-y-8">
      <SectionHeader
        eyebrow="From the journal"
        title="Read deeper into the science."
        subhead="Editorial features, creator routines, and daily playbooks — written for people who want to understand what they're taking and why."
        right={
          <Pill
            href="/blog"
            variant="secondary"
            size="sm"
            className="border-0 bg-[var(--surface-elevated)] text-[var(--forest)] hover:bg-[var(--forest)] hover:text-[var(--on-primary)]"
          >
            Read all stories
          </Pill>
        }
      />
      <div className="grid gap-5 md:grid-cols-3 md:gap-7">
        {top.map((post, idx) => (
          <ArticleCard key={post.slug} post={post} compact index={idx} />
        ))}
      </div>
    </section>
  );
}
