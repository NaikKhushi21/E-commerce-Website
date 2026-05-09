import { loadEnvConfig } from "@next/env";
import fs from "node:fs/promises";
import path from "node:path";

loadEnvConfig(process.cwd());

type SanityAssetDocument = {
  _id: string;
  url?: string;
};

type SanityAssetResponse = {
  document?: SanityAssetDocument;
};

type SeedDocType = "researchFeature" | "influencerExperience" | "protocolPlaybook";

type SeedMedia = {
  kind: "image" | "video";
  src: string;
};

type SeedDoc = {
  _id: string;
  _type: SeedDocType;
  title: string;
  slug: string;
  excerpt: string;
  category: "Research" | "Protocols" | "Ingredients" | "Lifestyle";
  readTime: string;
  publishedAt: string;
  heroType: "image" | "video";
  heroAlt: string;
  heroImageSrc?: string;
  heroVideoSrc?: string;
  bullets: string[];
  mediaGallery: SeedMedia[];
  extras?: Record<string, unknown>;
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const writeToken = process.env.SANITY_API_WRITE_TOKEN;
const DEFAULT_API_VERSION = "2023-10-01";

function resolveApiVersion(value: string | undefined): string {
  if (!value) return DEFAULT_API_VERSION;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return DEFAULT_API_VERSION;
  const today = new Date().toISOString().slice(0, 10);
  if (value > today) return DEFAULT_API_VERSION;
  return value;
}

const apiVersion = resolveApiVersion(process.env.NEXT_PUBLIC_SANITY_API_VERSION);

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in env.");
}

if (!writeToken) {
  throw new Error("Missing SANITY_API_WRITE_TOKEN in env.");
}

const apiBase = `https://${projectId}.api.sanity.io/v${apiVersion}`;
const assetCache = new Map<string, SanityAssetDocument>();
const BLOG_DOC_TYPES: SeedDocType[] = ["researchFeature", "influencerExperience", "protocolPlaybook"];

