import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

const L = Colors.light;

interface RecentProject {
  _id: string;
  title: string;
  status: string;
  company?: string;
}

interface RecentActivityProps {
  projects: RecentProject[];
  openRate: number;
}

// Rotating avatar colors (pink / blue / orange) like the web "Current Projects".
const AVATAR_COLORS = ['#EC4899', '#3B82F6', '#F97316'];

/**
 * White "Current Projects" card matching the web dashboard: each row shows a
 * colored circular avatar, the project title, and a secondary muted line.
 */
export function RecentActivity({ projects, openRate }: RecentActivityProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Current Projects</Text>

      {projects.length === 0 ? (
        <Text style={styles.empty}>No recent projects</Text>
      ) : (
        projects.slice(0, 3).map((p, i) => (
          <View key={p._id} style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
              <Feather name="user" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.projectTitle} numberOfLines={1}>
                {p.title}
              </Text>
              <Text style={styles.projectSub} numberOfLines={1}>
                {p.company ? p.company : p.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
        ))
      )}

      <View style={styles.divider} />
      <View style={styles.openRateRow}>
        <Feather name="eye" size={16} color={L.seg2} />
        <Text style={styles.openRateLabel}>Email Open Rate</Text>
        <Text style={styles.openRateValue}>{openRate.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: L.card,
    borderWidth: 1,
    borderColor: L.cardBorder,
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: L.textPrimary,
    marginBottom: 12,
  },
  empty: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: L.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },
  projectTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: L.textPrimary,
  },
  projectSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: L.textMuted,
    marginTop: 1,
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: L.cardBorder,
    marginVertical: 14,
  },
  openRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openRateLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: L.textBody,
    flex: 1,
  },
  openRateValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: L.seg2,
  },
});
