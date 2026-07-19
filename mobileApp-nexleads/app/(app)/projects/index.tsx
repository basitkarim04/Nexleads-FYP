import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../src/store';
import { fetchProjects, createProject } from '../../../src/store/slices/projectSlice';
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper';
import { StatusColumn } from '../../../src/components/projects/StatusColumn';
import { GlassInput } from '../../../src/components/ui/GlassInput';
import { PrimaryButton } from '../../../src/components/ui/PrimaryButton';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { ToastMessage } from '../../../src/components/ui/ToastMessage';
import { useToast } from '../../../src/hooks/useToast';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Radius, Spacing } from '../../../src/theme/spacing';

export default function ProjectsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { inDiscussion, ongoing, completed, loading } = useSelector(
    (s: RootState) => s.projects
  );
  
  const leads = useSelector((s: RootState) => s.leads.leads);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchProjects());
    setRefreshing(false);
  }, [dispatch]);

  const handleCreate = async () => {
    if (!title.trim() || !company.trim()) {
      showError('Title and company are required');
      return;
    }
    setCreating(true);
    const result = await dispatch(
      createProject({ leadId: selectedLeadId, title: title.trim(), company: company.trim() })
    );
    setCreating(false);
    if (createProject.fulfilled.match(result)) {
      showSuccess('Project created!');
      setShowCreate(false);
      setTitle('');
      setCompany('');
      setSelectedLeadId('');
    } else {
      showError('Failed to create project');
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)} style={styles.fab}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <LoadingSpinner size={48} />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kanban}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        >
          <StatusColumn status="in_discussion" projects={inDiscussion} />
          <StatusColumn status="ongoing" projects={ongoing} />
          <StatusColumn status="completed" projects={completed} />
        </ScrollView>
      )}

      <Modal transparent visible={showCreate} onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Project</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Ionicons name="close" size={22} color={Colors.muted} />
              </TouchableOpacity>
            </View>

            <GlassInput
              label="Project Title"
              placeholder="e.g. E-commerce Website"
              value={title}
              onChangeText={setTitle}
            />
            <GlassInput
              label="Company"
              placeholder="Client company name"
              value={company}
              onChangeText={setCompany}
            />

            {leads.length > 0 && (
              <>
                <Text style={styles.leadLabel}>Link to Lead (optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.leadList}>
                  {leads.slice(0, 10).map((l) => (
                    <TouchableOpacity
                      key={l._id}
                      onPress={() => setSelectedLeadId(l._id)}
                      style={[
                        styles.leadChip,
                        selectedLeadId === l._id && styles.leadChipActive,
                      ]}
                    >
                      <Text style={[styles.leadChipText, selectedLeadId === l._id && styles.leadChipTextActive]}>
                        {l.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <PrimaryButton
              title="Create Project"
              onPress={handleCreate}
              loading={creating}
              brutalism
              style={styles.createBtn}
            />
          </View>
        </View>
      </Modal>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  title: { ...Typography.headlineM, color: Colors.text },
  fab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  kanban: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xxl,
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: { ...Typography.headlineM, color: Colors.text },
  leadLabel: { ...Typography.label, color: Colors.muted, marginBottom: Spacing.sm },
  leadList: { maxHeight: 50, marginBottom: Spacing.md },
  leadChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassCard,
    marginRight: Spacing.sm,
  },
  leadChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  leadChipText: { ...Typography.captionXS, color: Colors.muted },
  leadChipTextActive: { color: '#fff' },
  createBtn: {},
});
