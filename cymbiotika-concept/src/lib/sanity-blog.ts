import type { PortableTextBlock } from "@portabletext/react";
import type { BlogPost } from "@/data/blog-posts";

function legacyStringToPortableText(text: string): PortableTextBlock[] {
  // Split paragraphs on blank lines so existing newline-separated bodies render
  // as multiple paragraph blocks instead of one big run.
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs.map((paragraph, i) => ({
    _type: "block",
    _key: `legacy-${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `legacy-${i}-0`, text: paragraph, marks: [] }],
  }));
}

function coerceRichTextBody(value: unknown): PortableTextBlock[] | null {
  if (Array.isArray(value)) {
    return value.length > 0 ? (value as PortableTextBlock[]) : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return legacyStringToPortableText(trimmed);
  }
  return null;
}

type SanityQueryResult = {
  result?: unknown;
};

type SanityBlogDoc = {
  _type?: "researchFeature" | "influencerExperience" | "protocolPlaybook";
  slug?: string;
  title?: string;
  excerpt?: string;
  category?: BlogPost["category"];
  readTime?: string;
  publishedAt?: string;
  authorName?: string;
  reviewedBy?: string;
  scienceNote?: string;
  heroType?: "image" | "video";
  heroAlt?: string;
  heroImageUrl?: string;
  heroVideoUrl?: string;
  bullets?: string[];
  mediaGallery?: Array<{
    assetUrl?: string;
    _type?: string;
  }>;
  storySections?: Array<{
    heading?: string;
    body?: string;
  }>;
  contentBlocks?: Array<{
    _type?: string;
    eyebrow?: string;
    heading?: string;
    body?: unknown;
    quote?: string;
    author?: string;
    stats?: Array<{
      value?: string;
      label?: string;
      detail?: string;
    }>;
    productSlug?: string;
    title?: string;
    description?: string;
    leftTitle?: string;
    rightTitle?: string;
    rows?: Array<{
      label?: string;
      left?: string;
      right?: string;
    }>;
    steps?: Array<{
      title?: string;
      body?: string;
    }>;
    items?: Array<{
      question?: string;
      answer?: string;
      title?: string;
      authors?: string;
      journal?: string;
      year?: string;
      url?: string;
    }>;
    variant?: string;
    imageUrl?: string;
    alt?: string;
    caption?: string;
    credit?: string;
    accent?: string;
  }>;
  influencerName?: string;
  influencerHandle?: string;
  platform?: string;
  experienceSummary?: string;
  featuredProducts?: string[];
};

function mapContentBlocks(doc: SanityBlogDoc): BlogPost["contentBlocks"] {
  const mapped = (doc.contentBlocks ?? [])
    .map((block) => {
      if (block._type === "richTextBlock") {
        const heading = block.heading?.trim() ?? "";
        const body = coerceRichTextBody(block.body);
        if (!heading || !body) return null;
        return {
          type: "richText" as const,
          eyebrow: block.eyebrow?.trim() || undefined,
          heading,
          body,
        };
      }

      if (block._type === "quoteBlock") {
        const quote = block.quote?.trim() ?? "";
        if (!quote) return null;
        return {
          type: "quote" as const,
          quote,
          author: block.author?.trim() || undefined,
        };
      }

      if (block._type === "statGridBlock") {
        const stats =
          block.stats
            ?.map((stat) => {
              const value = stat.value?.trim() ?? "";
              const label = stat.label?.trim() ?? "";
              if (!value || !label) return null;
              return {
                value,
                label,
                ...(stat.detail?.trim() ? { detail: stat.detail.trim() } : {}),
              };
            })
            .filter((stat): stat is { value: string; label: string; detail?: string } => Boolean(stat)) ?? [];
        if (stats.length === 0) return null;
        return { type: "statGrid" as const, stats };
      }

      if (block._type === "productCalloutBlock") {
        const productSlug = block.productSlug?.trim() ?? "";
        const title = block.title?.trim() ?? "";
        const description = block.description?.trim() ?? "";
        if (!productSlug || !title || !description) return null;
        return {
          type: "productCallout" as const,
          productSlug,
          title,
          description,
        };
      }

      if (block._type === "comparisonBlock") {
        const leftTitle = block.leftTitle?.trim() ?? "";
        const rightTitle = block.rightTitle?.trim() ?? "";
        const rows =
          block.rows
            ?.map((row) => {
              const label = row.label?.trim() ?? "";
              const left = row.left?.trim() ?? "";
              const right = row.right?.trim() ?? "";
              if (!label || !left || !right) return null;
              return { label, left, right };
            })
            .filter((row): row is { label: string; left: string; right: string } => Boolean(row)) ?? [];
        if (!leftTitle || !rightTitle || rows.length === 0) return null;
        return { type: "comparison" as const, leftTitle, rightTitle, rows };
      }

      if (block._type === "timelineBlock") {
        const steps =
          block.steps
            ?.map((step) => {
              const title = step.title?.trim() ?? "";
              const body = step.body?.trim() ?? "";
              if (!title || !body) return null;
              return { title, body };
            })
            .filter((step): step is { title: string; body: string } => Boolean(step)) ?? [];
        if (steps.length === 0) return null;
        return { type: "timeline" as const, steps };
      }

      if (block._type === "faqBlock") {
        const items =
          block.items
            ?.map((item) => {
              const question = item.question?.trim() ?? "";
              const answer = item.answer?.trim() ?? "";
              if (!question || !answer) return null;
              return { question, answer };
            })
            .filter((item): item is { question: string; answer: string } => Boolean(item)) ?? [];
        if (items.length === 0) return null;
        return { type: "faq" as const, items };
      }

      if (block._type === "calloutBlock") {
        const title = block.title?.trim() ?? "";
        const rawBody = typeof block.body === "string" ? block.body : "";
        const body = rawBody.trim();
        if (!title || !body) return null;
        const allowedVariants = new Set(["info", "clinical", "warning", "tip"]);
        const rawVariant = block.variant?.trim() ?? "info";
        const variant = (allowedVariants.has(rawVariant) ? rawVariant : "info") as
          | "info"
          | "clinical"
          | "warning"
          | "tip";
        const eyebrow = block.eyebrow?.trim();
        return {
          type: "callout" as const,
          variant,
          ...(eyebrow ? { eyebrow } : {}),
          title,
          body,
        };
      }

      if (block._type === "inlineImageBlock") {
        const src = block.imageUrl?.trim() ?? "";
        if (!src) return null;
        const alt = block.alt?.trim() || "Editorial image";
        const allowedAccents = new Set(["none", "teal", "gold", "cream"]);
        const rawAccent = block.accent?.trim() ?? "none";
        const accent = (allowedAccents.has(rawAccent) ? rawAccent : "none") as
          | "none"
          | "teal"
          | "gold"
          | "cream";
        const caption = block.caption?.trim();
        const credit = block.credit?.trim();
        return {
          type: "inlineImage" as const,
          src,
          alt,
          ...(caption ? { caption } : {}),
          ...(credit ? { credit } : {}),
          accent,
        };
      }

      if (block._type === "citationsBlock") {
        type CitationItem = {
          title: string;
          authors?: string;
          journal?: string;
          year?: string;
          url?: string;
        };
        const items: CitationItem[] = [];
        (block.items ?? []).forEach((item) => {
          const title = item.title?.trim();
          if (!title) return;
          const ci: CitationItem = { title };
          const authors = item.authors?.trim();
          if (authors) ci.authors = authors;
          const journal = item.journal?.trim();
          if (journal) ci.journal = journal;
          const year = item.year?.trim();
          if (year) ci.year = year;
          const url = item.url?.trim();
          if (url) ci.url = url;
          items.push(ci);
        });
        if (items.length === 0) return null;
        const eyebrow = block.eyebrow?.trim();
        return {
          type: "citations" as const,
          ...(eyebrow ? { eyebrow } : {}),
          items,
        };
      }

      return null;
    })
    .filter((block): block is NonNullable<BlogPost["contentBlocks"]>[number] => Boolean(block));

  return mapped.length > 0 ? mapped : [];
}

const DEFAULT_API_VERSION = "2023-10-01";
function resolveApiVersion(value: string | undefined): string {
  if (!value) return DEFAULT_API_VERSION;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return DEFAULT_API_VERSION;
  const today = new Date().toISOString().slice(0, 10);
  if (value > today) return DEFAULT_API_VERSION;
  return value;
}

const API_VERSION = resolveApiVersion(process.env.NEXT_PUBLIC_SANITY_API_VERSION);
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const READ_TOKEN = process.env.SANITY_API_READ_TOKEN;

function mapDoc(doc: SanityBlogDoc): BlogPost | null {
  const slug = doc.slug?.trim();
  const title = doc.title?.trim();
  if (!slug || !title) return null;

  const firstGalleryImage = doc.mediaGallery?.find((entry) => entry._type === "image")?.assetUrl ?? "";
  const firstGalleryVideo = doc.mediaGallery?.find((entry) => entry._type !== "image")?.assetUrl ?? "";
  const heroType: "image" | "video" = doc.heroType ?? (doc.heroVideoUrl || firstGalleryVideo ? "video" : "image");
  const heroSrc = heroType === "video"
    ? doc.heroVideoUrl ?? firstGalleryVideo ?? ""
    : doc.heroImageUrl ?? firstGalleryImage ?? "";
  if (!heroSrc) return null;

  const sections =
    doc.storySections
      ?.map((section) => {
        const heading = section.heading?.trim() ?? "";
        const body = section.body?.trim() ?? "";
        if (!heading || !body) return null;
        return { heading, body };
      })
      .filter((section): section is { heading: string; body: string } => Boolean(section)) ?? [];
  const contentBlocks = mapContentBlocks(doc);

  const gallery =
    doc.mediaGallery
      ?.map((entry, index) => {
        const src = entry.assetUrl?.trim() ?? "";
        if (!src) return null;
        return {
          type: entry._type === "image" ? "image" : "video",
          src,
          alt: `${title} media ${index + 1}`,
        };
      })
      .filter((entry): entry is { type: "image" | "video"; src: string; alt: string } => Boolean(entry)) ?? [];

  return {
    schemaType: doc._type,
    slug,
    title,
    excerpt: doc.excerpt ?? "",
    category: doc.category ?? "Research",
    readTime: doc.readTime ?? "5 min read",
    publishedAt: doc.publishedAt ?? "",
    authorName: doc.authorName?.trim() || undefined,
    reviewedBy: doc.reviewedBy?.trim() || undefined,
    scienceNote: doc.scienceNote?.trim() || undefined,
    heroType,
    heroSrc,
    heroAlt: doc.heroAlt ?? title,
    bullets: doc.bullets && doc.bullets.length > 0 ? doc.bullets : [],
    sections: sections.length > 0 ? sections : [],
    contentBlocks,
    gallery: gallery.length > 0 ? gallery : [],
    influencer:
      doc._type === "influencerExperience"
        ? {
            name: doc.influencerName?.trim() || "Creator",
            handle: doc.influencerHandle,
            platform: doc.platform,
            summary: doc.experienceSummary,
            featuredProducts: doc.featuredProducts?.length ? doc.featuredProducts : [],
          }
        : undefined,
  };
}

async function sanityQuery<T>(query: string): Promise<T | null> {
  if (!PROJECT_ID || !DATASET) return null;

  try {
    const encoded = encodeURIComponent(query);
    const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encoded}`;
    const res = await fetch(url, {
      headers: READ_TOKEN
        ? {
            Authorization: `Bearer ${READ_TOKEN}`,
          }
        : undefined,
      cache: "no-store",
    });

    if (!res.ok) return null;
    const json = (await res.json()) as SanityQueryResult;
    return (json.result ?? null) as T | null;
  } catch {
    return null;
  }
}

export async function getSanityBlogPosts(): Promise<BlogPost[]> {
  const query = `*[_type in ["researchFeature","influencerExperience","protocolPlaybook"]] | order(publishedAt desc){
    _type,
    "slug": slug.current,
    title,
    excerpt,
    category,
    readTime,
    publishedAt,
    authorName,
    reviewedBy,
    scienceNote,
    heroType,
    heroAlt,
    "heroImageUrl": heroImage.asset->url,
    "heroVideoUrl": heroVideo.asset->url,
    bullets,
    "mediaGallery": mediaGallery[]{
      _type,
      "assetUrl": asset->url
    },
    storySections,
    "contentBlocks": contentBlocks[]{
      ...,
      "imageUrl": image.asset->url,
      stats[]{
        value,
        label,
        detail
      },
      rows[]{
        label,
        left,
        right
      },
      steps[]{
        title,
        body
      },
      items[]{
        question,
        answer,
        title,
        authors,
        journal,
        year,
        url
      }
    },
    influencerName,
    influencerHandle,
    platform,
    experienceSummary,
    featuredProducts
  }`;

  const rows = (await sanityQuery<SanityBlogDoc[]>(query)) ?? [];
  const mapped = rows.map(mapDoc).filter((entry): entry is BlogPost => Boolean(entry));
  return mapped;
}

export async function getSanityBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const safeSlug = slug.replace(/"/g, '\\"');
  const query = `*[_type in ["researchFeature","influencerExperience","protocolPlaybook"] && slug.current == "${safeSlug}"][0]{
    _type,
    "slug": slug.current,
    title,
    excerpt,
    category,
    readTime,
    publishedAt,
    authorName,
    reviewedBy,
    scienceNote,
    heroType,
    heroAlt,
    "heroImageUrl": heroImage.asset->url,
    "heroVideoUrl": heroVideo.asset->url,
    bullets,
    "mediaGallery": mediaGallery[]{
      _type,
      "assetUrl": asset->url
    },
    storySections,
    "contentBlocks": contentBlocks[]{
      ...,
      "imageUrl": image.asset->url,
      stats[]{
        value,
        label,
        detail
      },
      rows[]{
        label,
        left,
        right
      },
      steps[]{
        title,
        body
      },
      items[]{
        question,
        answer,
        title,
        authors,
        journal,
        year,
        url
      }
    },
    influencerName,
    influencerHandle,
    platform,
    experienceSummary,
    featuredProducts
  }`;

  const row = await sanityQuery<SanityBlogDoc | null>(query);
  if (!row) return null;
  return mapDoc(row);
}

export async function getSanityBlogSlugs(): Promise<string[]> {
  const query = `*[_type in ["researchFeature","influencerExperience","protocolPlaybook"] && defined(slug.current)].slug.current`;
  const slugs = (await sanityQuery<string[]>(query)) ?? [];
  return slugs;
}
