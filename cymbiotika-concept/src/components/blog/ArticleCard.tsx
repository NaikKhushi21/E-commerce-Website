"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AutoplayVideo } from "@/components/ui/AutoplayVideo";
import { SafeImage } from "@/components/ui/SafeImage";
import { type BlogPost } from "@/data/blog-posts";
import { displayCategory, formatCardDate, intentTag } from "@/components/blog/blog-utils";

type ArticleCardProps = {
  post: BlogPost;
  compact?: boolean;
  index?: number;
};

export function ArticleCard({ post, compact = false, index = 0 }: ArticleCardProps) {
  const tall = !compact && index % 3 === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.52, delay: (index % 3) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-[2rem] border border-white/45 bg-[var(--primary)] shadow-[0_8px_22px_rgba(18,18,18,0.06)] transition duration-700 [transition-timing-function:var(--easing-premium)] hover:-translate-y-2 hover:shadow-[0_14px_30px_rgba(18,18,18,0.10)] ${tall ? "md:row-span-2" : ""}`}
    >
      <Link href={`/blog/${post.slug}`} className="block">
        <div className={`relative ${compact ? "h-[520px]" : tall ? "h-[680px]" : "h-[540px]"}`}>
          {post.heroType === "video" ? (
            <AutoplayVideo
              src={post.heroSrc}
              className="h-full w-full object-cover transition duration-1000 [transition-timing-function:var(--easing-premium)] group-hover:scale-105"
              loop
            />
          ) : (
            <SafeImage
              src={post.heroSrc}
              alt={post.heroAlt}
              fill
              className="object-cover transition duration-1000 [transition-timing-function:var(--easing-premium)] group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.18)_28%,rgba(0,0,0,0.55)_62%,rgba(0,0,0,0.88)_100%)]" />
          <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
            <div className="h-full w-full bg-[radial-gradient(circle_at_52%_18%,rgba(255,255,255,0.28),transparent_34%)]" />
          </div>

          <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.16em] text-white/78">
            <span>{displayCategory(post.category)}</span>
            <span>{formatCardDate(post.publishedAt)}</span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
            <div className="mb-5 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/76">
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">{intentTag(post)}</span>
              <span>{post.readTime}</span>
            </div>
            <h3
              className={`display-title line-clamp-5 max-w-[16ch] text-white ${compact ? "text-3xl md:text-4xl" : tall ? "text-5xl md:text-6xl" : "text-4xl md:text-5xl"}`}
              style={{
                textShadow:
                  "0 1px 2px rgba(0,0,0,0.55), 0 4px 18px rgba(0,0,0,0.5), 0 0 32px rgba(0,0,0,0.28)",
              }}
            >
              {post.title}
            </h3>
            <p
              className="mt-4 max-w-md translate-y-3 text-sm leading-relaxed text-white/82 opacity-0 transition duration-700 [transition-timing-function:var(--easing-premium)] group-hover:translate-y-0 group-hover:opacity-100 md:text-base"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}
            >
              {post.excerpt}
            </p>
            <p
              className="mt-6 text-xs uppercase tracking-[0.16em] text-white underline underline-offset-4"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
            >
              Open cover story
            </p>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
