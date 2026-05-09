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
  goals: WellnessGoal[];
  modelPath?: string;
  rating?: number | null;
  reviewCount?: number | null;
  datasetSource?: string;
  sourceUrl?: string;
  license?: string;
};
