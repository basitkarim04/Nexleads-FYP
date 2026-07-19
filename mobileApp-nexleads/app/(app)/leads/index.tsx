import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../src/store';
import { fetchMyLeads } from '../../../src/store/slices/leadSlice';
import { fetchProfile } from '../../../src/store/slices/userSlice';
import { Lead } from '../../../src/types/lead.types';
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper';
import { LeadCard } from '../../../src/components/leads/LeadCard';
import { SearchModal } from '../../../src/components/leads/SearchModal';
import { DatePickerModal } from '../../../src/components/ui/DatePickerModal';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ToastMessage } from '../../../src/components/ui/ToastMessage';
import { useToast } from '../../../src/hooks/useToast';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Radius, Spacing } from '../../../src/theme/spacing';

const PLATFORMS = ['All', 'upwork', 'linkedin', 'freelancer', 'fiverr', 'other'];

function fmtDate(d: Date | null): string {
  if (!d) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LeadsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { leads, loading } = useSelector((s: RootState) => s.leads);
  const profile = useSelector((s: RootState) => s.user.profile);
  // Fallback source for subscription usage if the full profile hasn't loaded
  // yet — the stored auth user also carries the subscription block.
  const authUser = useSelector((s: RootState) => s.auth.user);
  const { toast, hideToast } = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activePlatform, setActivePlatform] = useState('All');

  // Multi-select for the bulk "email selected leads" flow (mirrors web).
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Inline search + date-range filter (mirrors the web DashboardSearch).
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateModal, setDateModal] = useState<null | 'start' | 'end'>(null);

  useEffect(() => {
    dispatch(fetchMyLeads());
    dispatch(fetchProfile());
  }, [dispatch]);

  // Refresh when the screen regains focus (e.g. returning from the bulk Compose
  // screen) so emailsSent counters / statuses are current, and clear any stale
  // selection so the user starts fresh.
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMyLeads());
      setSelectedLeads([]);
    }, [dispatch])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchMyLeads()), dispatch(fetchProfile())]);
    setRefreshing(false);
  }, [dispatch]);

  const filteredLeads = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Normalize the range to start-of-day / end-of-day, swapping if reversed.
    let from = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    let to = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
    if (from !== null && to !== null && from > to) {
      const t = from;
      from = new Date(endDate as Date).setHours(0, 0, 0, 0);
      to = new Date(startDate as Date).setHours(23, 59, 59, 999);
    }

    return leads.filter((lead) => {
      const platformMatch =
        activePlatform === 'All' || lead.platform.toLowerCase() === activePlatform.toLowerCase();

      // Keyword search over name, jobTitle, and keywords (jobField).
      const searchMatch =
        !q ||
        lead.name?.toLowerCase().includes(q) ||
        lead.jobTitle?.toLowerCase().includes(q) ||
        lead.jobField?.toLowerCase().includes(q);

      // Date-range filter on createdAt.
      let dateMatch = true;
      if (from !== null || to !== null) {
        const ts = new Date(lead.createdAt).getTime();
        if (isNaN(ts)) {
          dateMatch = false;
        } else {
          dateMatch = (from === null || ts >= from) && (to === null || ts <= to);
        }
      }

      return platformMatch && searchMatch && dateMatch;
    });
  }, [leads, activePlatform, query, startDate, endDate]);

  // ---- Selection (mirrors web DashboardSearch) ----
  const toggleLead = useCallback((leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  }, []);

  const allSelected =
    filteredLeads.length > 0 && selectedLeads.length === filteredLeads.length;

  const toggleSelectAll = useCallback(() => {
    // Select/deselect ALL filtered leads (not just the visible ones).
    setSelectedLeads((prev) =>
      prev.length === filteredLeads.length ? [] : filteredLeads.map((l) => l._id)
    );
  }, [filteredLeads]);

  // Prune any selected ids that fall out of the current filter so the
  // "select all" checked-state and the send target stay accurate.
  useEffect(() => {
    setSelectedLeads((prev) => {
      const visible = new Set(filteredLeads.map((l) => l._id));
      const next = prev.filter((id) => visible.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [filteredLeads]);

  // Open the shared Compose screen in bulk mode (gets AI Assist for free). The
  // selected ids ride along as a comma-separated route param.
  const openBulkCompose = useCallback(() => {
    if (selectedLeads.length === 0) return;
    router.push(`/(app)/emails/compose?leadIds=${selectedLeads.join(',')}`);
  }, [selectedLeads]);

  const renderLead = useCallback(
    ({ item }: { item: Lead }) => (
      <LeadCard
        lead={item}
        // Always show the per-lead checkbox (mirrors the web table where every
        // row has one). Tapping the card body toggles selection; the row's
        // detail chevron still opens the lead.
        selectable
        selected={selectedLeads.includes(item._id)}
        onToggleSelect={toggleLead}
      />
    ),
    [selectedLeads, toggleLead]
  );

  // Read usage from the full profile, falling back to the auth user, so the
  // pill shows real numbers (e.g. "6/100") instead of "0/0" before/if the
  // profile fetch hasn't populated yet.
  const subscription = profile?.subscription ?? authUser?.subscription;
  const leadsLimit = subscription?.leadsLimit ?? 0;
  const leadsUsed = subscription?.leadsUsed ?? 0;

  const hasDateFilter = !!startDate || !!endDate;
  const dateLabel = hasDateFilter
    ? `${fmtDate(startDate) || 'Any'} – ${fmtDate(endDate) || 'Any'}`
    : 'Date range';

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>My Leads</Text>
        <View style={styles.usagePill}>
          <Text style={styles.usageText}>
            {leadsLimit === -1 ? `${leadsUsed}/∞ used` : `${leadsUsed}/${leadsLimit} used`}
          </Text>
        </View>
      </View>

      {/* Search for new leads (opens the lead-search modal) */}
      <TouchableOpacity
        onPress={() => setShowSearch(true)}
        style={styles.searchLeadsBtn}
        activeOpacity={0.85}
      >
        <Ionicons name="search-outline" size={18} color="#fff" />
        <Text style={styles.searchLeadsText}>Search for New Leads</Text>
      </TouchableOpacity>

      {/* Single-line: search bar + calendar icon (filters the list below) */}
      <View style={styles.filterRow}>
        <View style={styles.searchField}>
          <Ionicons name="search-outline" size={18} color={Colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search name, job title, keywords…"
            placeholderTextColor={Colors.muted}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setDateModal('start')}
          style={[styles.calendarBtn, hasDateFilter && styles.calendarBtnActive]}
          activeOpacity={0.85}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={hasDateFilter ? '#fff' : Colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Active date-range chip */}
      {hasDateFilter && (
        <View style={styles.dateChipRow}>
          <View style={styles.dateChip}>
            <Ionicons name="calendar-outline" size={13} color={Colors.primary} />
            <Text style={styles.dateChipText}>{dateLabel}</Text>
            <TouchableOpacity onPress={clearDates} hitSlop={8}>
              <Ionicons name="close" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Platform filter chips — FlatList measures items lazily, so all chips
          (including the leading ones) render correctly on the first frame. */}
      <FlatList
        horizontal
        data={PLATFORMS}
        keyExtractor={(p) => p}
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
        renderItem={({ item: p }) => (
          <TouchableOpacity
            onPress={() => setActivePlatform(p)}
            style={[styles.chip, activePlatform === p && styles.chipActive]}
          >
            <Text style={[styles.chipText, activePlatform === p && styles.chipTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Select-all row — selects/deselects ALL filtered leads at once. */}
      {filteredLeads.length > 0 && (
        <View style={styles.selectAllRow}>
          <TouchableOpacity
            onPress={toggleSelectAll}
            style={styles.selectAllLeft}
            hitSlop={8}
            activeOpacity={0.7}
          >
            <Ionicons
              name={allSelected ? 'checkbox' : 'square-outline'}
              size={22}
              color={allSelected ? Colors.primary : Colors.muted}
            />
            <Text style={styles.selectAllText}>
              {selectedLeads.length > 0
                ? `${selectedLeads.length} selected`
                : 'Select All'}
            </Text>
          </TouchableOpacity>

          {selectedLeads.length > 0 && (
            <TouchableOpacity
              onPress={openBulkCompose}
              style={styles.sendBtn}
              activeOpacity={0.85}
            >
              <Ionicons name="mail-outline" size={16} color="#fff" />
              <Text style={styles.sendBtnText}>Email Selected</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading && leads.length === 0 ? (
        <View style={styles.center}>
          <LoadingSpinner size={48} />
        </View>
      ) : (
        <FlatList
          data={filteredLeads}
          keyExtractor={(item) => item._id}
          renderItem={renderLead}
          extraData={selectedLeads}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No leads found"
              subtitle="Search for leads or adjust your filters"
            />
          }
        />
      )}

      <SearchModal visible={showSearch} onClose={() => setShowSearch(false)} />

      <ToastMessage
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />

      {/* Date-range picker: pick start, then end */}
      <DatePickerModal
        visible={dateModal === 'start'}
        value={startDate ?? new Date()}
        onCancel={() => setDateModal(null)}
        onConfirm={(d) => {
          setStartDate(d);
          setDateModal('end');
        }}
      />
      <DatePickerModal
        visible={dateModal === 'end'}
        value={endDate ?? startDate ?? new Date()}
        minimumDate={startDate ?? undefined}
        onCancel={() => setDateModal(null)}
        onConfirm={(d) => {
          setEndDate(d);
          setDateModal(null);
        }}
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
  usagePill: {
    backgroundColor: `${Colors.primary}22`,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${Colors.primary}44`,
  },
  usageText: { ...Typography.captionXS, color: Colors.primary, fontFamily: 'Poppins_600SemiBold' },

  // "Search for New Leads" call-to-action button
  searchLeadsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary2,
  },
  searchLeadsText: {
    ...Typography.button,
    color: '#fff',
  },

  // Inline search + calendar row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 46,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.glassInput,
    borderWidth: 1,
    borderColor: Colors.glassInputBorder,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    padding: 0,
  },
  calendarBtn: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.glassInput,
    borderWidth: 1,
    borderColor: Colors.glassInputBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  // Active date-range chip
  dateChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: `${Colors.primary}18`,
    borderWidth: 1,
    borderColor: `${Colors.primary}44`,
  },
  dateChipText: {
    ...Typography.captionXS,
    color: Colors.primary,
    fontFamily: 'Poppins_600SemiBold',
  },

  // flexGrow:0 keeps the bar at its content height inside the parent column so
  // it isn't squeezed (the squeeze is what clipped the leading chips on first
  // render until a scroll forced a re-measure).
  filterBar: {
    flexGrow: 0,
  },
  // flexGrow:1 lets the row size to its content without conflicting flex props;
  // alignItems centers the chips vertically.
  filterContent: {
    flexGrow: 1,
    minHeight: 70,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    flexShrink: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassCard,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { ...Typography.captionXS, color: Colors.muted, fontFamily: 'Poppins_600SemiBold' },
  chipTextActive: { color: '#fff' },
  list: { paddingVertical: Spacing.sm, paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Select-all row above the list
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  selectAllLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  selectAllText: {
    ...Typography.captionXS,
    color: Colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  sendBtnText: {
    ...Typography.captionXS,
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
  },
});
