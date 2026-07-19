import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../src/store';
import { fetchAdminStats } from '../../src/store/slices/adminSlice';
import { logoutThunk } from '../../src/store/slices/authSlice';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { StatCard } from '../../src/components/admin/StatCard';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { formatCurrency } from '../../src/utils/formatters';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing } from '../../src/theme/spacing';

export default function AdminDashboardScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, statsLoading } = useSelector((s: RootState) => s.admin);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchAdminStats());
    setRefreshing(false);
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    router.replace('/auth/login');
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>NexLeads Admin</Text>
          <Text style={styles.headerSub}>Management Console</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {statsLoading && !stats ? (
          <View style={styles.center}>
            <LoadingSpinner size={48} />
          </View>
        ) : stats ? (
          <>
            <Text style={styles.sectionTitle}>Platform Overview</Text>
            <View style={styles.statsRow}>
              <StatCard
                icon="people-outline"
                label="Total Users"
                value={stats.totalUsers}
                color={Colors.primary}
              />
              <StatCard
                icon="person-add-outline"
                label="New This Month"
                value={stats.newUsersThisMonth}
                color={Colors.primary2}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                icon="analytics-outline"
                label="Total Leads"
                value={stats.totalLeads}
                color={Colors.warning}
              />
              <StatCard
                icon="cash-outline"
                label="Total Earnings"
                value={formatCurrency(stats.totalEarnings)}
                color={Colors.success}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                icon="diamond-outline"
                label="Active Subs"
                value={stats.activeSubscriptions}
                color="#a78bfa"
              />
            </View>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Management</Text>
        <TouchableOpacity
          onPress={() => router.push('/admin/users')}
          style={styles.navCard}
          activeOpacity={0.82}
        >
          <View style={styles.navIconWrap}>
            <Ionicons name="people" size={24} color={Colors.primary} />
          </View>
          <View style={styles.navInfo}>
            <Text style={styles.navTitle}>User Management</Text>
            <Text style={styles.navSub}>View, search, block/unblock users</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: Colors.sidebar,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: Colors.primary,
  },
  headerSub: {
    ...Typography.captionXS,
    color: Colors.muted,
  },
  logoutBtn: {
    padding: Spacing.sm,
    backgroundColor: `${Colors.danger}22`,
    borderRadius: 20,
  },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.xxl },
  sectionTitle: {
    ...Typography.sectionTitle,
    color: Colors.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  statsRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.glassCard,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 16,
    padding: Spacing.md,
  },
  navIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}22`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navInfo: { flex: 1 },
  navTitle: { ...Typography.body, color: Colors.text, fontFamily: 'Poppins_600SemiBold' },
  navSub: { ...Typography.captionXS, color: Colors.muted },
});
