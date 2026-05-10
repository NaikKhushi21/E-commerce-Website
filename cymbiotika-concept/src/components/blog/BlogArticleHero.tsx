import { type BlogPost } from "@/data/blog-posts";
import { displayCategory, formatCardDate } from "@/components/blog/blog-utils";

type BlogArticleHeroProps = {
  post: BlogPost;
};

export function BlogArticleHero({ post }: BlogArticleHeroProps) {
  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
        <span className="rounded-full border border-[var(--line)] px-3 py-1">{displayCategory(post.category)}</span>
        <span>{post.readTime}</span>
        <span>{formatCardDate(post.publishedAt)}</span>
      </div>

      <h1 className="display-title max-w-5xl text-3xl text-[var(--forest)] sm:text-4xl md:text-6xl lg:text-7xl">
        {post.title}
      </h1>
      <p className="body-copy max-w-3xl text-base md:text-xl">{post.excerpt}</p>

      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
        {post.authorName ? <span>Author: {post.authorName}</span> : null}
        {post.reviewedBy ? <span>Reviewed by: {post.reviewedBy}</span> : null}
        {post.scienceNote ? <span>Science note: {post.scienceNote}</span> : null}
      </div>
    </header>
  );
}
