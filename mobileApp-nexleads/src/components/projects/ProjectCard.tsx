import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { Project, ProjectStatus } from '../../types/project.types';
import { AppDispatch } from '../../store';
import { updateProjectStatus, deleteProject } from '../../store/slices/projectSlice';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { PrimaryButton } from '../ui/PrimaryButton';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface ProjectCardProps {
  project: Project;
}

const statusConfig: Record<ProjectStatus, { color: string; label: string }> = {
  in_discussion: { color: Colors.warning, label: 'In Discussion' },
  ongoing: { color: Colors.primary, label: 'Ongoing' },
  completed: { color: Colors.success, label: 'Completed' },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const config = statusConfig[project.status];
  const isOverdue =
    project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed';

  const handleStatusChange = (status: ProjectStatus) => {
    dispatch(updateProjectStatus({ projectId: project._id, payload: { status } }));
    setShowMenu(false);
  };

  const handleDelete = () => {
    dispatch(deleteProject(project._id));
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <GlassCard style={styles.card} accentColor={config.color}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>{project.title}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.iconBtn}>
              <Ionicons name="ellipsis-vertical" size={16} color={Colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.company} numberOfLines={1}>{project.company}</Text>

        <View style={styles.meta}>
          {project.budget !== undefined && project.budget !== null && (
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={14} color={Colors.success} />
              <Text style={styles.budget}>${project.budget.toLocaleString()}</Text>
            </View>
          )}
          {project.deadline && (
            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={isOverdue ? Colors.danger : Colors.muted}
              />
              <Text style={[styles.deadline, isOverdue && styles.overdue]}>
                {new Date(project.deadline).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Badge label={config.label} color={config.color} />
          <TouchableOpacity
            onPress={() => router.push(`/(app)/projects/${project._id}`)}
            style={styles.detailBtn}
          >
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </GlassCard>

      <Modal transparent visible={showMenu} onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Change Status</Text>
            {(Object.keys(statusConfig) as ProjectStatus[]).map((s) => (
              <TouchableOpacity key={s} onPress={() => handleStatusChange(s)} style={styles.menuItem}>
                <View style={[styles.menuDot, { backgroundColor: statusConfig[s].color }]} />
                <Text style={styles.menuItemText}>{statusConfig[s].label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
              style={[styles.menuItem, styles.menuDanger]}
            >
              <Ionicons name="trash-outline" size={16} color={Colors.danger} />
              <Text style={[styles.menuItemText, { color: Colors.danger }]}>Delete Project</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={showDeleteConfirm} onRequestClose={() => setShowDeleteConfirm(false)}>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Delete Project?</Text>
            <Text style={styles.confirmText}>This action cannot be undone.</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity onPress={() => setShowDeleteConfirm(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <PrimaryButton title="Delete" onPress={handleDelete} variant="solid" style={styles.deleteBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.sectionTitle,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    padding: 4,
  },
  company: {
    ...Typography.body,
    color: Colors.muted,
    marginBottom: Spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  budget: {
    ...Typography.body,
    color: Colors.success,
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
  },
  deadline: {
    ...Typography.captionXS,
    color: Colors.muted,
  },
  overdue: {
    color: Colors.danger,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: `${Colors.primary}22`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    width: 240,
    padding: Spacing.md,
  },
  menuTitle: {
    ...Typography.label,
    color: Colors.muted,
    marginBottom: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  menuDanger: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    paddingTop: Spacing.md,
  },
  menuDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  menuItemText: {
    ...Typography.body,
    color: Colors.text,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  confirmBox: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.lg,
    width: '100%',
  },
  confirmTitle: {
    ...Typography.headlineM,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  confirmText: {
    ...Typography.body,
    color: Colors.muted,
    marginBottom: Spacing.lg,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  cancelBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  cancelText: {
    ...Typography.button,
    color: Colors.muted,
  },
  deleteBtn: {
    backgroundColor: Colors.danger,
    height: 44,
  },
});
