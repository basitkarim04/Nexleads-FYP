import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { Lead, LeadInterest } from '../../types/lead.types';
import { AppDispatch } from '../../store';
import { updateLeadInterest } from '../../store/slices/leadSlice';
import { GlassCard } from '../ui/GlassCard';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LeadInterestToggle } from './LeadInterestToggle';
import { Badge } from '../ui/Badge';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface LeadCardProps {
  lead: Lead;
  // When true, the card shows a selection checkbox and tapping the card body
  // toggles selection instead of opening the lead detail.
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (leadId: string) => void;
}

const platformColors: Record<string, string> = {
  upwork: Colors.upwork,
  linkedin: Colors.linkedin,
  freelancer: Colors.freelancer,
  fiverr: Colors.fiverr,
};

export function LeadCard({ lead, selectable = false, selected = false, onToggleSelect }: LeadCardProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleInterest = useCallback(
    (interest: LeadInterest) => {
      dispatch(updateLeadInterest({ leadId: lead._id, payload: { interest } }));
    },
    [dispatch, lead._id]
  );

  const platformColor = platformColors[lead.platform?.toLowerCase()] ?? Colors.primary;

  const openDetails = useCallback(() => {
    router.push(`/(app)/leads/${lead._id}`);
  }, [lead._id]);

  // In selection mode, tapping the card toggles selection; otherwise it opens
  // the detail screen (preserving the original behavior).
  const handleCardPress = useCallback(() => {
    if (selectable) onToggleSelect?.(lead._id);
    else openDetails();
  }, [selectable, onToggleSelect, lead._id, openDetails]);

  return (
    <GlassCard
      style={styles.card}
      accentColor={platformColor}
      onPress={handleCardPress}
    >
      <View style={styles.header}>
        {selectable && (
          <TouchableOpacity
            onPress={() => onToggleSelect?.(lead._id)}
            hitSlop={10}
            style={styles.checkbox}
          >
            <Ionicons
              name={selected ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={selected ? Colors.primary : Colors.muted}
            />
          </TouchableOpacity>
        )}
        <View style={styles.info}>
          <Text style={styles.company} numberOfLines={1}>{lead.company}</Text>
          <Text style={styles.name} numberOfLines={1}>{lead.name}</Text>
        </View>
        <LeadStatusBadge status={lead.status} />
      </View>

      <View style={styles.meta}>
        <Badge
          label={lead.platform}
          color={platformColor}
        />
        {lead.email && (
          <Text style={styles.email} numberOfLines={1}>{lead.email}</Text>
        )}
      </View>

      <View style={styles.footer}>
        <LeadInterestToggle interest={lead.interest} onToggle={handleInterest} />
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push(`/(app)/emails/compose?leadId=${lead._id}&to=${lead.email}`)}
          >
            <Ionicons name="mail-outline" size={16} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push(`/(app)/leads/${lead._id}`)}
          >
            <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  checkbox: {
    marginRight: Spacing.sm,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  info: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  company: {
    ...Typography.sectionTitle,
    fontSize: 15,
    color: Colors.text,
  },
  name: {
    ...Typography.body,
    color: Colors.muted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  email: {
    ...Typography.captionXS,
    color: Colors.muted,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.glassInput,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
});
