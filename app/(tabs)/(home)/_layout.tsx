import { NavigationHeaderAction } from '@/components/navigation-header-action';
import { theme } from '@/constants/Theme';
import { useSubscription } from '@/context/SubscriptionContext';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack, useRouter } from 'expo-router';
import { Platform } from 'react-native';
export default function HomeLayout() {
  const router = useRouter();
  const { isPro } = useSubscription();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerLargeTitle: false,
          headerTransparent: isLiquidGlassAvailable(),
          headerStyle: {
            backgroundColor: isLiquidGlassAvailable() ? 'transparent' : theme.colors.background,
          },
          ...(Platform.OS === 'ios'
            ? {
                unstable_headerLeftItems: () => [
                  {
                    type: 'button' as const,
                    label: 'Settings',
                    icon: { type: 'sfSymbol' as const, name: 'gear' },
                    onPress: () => router.push('/(settings)'),
                  },
                ],
                unstable_headerRightItems: !isPro
                  ? () => [
                      {
                        type: 'button' as const,
                        variant: 'prominent',
                        label: 'Pro',
                        icon: { type: 'sfSymbol' as const, name: 'crown.fill' },
                        tintColor: theme.colors.primary,
                        onPress: () => router.push('/(paywalls)'),
                      },
                    ]
                  : undefined,
              }
            : {
                headerLeft: () => (
                  <NavigationHeaderAction
                    label="Settings"
                    icon="cog-outline"
                    compact
                    onPress={() => router.push('/(settings)')}
                  />
                ),
                headerRight: !isPro
                  ? () => (
                      <NavigationHeaderAction
                        label="Pro"
                        icon="crown"
                        variant="prominent"
                        onPress={() => router.push('/(paywalls)')}
                      />
                    )
                  : undefined,
              }),
        }}
      />
    </Stack>
  );
}
