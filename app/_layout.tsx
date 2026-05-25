import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import '@/i18n';
import { initializeHaptics } from '@/services/haptics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { enableScreens } from 'react-native-screens';
import '../global.css';

const queryClient = new QueryClient();

enableScreens();

// Keep splash visible until core app initialization completes.
void SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

export default function RootLayout() {
  const { isReady } = useAppInitialization();
  const subscription = useSubscriptionStatus(isReady);

  useEffect(() => {
    initializeHaptics();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    SplashScreen.hide();
  }, [isReady]);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SubscriptionProvider value={subscription}>
        <QueryClientProvider client={queryClient}>
          <KeyboardProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(settings)" options={{ headerShown: false }} />
              <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
              <Stack.Screen name="(patterns)" options={{ headerShown: false }} />
              <Stack.Screen name="(projects)" options={{ headerShown: false }} />
              <Stack.Screen name="(tools)" options={{ headerShown: false }} />
              <Stack.Screen name="(lessons)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(paywalls)"
                options={{ headerShown: false, presentation: 'fullScreenModal' }}
              />
            </Stack>
          </KeyboardProvider>
        </QueryClientProvider>
      </SubscriptionProvider>
    </GestureHandlerRootView>
  );
}
