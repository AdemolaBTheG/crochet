import { Colors } from '@/constants/Theme';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack } from 'expo-router';
export default function FoldersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isLiquidGlassAvailable() ? 'transparent' : Colors.background,
        },
        headerTransparent: isLiquidGlassAvailable(),
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
