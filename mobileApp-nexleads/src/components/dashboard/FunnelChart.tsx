import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

const L = Colors.light;

interface FunnelChartProps {
  data: { stage: string; count: number }[];
}

// Sequential icons for the funnel circles, matching the web (Leads -> Emails
// -> Response -> Project). Falls back to the last icon for any extra stages.
const STAGE_ICONS: React.ComponentProps<typeof Feather>['name'][] = [
  'search',
  'mail',
  'message-circle',
  'layers',
];

/**
 * Horizontal funnel matching the web dashboard: dark navy circles with white
 * glyphs, connected by arrows, with the stage label beneath each circle.
 */
export function FunnelChart({ data }: FunnelChartProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Funnel Lead Chart</Text>
      <View style={styles.divider} />

      <View style={styles.row}>
        {data.map((item, index) => (
          <React.Fragment key={item.stage}>
            <View style={styles.stage}>
              <View style={styles.circle}>
                <Feather
                  name={STAGE_ICONS[index] ?? STAGE_ICONS[STAGE_ICONS.length - 1]}
                  size={22}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {item.stage}
              </Text>
            </View>
            {index < data.length - 1 && (
              <Feather name="arrow-right" size={18} color={L.textFaint} style={styles.arrow} />
            )}
          </React.Fragment>
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
  },
  divider: {
    height: 1,
    backgroundColor: L.cardBorder,
    marginTop: 12,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stage: {
    alignItems: 'center',
    flexShrink: 1,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: L.circle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: L.textPrimary,
    marginTop: 10,
  },
  arrow: {
    marginTop: 18,
  },
});
