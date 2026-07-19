import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';
import { Shadows } from '../../theme/shadows';

interface BentoTileProps {
  icon: string;
  label: string;
  value: string | number;
  accentColor?: string;
  flex?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function BentoTile({
  icon,
  label,
  value,
  accentColor = Colors.primary,
  flex = 1,
  children,
  style,
}: BentoTileProps) {
  return (
    <View style={[styles.tile, { flex }, style]}>
      <View style={[styles.accentStripe, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: `${accentColor}22` }]}>
          <Ionicons name={icon as any} size={20} color={accentColor} />
        </View>
        {children ? (
          children
        ) : (
          <>
            <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: Colors.glassCard,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    margin: Spacing.xs,
    ...Shadows.card,
  },
  accentStripe: {
    height: 3,
    width: '100%',
  },
  content: {
    padding: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  value: {
    ...Typography.metric,
    marginBottom: 2,
  },
  label: {
    ...Typography.caption,
    color: Colors.muted,
  },
});
