import { theme } from '@/constants/Theme';
import { Stack } from 'expo-router';

export default function ProjectsStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" />
      <Stack.Screen
        name="chat/[id]"
        options={{
          title: 'Ask AI',
          presentation: 'modal',
          headerLargeTitle: false,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      />
      <Stack.Screen
        name="complete/[id]"
        options={{
          title: 'Project complete',
          headerLargeTitle: false,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      />
    </Stack>
  );
}
