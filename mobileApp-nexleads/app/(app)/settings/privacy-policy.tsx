import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing } from '../../../src/theme/spacing';

interface Section {
  title: string;
  body: string;
}

const LAST_UPDATED = 'June 2026';

const SECTIONS: Section[] = [
  {
    title: '1. Information We Collect',
    body:
      'We collect the information you provide when you create an account, such as your name and email address, along with the leads, emails, and project data you generate while using NexLeads. We also collect basic usage data to keep the service running reliably.',
  },
  {
    title: '2. How We Use Your Information',
    body:
      'Your information is used to operate and improve NexLeads — managing your account, delivering the lead-generation and outreach features, processing your subscription, and providing support. We do not sell your personal information to third parties.',
  },
  {
    title: '3. Data Sharing',
    body:
      'We share data only with the service providers needed to run NexLeads (for example, payment processing and email delivery), and only to the extent required to provide those services. These providers are bound to protect your data.',
  },
  {
    title: '4. Data Security',
    body:
      'We apply industry-standard safeguards to protect your data in transit and at rest. While no system can be guaranteed completely secure, we work continuously to keep your information safe.',
  },
  {
    title: '5. Your Rights',
    body:
      'You can access, update, or delete your account information at any time from the Settings screen. If you would like your data exported or permanently removed, contact our support team.',
  },
  {
    title: '6. Changes to This Policy',
    body:
      'We may update this Privacy Policy from time to time. When we do, we will revise the “Last updated” date above and, where appropriate, notify you within the app.',
  },
  {
    title: '7. Contact Us',
    body:
      'If you have any questions about this Privacy Policy or how your data is handled, reach out to us at support@nexleads.app.',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>
        <Text style={styles.intro}>
          Your privacy matters to us. This policy explains what information NexLeads collects, how we
          use it, and the choices you have.
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
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
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  updated: { ...Typography.captionXS, color: Colors.muted, marginBottom: Spacing.sm },
  intro: { ...Typography.body, color: Colors.text, marginBottom: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    ...Typography.sectionTitle,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 6,
  },
  sectionBody: { ...Typography.body, color: Colors.muted, lineHeight: 22 },
});
