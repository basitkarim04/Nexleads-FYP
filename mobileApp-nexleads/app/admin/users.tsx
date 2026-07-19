import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../src/store';
import { fetchAllUsers } from '../../src/store/slices/adminSlice';
import { AdminUser } from '../../src/types/admin.types';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { UserRow } from '../../src/components/admin/UserRow';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Badge } from '../../src/components/ui/Badge';
import { Avatar } from '../../src/components/ui/Avatar';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { formatDate } from '../../src/utils/formatters';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Radius, Spacing } from '../../src/theme/spacing';

const planColors: Record<string, string> = {
  free: Colors.muted,
  pro: Colors.primary,
  platinum: '#a78bfa',
};

export default function UsersScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, selectedUser } = useSelector((s: RootState) => s.admin);
  const [search, setSearch] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dispatch(fetchAllUsers({}));
  }, [dispatch]);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(fetchAllUsers({ search: text }));
    }, 500);
  };

  const handleUserPress = (user: AdminUser) => {
    setDetailUser(user);
    setShowDetail(true);
  };

  const renderUser = useCallback(
    ({ item }: { item: AdminUser }) => (
      <UserRow user={item} onPress={() => handleUserPress(item)} />
    ),
    []
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Users</Text>
        <Text style={styles.count}>{users.length}</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor={Colors.muted}
          value={search}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(''); dispatch(fetchAllUsers({})); }}>
            <Ionicons name="close-circle" size={18} color={Colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {loading && users.length === 0 ? (
        <View style={styles.center}>
          <LoadingSpinner size={48} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No users found"
              subtitle="Try a different search term"
            />
          }
        />
      )}

      <Modal transparent visible={showDetail} onRequestClose={() => setShowDetail(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            {detailUser && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>User Detail</Text>
                  <TouchableOpacity onPress={() => setShowDetail(false)}>
                    <Ionicons name="close" size={22} color={Colors.muted} />
                  </TouchableOpacity>
                </View>
                <View style={styles.detailProfile}>
                  <Avatar uri={detailUser.profilePicture} name={detailUser.name} size={64} />
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailName}>{detailUser.name}</Text>
                    <Text style={styles.detailEmail}>{detailUser.email}</Text>
                    <Badge
                      label={detailUser.subscription.plan}
                      color={planColors[detailUser.subscription.plan] ?? Colors.primary}
                    />
                  </View>
                </View>

                <GlassCard style={styles.detailStats}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Leads Used</Text>
                    <Text style={styles.statValue}>
                      {detailUser.subscription.leadsUsed} / {detailUser.subscription.leadsLimit}
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Total Leads</Text>
                    <Text style={styles.statValue}>{detailUser.leadsCount ?? 0}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Status</Text>
                    <Badge
                      label={detailUser.blocked ? 'Blocked' : 'Active'}
                      color={detailUser.blocked ? Colors.danger : Colors.success}
                    />
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Joined</Text>
                    <Text style={styles.statValue}>{formatDate(detailUser.createdAt)}</Text>
                  </View>
                </GlassCard>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.sidebar,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  backBtn: { padding: 4 },
  title: { ...Typography.headlineM, color: Colors.text, flex: 1 },
  count: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: Colors.primary,
    backgroundColor: `${Colors.primary}22`,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassInput,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radius.md,
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: Spacing.xxl },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.bg2,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: { ...Typography.headlineM, color: Colors.text },
  detailProfile: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  detailInfo: { flex: 1, gap: 4, justifyContent: 'center' },
  detailName: { ...Typography.sectionTitle, color: Colors.text },
  detailEmail: { ...Typography.captionXS, color: Colors.muted },
  detailStats: { marginTop: Spacing.sm },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  statLabel: { ...Typography.body, color: Colors.muted },
  statValue: { ...Typography.body, color: Colors.text, fontFamily: 'Poppins_600SemiBold' },
});
