import QuizScreenView from '@/components/quiz-screen';
import { getOnboardingQuizSteps } from '@/constants/onboarding-quiz';
import { useTranslation } from 'react-i18next';

export default function OnboardingIndex() {
  const { t } = useTranslation();

  return (
    <QuizScreenView
      steps={getOnboardingQuizSteps(t)}
      completeHref="/(onboarding)/daily-goal"
      markCompletedOnFinish={false}
    />
  );
}
