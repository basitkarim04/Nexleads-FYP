import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../src/store';
import { fetchProfile } from '../../../src/store/slices/userSlice';
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Badge } from '../../../src/components/ui/Badge';
import { useAuth } from '../../../src/hooks/useAuth';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Radius, Spacing } from '../../../src/theme/spacing';

interface SettingsItem {
  icon: string;
  label: string;
  route: string;
  color?: string;
  badge?: string;
}

const planColors: Record<string, string> = {
  free: Colors.muted,
  pro: Colors.primary,
  platinum: '#a78bfa',
};

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  // Subscription/usage isn't in the minimal auth user — fetch the full profile.
  const profile = useSelector((s: RootState) => s.user.profile);
  const displayUser = profile ?? user;
  const subscription = profile?.subscription;

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const items: SettingsItem[] = [
    { icon: 'person-outline', label: 'Profile', route: '/(app)/settings/profile' },
    { icon: 'lock-closed-outline', label: 'Password', route: '/(app)/settings/password' },
    {
      icon: 'diamond-outline',
      label: 'Subscription',
      route: '/(app)/settings/subscription',
      color: '#a78bfa',
      badge: subscription?.plan,
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Privacy Policy',
      route: '/(app)/settings/privacy-policy',
    },
    {
      icon: 'document-text-outline',
      label: 'Terms & Conditions',
      route: '/(app)/settings/terms-conditions',
    },
  ];

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar uri={displayUser?.profilePicture} name={displayUser?.name} size={64} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayUser?.name}</Text>
              <Text style={styles.profileEmail}>{displayUser?.email}</Text>
              <Badge
                label={subscription?.plan ?? 'free'}
                color={planColors[subscription?.plan ?? 'free']}
              />
            </View>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Leads Usage</Text>
            <Text style={styles.usageValue}>
              {subscription?.leadsUsed ?? 0} / {subscription?.leadsLimit ?? 0}
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${subscription?.leadsLimit
                    ? Math.round((subscription.leadsUsed / subscription.leadsLimit) * 100)
                    : 0}%`,
                },
              ]}
            />
          </View>
        </GlassCard>

        <View style={styles.menuGrid}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.push(item.route as any)}
              style={styles.menuCard}
              activeOpacity={0.82}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: `${item.color ?? Colors.primary}22` },
                ]}
              >
                <Ionicons name={item.icon as any} size={22} color={item.color ?? Colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.badge && (
                <Badge label={item.badge} color={item.color ?? Colors.primary} style={styles.menuBadge} />
              )}
              <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.82}>
          <View style={[styles.menuIcon, { backgroundColor: `${Colors.danger}22` }]}>
            <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
          </View>
          <Text style={[styles.menuLabel, { color: Colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  title: { ...Typography.headlineM, color: Colors.text },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  profileCard: { marginBottom: Spacing.md },
  profileRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  profileInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  profileName: { ...Typography.sectionTitle, color: Colors.text },
  profileEmail: { ...Typography.captionXS, color: Colors.muted },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  usageLabel: { ...Typography.captionXS, color: Colors.muted },
  usageValue: { ...Typography.captionXS, color: Colors.primary, fontFamily: 'Poppins_600SemiBold' },
  progressBg: {
    height: 6,
    backgroundColor: Colors.glassInput,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
    minWidth: 4,
  },
  menuGrid: { gap: Spacing.sm, marginBottom: Spacing.md },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.glassCard,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: { ...Typography.body, color: Colors.text, flex: 1, fontFamily: 'Poppins_600SemiBold' },
  menuBadge: { marginRight: 4 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.danger}11`,
    borderWidth: 1,
    borderColor: `${Colors.danger}33`,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
});
