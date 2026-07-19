import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DashboardStats } from '../../store/slices/userSlice';
import { Colors } from '../../theme/colors';

const L = Colors.light;

interface MetricBentoProps {
  stats: DashboardStats['stats'];
}

interface Metric {
  label: string;
  value: number | undefined;
}

/**
 * Metric cards matching the web dashboard: the first tile is a navy gradient
 * "hero" card with white text, the remaining tiles are plain white cards with
 * a gray label, large dark value, and a muted sub-line.
 */
export function MetricBento({ stats }: MetricBentoProps) {
  const metrics: Metric[] = [
    { label: 'Total Emails Sent', value: stats?.totalEmailsSent },
    { label: 'Emails Opened', value: stats?.totalEmailsOpened },
    { label: 'Responses Received', value: stats?.totalResponses },
    { label: 'People Reached', value: stats?.totalLeads },
  ];

  return (
    <View style={styles.grid}>
      {metrics.map((m, i) =>
        i === 0 ? (
          <LinearGradient
            key={m.label}
            colors={[L.heroFrom, L.heroTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.tile, styles.heroTile]}
          >
            <Text style={styles.heroLabel}>{m.label}</Text>
            <Text style={styles.heroValue}>{m.value ?? 0}</Text>
            <Text style={styles.heroSub}>Increased from last month</Text>
          </LinearGradient>
        ) : (
          <View key={m.label} style={[styles.tile, styles.plainTile]}>
            <Text style={styles.label}>{m.label}</Text>
            <Text style={styles.value}>{m.value ?? 0}</Text>
            <Text style={styles.sub}>Increased from last month</Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 110,
    justifyContent: 'center',
  },
  heroTile: {
    shadowColor: '#16304f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  plainTile: {
    backgroundColor: L.card,
    borderWidth: 1,
    borderColor: L.cardBorder,
  },
  // Hero (navy) card
  heroLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  heroValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 30,
    color: '#FFFFFF',
    marginVertical: 2,
  },
  heroSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  // Plain (white) cards
  label: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: L.textMuted,
  },
  value: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 30,
    color: L.textPrimary,
    marginVertical: 2,
  },
  sub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: L.textFaint,
  },
});
