import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LeadStatus } from '../../types/lead.types';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';
import { Colors } from '../../theme/colors';

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

const statusConfig: Record<LeadStatus, { bg: string; text: string; label: string }> = {
  new: { bg: '#1e3a5f', text: '#7cc7ff', label: 'New' },
  contacted: { bg: '#1a3a2a', text: '#22c55e', label: 'Contacted' },
  responded: { bg: '#2a2a1a', text: '#f59e0b', label: 'Responded' },
  in_discussion: { bg: '#2a1a3a', text: '#a78bfa', label: 'In Discussion' },
  ongoing: { bg: '#1a2a3a', text: '#4ea8ff', label: 'Ongoing' },
  completed: { bg: '#1a3a1a', text: '#22c55e', label: 'Completed' },
  rejected: { bg: '#3a1a1a', text: '#ef4444', label: 'Rejected' },
};

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.new;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.captionXS,
    fontFamily: 'Poppins_600SemiBold',
  },
});
