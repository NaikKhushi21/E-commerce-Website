import { notFound } from "next/navigation";
import { BlogArticleClient } from "@/components/blog/BlogArticleClient";
import { getSanityBlogPostBySlug, getSanityBlogPosts, getSanityBlogSlugs } from "@/lib/sanity-blog";
import { getIngredientAtlas } from "@/lib/sanity-ingredients";

export async function generateStaticParams() {
  const slugs = await getSanityBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, allPosts, ingredientAtlas] = await Promise.all([
    getSanityBlogPostBySlug(slug),
    getSanityBlogPosts(),
    getIngredientAtlas(),
  ]);

  if (!post) {
    notFound();
  }

  const related = allPosts
    .filter((entry) => entry.slug !== post.slug)
    .sort((a, b) => {
      const sameCategoryA = a.category === post.category ? 1 : 0;
      const sameCategoryB = b.category === post.category ? 1 : 0;
      return sameCategoryB - sameCategoryA;
    })
    .slice(0, 6);

  return <BlogArticleClient post={post} related={related} ingredientAtlas={ingredientAtlas} />;
}
