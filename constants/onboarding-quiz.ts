import type { QuizScreenConfig } from "@/components/quiz-screen";

export const ONBOARDING_QUIZ_STEPS: QuizScreenConfig[] = [
  {
    field: "skillLevel",
    title: "What is your crochet level?",
    subtitle:
      "We will tune your lessons and starter projects around where you are today.",
    ctaLabel: "Continue",
    options: [
      { id: "beginner", label: "I am completely new", emoji: "🧶" },
      { id: "intermediate", label: "I know the basics", emoji: "✨" },
      { id: "advanced", label: "I want tougher projects", emoji: "🔥" },
    ],
  },
  {
    field: "goal",
    title: "What do you want help with first?",
    subtitle:
      "Pick the main reason you downloaded YarnPal so the app can guide you there faster.",
    ctaLabel: "Continue",
    options: [
      { id: "learn-basics", label: "Learn the core stitches", emoji: "🪡" },
      {
        id: "finish-first-project",
        label: "Finish my first real project",
        emoji: "✅",
      },
      { id: "build-habit", label: "Build a steady crochet habit", emoji: "📅" },
    ],
  },
  {
    field: "handedness",
    title: "Which hand do you crochet with?",
    subtitle:
      "This helps us show the right teaching angle once left-handed content is added.",
    ctaLabel: "Start YarnPal",
    options: [
      { id: "right", label: "Right-handed", emoji: "👉" },
      { id: "left", label: "Left-handed", emoji: "👈" },
    ],
  },
];
