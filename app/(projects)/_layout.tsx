import { theme } from '@/constants/Theme';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack } from 'expo-router';
export default function ProjectsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: isLiquidGlassAvailable(),
        headerStyle: {
          backgroundColor: isLiquidGlassAvailable() ? 'transparent' : theme.colors.background,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen
        name="chat/[id]"
        options={{
          title: 'Ask AI',
          presentation: 'modal',
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="complete/[id]"
        options={{
          title: 'Project complete',
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
