import { theme } from '@/constants/Theme';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack, useRouter } from 'expo-router';

export default function ToolsLayout() {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: theme.colors.background,
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
      <Stack.Screen
        name="row-counter"
        options={{
          title: 'Row Counter',
        }}
      />
      <Stack.Screen
        name="stitch-fixes"
        options={{
          title: 'Stitch Fixes',
          headerTransparent: isLiquidGlassAvailable(),
          headerStyle: {
            backgroundColor: isLiquidGlassAvailable() ? 'transparent' : theme.colors.background,
          },
        }}
      />
      <Stack.Screen
        name="size-calculator"
        options={{
          title: 'Size Calculator',
        }}
      />
      <Stack.Screen
        name="identify-stitch"
        options={{
          title: 'Identify Stitch',
          headerTransparent: isLiquidGlassAvailable(),
          headerStyle: {
            backgroundColor: isLiquidGlassAvailable() ? 'transparent' : theme.colors.background,
          },
        }}
      />
    </Stack>
  );
}
