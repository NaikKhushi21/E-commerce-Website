export const WELLNESS_GOALS = [
  "energy",
  "immunity",
  "gut-health",
  "brain-health",
  "sleep",
  "stress",
  "skin",
  "detox",
  "longevity",
] as const;

export type WellnessGoal = (typeof WELLNESS_GOALS)[number];

export const GOAL_LABELS: Record<WellnessGoal, string> = {
  energy: "Energy",
  immunity: "Immunity",
  "gut-health": "Gut Health",
  "brain-health": "Brain Health",
  sleep: "Sleep",
  stress: "Stress",
  skin: "Skin",
  detox: "Detox",
  longevity: "Longevity",
};
