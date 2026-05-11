import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { type BlogPost } from "@/data/blog-posts";
import type { IngredientEntry } from "@/lib/sanity-ingredients";
import { SafeImage } from "@/components/ui/SafeImage";
import { QuoteBlock } from "@/components/blog/QuoteBlock";
import { StatGrid } from "@/components/blog/StatGrid";
import { ProductCallout } from "@/components/blog/ProductCallout";
import { ProtocolTimeline } from "@/components/blog/ProtocolTimeline";
import { IngredientHoverCard } from "@/components/blog/IngredientHoverCard";
import { type Lens, blockVisibleAtLens } from "@/components/blog/reading-lens";

function buildRichTextComponents(
  atlas: Record<string, IngredientEntry> | undefined,
): PortableTextComponents {
  return {
    block: {
      normal: ({ children }) => (
        <p className="max-w-3xl text-body leading-relaxed text-[var(--muted)] md:text-lg">{children}</p>
      ),
      h3: ({ children }) => (
        <h3 className="text-h2 mt-2 max-w-3xl text-[var(--forest)]">{children}</h3>
      ),
      h4: ({ children }) => (
        <h4 className="mt-2 max-w-3xl text-lg uppercase tracking-[0.1em] text-[var(--forest)] md:text-xl">{children}</h4>
      ),
      blockquote: ({ children }) => (
        <blockquote className="max-w-3xl border-l-2 border-[var(--forest)] pl-5 text-lg italic leading-relaxed text-[var(--forest)] md:text-xl">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className="ml-5 max-w-3xl list-disc space-y-1.5 text-base leading-relaxed text-[var(--muted)] md:text-lg">
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className="ml-5 max-w-3xl list-decimal space-y-1.5 text-base leading-relaxed text-[var(--muted)] md:text-lg">
          {children}
        </ol>
      ),
    },
    marks: {
      strong: ({ children }) => <strong className="text-[var(--forest)]">{children}</strong>,
      em: ({ children }) => <em>{children}</em>,
      highlight: ({ children }) => (
        <mark className="rounded-[0.25rem] bg-[rgba(140,224,214,0.18)] px-1 text-[var(--forest)]">
          {children}
        </mark>
      ),
      link: ({ value, children }) => {
        const href: string = value?.href ?? "#";
        const newTab = Boolean(value?.newTab);
        return (
          <a
            href={href}
            target={newTab ? "_blank" : undefined}
            rel={newTab ? "noreferrer" : undefined}
            className="text-[var(--forest)] underline underline-offset-4 hover:opacity-80"
          >
            {children}
          </a>
        );
      },
      ingredient: ({ value, children }) => {
        const slug: string | undefined = value?.slug;
        if (!slug) return <span className="text-[var(--forest)]">{children}</span>;
        const entry = atlas?.[slug];
        return (
          <IngredientHoverCard slug={slug} entry={entry}>
            {children}
          </IngredientHoverCard>
        );
      },
    },
  };
}

const CALLOUT_VARIANT: Record<
  "info" | "clinical" | "warning" | "tip",
  { accent: string; tint: string; label: string }
> = {
  info: { accent: "#8ce0d6", tint: "rgba(140, 224, 214, 0.10)", label: "Note" },
  clinical: { accent: "#d7c3a7", tint: "rgba(215, 195, 167, 0.12)", label: "Clinical" },
  warning: { accent: "#f5b75f", tint: "rgba(245, 183, 95, 0.12)", label: "Caution" },
  tip: { accent: "#ecf2ee", tint: "rgba(236, 242, 238, 0.08)", label: "Tip" },
};

const ACCENT_BORDER: Record<"none" | "teal" | "gold" | "cream", string> = {
  none: "var(--line)",
  teal: "rgba(140, 224, 214, 0.45)",
  gold: "rgba(245, 183, 95, 0.45)",
  cream: "rgba(215, 195, 167, 0.45)",
};

type ContentBlockRendererProps = {
  post: BlogPost;
  ingredientAtlas?: Record<string, IngredientEntry>;
  lens?: Lens;
};

