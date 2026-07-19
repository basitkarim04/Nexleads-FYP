import { Stack } from 'expo-router';

// Per-tab Stack so compose/[emailId] push over the email list and back returns
// to the list rather than the dashboard.
export default function EmailsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="compose" />
      <Stack.Screen name="[emailId]" />
    </Stack>
  );
}
