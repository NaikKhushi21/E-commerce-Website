import fs from 'node:fs/promises';
import path from 'node:path';

const USER_AGENT = 'cymbiotika-prototype/1.0';
const BASE_DIR = path.resolve('public/models/polyhaven');
const ASSETS = [
  'wine_bottles_01',
  'modified_thermos',
  'plastic_thermos',
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadFile(url, targetPath) {
  await ensureDir(path.dirname(targetPath));
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Failed ${res.status} for ${url}`);
  }
  const arr = await res.arrayBuffer();
  await fs.writeFile(targetPath, Buffer.from(arr));
}

async function downloadAsset(assetId) {
  const apiUrl = `https://api.polyhaven.com/files/${assetId}`;
  const metaRes = await fetch(apiUrl, { headers: { 'User-Agent': USER_AGENT } });
  if (!metaRes.ok) {
    throw new Error(`API failed ${metaRes.status} for ${assetId}`);
  }

  const meta = await metaRes.json();
  const gltfBlock = meta?.gltf?.['1k']?.gltf;
  if (!gltfBlock?.url || !gltfBlock?.include) {
    throw new Error(`No 1k glTF payload for ${assetId}`);
  }

  const assetRoot = path.join(BASE_DIR, assetId);
  await ensureDir(assetRoot);

  const gltfName = path.basename(new URL(gltfBlock.url).pathname);
  const gltfPath = path.join(assetRoot, gltfName);
  if (!(await fileExists(gltfPath))) {
    await downloadFile(gltfBlock.url, gltfPath);
  }

  const includeEntries = Object.entries(gltfBlock.include);
  for (const [relativePath, fileMeta] of includeEntries) {
    const target = path.join(assetRoot, relativePath);
    if (!(await fileExists(target))) {
      await downloadFile(fileMeta.url, target);
    }
  }

  return `/models/polyhaven/${assetId}/${gltfName}`;
}

async function main() {
  const out = {};
  for (const id of ASSETS) {
    out[id] = await downloadAsset(id);
    console.log(`Downloaded ${id} -> ${out[id]}`);
  }

  await fs.writeFile(
    path.resolve('src/data/model-catalog.json'),
    JSON.stringify(out, null, 2) + '\n',
  );

  console.log('Wrote src/data/model-catalog.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
