import { theme } from '@/constants/Theme';
import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="questions" options={{ headerShown: false }} />
      <Stack.Screen name="daily-goal" options={{ headerShown: false }} />
      <Stack.Screen name="yearly-goal" options={{ headerShown: false }} />
      <Stack.Screen name="loader" options={{ headerShown: false }} />
      <Stack.Screen name="demo" options={{ headerShown: false }} />
      <Stack.Screen name="trial-offer" options={{ headerShown: false }} />
    </Stack>
  );
}
