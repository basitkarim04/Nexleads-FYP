import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radius, Spacing } from '../../theme/spacing';
import { Shadows } from '../../theme/shadows';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  brutalism?: boolean;
  accentColor?: string;
  onPress?: () => void;
}

export function GlassCard({ children, style, brutalism, accentColor, onPress }: GlassCardProps) {
  const content = (
    <View
      style={[
        styles.card,
        brutalism && styles.brutalism,
        brutalism && { borderColor: accentColor ?? Colors.primary },
        style,
      ]}
    >
      {accentColor && <View style={[styles.accentStripe, { backgroundColor: accentColor }]} />}
      <View style={styles.inner}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={style}>
        <View
          style={[
            styles.card,
            brutalism && styles.brutalism,
            brutalism && { borderColor: accentColor ?? Colors.primary },
          ]}
        >
          {accentColor && <View style={[styles.accentStripe, { backgroundColor: accentColor }]} />}
          <View style={styles.inner}>{children}</View>
        </View>
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glassCard,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  brutalism: {
    borderWidth: 2,
    ...Shadows.brutalism,
  },
  accentStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  inner: {
    padding: Spacing.md,
  },
});
