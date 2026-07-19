import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StatusBar,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../src/store';
import { fetchDashboardStats } from '../../../src/store/slices/userSlice';
import { useAuth } from '../../../src/hooks/useAuth';
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { MetricBento } from '../../../src/components/dashboard/MetricBento';
import { FunnelChart } from '../../../src/components/dashboard/FunnelChart';
import { EmailsBreakdown } from '../../../src/components/dashboard/EmailsBreakdown';
import { RecentActivity } from '../../../src/components/dashboard/RecentActivity';
import { Colors } from '../../../src/theme/colors';

/**
 * Light-theme tokens mapped from the web dashboard (Dashboard.jsx + Tailwind).
 * Sourced from the shared `Colors.light` block so the screen and its child
 * cards stay in sync. The app default palette is dark; only the dashboard
 * surfaces opt into this light look.
 */
const Web = {
  ...Colors.light,
  active: '#5F81AF', // active nav -> bg-[#5F81AF]
  avatarBg: Colors.light.blue300, // avatar circle -> bg-blue-300
  avatarIcon: Colors.light.blue900, // avatar icon -> text-blue-900
} as const;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { dashboardStats, statsLoading } = useSelector((s: RootState) => s.user);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadStats = useCallback(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchDashboardStats());
    setRefreshing(false);
  }, [dispatch]);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <ScreenWrapper style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={Web.headerBg} />

      {/* HEADER — matches web: bg-[#EEF8FF], avatar + name/email left, bell right */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Avatar: blue-300 circle with blue-900 user icon (web parity) */}
          <View style={styles.avatar}>
            {user?.profilePicture ? (
              <Image source={{ uri: user.profilePicture }} style={styles.avatarImg} />
            ) : (
              <Feather name="user" size={20} color={Web.avatarIcon} />
            )}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.greeting} numberOfLines={1}>
              {getGreeting()}, {firstName}
            </Text>
            <Text style={styles.nexEmail} numberOfLines={1}>
              {user?.nexleadsEmail ?? user?.email}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
          <Feather name="bell" size={22} color={Web.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* CONTENT — bg-blue-50, p-4 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Web.active}
            colors={[Web.active]}
          />
        }
        contentContainerStyle={styles.content}
      >
        {statsLoading && !dashboardStats ? (
          <View style={styles.loadingWrap}>
            <LoadingSpinner size={48} />
          </View>
        ) : dashboardStats ? (
          <>
            <Text style={styles.sectionTitle}>Overview</Text>
            <MetricBento stats={dashboardStats.stats} />

            <Text style={styles.sectionTitle}>Lead Funnel</Text>
            <FunnelChart data={dashboardStats.funnelData ?? []} />

            <Text style={styles.sectionTitle}>Emails Breakdown</Text>
            <EmailsBreakdown
              breakdown={
                dashboardStats.emailBreakdown ?? { sent: 0, opened: 0, responded: 0 }
              }
            />

            <Text style={styles.sectionTitle}>Activity</Text>
            <RecentActivity
              projects={dashboardStats.recentProjects ?? []}
              openRate={dashboardStats.emailOpenRate ?? 0}
            />
          </>
        ) : (
          <View style={styles.loadingWrap}>
            <Text style={styles.noData}>Pull down to load your stats</Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // Override ScreenWrapper's dark background -> web light theme (#FFF)
  screen: {
    backgroundColor: Web.bg,
  },
  // Header: flex row, space-between, compact padding (web: px-2 md:px-4 py-3)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Web.headerBg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  // Avatar: w-10 h-10 rounded-full bg-blue-300
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Web.avatarBg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerText: {
    flex: 1,
  },
  // name -> font-semibold text-sm text-gray-900
  greeting: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: Web.textPrimary,
  },
  // email -> text-xs text-gray-500
  nexEmail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: Web.textMuted,
    marginTop: 1,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: Web.contentBg,
  },
  // Content area: p-4, bg-blue-50
  content: {
    padding: 16,
    paddingBottom: 40,
    rowGap: 4,
  },
  // Section titles: uppercase, text-xs, muted (text-gray-500)
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    color: Web.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  noData: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: Web.textMuted,
  },
});
