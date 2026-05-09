import type { PortableTextBlock } from "@portabletext/react";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Research" | "Protocols" | "Ingredients" | "Lifestyle";
  readTime: string;
  publishedAt: string;
  authorName?: string;
  reviewedBy?: string;
  scienceNote?: string;
  heroType: "image" | "video";
  heroSrc: string;
  heroAlt: string;
  bullets: string[];
  schemaType?: "researchFeature" | "influencerExperience" | "protocolPlaybook";
  sections?: Array<{
    heading: string;
    body: string;
  }>;
  contentBlocks?: Array<
    | {
        type: "richText";
        eyebrow?: string;
        heading: string;
        body: PortableTextBlock[];
      }
    | {
        type: "quote";
        quote: string;
        author?: string;
      }
    | {
        type: "statGrid";
        stats: Array<{ value: string; label: string; detail?: string }>;
      }
    | {
        type: "productCallout";
        productSlug: string;
        title: string;
        description: string;
      }
    | {
        type: "comparison";
        leftTitle: string;
        rightTitle: string;
        rows: Array<{ label: string; left: string; right: string }>;
      }
    | {
        type: "timeline";
        steps: Array<{ title: string; body: string }>;
      }
    | {
        type: "faq";
        items: Array<{ question: string; answer: string }>;
      }
    | {
        type: "callout";
        variant: "info" | "clinical" | "warning" | "tip";
        eyebrow?: string;
        title: string;
        body: string;
      }
    | {
        type: "inlineImage";
        src: string;
        alt: string;
        caption?: string;
        credit?: string;
        accent: "none" | "teal" | "gold" | "cream";
      }
    | {
        type: "citations";
        eyebrow?: string;
        items: Array<{
          title: string;
          authors?: string;
          journal?: string;
          year?: string;
          url?: string;
        }>;
      }
  >;
  gallery?: Array<{
    type: "image" | "video";
    src: string;
    alt: string;
  }>;
  influencer?: {
    name: string;
    handle?: string;
    platform?: string;
    summary?: string;
    featuredProducts?: string[];
  };
};

export const BLOG_POSTS: BlogPost[] = [
  // Blog content/media are sourced from Sanity.
];
