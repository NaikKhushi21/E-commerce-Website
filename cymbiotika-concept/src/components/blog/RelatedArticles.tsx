import { type BlogPost } from "@/data/blog-posts";
import { ArticleCard } from "@/components/blog/ArticleCard";

type RelatedArticlesProps = {
  posts: BlogPost[];
};

export function RelatedArticles({ posts }: RelatedArticlesProps) {
  if (posts.length === 0) return null;

  return (
    <section className="space-y-5">
      <div>
        <p className="micro-copy text-[var(--muted)]">Related Articles</p>
        <h2 className="mt-2 text-4xl text-[var(--forest)] md:text-5xl">Continue reading</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.slice(0, 3).map((post, idx) => (
          <ArticleCard key={post.slug} post={post} compact index={idx} />
        ))}
      </div>
    </section>
  );
}
