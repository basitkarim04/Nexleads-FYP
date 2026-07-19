import React from 'react';
import {
  View,
  ImageBackground,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors } from '../../theme/colors';

const star = require('../../assets/Images/star.png');
const heroVideo = require('../../assets/Images/authBackgroundVideo.mp4');

const { width } = Dimensions.get('window');

// Hero is full-width and proportionally sized. Source art is ~16:10; tune
// HERO_RATIO if the supplied asset has a different aspect ratio.
const HERO_RATIO = 0.82;
const HERO_HEIGHT = Math.round(width * HERO_RATIO);

interface AuthBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Shared space-themed backdrop for the auth screens:r
 *   deep blue → navy gradient, a subtly repeated star particle layer,
 *   and the full-width hero (astronaut + logo) pinned to the top.
 *
 * The hero and the form share one ScrollView so that — with Android's
 * windowSoftInputMode=adjustResize — the whole page can scroll the focused
 * field above the keyboard. When the keyboard is closed everything fits on a
 * single screen without scrolling.
 */
export function AuthBackground({ children, style }: AuthBackgroundProps) {
  const player = useVideoPlayer(heroVideo, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Blue → navy gradient base */}
      <LinearGradient
        colors={['#3671cc', '#0a224f', '#021024']}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Tiled star particles */}
      <ImageBackground
        source={star}
        resizeMode="repeat"
        style={[StyleSheet.absoluteFill, styles.starsLayer]}
        imageStyle={styles.starsImage}
      />

      {/* Soft cyan glow behind the hero */}
      <View style={styles.heroGlow} />

      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Hero pinned flush to the very top, edge-to-edge */}
          <VideoView
            player={player}
            style={styles.hero}
            contentFit="cover"
            nativeControls={false}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
          />

          <View style={[styles.content, style]}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#021024',
  },
  flex: {
    flex: 1,
  },
  starsLayer: {
    pointerEvents: 'none',
  },
  starsImage: {
    opacity: 1,
  },
  heroGlow: {
    position: 'absolute',
    pointerEvents: 'none',
    top: -width * 0.25,
    alignSelf: 'center',
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width,
    opacity: 0.18,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  hero: {
    width: '100%',
    height: HERO_HEIGHT,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
});
