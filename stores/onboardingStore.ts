import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import zustandStorage from "./storage";

export type SkillLevel = "beginner" | "intermediate" | "advanced" | null;
export type Goal =
  | "learn-basics"
  | "finish-first-project"
  | "build-habit"
  | null;
export type Handedness = "right" | "left" | null;

interface OnboardingState {
  isOnboardingCompleted: boolean;
  skillLevel: SkillLevel;
  goal: Goal;
  handedness: Handedness;
  setOnboardingCompleted: (completed: boolean) => void;
  setSkillLevel: (value: SkillLevel) => void;
  setGoal: (value: Goal) => void;
  setHandedness: (value: Handedness) => void;
  resetOnboarding: () => void;
}

const initialState = {
  isOnboardingCompleted: false,
  skillLevel: null as SkillLevel,
  goal: null as Goal,
  handedness: null as Handedness,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setOnboardingCompleted: (completed) =>
        set({ isOnboardingCompleted: completed }),
      setSkillLevel: (value) => set({ skillLevel: value }),
      setGoal: (value) => set({ goal: value }),
      setHandedness: (value) => set({ handedness: value }),
      resetOnboarding: () => set(initialState),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
