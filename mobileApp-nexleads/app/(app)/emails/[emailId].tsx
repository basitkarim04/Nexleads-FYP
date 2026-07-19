import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../src/store';
import { moveEmail } from '../../../src/store/slices/emailSlice';
import { createProject } from '../../../src/store/slices/projectSlice';
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { Badge } from '../../../src/components/ui/Badge';
import { PrimaryButton } from '../../../src/components/ui/PrimaryButton';
import { ToastMessage } from '../../../src/components/ui/ToastMessage';
import { useToast } from '../../../src/hooks/useToast';
import { formatDate } from '../../../src/utils/formatters';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Radius, Spacing } from '../../../src/theme/spacing';

export default function EmailDetailScreen() {
  const { emailId } = useLocalSearchParams<{ emailId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const email = useSelector((s: RootState) =>
    s.emails.emails.find((e) => e._id === emailId)
  );
  // The lead this email belongs to (needed to create a discussion project —
  // the backend creates projects from a lead, not a raw email).
  const linkedLead = useSelector((s: RootState) =>
    email?.leadId ? s.leads.leads.find((l) => l._id === email.leadId) : undefined
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [marking, setMarking] = useState(false);

  const handleMarkAsDiscussion = async () => {
    setMenuOpen(false);
    if (!email?.leadId) {
      showError('No lead is linked to this email, so it can’t be added to Discussions.');
      return;
    }
    setMarking(true);
    const result = await dispatch(
      createProject({
        leadId: email.leadId,
        // Use the lead's details when available, else fall back to email data.
        title: linkedLead?.jobTitle || email.subject || 'New Discussion',
        company: linkedLead?.company || 'Unknown',
      })
    );
    setMarking(false);
    if (createProject.fulfilled.match(result)) {
      showSuccess('Added to Discussions');
    } else {
      showError((result.payload as string) || 'Could not add to Discussions');
    }
  };

  if (!email) {
    return (
      <ScreenWrapper>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Email not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const handleMoveToTrash = async () => {
    await dispatch(moveEmail({ emailId: email._id, folder: 'trash' }));
    showSuccess('Moved to Trash');
    router.back();
  };

  const handleReply = () => {
    router.push({
      pathname: '/(app)/emails/compose',
      params: { to: email.from, subject: `Re: ${email.subject}` },
    });
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{email.subject}</Text>
        <TouchableOpacity onPress={handleMoveToTrash} style={styles.trashBtn}>
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMenuOpen(true)}
          style={styles.menuBtn}
          disabled={marking}
        >
          <Ionicons
            name={marking ? 'hourglass-outline' : 'ellipsis-vertical'}
            size={20}
            color={Colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* More-options menu */}
      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleMarkAsDiscussion}>
              <Ionicons name="chatbubbles-outline" size={18} color={Colors.primary} />
              <Text style={styles.menuItemText}>Mark as discussion</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.metaCard}>
          <Text style={styles.subject}>{email.subject}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>From: </Text>
            <Text style={styles.metaValue}>{email.from}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>To: </Text>
            <Text style={styles.metaValue}>{email.to}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date: </Text>
            <Text style={styles.metaValue}>{formatDate(email.sentAt)}</Text>
          </View>
          <View style={styles.statusRow}>
            <Badge
              label={email.folder}
              color={Colors.primary}
            />
            {email.isOpened && (
              <View style={styles.openedBadge}>
                <Ionicons name="eye-outline" size={13} color={Colors.success} />
                <Text style={styles.openedText}>Opened</Text>
              </View>
            )}
          </View>
        </GlassCard>

        {email.attachments && email.attachments.length > 0 && (
          <GlassCard style={styles.attachCard}>
            <Text style={styles.attachTitle}>Attachments</Text>
            <View style={styles.attachList}>
              {email.attachments.map((att, i) => (
                <View key={i} style={styles.attachChip}>
                  <Ionicons name="document-outline" size={14} color={Colors.primary} />
                  <Text style={styles.attachName}>{att}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        <GlassCard style={styles.bodyCard}>
          <Text style={styles.bodyText}>{email.body.replace(/<[^>]+>/g, '')}</Text>
        </GlassCard>

        <PrimaryButton
          title="Reply"
          onPress={handleReply}
          icon="arrow-undo-outline"
          brutalism
          style={styles.replyBtn}
        />
      </ScrollView>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  backBtn: { padding: 4, marginRight: Spacing.sm },
  title: { ...Typography.sectionTitle, color: Colors.text, flex: 1 },
  trashBtn: { padding: 4 },
  menuBtn: { padding: 4, marginLeft: Spacing.xs },
  menuOverlay: {
    flex: 1,
    // Anchor the menu under the header's top-right (where the 3-dots are).
    paddingTop: 56,
    paddingRight: Spacing.md,
    alignItems: 'flex-end',
  },
  menu: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingVertical: 4,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  menuItemText: { ...Typography.body, color: Colors.text },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  metaCard: { marginBottom: Spacing.md },
  subject: { ...Typography.headlineM, color: Colors.text, marginBottom: Spacing.md, fontSize: 18 },
  metaRow: { flexDirection: 'row', marginBottom: 4 },
  metaLabel: { ...Typography.captionXS, color: Colors.muted, width: 40 },
  metaValue: { ...Typography.captionXS, color: Colors.text, flex: 1 },
  statusRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  openedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.success}22`,
    borderRadius: 20,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  openedText: { ...Typography.captionXS, color: Colors.success },
  attachCard: { marginBottom: Spacing.md },
  attachTitle: { ...Typography.label, color: Colors.muted, marginBottom: Spacing.sm },
  attachList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  attachChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.glassInput,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  attachName: { ...Typography.captionXS, color: Colors.muted },
  bodyCard: { marginBottom: Spacing.md },
  bodyText: { ...Typography.body, color: Colors.text, lineHeight: 24 },
  replyBtn: { marginBottom: Spacing.md },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { ...Typography.headlineM, color: Colors.muted },
  backText: { ...Typography.body, color: Colors.primary, marginTop: Spacing.md },
});
