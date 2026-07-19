import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';
import { store } from '../src/store';
import { AnimatedSplash } from '../src/components/layout/AnimatedSplash';

// Keep the native splash visible until our animated JS splash takes over, so
// there's no white flash between the OS splash and the app.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* no-op: preventAutoHideAsync can reject if called more than once */
});

const STRIPE_PUBLISHABLE_KEY = "pk_test_51SwqzbJwDoDn6hRevJqydKFkVYlXJeGpfpwltdLXsPWbmvSruH6wu0gVmOlOO48ypJxWufRaVDtLxqYbFDasokkO00NftTJjB6";

function RootLayoutInner() {
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
  });
  // Stays true until the animated splash has fully grown + faded out.
  const [splashVisible, setSplashVisible] = useState(true);

  // The app is "ready" once fonts are in. Render the navigator underneath the
  // splash overlay so it's warmed up by the time the splash fades away.
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="admin" />
      </Stack>
      {splashVisible && (
        <AnimatedSplash
          isAppReady={fontsLoaded}
          onFinish={() => setSplashVisible(false)}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <Provider store={store}>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <RootLayoutInner />
        </StripeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
