import type { Review } from "@/lib/sanity-reviews";
import { SectionHeader } from "@/components/ui/SectionHeader";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-[var(--brand-gold)]" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "" : "opacity-25"} aria-hidden>
          ★
        </span>
      ))}
    </div>
  );
}

export function ReviewsModule({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const top = reviews.slice(0, 6);

  return (
    <section className="space-y-8">
      <SectionHeader
        eyebrow="What our community says"
        title="Routines that actually stick."
        subhead="Real responses from people who built a daily routine around our formulas. No paid placements."
      />

      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {top.map((review) => (
          <article
            key={review.id}
            className="flex h-full flex-col justify-between rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface-elevated)] p-6 transition duration-500 [transition-timing-function:var(--easing-premium)] hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(18,18,18,0.08)]"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--forest)]">
                  {review.tag}
                </span>
                <Stars rating={review.rating} />
              </div>
              <blockquote className="mt-5 text-base leading-relaxed text-[var(--forest)] md:text-lg">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              — {review.author}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
