import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { AdminUser } from '../../types/admin.types';
import { AppDispatch } from '../../store';
import { toggleBlockUser } from '../../store/slices/adminSlice';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface UserRowProps {
  user: AdminUser;
  onPress: () => void;
}

const planColors: Record<string, string> = {
  free: Colors.muted,
  pro: Colors.primary,
  platinum: '#a78bfa',
};

export function UserRow({ user, onPress }: UserRowProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleBlockToggle = () => {
    dispatch(toggleBlockUser({ userId: user._id, payload: { blocked: !user.blocked } }));
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={0.82}>
      <Avatar uri={user.profilePicture} name={user.name} size={44} />
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.meta}>
          <Badge
            label={user.subscription.plan}
            color={planColors[user.subscription.plan] ?? Colors.primary}
          />
          <Text style={styles.leadsCount}>{user.leadsCount ?? 0} leads</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleBlockToggle}
        style={[styles.blockBtn, { backgroundColor: user.blocked ? `${Colors.success}22` : `${Colors.danger}22` }]}
      >
        <Text style={[styles.blockText, { color: user.blocked ? Colors.success : Colors.danger }]}>
          {user.blocked ? 'Unblock' : 'Block'}
        </Text>
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
    gap: Spacing.sm,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.body,
    color: Colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  email: {
    ...Typography.captionXS,
    color: Colors.muted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  leadsCount: {
    ...Typography.captionXS,
    color: Colors.muted,
  },
  blockBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  blockText: {
    ...Typography.label,
  },
});
