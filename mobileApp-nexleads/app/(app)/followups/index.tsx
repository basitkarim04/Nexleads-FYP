/**
 * REFACTORED: Mirrors DashboardTask.jsx architecture
 *
 * REMOVED:
 *   - fetchFollowUps / fetchFollowUpStats dispatches (were fetching pre-aggregated backend records)
 *   - createFollowUp modal (was creating backend follow-up record objects)
 *   - FollowUp type usage (replaced with Lead[])
 *   - stats state from Redux (was a separate backend-computed FollowUpStats object)
 *
 * REPLACED WITH:
 *   - fetchLeadsForFollowUp → GET /user/get-my-Leads (raw leads, mirrors JobLeads in UserDetailSlice)
 *   - leadsByJobField useMemo: groups contacted leads by jobField (mirrors DashboardTask.leadsByJobField)
 *   - derivedStats useMemo: totalFollowUpsSent + responsesReceived computed from raw leads
 *   - Per-card stats: leads.length, sum(emailsSent), count(interest==="interested")
 *   - Platform breakdown: new Set(leads.map(l => l.platform)) per group (mirrors DashboardTask)
 *   - Detail screen: shows all leads in the selected jobField group (mirrors DashboardTask selectedCard view)
 *   - updateLeadInterest dispatch: patches interest in-place (mirrors DashboardTask.handleStatusChange)
 *   - sendFollowUp: accepts leadIds[] for single or bulk (mirrors FollowTrackModal usage)
 */

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../src/store';
import {
  fetchLeadsForFollowUp,
  updateLeadInterest,
  sendFollowUp,
} from '../../../src/store/slices/followUpSlice';
import { Lead } from '../../../src/types/lead.types';
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { BentoTile } from '../../../src/components/ui/BentoTile';
import { GlassInput } from '../../../src/components/ui/GlassInput';
import { PrimaryButton } from '../../../src/components/ui/PrimaryButton';
import { Badge } from '../../../src/components/ui/Badge';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ToastMessage } from '../../../src/components/ui/ToastMessage';
import { useToast } from '../../../src/hooks/useToast';
import { formatDate } from '../../../src/utils/formatters';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Radius, Spacing } from '../../../src/theme/spacing';

// Platform color map — mirrors PLATFORM_STYLES in DashboardTask.jsx
const PLATFORM_COLORS: Record<string, string> = {
  linkedin: '#0A66C2',
  upwork: '#EA4335',
  twitter: '#1DA1F2',
  fiverr: '#1DBF73',
  freelancer: '#29B2FE',
  other: Colors.muted,
};

function getPlatformColor(platform: string): string {
  return PLATFORM_COLORS[platform?.toLowerCase()] ?? Colors.muted;
}

