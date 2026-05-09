import Link from "next/link";
import { type BlogPost } from "@/data/blog-posts";

const PATHS = [
  { id: "start", title: "Start here", blurb: "A short orientation for how to read protocols and ingredient science." },
  { id: "energy", title: "Energy protocol", blurb: "Morning stack sequencing and consistency cues for stable energy." },
  { id: "gut", title: "Gut health basics", blurb: "Absorption-first fundamentals to support daily digestive resilience." },
  { id: "ingredient", title: "Ingredient deep dives", blurb: "Focused breakdowns of compounds, forms, and intended outcomes." },
] as const;

function selectPathPost(posts: BlogPost[], pathId: string): BlogPost | undefined {
  const byPath = {
    start: ["guide", "protocol", "start", "routine"],
    energy: ["energy", "nad", "performance", "focus"],
    gut: ["gut", "digest", "microbiome", "probiotic"],
    ingredient: ["ingredient", "magnesium", "glutathione", "vitamin"],
  } as const;

  const terms = byPath[pathId as keyof typeof byPath] ?? [];
  return posts.find((post) => {
    const target = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase();
    return terms.some((term) => target.includes(term));
  });
}

type ReadingPathCardsProps = {
  posts: BlogPost[];
};

export function ReadingPathCards({ posts }: ReadingPathCardsProps) {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="micro-copy text-[var(--muted)]">Reading Paths</p>
          <h2 className="mt-2 text-4xl text-[var(--forest)] md:text-5xl">Choose a learning route.</h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PATHS.map((path) => {
          const post = selectPathPost(posts, path.id);
          return (
            <article key={path.id} className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-elevated)] p-5">
              <p className="micro-copy text-[var(--muted)]">{path.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{path.blurb}</p>
              {post ? (
                <Link href={`/blog/${post.slug}`} className="mt-5 inline-block text-sm uppercase tracking-[0.13em] text-[var(--forest)] underline underline-offset-4">
                  Open route
                </Link>
              ) : (
                <p className="mt-5 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Upcoming</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
