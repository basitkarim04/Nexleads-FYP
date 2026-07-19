import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../src/store';
import { fetchEmails, setCurrentFolder } from '../../../src/store/slices/emailSlice';
import { EmailFolder } from '../../../src/types/email.types';
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper';
import { EmailRow } from '../../../src/components/emails/EmailRow';
import { FolderTab } from '../../../src/components/emails/FolderTab';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing } from '../../../src/theme/spacing';

const FOLDERS: EmailFolder[] = ['inbox', 'sent', 'drafts', 'trash'];

export default function EmailsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { emails, currentFolder, loading, unreadCount } = useSelector((s: RootState) => s.emails);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchEmails({ folder: currentFolder }));
  }, [currentFolder, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchEmails({ folder: currentFolder }));
    setRefreshing(false);
  }, [dispatch, currentFolder]);

  const handleFolderChange = (folder: EmailFolder) => {
    dispatch(setCurrentFolder(folder));
  };

  return (
    <ScreenWrapper>
      <View style={styles.Pageheader}>
        <Text style={styles.title}>Emails</Text>
        <TouchableOpacity
          onPress={() => router.push('/(app)/emails/compose')}
          style={styles.composeBtn}
        >
          <Ionicons name="create-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.folderTabs}
        >
          {FOLDERS.map((f) => (
            <FolderTab
              key={f}
              folder={f}
              activeFolder={currentFolder}
              onPress={handleFolderChange}
              unreadCount={unreadCount}
            />
          ))}
        </ScrollView>
      </View>

      {loading && emails.length === 0 ? (
        <View style={styles.center}>
          <LoadingSpinner size={48} />
        </View>
      ) : (
        <FlatList
          data={emails.filter((e) => e.folder === currentFolder)}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <EmailRow email={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="mail-outline"
              title={`No emails in ${currentFolder}`}
              subtitle="Your emails will appear here"
            />
          }
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  Pageheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
    paddingRight: Spacing.md,
  },
  title: { ...Typography.headlineM, color: Colors.text },
  folderTabs: {
    paddingHorizontal: Spacing.sm,
  },
  composeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: `${Colors.primary}22`,
    borderWidth: 1,
    borderColor: `${Colors.primary}44`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: Spacing.xxl },
});
