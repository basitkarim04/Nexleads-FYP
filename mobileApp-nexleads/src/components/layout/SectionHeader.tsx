import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.titleWrap}>
        <View style={styles.accent} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accent: {
    width: 4,
    height: 18,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.sectionTitle,
    color: Colors.text,
  },
  action: {
    ...Typography.label,
    color: Colors.primary,
  },
});
