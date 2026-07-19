import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper';
import { ComposeForm } from '../../../src/components/emails/ComposeForm';
import { KeyboardAwareWrapper } from '../../../src/components/layout/KeyboardAwareWrapper';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing } from '../../../src/theme/spacing';

export default function ComposeScreen() {
  const { to, leadId, subject, leadIds } = useLocalSearchParams<{
    to?: string;
    leadId?: string;
    subject?: string;
    // Comma-separated lead ids for a bulk send (set when emailing selected leads).
    leadIds?: string;
  }>();

  const leadIdList = leadIds
    ? leadIds.split(',').map((id) => id.trim()).filter(Boolean)
    : undefined;
  const isBulk = !!leadIdList?.length;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(app)/emails')} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{isBulk ? 'Email Selected Leads' : 'Compose Email'}</Text>
      </View>

      <KeyboardAwareWrapper style={styles.scroll}>
        <View style={styles.form}>
          <ComposeForm
            defaultTo={to}
            defaultSubject={subject}
            leadId={leadId}
            leadIds={leadIdList}
            onSent={() => router.push('/(app)/emails')}
          />
        </View>
      </KeyboardAwareWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  backBtn: { padding: 4 },
  title: { ...Typography.headlineM, color: Colors.text },
  scroll: { padding: Spacing.md },
  form: { flex: 1 },
});
