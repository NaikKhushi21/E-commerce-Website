import fs from "node:fs";
import path from "node:path";

const dataPath = path.resolve("src/data/products.json");
const outDir = path.resolve("public/images/products");
fs.mkdirSync(outDir, { recursive: true });

const products = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const palettes = [
  { bg: "#2F5A32", card: "#3D6C3F", jar: "#0E1510", cap: "#1A2A1C", label: "#D2E6D2" },
  { bg: "#2E5B3A", card: "#416E49", jar: "#EBEEE7", cap: "#D8E0D5", label: "#2F5A32" },
  { bg: "#305D35", card: "#4A754C", jar: "#F6F4EE", cap: "#DADFD6", label: "#365A39" },
  { bg: "#2A5630", card: "#406B45", jar: "#EFF3EA", cap: "#D6DDCF", label: "#395E3C" },
];

function escapeXml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildSvg({ title, code, palette, angle }) {
  const cardX = angle === "b" ? 96 : angle === "c" ? 64 : 80;
  const skew = angle === "b" ? -8 : angle === "c" ? 8 : 0;
  const rotate = angle === "b" ? -5 : angle === "c" ? 5 : 0;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1400" height="1400" viewBox="0 0 1400 1400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1400" height="1400" fill="${palette.bg}"/>
  <rect x="60" y="60" width="1280" height="1280" rx="48" fill="${palette.card}" stroke="#F7EFD9" stroke-opacity="0.18" stroke-width="4"/>
  <text x="700" y="195" text-anchor="middle" fill="#F6F1E1" font-family="Arial, Helvetica, sans-serif" font-size="52" opacity="0.96">${escapeXml(title)}</text>
  <g transform="translate(${cardX} 280) skewX(${skew}) rotate(${rotate} 620 520)">
    <ellipse cx="620" cy="250" rx="300" ry="70" fill="${palette.cap}"/>
    <rect x="320" y="250" width="600" height="120" rx="60" fill="${palette.cap}"/>
    <rect x="300" y="360" width="640" height="620" rx="120" fill="${palette.jar}"/>
    <rect x="370" y="500" width="500" height="270" rx="36" fill="#0A0A0A" fill-opacity="0.22"/>
    <circle cx="620" cy="640" r="28" fill="${palette.label}"/>
    <text x="620" y="835" text-anchor="middle" fill="${palette.label}" font-family="Arial, Helvetica, sans-serif" font-size="34" opacity="0.94">${escapeXml(code)}</text>
  </g>
</svg>`;
}

for (let i = 0; i < products.length; i++) {
  const product = products[i];
  const palette = palettes[i % palettes.length];
  const code = `C-${String(i + 1).padStart(2, "0")}`;

  const variants = ["a", "b", "c"];
  const imagePaths = variants.map((variant) => {
    const file = `${product.handle}-${variant}.svg`;
    const svg = buildSvg({ title: product.title, code, palette, angle: variant });
    fs.writeFileSync(path.join(outDir, file), svg, "utf8");
    return `/images/products/${file}`;
  });

  product.featuredImage = imagePaths[0];
  product.images = imagePaths;
}

fs.writeFileSync(dataPath, JSON.stringify(products, null, 2), "utf8");
console.log(`Generated ${products.length * 3} product images in ${outDir}`);
