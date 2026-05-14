import { theme } from '@/constants/Theme';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack } from 'expo-router';
export default function LearnLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Learn',
          headerLargeTitle: true,
          headerTransparent: isLiquidGlassAvailable(),
          headerStyle: {
            backgroundColor: isLiquidGlassAvailable() ? 'transparent' : theme.colors.background,
          },
        }}
      />
    </Stack>
  );
}