export default function FollowUpsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  // Raw leads from Redux — mirrors: state.userDetail.userLeads in DashboardTask
  const { leads, loading, sending } = useSelector((s: RootState) => s.followUps);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [refreshing, setRefreshing] = useState(false);
  // selectedCard mirrors DashboardTask: null = list view, string = detail view
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showSend, setShowSend] = useState(false);
  const [sendLeadIds, setSendLeadIds] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  useEffect(() => {
    dispatch(fetchLeadsForFollowUp());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchLeadsForFollowUp());
    setRefreshing(false);
  }, [dispatch]);

  /**
   * leadsByJobField — mirrors DashboardTask.leadsByJobField useMemo
   * Groups only "contacted" leads by their jobField.
   * Shape: { "Full Stack Dev": Lead[], "React Dev": Lead[], ... }
   */
  const leadsByJobField = useMemo<Record<string, Lead[]>>(() => {
    if (!leads?.length) return {};
    return leads.reduce<Record<string, Lead[]>>((acc, lead) => {
      if (lead.status !== 'contacted') return acc;
      if (!acc[lead.jobField]) acc[lead.jobField] = [];
      acc[lead.jobField].push(lead);
      return acc;
    }, {});
  }, [leads]);

  /**
   * derivedStats — replaces the old fetchFollowUpStats backend call.
   * Computed from raw leads, mirrors DashboardTask's inline stat derivation.
   */
  const derivedStats = useMemo(() => {
    const allContacted = leads.filter((l) => l.status === 'contacted');
    return {
      totalFollowUpsSent: allContacted.reduce((sum, l) => sum + (l.emailsSent ?? 0), 0),
      responsesReceived: allContacted.filter((l) => l.interest === 'interested').length,
    };
  }, [leads]);

  // Leads for the open detail card
  const selectedLeads = useMemo<Lead[]>(
    () => (selectedCard ? (leadsByJobField[selectedCard] ?? []) : []),
    [selectedCard, leadsByJobField]
  );

  /**
   * handleInterestChange — mirrors DashboardTask.handleStatusChange
   * Dispatches updateLeadInterest; slice patches lead in-place (no full reload).
   */
  const handleInterestChange = async (leadId: string, interest: 'interested' | 'not_interested') => {
    try {
      await dispatch(updateLeadInterest({ leadId, interest })).unwrap();
    } catch {
      showError('Failed to update interest');
    }
  };

  const openSendModal = (ids: string[]) => {
    setSendLeadIds(ids);
    setShowSend(true);
  };

  const handleSend = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      showError('Subject and body are required');
      return;
    }
    if (sendLeadIds.length === 0) {
      showError('No leads selected');
      return;
    }
    // Uses the first leadId as the route param; passes all ids in body for bulk
    const result = await dispatch(
      sendFollowUp({
        followUpId: sendLeadIds[0],
        payload: { subject: emailSubject, body: emailBody, leadIds: sendLeadIds },
      })
    );
    if (sendFollowUp.fulfilled.match(result)) {
      showSuccess('Follow-up sent!');
      setShowSend(false);
      setEmailSubject('');
      setEmailBody('');
    } else {
      showError('Failed to send follow-up');
    }
  };

  const renderSendModal = () => (
    <Modal
      transparent
      animationType="slide"
      visible={showSend}
      onRequestClose={() => setShowSend(false)}
    >
      <KeyboardAvoidingView
        style={styles.modalAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <ScrollView
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>Send Follow-Up Email</Text>
                <GlassInput
                  label="Subject"
                  placeholder="Follow-up subject"
                  value={emailSubject}
                  onChangeText={setEmailSubject}
                />
                <GlassInput
                  label="Message"
                  placeholder="Write your follow-up..."
                  value={emailBody}
                  onChangeText={setEmailBody}
                  multiline
                  numberOfLines={4}
                  style={styles.messageInput}
                />
                <PrimaryButton title="Send" onPress={handleSend} loading={sending} brutalism />
                <TouchableOpacity onPress={() => setShowSend(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );

  // ─── Card list renderer ───────────────────────────────────────────────────

  const renderCard = useCallback(
    ({ item: jobField }: { item: string }) => {
      const group = leadsByJobField[jobField];
      // Per-card stats — all derived from raw leads, mirrors DashboardTask card section
      const totalLeads = group.length;
      const followUpsSent = group.reduce((sum, l) => sum + (l.emailsSent ?? 0), 0);
      const responses = group.filter((l) => l.interest === 'interested').length;
      const platforms = [...new Set(group.map((l) => l.platform))];
      const interestedIds = group
        .filter((l) => l.interest === 'interested')
        .map((l) => l._id);
      const newestDate = group[0]?.createdAt;

      return (
        <GlassCard style={styles.card}>
          <TouchableOpacity onPress={() => setSelectedCard(jobField)} activeOpacity={0.8}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.jobField} numberOfLines={1}>{jobField}</Text>
              {newestDate && (
                <Text style={styles.dateText}>{formatDate(newestDate)}</Text>
              )}
            </View>

            {/* Platform chips — mirrors DashboardTask platform badge row */}
            <View style={styles.platformRow}>
              {platforms.map((p) => (
                <View
                  key={p}
                  style={[styles.platformChip, { borderColor: getPlatformColor(p) }]}
                >
                  <Text style={[styles.platformChipText, { color: getPlatformColor(p) }]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Stats — mirrors DashboardTask stats box */}
            <View style={styles.statsBox}>
              <StatItem label="Total Leads" value={totalLeads} />
              <StatItem label="Follow-Ups Sent" value={followUpsSent} />
              <StatItem label="Responses" value={responses} color={Colors.success} />
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarWrap}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${totalLeads > 0
                      ? Math.round((responses / totalLeads) * 100)
                      : 0}%` as any,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Send button — single bulk send for all interested in this group */}
          <TouchableOpacity
            onPress={() => openSendModal(interestedIds.length > 0 ? interestedIds : group.map((l) => l._id))}
            style={styles.sendBtn}
          >
            <Ionicons name="send-outline" size={14} color={Colors.primary} />
            <Text style={styles.sendBtnText}>Send Follow-Up</Text>
          </TouchableOpacity>
        </GlassCard>
      );
    },
    [leadsByJobField]
  );

  // ─── Detail view ─────────────────────────────────────────────────────────

  if (selectedCard) {
    return (
      <ScreenWrapper>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedCard(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{selectedCard}</Text>
          <View style={{ width: 60 }} />
        </View>

        <FlatList
          data={selectedLeads}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState icon="person-outline" title="No leads" subtitle="No contacted leads in this group" />
          }
          renderItem={({ item }) => (
            <GlassCard style={styles.leadRow}>
              <View style={styles.leadRowTop}>
                <Text style={styles.leadName}>{item.name}</Text>
                <Badge label={item.platform} color={getPlatformColor(item.platform)} />
              </View>
              <Text style={styles.leadEmail}>{item.email}</Text>
              {item.jobTitle && (
                <Text style={styles.leadJobTitle}>{item.jobTitle}</Text>
              )}
              <Text style={styles.leadDate}>{formatDate(item.createdAt)}</Text>

              <View style={styles.leadActions}>
                {/* Interest toggle — mirrors DashboardTask status dropdown */}
                <View style={styles.interestRow}>
                  <TouchableOpacity
                    onPress={() => handleInterestChange(item._id, 'interested')}
                    style={[
                      styles.interestBtn,
                      item.interest === 'interested' && styles.interestBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.interestBtnText,
                        item.interest === 'interested' && styles.interestBtnTextActive,
                      ]}
                    >
                      Interested
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleInterestChange(item._id, 'not_interested')}
                    style={[
                      styles.interestBtn,
                      item.interest === 'not_interested' && styles.interestBtnInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.interestBtnText,
                        item.interest === 'not_interested' && styles.interestBtnTextInactive,
                      ]}
                    >
                      Not Interested
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Per-lead send button */}
                <TouchableOpacity
                  onPress={() => openSendModal([item._id])}
                  style={styles.sendBtn}
                >
                  <Ionicons name="mail-outline" size={14} color={Colors.primary} />
                  <Text style={styles.sendBtnText}>Send</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          )}
        />

        <ToastMessage
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onHide={hideToast}
        />

        {/* Send modal — same as list view */}
        {renderSendModal()}
      </ScreenWrapper>
    );
  }

  // ─── List view ────────────────────────────────────────────────────────────

  const jobFieldKeys = Object.keys(leadsByJobField);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Follow-Ups</Text>
      </View>

      {/* Top stats — derived from raw leads, replaces fetchFollowUpStats */}
      <View style={styles.statsGrid}>
        <BentoTile
          icon="send-outline"
          label="Follow-Ups Sent"
          value={derivedStats.totalFollowUpsSent}
          accentColor={Colors.primary}
          flex={1}
        />
        <BentoTile
          icon="chatbubble-outline"
          label="Responses"
          value={derivedStats.responsesReceived}
          accentColor={Colors.success}
          flex={1}
        />
      </View>

      {loading && leads.length === 0 ? (
        <View style={styles.center}>
          <LoadingSpinner size={48} />
        </View>
      ) : (
        <FlatList
          data={jobFieldKeys}
          keyExtractor={(item) => item}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="time-outline"
              title="No follow-ups yet"
              subtitle="Contacted leads will appear here grouped by job field"
            />
          }
        />
      )}

      {/* Send Follow-Up Modal */}
      {renderSendModal()}

      <ToastMessage
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </ScreenWrapper>
  );
}

function StatItem({
  label,
  value,
  color = Colors.text,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <View style={statStyles.item}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  item: { alignItems: 'center', flex: 1 },
  value: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: Colors.text },
  label: { ...Typography.captionXS, color: Colors.muted, textAlign: 'center' },
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  title: { ...Typography.headlineM, color: Colors.text, flex: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 70 },
  backText: { ...Typography.body, color: Colors.text },
  statsGrid: { flexDirection: 'row', padding: Spacing.sm },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  // Card
  card: { marginBottom: Spacing.md },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  jobField: { ...Typography.sectionTitle, fontSize: 15, color: Colors.text, flex: 1 },
  dateText: { ...Typography.captionXS, color: Colors.muted },
  platformRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  platformChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  platformChipText: { ...Typography.captionXS, fontFamily: 'Poppins_600SemiBold' },
  statsBox: {
    flexDirection: 'row',
    backgroundColor: Colors.glassInput,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  progressBarWrap: {
    height: 6,
    backgroundColor: Colors.glassInput,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3, minWidth: 4 },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    backgroundColor: `${Colors.primary}22`,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: `${Colors.primary}44`,
  },
  sendBtnText: { ...Typography.captionXS, color: Colors.primary, fontFamily: 'Poppins_600SemiBold' },

  // Detail view — lead rows
  leadRow: { marginBottom: Spacing.md },
  leadRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  leadName: { ...Typography.sectionTitle, color: Colors.text, flex: 1, fontSize: 14 },
  leadEmail: { ...Typography.captionXS, color: Colors.muted, marginBottom: 2 },
  leadJobTitle: { ...Typography.captionXS, color: Colors.muted, marginBottom: 2 },
  leadDate: { ...Typography.captionXS, color: Colors.muted, marginBottom: Spacing.sm },
  leadActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  interestRow: { flexDirection: 'row', gap: Spacing.xs },
  interestBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassCard,
  },
  interestBtnActive: { backgroundColor: `${Colors.success}22`, borderColor: Colors.success },
  interestBtnInactive: { backgroundColor: `${Colors.danger}22`, borderColor: Colors.danger },
  interestBtnText: { ...Typography.captionXS, color: Colors.muted },
  interestBtnTextActive: { color: Colors.success },
  interestBtnTextInactive: { color: Colors.danger },

  // Modal
  modalAvoider: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.bg2,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    maxHeight: '88%',
  },
  modalContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  modalTitle: { ...Typography.headlineM, color: Colors.text, marginBottom: Spacing.md },
  messageInput: { minHeight: 110, textAlignVertical: 'top' },
  cancelBtn: { alignItems: 'center', marginTop: Spacing.md },
  cancelText: { ...Typography.body, color: Colors.muted },
});
