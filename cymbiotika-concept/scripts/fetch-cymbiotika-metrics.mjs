import fs from "node:fs/promises";
import path from "node:path";

const HANDLES = [
  "vitamin-c",
  "glutathione",
  "magnesium-complex",
  "liquid-colostrum",
  "shilajit-liquid-complex",
  "nad",
];

const OUT_PATH = path.resolve("src/data/cymbiotika-insights.json");
const USER_AGENT = "cymbiotika-concept-graphs/1.0";

function extractMaxNumberFromRegex(text, regex) {
  const values = [];
  for (const match of text.matchAll(regex)) {
    const raw = (match[1] ?? "").replaceAll(",", "");
    const value = Number(raw);
    if (Number.isFinite(value)) values.push(value);
  }
  if (values.length === 0) return null;
  return Math.max(...values);
}

function formatDollars(centsValue) {
  return Math.round((centsValue / 100) * 100) / 100;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`Failed JSON ${res.status}: ${url}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Failed HTML ${res.status}: ${url}`);
  return res.text();
}

async function fetchHandleMetrics(handle) {
  const productUrl = `https://cymbiotika.com/products/${handle}`;
  const [productJson, productHtml] = await Promise.all([
    fetchJson(`${productUrl}.js`),
    fetchText(productUrl),
  ]);

  const firstVariant = productJson?.variants?.[0];
  if (!firstVariant) {
    throw new Error(`No variants found for ${handle}`);
  }

  const oneTimePrice = Number(firstVariant.price) || 0;
  const compareAt = Number(firstVariant.compare_at_price) || 0;
  const rating = extractMaxNumberFromRegex(productHtml, /"ratingValue"\s*:\s*"?(?<value>[0-9.]+)/g);
  const reviewCount = extractMaxNumberFromRegex(productHtml, /"ratingCount"\s*:\s*"?(?<count>[0-9,]+)/g);

  return {
    handle,
    title: productJson.title,
    oneTimePrice: formatDollars(oneTimePrice),
    compareAtPrice: compareAt > 0 ? formatDollars(compareAt) : null,
    discountPercent: compareAt > 0 ? Math.round(((compareAt - oneTimePrice) / compareAt) * 1000) / 10 : 0,
    rating: rating ?? null,
    reviewCount: reviewCount ?? null,
    productType: productJson.type || "Unknown",
    sourceUrl: productUrl,
  };
}

async function run() {
  const products = [];
  for (const handle of HANDLES) {
    const metric = await fetchHandleMetrics(handle);
    products.push(metric);
    console.log(`Fetched ${handle}: $${metric.oneTimePrice} (${metric.reviewCount ?? "n/a"} reviews)`);
  }

  const payload = {
    source: "Cymbiotika public product pages (.js + HTML)",
    fetchedAt: new Date().toISOString(),
    handles: HANDLES,
    products,
  };

  await fs.writeFile(OUT_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`Wrote ${OUT_PATH}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
