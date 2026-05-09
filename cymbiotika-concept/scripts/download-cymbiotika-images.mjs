import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "images", "cymbiotika-real");
const DATA_PATH = path.join(ROOT, "src", "data", "products.json");

const fallbackHandles = [
  "glutathione",
  "vitamin-c",
  "magnesium-complex",
  "magnesium-l-threonate",
  "liquid-colostrum",
  "shilajit-liquid-complex",
  "nad",
  "d3",
];

function unique(arr) {
  return [...new Set(arr)];
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.text();
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
}

async function download(url, filePath) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`image ${res.status}: ${url}`);
  const ab = await res.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(ab));
}

function extFromUrl(url) {
  const clean = url.split("?")[0] ?? url;
  if (clean.endsWith(".png")) return ".png";
  if (clean.endsWith(".webp")) return ".webp";
  return ".jpg";
}

function normalizeImageUrl(url) {
  if (typeof url !== "string") return "";
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}

async function getHandles() {
  try {
    const html = await fetchText("https://cymbiotika.com/");
    const matches = html.match(/\/products\/[a-z0-9-]+/g) ?? [];
    const handles = unique(matches.map((m) => m.replace("/products/", "")));
    return handles.length > 0 ? handles : fallbackHandles;
  } catch {
    return fallbackHandles;
  }
}

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const handles = await getHandles();
  const catalog = [];

  for (const handle of handles) {
    try {
      const data = await fetchJson(`https://cymbiotika.com/products/${handle}.js`);
      const images = (data.images ?? []).map(normalizeImageUrl).filter(Boolean).slice(0, 3);
      if (images.length === 0) continue;

      const localImages = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const ext = extFromUrl(img);
        const file = `${handle}-${i + 1}${ext}`;
        const absPath = path.join(OUT_DIR, file);
        const relPath = `/images/cymbiotika-real/${file}`;
        await download(img, absPath);
        localImages.push(relPath);
      }

      catalog.push({
        handle,
        title: data.title,
        images: localImages,
      });
    } catch (error) {
      console.warn(`skip ${handle}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (catalog.length === 0) {
    throw new Error("No real product images downloaded.");
  }

  const products = JSON.parse(await fs.readFile(DATA_PATH, "utf8"));
  const updated = products.map((product, i) => {
    const source = catalog[i % catalog.length];
    return {
      ...product,
      featuredImage: source.images[0],
      images: source.images,
    };
  });

  await fs.writeFile(DATA_PATH, JSON.stringify(updated, null, 2), "utf8");

  console.log(`Downloaded real product images for ${catalog.length} Cymbiotika products.`);
  console.log(`Updated ${updated.length} local products in src/data/products.json`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
