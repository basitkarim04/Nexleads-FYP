import { Stack } from 'expo-router';

// Per-tab Stack so [projectId] pushes over the projects board and back returns
// to the board rather than the dashboard.
export default function ProjectsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[projectId]" />
    </Stack>
  );
}