const BLOG_SEED: SeedDoc[] = [
  {
    _id: "researchFeature.absorption-architecture-2026",
    _type: "researchFeature",
    title: "Absorption architecture: why delivery format changes outcomes",
    slug: "absorption-architecture-2026",
    excerpt: "A research-forward look at timing, delivery, and stack order for more predictable outcomes.",
    category: "Research",
    readTime: "6 min read",
    publishedAt: "May 5, 2026",
    heroType: "image",
    heroAlt: "Cymbiotika Vitamin C packaging",
    heroImageSrc: "/images/cymbiotika-real/vitamin-c-1.png",
    bullets: [
      "Delivery format influences practical bioavailability.",
      "Sequence antioxidants to reduce overlap.",
      "Use weekly review windows for protocol tuning.",
    ],
    mediaGallery: [
      { kind: "image", src: "/images/cymbiotika-real/vitamin-c-2.jpg" },
      { kind: "image", src: "/images/cymbiotika-real/vitamin-c-3.jpg" },
      { kind: "image", src: "/images/cymbiotika-real/d3-1.png" },
      { kind: "image", src: "/images/cymbiotika-real/d3-2.jpg" },
      { kind: "video", src: "https://assets.mixkit.co/videos/4730/4730-720.mp4" },
      { kind: "video", src: "https://assets.mixkit.co/videos/5697/5697-720.mp4" },
    ],
    extras: {
      researchHighlights: [
        "Liposomal delivery shows stronger user adherence in routine-based protocols.",
        "Stack order drives consistency more than single-product dosage increases.",
        "Simple protocol plans outperform dense supplement schedules in long-term usage.",
      ],
      storySections: [
        {
          _key: "rs_1",
          _type: "storySection",
          heading: "Why format matters more than label claims",
          body:
            "Two products with similar ingredients can perform differently in real routines when delivery format and timing differ. In practice, users follow protocols that feel simple and predictable. Better delivery often improves that predictability.",
        },
        {
          _key: "rs_2",
          _type: "storySection",
          heading: "Stack order and absorption rhythm",
          body:
            "Morning antioxidant stacks tend to perform best when hydration and mineral baseline are established first. This reduces overlap and gives clearer signal on what is driving response. Teams should design protocols in sequence, not in ingredient silos.",
        },
        {
          _key: "rs_3",
          _type: "storySection",
          heading: "How to evaluate a protocol in 30 days",
          body:
            "Track one primary metric and two secondary metrics each week. Keep dosage and timing stable for at least seven days before making adjustments. This approach prevents noise from being mistaken for progress.",
        },
      ],
    },
  },
  {
    _id: "influencerExperience.morning-energy-creator-story",
    _type: "influencerExperience",
    title: "Creator routine spotlight: clean morning energy without stimulant crashes",
    slug: "morning-energy-creator-story",
    excerpt: "An influencer-led routine showing how users stack essentials for stable focus and recovery.",
    category: "Lifestyle",
    readTime: "5 min read",
    publishedAt: "May 4, 2026",
    heroType: "video",
    heroAlt: "Creator wellness routine video frame",
    heroVideoSrc: "https://assets.mixkit.co/videos/17595/17595-720.mp4",
    heroImageSrc: "/images/cymbiotika-real/glutathione-1.png",
    bullets: [
      "Morning hydration precedes supplementation.",
      "Users report steadier focus by week two.",
      "Night stack supports recovery and consistency.",
    ],
    mediaGallery: [
      { kind: "image", src: "/images/cymbiotika-real/glutathione-2.jpg" },
      { kind: "image", src: "/images/cymbiotika-real/glutathione-3.jpg" },
      { kind: "image", src: "/images/cymbiotika-real/liquid-colostrum-1.png" },
      { kind: "image", src: "/images/cymbiotika-real/liquid-colostrum-2.jpg" },
      { kind: "video", src: "https://assets.mixkit.co/videos/16420/16420-720.mp4" },
      { kind: "video", src: "https://assets.mixkit.co/videos/17595/17595-720.mp4" },
    ],
    extras: {
      influencerName: "Maya Torres",
      influencerHandle: "@maya.wellness.lab",
      platform: "Instagram",
      experienceSummary:
        "Maya documents a 30-day protocol cycle showing cleaner morning energy and better evening wind-down.",
      featuredProducts: ["Liposomal Vitamin C", "Liposomal Glutathione", "Magnesium L-Threonate"],
      storySections: [
        {
          _key: "is_1",
          _type: "storySection",
          heading: "Routine before recommendations",
          body:
            "Maya starts by documenting wake time, meals, stress load, and hydration for one week before adding products. The goal is to build a realistic baseline so any changes can be attributed to the routine, not random variation.",
        },
        {
          _key: "is_2",
          _type: "storySection",
          heading: "What changed by week two",
          body:
            "Energy became more stable through late afternoon, and evening recovery improved once magnesium was moved earlier. The content emphasizes consistency rather than quick hacks, which makes the story more credible and reusable.",
        },
        {
          _key: "is_3",
          _type: "storySection",
          heading: "How creators translate protocol into content",
          body:
            "Each post shows one concrete change, one metric, and one product decision. That structure keeps audience trust high and avoids over-claiming. It is a strong template for influencer-led education around supplements.",
        },
      ],
    },
  },
  {
    _id: "protocolPlaybook.daily-foundation-stack",
    _type: "protocolPlaybook",
    title: "Daily foundation playbook: morning and evening protocol map",
    slug: "daily-foundation-stack",
    excerpt: "A practical protocol blueprint with timed stacks and weekly milestones for habit retention.",
    category: "Protocols",
    readTime: "7 min read",
    publishedAt: "May 3, 2026",
    heroType: "image",
    heroAlt: "Magnesium product on clean background",
    heroImageSrc: "/images/cymbiotika-real/magnesium-complex-1.png",
    bullets: [
      "Use a stable baseline stack before adding experiments.",
      "Split goals across morning activation and evening restoration.",
      "Track one metric per week to avoid noisy conclusions.",
    ],
    mediaGallery: [
      { kind: "image", src: "/images/cymbiotika-real/magnesium-complex-2.jpg" },
      { kind: "image", src: "/images/cymbiotika-real/magnesium-complex-3.jpg" },
      { kind: "image", src: "/images/cymbiotika-real/nad-1.png" },
      { kind: "image", src: "/images/cymbiotika-real/nad-2.jpg" },
      { kind: "video", src: "https://assets.mixkit.co/videos/5697/5697-720.mp4" },
      { kind: "video", src: "https://assets.mixkit.co/videos/4730/4730-720.mp4" },
    ],
    extras: {
      routineName: "Foundation 30",
      morningStack: ["Liposomal Vitamin C", "Shilajit Liquid Complex", "Liposomal Glutathione"],
      eveningStack: ["Magnesium L-Threonate", "L-Theanine + GABA"],
      weeklyPlan: [
        { _key: "w1", _type: "planStep", week: "Week 1", focus: "Consistency", targetMetric: "Adherence %" },
        { _key: "w2", _type: "planStep", week: "Week 2", focus: "Energy stability", targetMetric: "Midday crash score" },
        { _key: "w3", _type: "planStep", week: "Week 3", focus: "Recovery quality", targetMetric: "Sleep continuity" },
        { _key: "w4", _type: "planStep", week: "Week 4", focus: "Protocol tuning", targetMetric: "Goal fit score" },
      ],
      storySections: [
        {
          _key: "ps_1",
          _type: "storySection",
          heading: "Build a baseline before optimization",
          body:
            "The first seven days are designed for repeatability. Dosage and timing remain fixed while users track adherence, afternoon energy stability, and sleep continuity. Without this baseline, later optimization decisions become guesswork.",
        },
        {
          _key: "ps_2",
          _type: "storySection",
          heading: "Morning and evening are different systems",
          body:
            "Morning stack choices support activation and stress resilience, while evening stack choices support down-regulation and recovery. Treating both windows with the same logic usually causes stack overlap and weaker outcomes.",
        },
        {
          _key: "ps_3",
          _type: "storySection",
          heading: "Weekly review framework",
          body:
            "At the end of each week, keep what is working and change only one variable. This protects signal quality and avoids protocol churn. Teams can use the same framework across creator campaigns and direct customer education.",
        },
      ],
    },
  },
];

