import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';
import { Shadows } from '../../theme/shadows';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({ icon, label, value, color = Colors.primary }: StatCardProps) {
  return (
    <View style={[styles.card, { borderColor: color, ...Shadows.brutalism, shadowColor: color }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.glassCard,
    borderRadius: Radius.lg,
    borderWidth: 2,
    padding: Spacing.md,
    alignItems: 'center',
    margin: Spacing.xs,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    textAlign: 'center',
  },
});
