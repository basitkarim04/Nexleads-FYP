import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { Email } from '../../types/email.types';
import { AppDispatch } from '../../store';
import { deleteEmail, setSelectedEmail } from '../../store/slices/emailSlice';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface EmailRowProps {
  email: Email;
}

function getInitialColor(from: string): string {
  const colors = [Colors.primary, Colors.success, Colors.warning, '#a78bfa', Colors.primary2];
  const index = from.charCodeAt(0) % colors.length;
  return colors[index];
}

export function EmailRow({ email }: EmailRowProps) {
  const dispatch = useDispatch<AppDispatch>();
  const initial = email.from?.[0]?.toUpperCase() ?? '?';
  const color = getInitialColor(email.from ?? '');
  const isUnread = !email.isRead;

  const handlePress = () => {
    dispatch(setSelectedEmail(email));
    router.push(`/(app)/emails/${email._id}`);
  };

  const handleTrash = async () => {
    await  dispatch(deleteEmail(email._id));
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.row} activeOpacity={0.82}>
      <View style={[styles.avatar, { backgroundColor: `${color}22`, borderColor: color }]}>
        <Text style={[styles.initial, { color }]}>{initial}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.from, isUnread && styles.bold]} numberOfLines={1}>
            {email.from}
          </Text>
          <View style={styles.rightCol}>
            {email.isOpened && (
              <Ionicons name="eye-outline" size={13} color={Colors.success} style={styles.eyeIcon} />
            )}
            <Text style={styles.time}>
              {new Date(email.sentAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <Text style={[styles.subject, isUnread && styles.bold]} numberOfLines={1}>
          {email.subject}
        </Text>
        <View style={styles.previewRow}>
          <Text style={styles.preview} numberOfLines={1}>
            {email.body.replace(/<[^>]+>/g, '')}
          </Text>
          {isUnread && <View style={styles.unreadDot} />}
        </View>
      </View>
      <TouchableOpacity onPress={handleTrash} style={styles.trashBtn}>
        <Ionicons name="trash-outline" size={16} color={Colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  initial: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  from: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  bold: {
    fontFamily: 'Poppins_700Bold',
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    marginRight: 4,
  },
  time: {
    ...Typography.captionXS,
    color: Colors.muted,
  },
  subject: {
    ...Typography.body,
    color: Colors.muted,
    fontSize: 13,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preview: {
    ...Typography.captionXS,
    color: Colors.active,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.xs,
  },
  trashBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
});
