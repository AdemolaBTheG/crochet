import { theme } from '@/constants/Theme';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack } from 'expo-router';
export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
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
