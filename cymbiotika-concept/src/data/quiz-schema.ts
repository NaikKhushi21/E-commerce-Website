import type { WellnessGoal } from "@/data/goals";

/* ============================================================================
   Quiz schema — single source of truth for the /quiz flow.
   ----------------------------------------------------------------------------
   The runner (QuizRunner.tsx) walks SECTIONS top-to-bottom, rendering each
   question by its `type`. Branching is just a `showIf(answers)` predicate per
   question — when it returns false the question is skipped silently.

   To add/remove/reorder questions, edit this file. The renderer is generic
   and doesn't need to know about specific question ids.
   ========================================================================== */

export type Sex = "male" | "female" | "skip";

export type AgeBracket = "18-34" | "35-54" | "55+";

export type ActivityLevel = "sedentary" | "active" | "athlete";

export type StackSize = "starter" | "complete" | "open";

export type Allergen =
  | "nuts"
  | "dairy"
  | "soy"
  | "gluten"
  | "shellfish"
  | "eggs"
  | "seasonal";

/** Shape of accumulated answers as the user progresses. All fields optional
 *  until the corresponding question is answered. Recommendation engine reads
 *  this object. */
export type QuizAnswers = {
  sex?: Sex;
  ageBracket?: AgeBracket;
  activity?: ActivityLevel;
  zones?: WellnessGoal[];             // populated by the existing body-zone picker
  goals?: WellnessGoal[];             // top 3 from explicit multi-select
  challenge?: string;
  stressSymptom?: string;
  energyDetail?: string;
  solutionStyle?: string;
  plantBased?: boolean;
  allergens?: Allergen[];
  currentSupplements?: string[];
  stackSize?: StackSize;
};

type Predicate = (answers: QuizAnswers) => boolean;

type Common = {
  id: keyof QuizAnswers;
  prompt: string;
  /** Optional persuasion panel — shown below the answer surface. Use for
   *  personal/sensitive questions where the user might wonder why we're
   *  asking. Keep under 30 words. */
  whyWeAsk?: string;
  /** Predicate for conditional questions. Omit for always-shown. */
  showIf?: Predicate;
};

export type Question =
  | (Common & {
      type: "visual-pick";
      options: {
        id: string;
        label: string;
        /** Omit for text-only options (e.g. "Prefer not to say"). */
        illustration?: "male-body" | "female-body";
      }[];
    })
  | (Common & {
      type: "single";
      options: string[];
    })
  | (Common & {
      type: "multi";
      options: string[];
      max?: number;
    })
  | (Common & {
      type: "yes-no";
    })
  | (Common & {
      type: "age-bracket";
      options: AgeBracket[];
    })
  | (Common & {
      // Special slot for the existing body-zone picker UI. The renderer
      // delegates to <BodyZoneStep /> instead of a generic option list.
      type: "body-zones";
    });

export type Section = {
  id: string;
  /** Label shown in the progress indicator ("Section 2 of 5"). */
  title: string;
  questions: Question[];
};

/* ============================================================================
   The schema itself
   ========================================================================== */

