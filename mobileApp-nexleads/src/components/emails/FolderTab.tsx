import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EmailFolder } from '../../types/email.types';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface FolderTabProps {
  folder: EmailFolder;
  activeFolder: EmailFolder;
  onPress: (folder: EmailFolder) => void;
  unreadCount?: number;
}

const labels: Record<EmailFolder, string> = {
  inbox: 'Inbox',
  sent: 'Sent',
  drafts: 'Drafts',
  spam: 'Spam',
  trash: 'Trash',
};

export function FolderTab({ folder, activeFolder, onPress, unreadCount }: FolderTabProps) {
  const isActive = folder === activeFolder;

  return (
    <TouchableOpacity
      onPress={() => onPress(folder)}
      style={styles.tab}
      activeOpacity={0.82}
    >
      <View style={styles.content}>
        <Text style={[styles.label, isActive && styles.labelActive]}>{labels[folder]}</Text>
        {folder === 'inbox' && unreadCount !== undefined && unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>
        )}
      </View>
      {isActive && <View style={styles.indicator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...Typography.body,
    color: Colors.muted,
  },
  labelActive: {
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#fff',
  },
  indicator: {
    height: 2,
    width: '80%',
    backgroundColor: Colors.primary,
    borderRadius: 1,
    marginTop: 4,
  },
});
