/**
 * Editorial media + product video service layer.
 * Reads `editorialMedia` and `productVideo` documents from Sanity.
 */

import { sanityQuery } from "@/lib/sanity-client";

// ---------- Editorial media (atmospheric pool) ----------

export type EditorialVideo = {
  id: string;
  title: string;
  src: string;
  sourcePage?: string;
  license?: string;
};

export type EditorialImage = {
  id: string;
  title: string;
  src: string;
  sourcePage?: string;
  license?: string;
};

type SanityEditorialMediaDoc = {
  _id?: string;
  title?: string;
  type?: "image" | "video";
  externalUrl?: string;
  assetUrl?: string;
  alt?: string;
  context?: string;
};

let cachedEditorialVideos: EditorialVideo[] | null = null;
let cachedEditorialImages: EditorialImage[] | null = null;

async function fetchEditorialMedia(): Promise<{
  videos: EditorialVideo[];
  images: EditorialImage[];
} | null> {
  const query = `*[_type == "editorialMedia"] | order(displayOrder asc, title asc){
    _id,
    title,
    type,
    externalUrl,
    "assetUrl": asset.asset->url,
    alt,
    context
  }`;
  const rows = await sanityQuery<SanityEditorialMediaDoc[]>(query);
  if (!rows || rows.length === 0) return null;

  const videos: EditorialVideo[] = [];
  const images: EditorialImage[] = [];
  rows.forEach((row) => {
    const src = (row.externalUrl ?? row.assetUrl ?? "").trim();
    const title = row.title?.trim();
    if (!src || !title) return;
    const id = row._id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (row.type === "video") {
      videos.push({ id, title, src });
    } else {
      images.push({ id, title, src });
    }
  });

  if (videos.length === 0 && images.length === 0) return null;
  return { videos, images };
}

export async function getEditorialVideos(): Promise<EditorialVideo[]> {
  if (cachedEditorialVideos) return cachedEditorialVideos;
  const fromSanity = await fetchEditorialMedia();
  cachedEditorialVideos = fromSanity?.videos ?? [];
  cachedEditorialImages = fromSanity?.images ?? [];
  return cachedEditorialVideos;
}

export async function getEditorialImages(): Promise<EditorialImage[]> {
  if (cachedEditorialImages) return cachedEditorialImages;
  await getEditorialVideos();
  return cachedEditorialImages ?? [];
}

// ---------- Product video clips (home InteractiveVideoReel) ----------

export type ProductVideoClip = {
  id: string;
  title: string;
  category: "bottles" | "capsules" | "lab";
  src: string;
  productSlug?: string;
};

type SanityProductVideoDoc = {
  _id?: string;
  title?: string;
  externalUrl?: string;
  assetUrl?: string;
  category?: "bottles" | "capsules" | "lab";
  productSlug?: string;
};

let cachedProductVideos: ProductVideoClip[] | null = null;

async function fetchProductVideos(): Promise<ProductVideoClip[] | null> {
  const query = `*[_type == "productVideo"] | order(displayOrder asc, title asc){
    _id,
    title,
    externalUrl,
    "assetUrl": asset.asset->url,
    category,
    productSlug
  }`;
  const rows = await sanityQuery<SanityProductVideoDoc[]>(query);
  if (!rows || rows.length === 0) return null;
  const mapped: ProductVideoClip[] = [];
  rows.forEach((row) => {
    const src = (row.externalUrl ?? row.assetUrl ?? "").trim();
    const title = row.title?.trim();
    const category = row.category;
    if (!src || !title || !category) return;
    mapped.push({
      id: row._id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title,
      src,
      category,
      productSlug: row.productSlug?.trim() || undefined,
    });
  });
  return mapped.length > 0 ? mapped : null;
}

export async function getProductVideoClips(): Promise<ProductVideoClip[]> {
  if (cachedProductVideos) return cachedProductVideos;
  const fromSanity = await fetchProductVideos();
  cachedProductVideos = fromSanity ?? [];
  return cachedProductVideos;
}
