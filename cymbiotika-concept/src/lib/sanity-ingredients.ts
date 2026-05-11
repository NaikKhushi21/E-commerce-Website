/**
 * Ingredient atlas service layer. Reads `ingredient` documents from Sanity.
 *
 * Also holds two structural maps used to resolve "which ingredients does
 * product X contain" — these are linkage rules, not seed content. When
 * Cymbiotika populates per-product `ingredients` metafields in Shopify,
 * these maps can be deleted in favour of `product.ingredients`.
 */

import type { Product } from "@/data/products";
import type { WellnessGoal } from "@/data/goals";
import { sanityQuery } from "@/lib/sanity-client";

export type IngredientCategory =
  | "Antioxidant Vitamin"
  | "Liposomal Antioxidant"
  | "Essential Mineral"
  | "Adaptogen"
  | "Bioactive Cofactor"
  | "Cellular Cofactor"
  | "Phytocompound"
  | "Phospholipid"
  | "Amino Acid"
  | "Active Compound";

export type IngredientEntry = {
  key: string;
  name: string;
  category: IngredientCategory;
  function: string;
  dose?: string;
  synergies?: string[];
  goals: WellnessGoal[];
};

export const CATEGORY_COLOR: Record<IngredientCategory, string> = {
  "Antioxidant Vitamin": "#fbd5b5",
  "Liposomal Antioxidant": "#c8b8ff",
  "Essential Mineral": "#9ec9ff",
  "Adaptogen": "#cbb8e8",
  "Bioactive Cofactor": "#8ce0d6",
  "Cellular Cofactor": "#fba973",
  "Phytocompound": "#f5d4a8",
  "Phospholipid": "#e8d7b8",
  "Amino Acid": "#f0c8d4",
  "Active Compound": "#d7c3a7",
};

const PRODUCT_INGREDIENTS: Record<string, string[]> = {
  "vitamin-c": ["vitamin-c", "quercetin", "bioflavonoids"],
  "liposomal-vitamin-c": ["vitamin-c", "quercetin", "bioflavonoids"],
  "glutathione": ["glutathione", "phospholipids", "vitamin-c"],
  "liposomal-glutathione": ["glutathione", "phospholipids", "vitamin-c"],
  "magnesium-complex": ["magnesium-l-threonate", "magnesium-glycinate", "magnesium-malate"],
  "liposomal-magnesium-complex": ["magnesium-l-threonate", "magnesium-glycinate", "magnesium-malate"],
  "liquid-colostrum": ["colostrum", "lactoferrin"],
  "shilajit-liquid-complex": ["shilajit", "fulvic-acid"],
  "nad": ["nicotinamide-riboside", "resveratrol", "quercetin"],
  "liposomal-nad": ["nicotinamide-riboside", "resveratrol", "quercetin"],
  "vitamin-d3-k2-cofactors": ["d3", "k2", "coq10"],
  "d3-k2": ["d3", "k2", "coq10"],
  "b12": ["methylcobalamin", "methylfolate"],
  "methyl-b-complex": ["methylcobalamin", "methylfolate"],
  "coq10": ["coq10", "phospholipids"],
  "apigenin": ["apigenin", "l-theanine"],
  "ashwagandha": ["ashwagandha", "l-theanine"],
  "tudca": ["tudca", "milk-thistle"],
  "lions-mane": ["lions-mane", "l-theanine"],
  "elderberry": ["elderberry", "vitamin-c", "zinc"],
  "omega-3": ["omega-3", "phospholipids"],
  "zinc": ["zinc", "vitamin-c"],
};

