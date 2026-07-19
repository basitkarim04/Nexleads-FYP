import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Project, ProjectStatus } from '../../types/project.types';
import { ProjectCard } from './ProjectCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface StatusColumnProps {
  status: ProjectStatus;
  projects: Project[];
}

const columnConfig: Record<ProjectStatus, { label: string; color: string }> = {
  in_discussion: { label: 'In Discussion', color: Colors.warning },
  ongoing: { label: 'Ongoing', color: Colors.primary },
  completed: { label: 'Completed', color: Colors.success },
};

export function StatusColumn({ status, projects }: StatusColumnProps) {
  const config = columnConfig[status];

  return (
    <View style={styles.column}>
      <View style={styles.header}>
        <View style={[styles.stripe, { backgroundColor: config.color }]} />
        <Text style={styles.label}>{config.label}</Text>
        <View style={[styles.countBadge, { backgroundColor: `${config.color}22` }]}>
          <Text style={[styles.count, { color: config.color }]}>{projects.length}</Text>
        </View>
      </View>
      <FlatList
        data={projects}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ProjectCard project={item} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    width: 240,
    marginRight: Spacing.md,
    paddingTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  stripe: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  label: {
    ...Typography.sectionTitle,
    color: Colors.text,
    flex: 1,
  },
  countBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
  },
});
