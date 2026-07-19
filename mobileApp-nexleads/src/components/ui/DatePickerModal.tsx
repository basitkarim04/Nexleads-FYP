import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function DatePickerModal({
  visible,
  value,
  onConfirm,
  onCancel,
  minimumDate,
  maximumDate,
}: DatePickerModalProps) {
  const now = value instanceof Date && !isNaN(value.getTime()) ? value : new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [day, setDay] = useState(now.getDate());

  const currentYear = new Date().getFullYear();
  const years = range(currentYear - 1, currentYear + 5);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = range(1, daysInMonth);

  const handleConfirm = () => {
    const safeDay = Math.min(day, daysInMonth);
    onConfirm(new Date(year, month, safeDay));
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Select Date</Text>

          <View style={styles.columns}>
            <View style={styles.col}>
              <Text style={styles.colLabel}>Month</Text>
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {MONTHS.map((m, i) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setMonth(i)}
                    style={[styles.item, month === i && styles.itemActive]}
                  >
                    <Text style={[styles.itemText, month === i && styles.itemTextActive]}>
                      {m.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.col}>
              <Text style={styles.colLabel}>Day</Text>
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {days.map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDay(d)}
                    style={[styles.item, day === d && styles.itemActive]}
                  >
                    <Text style={[styles.itemText, day === d && styles.itemTextActive]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.col}>
              <Text style={styles.colLabel}>Year</Text>
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {years.map((y) => (
                  <TouchableOpacity
                    key={y}
                    onPress={() => setYear(y)}
                    style={[styles.item, year === y && styles.itemActive]}
                  >
                    <Text style={[styles.itemText, year === y && styles.itemTextActive]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modal: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.lg,
    width: '100%',
  },
  title: {
    ...Typography.sectionTitle,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  columns: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  col: {
    flex: 1,
  },
  colLabel: {
    ...Typography.captionXS,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    fontFamily: 'Poppins_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scroll: {
    maxHeight: 180,
    backgroundColor: Colors.glassInput,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  item: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  itemActive: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    marginHorizontal: 2,
  },
  itemText: {
    ...Typography.body,
    color: Colors.muted,
    fontSize: 13,
  },
  itemTextActive: {
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
  },
  actions: {
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
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  confirmText: {
    ...Typography.button,
    color: '#fff',
  },
});
