/**
 * Product types only. Actual product data is fetched from Shopify via
 * `src/lib/shopify-products.ts`. There is no local product catalog —
 * adding hardcoded product data here is a violation of the architecture rule.
 */

import type { WellnessGoal } from "@/data/goals";

export type ProductVariant = {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  available: boolean;
  sku?: string | null;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  name?: string;
  slug?: string;
  description: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  category?: string;
  tags: string[];
  keywords?: string[];
  ingredients?: string[];
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  featuredImage: string;
  images: string[];
  available: boolean;
  variants: ProductVariant[];
  benefits: string[];
  /** Long-form overview paragraphs parsed from the Shopify "Description" section. */
  descriptionRich?: string[];
  /** Plain-text usage instructions parsed from the Shopify "How to Enjoy" / "How to Use" section. */
  howToUse?: string[];
  /** Active ingredients parsed from the Shopify "Ingredients" section, comma-split. */
  ingredientsActive?: string[];
  /** Other / inactive ingredients parsed from the Shopify "Ingredients" section, comma-split. */
  ingredientsOther?: string[];
  /** Optional pro-tip / pairing line above the description. */
  proTip?: string;
  /** Optional Certificate of Analysis URL surfaced in "Third Party Testing". */
  coaUrl?: string;
  goals: WellnessGoal[];
  modelPath?: string;
  rating?: number | null;
  reviewCount?: number | null;
  datasetSource?: string;
  sourceUrl?: string;
  license?: string;
};
