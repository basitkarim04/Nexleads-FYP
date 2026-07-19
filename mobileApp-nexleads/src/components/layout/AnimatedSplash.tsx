import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Navy used by the web/"backend" splash. The splash PNG itself is transparent,
// so without an explicit colored layer behind it the logo is invisible — this
// is the background color the task asked us to add.
const SPLASH_BG = '#071a3d';

interface AnimatedSplashProps {
  // Becomes true once the app is ready to be shown (fonts loaded, session
  // restored, etc.). The grow/fade-out animation only starts after this.
  isAppReady: boolean;
  // Called when the splash animation has fully finished and the overlay has
  // faded out, so the parent can stop rendering this component.
  onFinish: () => void;
}

/**
 * Full-screen branded splash overlay.
 *
 * Flow:
 *  1. The native splash (expo-splash-screen) is held visible until this JS
 *     overlay has mounted, so there is no white flash on launch.
 *  2. This overlay shows the same navy background + logo as the native splash.
 *  3. Once `isAppReady`, the logo scales up to ~fill the screen over ~1.2s,
 *     then the whole overlay fades out and `onFinish` fires to reveal the app.
 */
export function AnimatedSplash({ isAppReady, onFinish }: AnimatedSplashProps) {
  // Opacity of the entire overlay (used for the final fade-out).
  const containerOpacity = useRef(new Animated.Value(1)).current;
  // Scale of the logo — grows from 1 to fill the screen.
  const logoScale = useRef(new Animated.Value(1)).current;
  const [isNativeHidden, setIsNativeHidden] = useState(false);

  // Hide the native splash as soon as our JS overlay is on screen. Because our
  // overlay paints the identical navy + logo, the handoff is seamless.
  const onImageLayout = async () => {
    try {
      await SplashScreen.hideAsync();
    } catch {
      // hideAsync throws if already hidden — safe to ignore.
    } finally {
      setIsNativeHidden(true);
    }
  };

  useEffect(() => {
    if (!isAppReady || !isNativeHidden) return;

    // Hold a beat on the static splash, then grow the logo to full screen and
    // fade the overlay out — a standard "splash → app" reveal.
    Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 6,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) onFinish();
    });
  }, [isAppReady, isNativeHidden, logoScale, containerOpacity, onFinish]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { opacity: containerOpacity }]}
    >
      <View style={styles.center}>
        <Animated.Image
          source={require('../../../assets/splash.png')}
          onLayout={onImageLayout}
          resizeMode="contain"
          style={[styles.logo, { transform: [{ scale: logoScale }] }]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_BG,
    zIndex: 999,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
