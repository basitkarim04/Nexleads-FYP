import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../src/store';
import { changePassword } from '../../../src/store/slices/userSlice';
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper';
import { GlassInput } from '../../../src/components/ui/GlassInput';
import { PrimaryButton } from '../../../src/components/ui/PrimaryButton';
import { KeyboardAwareWrapper } from '../../../src/components/layout/KeyboardAwareWrapper';
import { ToastMessage } from '../../../src/components/ui/ToastMessage';
import { useToast } from '../../../src/hooks/useToast';
import { isValidPassword } from '../../../src/utils/validators';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing } from '../../../src/theme/spacing';

export default function PasswordScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((s: RootState) => s.user);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSave = async () => {
    if (!current.trim()) {
      showError('Current password is required');
      return;
    }
    const pwResult = isValidPassword(newPw);
    if (!pwResult.valid) {
      showError(pwResult.message ?? 'Invalid password');
      return;
    }
    if (newPw !== confirm) {
      showError('Passwords do not match');
      return;
    }
    const result = await dispatch(changePassword({ currentPassword: current, newPassword: newPw }));
    if (changePassword.fulfilled.match(result)) {
      showSuccess('Password changed successfully!');
      setCurrent('');
      setNewPw('');
      setConfirm('');
    } else {
      showError('Failed to change password');
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
      </View>

      <KeyboardAwareWrapper style={styles.form}>
        <GlassInput
          label="Current Password"
          placeholder="Your current password"
          value={current}
          onChangeText={setCurrent}
          icon="lock-closed-outline"
          secureToggle
        />
        <GlassInput
          label="New Password"
          placeholder="Min 8 characters"
          value={newPw}
          onChangeText={setNewPw}
          icon="lock-open-outline"
          secureToggle
        />
        <GlassInput
          label="Confirm New Password"
          placeholder="Repeat new password"
          value={confirm}
          onChangeText={setConfirm}
          icon="lock-open-outline"
          secureToggle
        />

        <PrimaryButton
          title="Update Password"
          onPress={handleSave}
          loading={loading}
          brutalism
          style={styles.saveBtn}
        />
      </KeyboardAwareWrapper>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  backBtn: { padding: 4 },
  title: { ...Typography.headlineM, color: Colors.text },
  form: { padding: Spacing.md },
  saveBtn: { marginTop: Spacing.sm },
});