export const QUIZ_SCHEMA: Section[] = [
  {
    id: "about-you",
    title: "About you",
    questions: [
      {
        id: "sex",
        type: "visual-pick",
        prompt: "Select what applies for product matching.",
        whyWeAsk:
          "Some formulas (iron, hormone support, prostate, longevity) are matched to biological sex. We don't use this anywhere else.",
        options: [
          { id: "male", label: "Male", illustration: "male-body" },
          { id: "female", label: "Female", illustration: "female-body" },
          { id: "skip", label: "Prefer not to say" },
        ],
      },
      {
        id: "ageBracket",
        type: "age-bracket",
        prompt: "What's your age range?",
        whyWeAsk:
          "Cellular needs shift with age. Longevity and NAD+ formulas weight differently for 55+, recovery skews younger.",
        options: ["18-34", "35-54", "55+"],
      },
      {
        id: "activity",
        type: "single",
        prompt: "How active are you in a typical week?",
        options: ["Sedentary (mostly desk-bound)", "Active (3–4 workouts)", "Athlete (5+ workouts or sport)"],
      },
    ],
  },

  {
    id: "your-body",
    title: "Your body",
    questions: [
      {
        id: "zones",
        type: "body-zones",
        prompt: "Tap where you want to feel different.",
        // The existing picker handles its own copy/state — this question just
        // owns the slot. Output: WellnessGoal[].
      },
    ],
  },

  {
    id: "goals",
    title: "Goals & challenges",
    questions: [
      {
        id: "goals",
        type: "multi",
        prompt: "What are your top health goals?",
        max: 3,
        // Mirrors the labels from data/goals.ts plus a few extras the brand
        // already speaks to.
        options: [
          "Energy",
          "Immunity",
          "Gut Health",
          "Brain Health",
          "Sleep",
          "Stress",
          "Skin",
          "Detox",
          "Longevity",
          "Recovery",
          "Heart Health",
          "Fitness",
          "Healthy Aging",
          "Joint and Bone Health",
        ],
      },
      {
        id: "challenge",
        type: "single",
        prompt: "What's your biggest day-to-day challenge?",
        options: [
          "Low energy or motivation",
          "Slow recovery or inconsistent sleep",
          "Digestive issues that affect performance",
          "Stress or a busy schedule",
          "Trouble focusing under pressure",
          "Other",
        ],
      },
      {
        id: "stressSymptom",
        type: "single",
        prompt: "How does stress show up for you?",
        options: [
          "Tension in my body and feeling on edge",
          "Racing thoughts and difficulty concentrating",
          "Trouble falling or staying asleep",
          "Digestive issues like bloating or discomfort",
          "Other",
        ],
        // Only shown when stress is in zones/goals or selected as challenge.
        showIf: (a) =>
          (a.zones ?? []).includes("stress") ||
          (a.zones ?? []).includes("sleep") ||
          (a.goals ?? []).map((g) => g.toLowerCase()).some((g) => g === "stress" || g === "sleep") ||
          a.challenge === "Stress or a busy schedule",
      },
      {
        id: "energyDetail",
        type: "single",
        prompt: "What would help you most right now?",
        options: [
          "Feeling calmer and more balanced through the day",
          "Staying focused and clear-headed under pressure",
          "Unwinding at night and sleeping more soundly",
          "Supporting my digestion when stress strikes",
          "Boosting energy without the jitters",
          "Other",
        ],
        // Shown when energy or brain are signals.
        showIf: (a) =>
          (a.zones ?? []).includes("energy") ||
          (a.zones ?? []).includes("brain-health") ||
          (a.goals ?? []).map((g) => g.toLowerCase()).some((g) => g === "energy" || g === "brain health") ||
          a.challenge === "Low energy or motivation" ||
          a.challenge === "Trouble focusing under pressure",
      },
    ],
  },

  {
    id: "approach",
    title: "Your approach",
    questions: [
      {
        id: "solutionStyle",
        type: "single",
        prompt: "What kind of solution sounds best?",
        options: [
          "A daily adaptogen that helps me stay steady",
          "Something I can take when I need focus without jitters",
          "A calming evening ritual to help me wind down",
          "A gut-supportive blend with calming benefits",
          "Keep it simple with daily essentials",
          "Other",
        ],
      },
    ],
  },

  {
    id: "diet-restrictions",
    title: "Diet & restrictions",
    questions: [
      {
        id: "plantBased",
        type: "yes-no",
        prompt: "Do you follow a plant-based diet?",
        whyWeAsk:
          "Plant-based diets often need B12, omega-3, and iron support. We'll factor that in.",
      },
      {
        id: "allergens",
        type: "multi",
        prompt: "Any of these allergies?",
        whyWeAsk:
          "We'll filter out formulas containing these ingredients before recommending.",
        // Single multi-select replaces N separate yes/no screens.
        options: [
          "Tree nuts (almond, macadamia, cashew)",
          "Dairy",
          "Soy",
          "Gluten",
          "Shellfish",
          "Eggs",
          "Seasonal allergies",
          "None of these",
        ],
      },
    ],
  },

  {
    id: "current-routine",
    title: "Current routine",
    questions: [
      {
        id: "currentSupplements",
        type: "multi",
        prompt: "Already taking any of these? (Optional)",
        whyWeAsk:
          "Prevents us from recommending a duplicate of something you're already on.",
        options: [
          "Multivitamin",
          "Vitamin D3",
          "Omega-3 / fish oil",
          "Magnesium",
          "Probiotic",
          "Protein powder",
          "Collagen",
          "Greens powder",
          "None of these",
        ],
      },
    ],
  },

  {
    id: "your-fit",
    title: "Your fit",
    questions: [
      {
        id: "stackSize",
        type: "single",
        prompt: "How much can your routine hold?",
        options: [
          "Simple 2-product starter",
          "Complete stack (4–6 products)",
          "Open to whatever fits best",
        ],
      },
    ],
  },
];

/* ============================================================================
   Helpers — runner uses these.
   ========================================================================== */

/** Flatten the schema to a list of questions visible given the current
 *  answers. Branching is resolved here so the runner just walks an array. */
export function visibleQuestions(answers: QuizAnswers): Question[] {
  return QUIZ_SCHEMA.flatMap((section) =>
    section.questions.filter((q) => q.showIf?.(answers) ?? true),
  );
}

/** Total visible question count for the progress indicator. */
export function totalVisible(answers: QuizAnswers): number {
  return visibleQuestions(answers).length;
}

/** Which section a given question belongs to (for "Section X of Y" labels). */
export function sectionIndexOf(questionId: keyof QuizAnswers): number {
  return QUIZ_SCHEMA.findIndex((s) => s.questions.some((q) => q.id === questionId));
}