function cleanFilename(name: string): string {
  return name.replace(/[^a-z0-9._-]/gi, "-").replace(/-+/g, "-");
}

function mimeFromExtension(ext: string): string {
  const normalized = ext.toLowerCase();
  if (normalized === ".png") return "image/png";
  if (normalized === ".jpg" || normalized === ".jpeg") return "image/jpeg";
  if (normalized === ".webp") return "image/webp";
  if (normalized === ".gif") return "image/gif";
  if (normalized === ".mp4") return "video/mp4";
  if (normalized === ".webm") return "video/webm";
  if (normalized === ".mov") return "video/quicktime";
  return "application/octet-stream";
}

async function readSource(src: string): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    const res = await fetch(src);
    if (!res.ok) {
      throw new Error(`Failed to download asset: ${src} (${res.status})`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const url = new URL(src);
    const pathname = url.pathname;
    const ext = path.extname(pathname);
    const filename = cleanFilename(path.basename(pathname) || `asset${ext || ""}`);
    const contentType = res.headers.get("content-type")?.split(";")[0] ?? mimeFromExtension(ext || ".bin");
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType,
      filename,
    };
  }

  const normalizedLocal = src.startsWith("/") ? src.replace(/^\/+/, "") : src;
  const localPath = src.startsWith("/")
    ? path.join(process.cwd(), "public", normalizedLocal)
    : path.join(process.cwd(), normalizedLocal);
  const buffer = await fs.readFile(localPath);
  const ext = path.extname(localPath);
  const filename = cleanFilename(path.basename(localPath));
  return {
    buffer,
    contentType: mimeFromExtension(ext),
    filename,
  };
}

