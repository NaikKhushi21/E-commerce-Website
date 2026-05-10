import { type BlogPost } from "@/data/blog-posts";

export const CATEGORIES = ["All", "Research", "Guides", "Ingredients", "Lifestyle"] as const;
export type Category = (typeof CATEGORIES)[number];

export function matchesCategory(post: BlogPost, category: Category): boolean {
  if (category === "All") return true;
  if (category === "Guides") return post.category === "Protocols";
  return post.category === category;
}

export function displayCategory(rawCategory: BlogPost["category"]): string {
  if (rawCategory === "Protocols") return "Guides";
  return rawCategory;
}

export function intentTag(post: BlogPost): string {
  if (post.category === "Protocols") return "Routine";
  if (post.category === "Research") return "Deep science";
  return "Beginner";
}

export function keyTakeaway(post: BlogPost): string {
  const firstBullet = post.bullets?.[0]?.trim();
  if (firstBullet) return firstBullet;

  const firstSentence = post.excerpt.split(".")[0]?.trim();
  if (firstSentence) return firstSentence;

  return "Absorption format can influence consistency and outcomes.";
}

export function formatCardDate(date: string): string {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function categorySearchTokens(category: BlogPost["category"]): string[] {
  switch (category) {
    case "Research":
      return ["Research", "Science", "Data"];
    case "Protocols":
      return ["Guides", "Routine", "Daily"];
    case "Ingredients":
      return ["Ingredients", "Compounds", "Breakdowns"];
    case "Lifestyle":
      return ["Lifestyle", "Habits", "Daily practice"];
    default:
      return [displayCategory(category)];
  }
}
