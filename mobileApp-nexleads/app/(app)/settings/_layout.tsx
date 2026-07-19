import { Stack } from 'expo-router';

// Per-tab Stack so the settings sub-pages (profile, password, subscription,
// privacy, terms) push over the settings hub and back returns to the hub
// rather than the dashboard.
export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="password" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms-conditions" />
    </Stack>
  );
}