async function uploadAsset(kind: "image" | "file", src: string): Promise<SanityAssetDocument> {
  const key = `${kind}:${src}`;
  const cached = assetCache.get(key);
  if (cached) return cached;

  const { buffer, contentType, filename } = await readSource(src);
  const assetPath = kind === "image" ? "images" : "files";
  const uploadUrl = `${apiBase}/assets/${assetPath}/${dataset}?filename=${encodeURIComponent(filename)}`;
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${writeToken}`,
      "Content-Type": contentType,
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sanity asset upload failed (${res.status}) for ${src}: ${body}`);
  }

  const json = (await res.json()) as SanityAssetResponse;
  if (!json.document?._id) {
    throw new Error(`Sanity asset upload response missing document id for ${src}`);
  }

  assetCache.set(key, json.document);
  return json.document;
}

async function mutate(mutations: unknown[]): Promise<void> {
  const res = await fetch(`${apiBase}/data/mutate/${dataset}?returnIds=true`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${writeToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutations }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sanity mutation failed (${res.status}): ${body}`);
  }
}

function galleryVideoType(docType: SeedDocType): "videoClip" | "creatorVideo" | "protocolVideo" {
  if (docType === "researchFeature") return "videoClip";
  if (docType === "influencerExperience") return "creatorVideo";
  return "protocolVideo";
}

function createGalleryEntry(media: SeedMedia, index: number, imageRef?: string, videoRef?: string, docType?: SeedDocType) {
  if (media.kind === "image") {
    if (!imageRef) return null;
    return {
      _type: "image",
      _key: `img_${index}`,
      asset: { _type: "reference", _ref: imageRef },
    };
  }

  if (!videoRef || !docType) return null;
  return {
    _type: galleryVideoType(docType),
    _key: `vid_${index}`,
    asset: { _type: "reference", _ref: videoRef },
  };
}

async function main() {
  await mutate([
    {
      delete: {
        query: `*[_type in ["blogPost","${BLOG_DOC_TYPES[0]}","${BLOG_DOC_TYPES[1]}","${BLOG_DOC_TYPES[2]}"]]`,
      },
    },
  ]);
  console.log("Cleared old blog documents for configured blog schemas.");

  for (const post of BLOG_SEED) {
    const heroImageAsset = post.heroImageSrc ? await uploadAsset("image", post.heroImageSrc) : null;
    const heroVideoAsset = post.heroVideoSrc ? await uploadAsset("file", post.heroVideoSrc) : null;

    const mediaGallery: unknown[] = [];
    for (let idx = 0; idx < post.mediaGallery.length; idx += 1) {
      const media = post.mediaGallery[idx];
      if (media.kind === "image") {
        const uploaded = await uploadAsset("image", media.src);
        const galleryEntry = createGalleryEntry(media, idx, uploaded._id, undefined, post._type);
        if (galleryEntry) mediaGallery.push(galleryEntry);
      } else {
        const uploaded = await uploadAsset("file", media.src);
        const galleryEntry = createGalleryEntry(media, idx, undefined, uploaded._id, post._type);
        if (galleryEntry) mediaGallery.push(galleryEntry);
      }
    }

    const doc = {
      _id: post._id,
      _type: post._type,
      title: post.title,
      slug: { _type: "slug", current: post.slug },
      excerpt: post.excerpt,
      category: post.category,
      readTime: post.readTime,
      publishedAt: post.publishedAt,
      heroType: post.heroType,
      heroAlt: post.heroAlt,
      heroImage: heroImageAsset
        ? {
            _type: "image",
            asset: { _type: "reference", _ref: heroImageAsset._id },
          }
        : undefined,
      heroVideo: heroVideoAsset
        ? {
            _type: "file",
            asset: { _type: "reference", _ref: heroVideoAsset._id },
          }
        : undefined,
      mediaGallery,
      bullets: post.bullets,
      ...(post.extras ?? {}),
    };

    await mutate([{ createOrReplace: doc }]);
    console.log(`Synced ${post._type}: ${post.slug}`);
  }

  console.log(`Done. Synced ${BLOG_SEED.length} blogs across 3 schema types to Sanity dataset "${dataset}".`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
