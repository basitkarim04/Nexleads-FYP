import { Stack } from 'expo-router';

// A per-tab Stack so detail screens (e.g. [leadId]) push ON TOP of the leads
// list and router.back() returns here — instead of falling back to the default
// tab (dashboard). Without this stack the screens were Tabs siblings with no
// shared history, which made "back" jump to home.
export default function LeadsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[leadId]" />
    </Stack>
  );
}
