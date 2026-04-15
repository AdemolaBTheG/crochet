import { theme } from '@/constants/Theme';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack, useRouter } from 'expo-router';

export default function SettingsLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTransparent: isLiquidGlassAvailable(),
        headerStyle: {
          backgroundColor: isLiquidGlassAvailable() ? 'transparent' : theme.colors.background,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        unstable_headerLeftItems: () => [
          {
            type: 'button' as const,
            label: 'Close',
            icon: { type: 'sfSymbol' as const, name: 'chevron.backward' },
            onPress: () => router.back(),
          },
        ],
      }}>
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
    </Stack>
  );
}
