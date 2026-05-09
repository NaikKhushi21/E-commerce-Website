import { type Product } from "@/data/products";
import { GOAL_LABELS, type WellnessGoal } from "@/data/goals";

export function getPrimaryVariant(product: Product) {
  return product.variants[0];
}

export function productHasGoal(product: Product, goal: WellnessGoal): boolean {
  return product.goals.includes(goal);
}

export function goalChip(goal: WellnessGoal): string {
  return GOAL_LABELS[goal];
}

export function toProductPath(handle: string): string {
  return `/products/${handle}`;
}
