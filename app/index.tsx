import LoadingShimmer from '@/components/shimmer/loading-shimmer';
import { useSubscription } from '@/context/SubscriptionContext';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isOnboardingCompleted } = useOnboardingStore();
  const { isPro, isLoading } = useSubscription();

  if (!isOnboardingCompleted) {
    return <Redirect href="/(onboarding)" />;
  }

  if (isLoading) {
    return <LoadingShimmer />;
  }

  if (isPro) {
    return <Redirect href="/(tabs)/(home)" />;
  }

  return <Redirect href="/(paywalls)" />;
}
