import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import zustandStorage from './storage';

interface CompletedLessonsState {
  completedSlugs: string[];
  markCompleted: (slug: string) => void;
  isCompleted: (slug: string) => boolean;
}

export const useCompletedLessonsStore = create<CompletedLessonsState>()(
  persist(
    (set, get) => ({
      completedSlugs: [],
      markCompleted: (slug) => {
        if (get().completedSlugs.includes(slug)) return;
        set({ completedSlugs: [...get().completedSlugs, slug] });
      },
      isCompleted: (slug) => get().completedSlugs.includes(slug),
    }),
    {
      name: 'completed-lessons-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
