import { NavigationHeaderAction } from '@/components/navigation-header-action';
import { theme } from '@/constants/Theme';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack, useRouter } from 'expo-router';
import { Platform } from 'react-native';

export default function LessonsLayout() {
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
        ...(Platform.OS === 'ios'
          ? {
              unstable_headerLeftItems: () => [
                {
                  type: 'button' as const,
                  label: 'Close',
                  icon: { type: 'sfSymbol' as const, name: 'chevron.backward' },
                  onPress: () => router.back(),
                },
              ],
            }
          : {
              headerLeft: () => (
                <NavigationHeaderAction
                  label="Close"
                  icon="chevron-left"
                  onPress={() => router.back()}
                />
              ),
            }),
      }}>
      <Stack.Screen name="all" options={{ title: 'All Lessons' }} />

      <Stack.Screen name="[slug]" options={{ title: 'Lesson' }} />
      <Stack.Screen name="practice/[slug]" options={{ title: 'Practice' }} />
    </Stack>
  );
}
