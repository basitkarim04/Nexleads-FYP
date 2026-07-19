import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { DatePickerModal } from '../ui/DatePickerModal';
import { AppDispatch, RootState } from '../../store';
import { searchLeads, fetchMyLeads } from '../../store/slices/leadSlice';
import { fetchProfile } from '../../store/slices/userSlice';
import { GlassInput } from '../ui/GlassInput';
import { PrimaryButton } from '../ui/PrimaryButton';
import { ToastMessage } from '../ui/ToastMessage';
import { useToast } from '../../hooks/useToast';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

const PLATFORMS = ['facebook', 'linkedin', 'freelancer', 'fiverr', 'other'];

const { height } = Dimensions.get('window');

export function SearchModal({ visible, onClose }: SearchModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { searching } = useSelector((s: RootState) => s.leads);
  const { toast, showToast, showError, hideToast } = useToast();

  const [keyword, setKeyword] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: height, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSearch = async () => {
    // Keep the sheet open while searching so the button's loader is visible
    // (the search hits scraping APIs and can take many seconds). Only close
    // once it completes — and refresh the saved-leads list + usage so the new
    // leads appear without a manual pull-to-refresh.
    const result = await dispatch(
      searchLeads({
        keyword: keyword || undefined,
        platforms: selectedPlatforms.join(',') || undefined,
        startDate: startDate?.toISOString().split('T')[0],
        endDate: endDate?.toISOString().split('T')[0],
      })
    );

    if (searchLeads.fulfilled.match(result)) {
      const summary = result.payload.summary;
      showToast(
        `Found Results ${summary.foundResults}, with Emails ${summary.withEmails}`,
        'info'
      );
      // Pull the freshly-saved leads and the updated usage counter.
      await Promise.all([dispatch(fetchMyLeads()), dispatch(fetchProfile())]);
      onClose();
    } else {
      showError(typeof result.payload === 'string' ? result.payload : 'Search failed');
    }
    // On failure, leave the sheet open so the user can retry; the leadSlice
    // stores the error and the screen surfaces it.
  };

  if (!visible && !toast.visible) return null;

  return (
    <>
    {visible && (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        {/* Block accidental dismissal while a search is in flight. */}
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          disabled={searching}
        />
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Search Leads</Text>

          {searching && (
            <View style={styles.searchingBanner}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.searchingText}>
                Searching across platforms… this can take a moment.
              </Text>
            </View>
          )}

          <GlassInput
            placeholder="Keyword (company, name, role...)"
            value={keyword}
            onChangeText={setKeyword}
            icon="search-outline"
          />

          <Text style={styles.sectionLabel}>Platforms</Text>
          <View style={styles.chips}>
            {PLATFORMS.map((p) => {
              const active = selectedPlatforms.includes(p);
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => togglePlatform(p)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Date Range</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.datePicker}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateText}>
                {startDate ? startDate.toLocaleDateString() : 'Start Date'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.datePicker}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateText}>
                {endDate ? endDate.toLocaleDateString() : 'End Date'}
              </Text>
            </TouchableOpacity>
          </View>

          <DatePickerModal
            visible={showStartPicker}
            value={startDate ?? new Date()}
            onConfirm={(d) => { setStartDate(d); setShowStartPicker(false); }}
            onCancel={() => setShowStartPicker(false)}
          />
          <DatePickerModal
            visible={showEndPicker}
            value={endDate ?? new Date()}
            onConfirm={(d) => { setEndDate(d); setShowEndPicker(false); }}
            onCancel={() => setShowEndPicker(false)}
          />

          <PrimaryButton
            title="Search"
            onPress={handleSearch}
            loading={searching}
            brutalism
            style={styles.searchBtn}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
    )}
    <ToastMessage
      message={toast.message}
      type={toast.type}
      visible={toast.visible}
      onHide={hideToast}
    />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.bg2,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.active,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.headlineM,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.muted,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassCard,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.label,
    color: Colors.muted,
  },
  chipTextActive: {
    color: '#fff',
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  datePicker: {
    flex: 1,
    backgroundColor: Colors.glassInput,
    borderWidth: 1,
    borderColor: Colors.glassInputBorder,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    minHeight: 46,
  },
  dateText: {
    ...Typography.body,
    color: Colors.muted,
  },
  searchBtn: {
    marginTop: Spacing.sm,
  },
  searchingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.primary}18`,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Colors.primary}44`,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchingText: {
    ...Typography.captionXS,
    color: Colors.primary,
    flex: 1,
  },
});
