/**
 * Product reviews service layer. Reads `productReview` documents from Sanity.
 */

import { sanityQuery } from "@/lib/sanity-client";

export type Review = {
  id: string;
  author: string;
  rating: 3 | 4 | 5;
  tag: string;
  quote: string;
  productSlug?: string;
  publishedAt?: string;
};

type SanityReviewDoc = {
  _id?: string;
  author?: string;
  rating?: number;
  tag?: string;
  quote?: string;
  productSlug?: string;
  publishedAt?: string;
};

function mapDoc(doc: SanityReviewDoc): Review | null {
  const author = doc.author?.trim();
  const tag = doc.tag?.trim();
  const quote = doc.quote?.trim();
  const rating = doc.rating;
  if (!author || !tag || !quote) return null;
  if (rating !== 3 && rating !== 4 && rating !== 5) return null;
  return {
    id: doc._id ?? `${author}-${tag}-${quote.slice(0, 8)}`,
    author,
    rating,
    tag,
    quote,
    productSlug: doc.productSlug?.trim() || undefined,
    publishedAt: doc.publishedAt,
  };
}

let cachedReviews: Review[] | null = null;

async function fetchAllFromSanity(): Promise<Review[] | null> {
  const query = `*[_type == "productReview"] | order(displayOrder asc, publishedAt desc){
    _id,
    author,
    rating,
    tag,
    quote,
    productSlug,
    publishedAt
  }`;
  const rows = await sanityQuery<SanityReviewDoc[]>(query);
  if (!rows || rows.length === 0) return null;
  const mapped = rows.map(mapDoc).filter((r): r is Review => Boolean(r));
  return mapped.length > 0 ? mapped : null;
}

/**
 * Returns reviews for a given product handle (or null/undefined for the
 * full pool of general reviews). Reviews tagged with a productSlug match
 * exact handle; untagged reviews are shown for any product.
 */
export async function getProductReviews(productHandle?: string): Promise<Review[]> {
  if (!cachedReviews) {
    const fromSanity = await fetchAllFromSanity();
    cachedReviews = fromSanity ?? [];
  }
  if (!productHandle) return cachedReviews;
  return cachedReviews.filter(
    (r) => !r.productSlug || r.productSlug === productHandle,
  );
}
