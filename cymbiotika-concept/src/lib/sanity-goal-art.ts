/**
 * Goal artwork service layer. Reads `goalArtwork` documents from Sanity and
 * returns a map keyed by WellnessGoal slug for the product detail page's
 * formula block.
 */

import { sanityQuery } from "@/lib/sanity-client";
import type { WellnessGoal } from "@/data/goals";

export type GoalArtwork = {
  src: string;
  subject: string;
  credit: string;
};

type SanityGoalArtworkDoc = {
  goal?: string;
  imageUrl?: string;
  subject?: string;
  credit?: string;
};

export async function getGoalArtworkMap(): Promise<Partial<Record<WellnessGoal, GoalArtwork>>> {
  const query = `*[_type == "goalArtwork" && defined(image.asset)]{
    goal,
    "imageUrl": image.asset->url,
    subject,
    credit
  }`;
  const rows = (await sanityQuery<SanityGoalArtworkDoc[]>(query)) ?? [];

  const map: Partial<Record<WellnessGoal, GoalArtwork>> = {};
  for (const row of rows) {
    if (!row.goal || !row.imageUrl || !row.subject) continue;
    map[row.goal as WellnessGoal] = {
      src: row.imageUrl,
      subject: row.subject,
      credit: row.credit ?? "",
    };
  }
  return map;
}
