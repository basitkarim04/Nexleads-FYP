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
    title: '1. Acceptance of Terms',
    body:
      'By creating an account or using NexLeads, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use the service.',
  },
  {
    title: '2. Use of the Service',
    body:
      'NexLeads provides lead-generation, outreach, and project-tracking tools. You agree to use the service only for lawful purposes and not to send spam, harass recipients, or violate any applicable laws or third-party rights.',
  },
  {
    title: '3. Accounts & Responsibility',
    body:
      'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use.',
  },
  {
    title: '4. Subscriptions & Payments',
    body:
      'Paid plans are billed in advance on a monthly or annual basis. Charges are non-refundable except where required by law. You can change or cancel your plan at any time from the Subscription screen.',
  },
  {
    title: '5. Acceptable Use',
    body:
      'You may not misuse the service by interfering with its normal operation, attempting to access it using a method other than the interface we provide, or using it to distribute malicious or unlawful content.',
  },
  {
    title: '6. Intellectual Property',
    body:
      'All content, branding, and software that make up NexLeads remain the property of NexLeads and its licensors. You retain ownership of the data and content you create using the service.',
  },
  {
    title: '7. Termination',
    body:
      'We may suspend or terminate your access to NexLeads if you violate these terms. You may stop using the service at any time. Certain provisions survive termination, including those relating to liability and intellectual property.',
  },
  {
    title: '8. Limitation of Liability',
    body:
      'NexLeads is provided “as is” without warranties of any kind. To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the service.',
  },
  {
    title: '9. Changes to These Terms',
    body:
      'We may update these Terms & Conditions from time to time. When we do, we will revise the “Last updated” date above and, where appropriate, notify you within the app.',
  },
  {
    title: '10. Contact Us',
    body:
      'If you have any questions about these Terms & Conditions, reach out to us at support@nexleads.app.',
  },
];

export default function TermsConditionsScreen() {
  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Terms & Conditions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>
        <Text style={styles.intro}>
          Please read these Terms & Conditions carefully before using NexLeads. They govern your
          access to and use of the service.
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
