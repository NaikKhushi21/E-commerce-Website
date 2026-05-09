import { BlogIndexClient } from "@/components/blog/BlogIndexClient";
import { getSanityBlogPosts } from "@/lib/sanity-blog";

export default async function BlogPage() {
  const posts = await getSanityBlogPosts();

  return (
    <div className="pb-12">
      <BlogIndexClient posts={posts} />
    </div>
  );
}
