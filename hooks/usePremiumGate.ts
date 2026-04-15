import { useSubscription } from '@/context/SubscriptionContext';
import { router } from 'expo-router';
import { useEffect } from 'react';

export function usePremiumGate() {
  const { isPro } = useSubscription();

  useEffect(() => {
    if (isPro) return;

    router.replace('/(paywalls)');
  }, [isPro]);

  return isPro;
}