export function ContentBlockRenderer({ post, ingredientAtlas, lens = "standard" }: ContentBlockRendererProps) {
  const richTextComponents = buildRichTextComponents(ingredientAtlas);
  const allBlocks = post.contentBlocks && post.contentBlocks.length > 0 ? post.contentBlocks : [];
  const richBlocks = allBlocks.filter((block) => blockVisibleAtLens(block.type, lens));

  if (allBlocks.length === 0) {
    const fallbackSections =
      post.sections && post.sections.length > 0
        ? post.sections
        : post.bullets.map((bullet, index) => ({ heading: `Section ${index + 1}`, body: bullet }));

    return (
      <section id="article-story" className="space-y-8">
        {fallbackSections.map((section, index) => (
          <article key={`${section.heading}-${index}`} id={`story-${index + 1}`} className="space-y-3">
            <h2 className="text-2xl text-[var(--forest)] sm:text-3xl md:text-4xl lg:text-5xl">{section.heading}</h2>
            <p className="max-w-3xl text-body leading-relaxed text-[var(--muted)] md:text-lg">{section.body}</p>
          </article>
        ))}
      </section>
    );
  }

  if (richBlocks.length === 0) {
    return (
      <section id="article-story" className="rounded-[1.4rem] border border-dashed border-[var(--line)] bg-[var(--surface-elevated)]/60 p-6 text-center">
        <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">
          Nothing surfaces at this depth
        </p>
        <p className="mt-2 text-body text-[var(--muted)]">
          Try Standard or Deep to read the full piece.
        </p>
      </section>
    );
  }

  return (
    <section id="article-story" className="space-y-9">
      {richBlocks.map((block, index) => {
        const id = `block-${index + 1}`;

        if (block.type === "richText") {
          return (
            <article key={id} id={id} className="space-y-4">
              {block.eyebrow ? <p className="micro-copy text-[var(--muted)]">{block.eyebrow}</p> : null}
              <h2 className="max-w-4xl text-2xl text-[var(--forest)] sm:text-3xl md:text-4xl lg:text-5xl">{block.heading}</h2>
              <div className="space-y-3">
                <PortableText value={block.body} components={richTextComponents} />
              </div>
            </article>
          );
        }

        if (block.type === "quote") {
          return (
            <section key={id} id={id}>
              <QuoteBlock quote={block.quote} author={block.author} />
            </section>
          );
        }

        if (block.type === "statGrid") {
          return (
            <section key={id} id={id}>
              <StatGrid stats={block.stats} />
            </section>
          );
        }

        if (block.type === "productCallout") {
          return (
            <section key={id} id={id}>
              <ProductCallout
                productSlug={block.productSlug}
                title={block.title}
                description={block.description}
              />
            </section>
          );
        }

        if (block.type === "comparison") {
          return (
            <section key={id} id={id} className="overflow-hidden rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-elevated)]">
              <div className="grid grid-cols-3 border-b border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-eyebrow tracking-[0.12em] text-[var(--muted)]">
                <span>Attribute</span>
                <span>{block.leftTitle}</span>
                <span>{block.rightTitle}</span>
              </div>
              <div>
                {block.rows.map((row) => (
                  <div key={`${row.label}-${row.left}-${row.right}`} className="grid grid-cols-3 gap-3 border-b border-[var(--line)] px-4 py-3 text-sm text-[var(--forest)] last:border-b-0">
                    <span>{row.label}</span>
                    <span className="text-[var(--muted)]">{row.left}</span>
                    <span className="text-[var(--muted)]">{row.right}</span>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === "timeline") {
          return (
            <section key={id} id={id}>
              <ProtocolTimeline steps={block.steps} />
            </section>
          );
        }

        if (block.type === "faq") {
          return (
            <section key={id} id={id} className="space-y-2">
              {block.items.map((item) => (
                <details key={item.question} className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface-elevated)] px-4 py-3">
                  <summary className="cursor-pointer text-base text-[var(--forest)]">{item.question}</summary>
                  <p className="mt-2 text-body leading-relaxed text-[var(--muted)] md:text-body">{item.answer}</p>
                </details>
              ))}
            </section>
          );
        }

        if (block.type === "callout") {
          const v = CALLOUT_VARIANT[block.variant];
          return (
            <aside
              key={id}
              id={id}
              className="relative overflow-hidden rounded-[1.4rem] border-l-[3px] px-5 py-5 md:px-6 md:py-6"
              style={{
                borderLeftColor: v.accent,
                background: v.tint,
              }}
            >
              <p
                className="text-eyebrow tracking-[0.1em]"
                style={{ color: v.accent }}
              >
                {block.eyebrow ?? v.label}
              </p>
              <h3 className="text-h3 mt-2 max-w-3xl text-[var(--forest)]">
                {block.title}
              </h3>
              <p className="mt-2 max-w-3xl whitespace-pre-line text-body leading-relaxed text-[var(--muted)] md:text-body">
                {block.body}
              </p>
            </aside>
          );
        }

        if (block.type === "inlineImage") {
          return (
            <figure
              key={id}
              id={id}
              className="overflow-hidden rounded-[1.4rem] border bg-[var(--surface-elevated)]"
              style={{ borderColor: ACCENT_BORDER[block.accent] }}
            >
              <div className="relative aspect-[16/9] w-full">
                <SafeImage
                  src={block.src}
                  alt={block.alt}
                  fill
                  className="object-cover"
                />
              </div>
              {block.caption || block.credit ? (
                <figcaption className="flex flex-col gap-1 px-5 py-3 text-sm text-[var(--muted)] md:flex-row md:items-baseline md:justify-between">
                  {block.caption ? <span className="text-[var(--forest)]">{block.caption}</span> : <span />}
                  {block.credit ? (
                    <span className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">
                      {block.credit}
                    </span>
                  ) : null}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        if (block.type === "citations") {
          return (
            <section
              key={id}
              id={id}
              className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-elevated)] px-5 py-5 md:px-7 md:py-6"
            >
              <p className="text-eyebrow tracking-[0.1em] text-[var(--muted)]">
                {block.eyebrow ?? "References"}
              </p>
              <ol className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                {block.items.map((item, idx) => (
                  <li key={`${item.title}-${idx}`} className="grid gap-2 md:grid-cols-[auto_1fr] md:gap-4">
                    <span className="font-mono text-[11px] tabular-nums text-[var(--forest)]">
                      [{String(idx + 1).padStart(2, "0")}]
                    </span>
                    <span className="leading-relaxed">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--forest)] underline underline-offset-4 hover:text-[var(--forest)]"
                        >
                          {item.title}
                        </a>
                      ) : (
                        <span className="text-[var(--forest)]">{item.title}</span>
                      )}
                      {item.authors ? <span className="text-[var(--muted)]"> — {item.authors}</span> : null}
                      {item.journal || item.year ? (
                        <span className="block text-eyebrow tracking-[0.1em] text-[var(--muted)]">
                          {[item.journal, item.year].filter(Boolean).join(" · ")}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          );
        }

        return null;
      })}
    </section>
  );
}
