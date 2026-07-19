import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

const L = Colors.light;

interface EmailsBreakdownProps {
  /** Percentages (0–100) for each stage, as provided by the API. */
  breakdown: { sent: number; opened: number; responded: number };
}

// Row/segment colors matching the web "Emails Breakdown" (dark -> light).
const ROWS = [
  { key: 'sent', label: 'Emails Sent', color: '#1e3a5f' },
  { key: 'opened', label: 'Emails Opened', color: '#5a7ba8' },
  { key: 'responded', label: 'Emails Responded', color: '#a8c8e8' },
] as const;

/**
 * White "Emails Breakdown" card matching the web dashboard: a labelled list
 * with a colored dot, name, and percentage, followed by one segmented bar.
 * Percentages come straight from the API's emailBreakdown.
 */
export function EmailsBreakdown({ breakdown }: EmailsBreakdownProps) {
  const values = ROWS.map((r) => ({ ...r, percent: breakdown[r.key] ?? 0 }));
  // Size the bar segments by their share of the combined total; fall back to
  // equal thirds when everything is zero so the track still reads as 3 colors.
  const total = values.reduce((sum, v) => sum + v.percent, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Emails Breakdown</Text>

      <View style={styles.list}>
        {values.map((v) => (
          <View key={v.key} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: v.color }]} />
            <Text style={styles.name}>{v.label}</Text>
            <Text style={styles.pct}>{v.percent}%</Text>
          </View>
        ))}
      </View>

      {/* Segmented progress bar */}
      <View style={styles.bar}>
        {values.map((v) => (
          <View
            key={v.key}
            style={{
              flex: total > 0 ? v.percent : 1,
              backgroundColor: v.color,
            }}
          />
        ))}
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
    marginBottom: 14,
  },
  list: {
    gap: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 10,
  },
  name: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: L.textBody,
  },
  pct: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: L.textPrimary,
  },
  bar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: L.track,
  },
});
