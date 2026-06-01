import { Colors } from '@/constants/Theme';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function AddLayout() {
  const liquidGlassAvailable = isLiquidGlassAvailable();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerTransparent: liquidGlassAvailable,
        contentStyle: { backgroundColor: Colors.background },
        headerStyle: {
          backgroundColor: liquidGlassAvailable ? 'transparent' : Colors.background,
        },
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: t('addPattern.screenTitles.add'),
        }}
      />
      <Stack.Screen
        name="processing"
        options={{
          headerShown: true,
          headerTitle: t('addPattern.screenTitles.processing'),
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="review"
        options={{
          headerShown: true,
          headerTitle: t('addPattern.screenTitles.review'),
        }}
      />
    </Stack>
  );
}
