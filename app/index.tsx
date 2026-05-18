import { useSubscription } from '@/context/SubscriptionContext';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '@/constants/Theme';

export default function Index() {
  const { isOnboardingCompleted } = useOnboardingStore();
  const { isPro, isLoading } = useSubscription();

  if (!isOnboardingCompleted) {
    return <Redirect href="/(onboarding)" />;
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
        }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (isPro) {
    return <Redirect href="/(tabs)/(home)" />;
  }

  return <Redirect href="/(paywalls)" />;
}
