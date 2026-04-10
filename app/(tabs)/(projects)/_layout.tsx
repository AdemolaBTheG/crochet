import { Stack } from "expo-router";

export default function ProjectsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Projects", headerLargeTitle: true }}
      />
    </Stack>
  );
}
