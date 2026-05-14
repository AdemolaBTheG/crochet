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
          icon: { ios: 'leaf.fill', android: 'spa', web: 'spa' },
        },
        {
          id: 'intermediate',
          label: t('onboarding.quiz.steps.skillLevel.options.intermediate'),
          icon: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
        },
        {
          id: 'advanced',
          label: t('onboarding.quiz.steps.skillLevel.options.advanced'),
          icon: {
            ios: 'flame.fill',
            android: 'local_fire_department',
            web: 'local_fire_department',
          },
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
          icon: { ios: 'book.fill', android: 'menu_book', web: 'menu_book' },
        },
        {
          id: 'finish-first-project',
          label: t('onboarding.quiz.steps.goal.options.finishFirstProject'),
          icon: { ios: 'checkmark.circle.fill', android: 'task_alt', web: 'task_alt' },
        },
        {
          id: 'build-habit',
          label: t('onboarding.quiz.steps.goal.options.buildHabit'),
          icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
        },
      ],
    },
    {
      field: 'handedness',
      title: t('onboarding.quiz.steps.handedness.title'),
      subtitle: t('onboarding.quiz.steps.handedness.subtitle'),
      ctaLabel: t('onboarding.quiz.steps.handedness.cta'),
      options: [
        {
          id: 'right',
          label: t('onboarding.quiz.steps.handedness.options.right'),
          icon: {
            ios: 'arrow.right.circle.fill',
            android: 'arrow_circle_right',
            web: 'arrow_circle_right',
          },
        },
        {
          id: 'left',
          label: t('onboarding.quiz.steps.handedness.options.left'),
          icon: {
            ios: 'arrow.left.circle.fill',
            android: 'arrow_circle_left',
            web: 'arrow_circle_left',
          },
        },
      ],
    },
  ];
}
