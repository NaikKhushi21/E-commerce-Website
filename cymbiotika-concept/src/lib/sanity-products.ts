/**
 * Editorial product copy authored in Sanity. Linked to Shopify products by
 * `handle`. Sanity values override the parsed Shopify content; missing fields
 * fall through to whatever was parsed from `descriptionHtml`.
 *
 * Schema: see `product-website/schemaTypes/productEnrichment.ts`.
 */

import { cache } from "react";
import { sanityQuery } from "@/lib/sanity-client";

export type ProductEnrichment = {
  handle: string;
  displayTitle?: string;
  shortDescription?: string;
  benefits?: string[];
  descriptionRich?: string[];
  howToUse?: string[];
  ingredientsActive?: string[];
  ingredientsOther?: string[];
  proTip?: string;
  coaUrl?: string;
};

type SanityEnrichmentDoc = {
  handle?: { current?: string };
  displayTitle?: string;
  shortDescription?: string;
  benefits?: string[];
  descriptionRich?: Array<{ text?: string }>;
  howToUse?: string[];
  ingredientsActive?: string[];
  ingredientsOther?: string[];
  proTip?: string;
  coaUrl?: string;
};

function trimNonEmpty(values: string[] | undefined): string[] | undefined {
  if (!values) return undefined;
  const cleaned = values.map((v) => v?.trim()).filter((v): v is string => Boolean(v));
  return cleaned.length > 0 ? cleaned : undefined;
}

function mapDoc(doc: SanityEnrichmentDoc): ProductEnrichment | null {
  const handle = doc.handle?.current?.trim();
  if (!handle) return null;
  return {
    handle,
    displayTitle: doc.displayTitle?.trim() || undefined,
    shortDescription: doc.shortDescription?.trim() || undefined,
    benefits: trimNonEmpty(doc.benefits),
    descriptionRich: trimNonEmpty(
      (doc.descriptionRich ?? []).map((p) => p?.text ?? "").filter(Boolean),
    ),
    howToUse: trimNonEmpty(doc.howToUse),
    ingredientsActive: trimNonEmpty(doc.ingredientsActive),
    ingredientsOther: trimNonEmpty(doc.ingredientsOther),
    proTip: doc.proTip?.trim() || undefined,
    coaUrl: doc.coaUrl?.trim() || undefined,
  };
}

/**
 * Fetch all product enrichment docs and index them by handle. Cached per
 * request via React's `cache`. Returns an empty map when Sanity is not
 * configured or returns no results — callers should treat the absence of
 * an entry as "use Shopify data as-is".
 */
export const getProductEnrichmentMap = cache(
  async (): Promise<Record<string, ProductEnrichment>> => {
    const query = `*[_type == "productEnrichment"]{
      "handle": handle,
      displayTitle,
      shortDescription,
      benefits,
      descriptionRich,
      howToUse,
      ingredientsActive,
      ingredientsOther,
      proTip,
      coaUrl
    }`;
    const rows = await sanityQuery<SanityEnrichmentDoc[]>(query);
    if (!rows || rows.length === 0) return {};
    const out: Record<string, ProductEnrichment> = {};
    for (const row of rows) {
      const mapped = mapDoc(row);
      if (mapped) out[mapped.handle] = mapped;
    }
    return out;
  },
);
