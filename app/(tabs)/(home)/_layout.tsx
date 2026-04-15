import { theme } from '@/constants/Theme';
import { useSubscription } from '@/context/SubscriptionContext';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack, useRouter } from 'expo-router';
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
        }}
      />
    </Stack>
  );
}