const TITLE_KEYWORDS: Array<{ regex: RegExp; keys: string[] }> = [
  { regex: /vitamin\s*c\b/i, keys: ["vitamin-c", "quercetin", "bioflavonoids"] },
  { regex: /glutathione/i, keys: ["glutathione", "phospholipids", "vitamin-c"] },
  { regex: /magnesium/i, keys: ["magnesium-l-threonate", "magnesium-glycinate", "magnesium-malate"] },
  { regex: /colostrum/i, keys: ["colostrum", "lactoferrin"] },
  { regex: /shilajit/i, keys: ["shilajit", "fulvic-acid"] },
  { regex: /\bnad\+?\b/i, keys: ["nicotinamide-riboside", "resveratrol", "quercetin"] },
  { regex: /d3.*k2|vitamin\s*d/i, keys: ["d3", "k2", "coq10"] },
  { regex: /b\s*12|methyl\s*b/i, keys: ["methylcobalamin", "methylfolate"] },
  { regex: /coq10|co\s*-?\s*q10|ubiquinol/i, keys: ["coq10", "phospholipids"] },
  { regex: /apigenin/i, keys: ["apigenin", "l-theanine"] },
  { regex: /ashwagandha/i, keys: ["ashwagandha", "l-theanine"] },
  { regex: /tudca/i, keys: ["tudca", "milk-thistle"] },
  { regex: /lion'?s?\s*mane/i, keys: ["lions-mane", "l-theanine"] },
  { regex: /elderberry/i, keys: ["elderberry", "vitamin-c", "zinc"] },
  { regex: /omega/i, keys: ["omega-3", "phospholipids"] },
  { regex: /zinc/i, keys: ["zinc", "vitamin-c"] },
  { regex: /sleep/i, keys: ["magnesium-glycinate", "apigenin", "l-theanine"] },
  { regex: /immune|immunity/i, keys: ["vitamin-c", "zinc", "elderberry"] },
];

// ---------- Sanity-aware fetchers ----------

type SanityIngredientDoc = {
  key?: { current?: string };
  name?: string;
  category?: IngredientCategory;
  function?: string;
  dose?: string;
  synergies?: string[];
  goals?: WellnessGoal[];
};

function mapDoc(doc: SanityIngredientDoc): IngredientEntry | null {
  const key = doc.key?.current?.trim();
  const name = doc.name?.trim();
  const category = doc.category;
  const fn = doc.function?.trim();
  if (!key || !name || !category || !fn) return null;
  return {
    key,
    name,
    category,
    function: fn,
    dose: doc.dose?.trim() || undefined,
    synergies: doc.synergies?.length ? doc.synergies : undefined,
    goals: doc.goals && doc.goals.length > 0 ? doc.goals : ["longevity"],
  };
}

async function fetchAtlasFromSanity(): Promise<Record<string, IngredientEntry> | null> {
  const query = `*[_type == "ingredient"] | order(displayOrder asc, name asc){
    "key": key,
    name,
    category,
    function,
    dose,
    synergies,
    goals
  }`;
  const rows = await sanityQuery<SanityIngredientDoc[]>(query);
  if (!rows || rows.length === 0) return null;
  const out: Record<string, IngredientEntry> = {};
  rows.forEach((row) => {
    const mapped = mapDoc(row);
    if (mapped) out[mapped.key] = mapped;
  });
  return Object.keys(out).length > 0 ? out : null;
}

let cachedAtlas: Record<string, IngredientEntry> | null = null;

/**
 * Returns the full ingredient atlas keyed by ingredient key. Cached
 * per-process *only* when the fetch returned real data — an empty result
 * is never cached, otherwise a single transient Sanity blip would poison
 * the serverless container for the rest of its lifetime.
 */
export async function getIngredientAtlas(): Promise<Record<string, IngredientEntry>> {
  if (cachedAtlas && Object.keys(cachedAtlas).length > 0) return cachedAtlas;
  const fromSanity = await fetchAtlasFromSanity();
  if (fromSanity && Object.keys(fromSanity).length > 0) {
    cachedAtlas = fromSanity;
    return cachedAtlas;
  }
  return {};
}

/**
 * Returns the ingredients that belong to a specific product.
 * Resolution: explicit handle map → product.ingredients (Shopify) → title-keyword inference.
 */
export async function getIngredientsForProduct(product: Product): Promise<IngredientEntry[]> {
  const atlas = await getIngredientAtlas();

  const explicit = PRODUCT_INGREDIENTS[product.handle];
  if (explicit && explicit.length > 0) {
    return explicit
      .map((k) => atlas[k])
      .filter((entry): entry is IngredientEntry => Boolean(entry));
  }

  if (product.ingredients && product.ingredients.length > 0) {
    const matched = product.ingredients
      .map((raw) => {
        const norm = raw.trim().toLowerCase().replace(/\s+/g, "-");
        return atlas[norm];
      })
      .filter((entry): entry is IngredientEntry => Boolean(entry));
    if (matched.length > 0) return matched;
  }

  for (const entry of TITLE_KEYWORDS) {
    if (entry.regex.test(product.title)) {
      return entry.keys
        .map((k) => atlas[k])
        .filter((e): e is IngredientEntry => Boolean(e));
    }
  }

  return [];
}
