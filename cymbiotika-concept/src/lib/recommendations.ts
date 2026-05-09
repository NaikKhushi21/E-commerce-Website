import { type Product } from "@/data/products";
import { type WellnessGoal } from "@/data/goals";

function scoreByGoals(product: Product, goals: WellnessGoal[]): number {
  return goals.reduce((score, goal) => score + (product.goals.includes(goal) ? 2 : 0), 0);
}

export function getProductsByGoalFromCatalog(sourceProducts: Product[], goal: WellnessGoal): Product[] {
  return sourceProducts.filter((product) => product.goals.includes(goal));
}

export function getRecommendedProtocolFromCatalog(
  sourceProducts: Product[],
  goals: WellnessGoal[],
): {
  morning: Product[];
  evening: Product[];
  targeted: Product[];
} {
  if (goals.length === 0) {
    return { morning: [], evening: [], targeted: [] };
  }

  const ranked = [...sourceProducts]
    .map((product) => ({ product, score: scoreByGoals(product, goals) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  let morning = ranked
    .filter((entry) => entry.product.tags.includes("morning"))
    .slice(0, 3)
    .map((entry) => entry.product);

  let evening = ranked
    .filter((entry) => entry.product.tags.includes("evening"))
    .slice(0, 3)
    .map((entry) => entry.product);

  // Fallback for datasets that don't include morning/evening tags.
  if (morning.length === 0 || evening.length === 0) {
    const ordered = ranked.map((entry) => entry.product);
    if (morning.length === 0) {
      morning = ordered.slice(0, 3);
    }
    if (evening.length === 0) {
      evening = ordered.slice(3, 6);
      if (evening.length === 0) {
        evening = ordered.slice(0, 3);
      }
    }
  }

  const used = new Set([...morning, ...evening].map((item) => item.id));

  const targeted = ranked
    .filter((entry) => !used.has(entry.product.id))
    .slice(0, 3)
    .map((entry) => entry.product);

  return { morning, evening, targeted };
}

export function getPairingsFromCatalog(product: Product, sourceProducts: Product[]): Product[] {
  return sourceProducts
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => {
      const overlap = candidate.goals.filter((goal) => product.goals.includes(goal)).length;
      const tagOverlap = candidate.tags.filter((tag) => product.tags.includes(tag)).length;
      return { candidate, score: overlap * 3 + tagOverlap };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => entry.candidate);
}
