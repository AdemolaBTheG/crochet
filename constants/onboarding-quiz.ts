import type { QuizScreenConfig } from '@/components/quiz-screen';
import type { TFunction } from 'i18next';

export function getOnboardingQuizSteps(t: TFunction): QuizScreenConfig[] {
  return [
    {
      field: 'skillLevel',
      title: t('onboarding.quiz.steps.skillLevel.title'),
      subtitle: t('onboarding.quiz.steps.skillLevel.subtitle'),
      ctaLabel: t('onboarding.quiz.steps.skillLevel.cta'),
      options: [
        {
          id: 'beginner',
          label: t('onboarding.quiz.steps.skillLevel.options.beginner'),
          emoji: '🧶',
        },
        {
          id: 'intermediate',
          label: t('onboarding.quiz.steps.skillLevel.options.intermediate'),
          emoji: '✨',
        },
        {
          id: 'advanced',
          label: t('onboarding.quiz.steps.skillLevel.options.advanced'),
          emoji: '🔥',
        },
      ],
    },
    {
      field: 'goal',
      title: t('onboarding.quiz.steps.goal.title'),
      subtitle: t('onboarding.quiz.steps.goal.subtitle'),
      ctaLabel: t('onboarding.quiz.steps.goal.cta'),
      options: [
        {
          id: 'learn-basics',
          label: t('onboarding.quiz.steps.goal.options.learnBasics'),
          emoji: '🪡',
        },
        {
          id: 'finish-first-project',
          label: t('onboarding.quiz.steps.goal.options.finishFirstProject'),
          emoji: '✅',
        },
        {
          id: 'build-habit',
          label: t('onboarding.quiz.steps.goal.options.buildHabit'),
          emoji: '📅',
        },
      ],
    },
    {
      field: 'handedness',
      title: t('onboarding.quiz.steps.handedness.title'),
      subtitle: t('onboarding.quiz.steps.handedness.subtitle'),
      ctaLabel: t('onboarding.quiz.steps.handedness.cta'),
      options: [
        { id: 'right', label: t('onboarding.quiz.steps.handedness.options.right'), emoji: '👉' },
        { id: 'left', label: t('onboarding.quiz.steps.handedness.options.left'), emoji: '👈' },
      ],
    },
  ];
}
