import React, { useState, useEffect } from 'react';
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
import { DatePickerModal } from '../../../src/components/ui/DatePickerModal';
import { AppDispatch, RootState } from '../../../src/store';
import { updateProject, updateProjectStatus } from '../../../src/store/slices/projectSlice';
import { ProjectStatus } from '../../../src/types/project.types';
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { GlassInput } from '../../../src/components/ui/GlassInput';
import { PrimaryButton } from '../../../src/components/ui/PrimaryButton';
import { Badge } from '../../../src/components/ui/Badge';
import { ToastMessage } from '../../../src/components/ui/ToastMessage';
import { useToast } from '../../../src/hooks/useToast';
import { formatDate } from '../../../src/utils/formatters';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing } from '../../../src/theme/spacing';

const statusColors: Record<ProjectStatus, string> = {
  in_discussion: Colors.warning,
  ongoing: Colors.primary,
  completed: Colors.success,
};

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const project = useSelector((s: RootState) => {
    const all = [
      ...s.projects.inDiscussion,
      ...s.projects.ongoing,
      ...s.projects.completed,
    ];
    return all.find((p) => p._id === projectId);
  });

  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [budget, setBudget] = useState(project?.budget ? String(project.budget) : '');
  const [deadline, setDeadline] = useState<Date | null>(
    project?.deadline ? new Date(project.deadline) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const goBackToProjects = () => {
    router.replace('/(app)/projects');
  };

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description ?? '');
      setBudget(project.budget ? String(project.budget) : '');
      setDeadline(project.deadline ? new Date(project.deadline) : null);
    }
  }, [project]);

  if (!project) {
    return (
      <ScreenWrapper>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Project not found</Text>
          <TouchableOpacity onPress={goBackToProjects}>
            <Text style={styles.backText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) {
      showError('Title is required');
      return;
    }
    setSaving(true);
    const result = await dispatch(
      updateProject({
        projectId: project._id,
        payload: {
          title: title.trim(),
          description: description.trim() || undefined,
          budget: budget ? Number(budget) : undefined,
          deadline: deadline?.toISOString(),
        },
      })
    );
    setSaving(false);
    if (updateProject.fulfilled.match(result)) {
      showSuccess('Project updated!');
    } else {
      showError('Failed to update project');
    }
  };

  const handleStatusChange = async (status: ProjectStatus) => {
    await dispatch(updateProjectStatus({ projectId: project._id, payload: { status } }));
    showSuccess('Status updated');
  };

  const statusColor = statusColors[project.status];

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackToProjects} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>Project Detail</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.statusCard}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectCompany}>{project.company}</Text>
          <View style={styles.statusRow}>
            <Badge
              label={project.status.replace('_', ' ')}
              color={statusColor}
            />
            {project.deadline && (
              <View style={styles.deadlineRow}>
                <Ionicons name="calendar-outline" size={14} color={Colors.muted} />
                <Text style={styles.deadlineText}>{formatDate(project.deadline)}</Text>
              </View>
            )}
          </View>
        </GlassCard>

        <GlassCard style={styles.statusChangeCard}>
          <Text style={styles.sectionLabel}>Change Status</Text>
          <View style={styles.statusBtns}>
            {(['in_discussion', 'ongoing', 'completed'] as ProjectStatus[]).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => handleStatusChange(s)}
                style={[
                  styles.statusBtn,
                  project.status === s && { backgroundColor: statusColors[s], borderColor: statusColors[s] },
                ]}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    project.status === s && styles.statusBtnTextActive,
                  ]}
                >
                  {s.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        <GlassCard style={styles.editCard}>
          <Text style={styles.sectionLabel}>Edit Project</Text>
          <GlassInput label="Title" value={title} onChangeText={setTitle} />
          <GlassInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          <GlassInput
            label="Budget ($)"
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />

          <Text style={styles.dateLabel}>Deadline</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
            <Ionicons name="calendar-outline" size={18} color={Colors.muted} />
            <Text style={styles.dateValue}>
              {deadline ? formatDate(deadline.toISOString()) : 'Set deadline'}
            </Text>
          </TouchableOpacity>

          <DatePickerModal
            visible={showDatePicker}
            value={deadline ?? new Date()}
            onConfirm={(d) => { setDeadline(d); setShowDatePicker(false); }}
            onCancel={() => setShowDatePicker(false)}
          />

          <PrimaryButton
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            brutalism
            style={styles.saveBtn}
          />
        </GlassCard>
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
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  backBtn: { padding: 4 },
  title: { ...Typography.headlineM, color: Colors.text },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  statusCard: { marginBottom: Spacing.md },
  projectTitle: { ...Typography.headlineM, color: Colors.text, marginBottom: 4 },
  projectCompany: { ...Typography.body, color: Colors.muted, marginBottom: Spacing.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadlineText: { ...Typography.captionXS, color: Colors.muted },
  statusChangeCard: { marginBottom: Spacing.md },
  sectionLabel: { ...Typography.label, color: Colors.muted, marginBottom: Spacing.sm },
  statusBtns: { flexDirection: 'row', gap: Spacing.sm },
  statusBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassCard,
    alignItems: 'center',
  },
  statusBtnText: { ...Typography.captionXS, color: Colors.muted, fontFamily: 'Poppins_600SemiBold', textAlign: 'center' },
  statusBtnTextActive: { color: '#fff' },
  editCard: { marginBottom: Spacing.md },
  dateLabel: { ...Typography.label, color: Colors.muted, marginBottom: Spacing.xs },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.glassInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glassInputBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  dateValue: { ...Typography.body, color: Colors.text },
  saveBtn: { marginTop: Spacing.sm },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { ...Typography.headlineM, color: Colors.muted },
  backText: { ...Typography.body, color: Colors.primary, marginTop: Spacing.md },
});
