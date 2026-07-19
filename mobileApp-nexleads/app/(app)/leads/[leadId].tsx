import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../src/store';
import { updateLeadStatus, updateLeadInterest } from '../../../src/store/slices/leadSlice';
import { createProject } from '../../../src/store/slices/projectSlice';
import { LeadStatus, LeadInterest } from '../../../src/types/lead.types';
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { Badge } from '../../../src/components/ui/Badge';
import { PrimaryButton } from '../../../src/components/ui/PrimaryButton';
import { LeadStatusBadge } from '../../../src/components/leads/LeadStatusBadge';
import { LeadInterestToggle } from '../../../src/components/leads/LeadInterestToggle';
import { ToastMessage } from '../../../src/components/ui/ToastMessage';
import { useToast } from '../../../src/hooks/useToast';
import { formatDate } from '../../../src/utils/formatters';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing } from '../../../src/theme/spacing';

const STATUSES: LeadStatus[] = ['new', 'contacted', 'responded', 'in_discussion', 'ongoing', 'completed', 'rejected'];

const platformColors: Record<string, string> = {
  upwork: Colors.upwork,
  linkedin: Colors.linkedin,
  freelancer: Colors.freelancer,
  fiverr: Colors.fiverr,
};

export default function LeadDetailScreen() {
  const { leadId } = useLocalSearchParams<{ leadId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const projectLoading = useSelector((s: RootState) => s.projects.loading);

  const lead = useSelector((s: RootState) =>
    s.leads.leads.find((l) => l._id === leadId) ??
    s.leads.searchResults.find((l) => l._id === leadId)
  );

  if (!lead) {
    return (
      <ScreenWrapper>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Lead not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const platformColor = platformColors[lead.platform?.toLowerCase()] ?? Colors.primary;

  const handleStatusChange = async (status: LeadStatus) => {
    try {
      await dispatch(updateLeadStatus({ leadId: lead._id, payload: { status } })).unwrap();
      showSuccess('Status updated');
    } catch (error) {
      showError(typeof error === 'string' ? error : 'Failed to update status');
    }
  };

  const handleInterest = async (interest: LeadInterest) => {
    try {
      await dispatch(updateLeadInterest({ leadId: lead._id, payload: { interest } })).unwrap();
      showSuccess('Interest updated');
    } catch (error) {
      showError(typeof error === 'string' ? error : 'Failed to update interest');
    }
  };

  const handleConvertToProject = async () => {
    const title = lead.jobTitle?.trim() || `${lead.name || 'Lead'} Project`;
    const company = lead.company?.trim() || lead.name || 'Unknown Company';

    try {
      const project = await dispatch(
        createProject({
          leadId: lead._id,
          title,
          company,
          description: `Project created from lead ${lead.name || lead.email}.`,
        })
      ).unwrap();

      showSuccess('Project created');
      router.push(`/(app)/projects/${project._id}`);
    } catch (error) {
      showError(typeof error === 'string' ? error : 'Failed to create project');
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Lead Detail</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard brutalism accentColor={platformColor} style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {lead.name?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.leadName}>{lead.name}</Text>
              <Text style={styles.leadCompany}>{lead.company}</Text>
              <LeadStatusBadge status={lead.status} />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailGrid}>
            <DetailRow icon="mail-outline" label="Email" value={lead.email} />
            <DetailRow icon="globe-outline" label="Platform" value={lead.platform} />
            {lead.jobTitle && <DetailRow icon="briefcase-outline" label="Role" value={lead.jobTitle} />}
            <DetailRow icon="mail-open-outline" label="Emails Sent" value={String(lead.emailsSent)} />
            <DetailRow icon="chatbubble-outline" label="Responses" value={String(lead.responsesReceived)} />
            {lead.lastContactedAt && (
              <DetailRow icon="calendar-outline" label="Last Contact" value={formatDate(lead.lastContactedAt)} />
            )}
            <DetailRow icon="calendar-outline" label="Added" value={formatDate(lead.createdAt)} />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Interest</Text>
          <LeadInterestToggle interest={lead.interest} onToggle={handleInterest} />
        </GlassCard>

        <GlassCard style={styles.statusCard}>
          <Text style={styles.sectionLabel}>Change Status</Text>
          <View style={styles.statusGrid}>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => handleStatusChange(s)}
                style={[
                  styles.statusBtn,
                  lead.status === s && styles.statusBtnActive,
                ]}
              >
                <Text style={[styles.statusBtnText, lead.status === s && styles.statusBtnTextActive]}>
                  {s.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        <PrimaryButton
          title="Email This Lead"
          onPress={() => router.push(`/(app)/emails/compose?leadId=${lead._id}&to=${lead.email}`)}
          icon="mail-outline"
          brutalism
          style={styles.emailBtn}
        />

        <PrimaryButton
          title="Convert to Project"
          onPress={handleConvertToProject}
          loading={projectLoading}
          icon="folder-outline"
          variant="outline"
          style={styles.projectBtn}
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

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Ionicons name={icon as any} size={15} color={Colors.muted} />
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  label: { ...Typography.captionXS, color: Colors.muted, width: 90 },
  value: { ...Typography.body, color: Colors.text, flex: 1 },
});

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
  profileCard: { marginBottom: Spacing.md },
  profileHeader: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: Colors.primary },
  profileInfo: { flex: 1, gap: 4 },
  leadName: { ...Typography.sectionTitle, color: Colors.text },
  leadCompany: { ...Typography.body, color: Colors.muted },
  divider: { height: 1, backgroundColor: Colors.glassBorder, marginVertical: Spacing.md },
  detailGrid: {},
  sectionLabel: { ...Typography.label, color: Colors.muted, marginBottom: Spacing.sm },
  statusCard: { marginBottom: Spacing.md },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  statusBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassCard,
  },
  statusBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  statusBtnText: { ...Typography.captionXS, color: Colors.muted, fontFamily: 'Poppins_600SemiBold' },
  statusBtnTextActive: { color: '#fff' },
  emailBtn: { marginBottom: Spacing.sm },
  projectBtn: { marginBottom: Spacing.md },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { ...Typography.headlineM, color: Colors.muted },
  backText: { ...Typography.body, color: Colors.primary, marginTop: Spacing.md },
});
