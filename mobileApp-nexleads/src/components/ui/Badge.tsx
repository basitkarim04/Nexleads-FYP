import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  style?: ViewStyle;
}

export function Badge({
  label,
  color = Colors.primary,
  bgColor,
  style,
}: BadgeProps) {
  const bg = bgColor ?? `${color}22`;
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: `${color}44` }, style]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.captionXS,
    fontFamily: 'Poppins_600SemiBold',
    textTransform: 'capitalize',
  },
});
