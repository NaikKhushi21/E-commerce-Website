import type { BlogPost } from "@/data/blog-posts";

export type Lens = "quick" | "standard" | "deep";

type BlockType = NonNullable<BlogPost["contentBlocks"]>[number]["type"];

const MIN_LENS: Record<BlockType, Lens> = {
  statGrid: "quick",
  productCallout: "quick",
  callout: "quick",
  richText: "standard",
  quote: "standard",
  comparison: "standard",
  timeline: "standard",
  faq: "standard",
  inlineImage: "standard",
  citations: "deep",
};

const LENS_RANK: Record<Lens, number> = { quick: 0, standard: 1, deep: 2 };

export function blockVisibleAtLens(blockType: BlockType, lens: Lens): boolean {
  return LENS_RANK[lens] >= LENS_RANK[MIN_LENS[blockType]];
}

export function galleryVisibleAtLens(lens: Lens): boolean {
  return lens !== "quick";
}
