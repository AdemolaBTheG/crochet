import QuizScreenView from "@/components/quiz-screen";
import { ONBOARDING_QUIZ_STEPS } from "@/constants/onboarding-quiz";

export default function OnboardingIndex() {
  return <QuizScreenView steps={ONBOARDING_QUIZ_STEPS} />;
}
