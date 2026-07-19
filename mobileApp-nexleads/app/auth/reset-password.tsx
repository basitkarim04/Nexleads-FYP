import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../src/store';
import { resetPasswordThunk } from '../../src/store/slices/authSlice';
import { GlassInput } from '../../src/components/ui/GlassInput';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { ToastMessage } from '../../src/components/ui/ToastMessage';
import { useToast } from '../../src/hooks/useToast';
import { isValidPassword } from '../../src/utils/validators';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Radius, Spacing } from '../../src/theme/spacing';

export default function ResetPasswordScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((s: RootState) => s.auth);
  const { token } = useLocalSearchParams<{ token: string }>();
  const { toast, showError, showSuccess, hideToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    const pwResult = isValidPassword(password);
    if (!pwResult.valid) {
      showError(pwResult.message ?? 'Invalid password');
      return;
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    const result = await dispatch(
      resetPasswordThunk({ token: token ?? '', password, confirmPassword })
    );
    if (resetPasswordThunk.fulfilled.match(result)) {
      setDone(true);
      showSuccess('Password reset successfully!');
    } else {
      showError(result.payload as string ?? 'Failed to reset password');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoNex}>Nex</Text>
          <Text style={styles.logoLeads}>Leads</Text>
        </View>

        <View style={styles.card}>
          {done ? (
            <View style={styles.successState}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={40} color={Colors.success} />
              </View>
              <Text style={styles.successTitle}>Password Reset!</Text>
              <Text style={styles.successSubtitle}>
                Your password has been updated. Sign in with your new password.
              </Text>
              <PrimaryButton
                title="Sign In"
                onPress={() => router.replace('/auth/login')}
                brutalism
                style={styles.signInBtn}
              />
            </View>
          ) : (
            <>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Enter your new password below.</Text>

              <GlassInput
                label="New Password"
                placeholder="Min 8 characters"
                value={password}
                onChangeText={setPassword}
                icon="lock-closed-outline"
                secureToggle
              />
              <GlassInput
                label="Confirm Password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                icon="lock-closed-outline"
                secureToggle
              />

              <PrimaryButton
                title="Reset Password"
                onPress={handleReset}
                loading={isLoading}
                brutalism
                style={styles.resetBtn}
              />
            </>
          )}
        </View>
      </View>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  backBtn: { padding: Spacing.lg, paddingBottom: 0 },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    alignItems: 'center',
  },
  logoWrap: { flexDirection: 'row', marginBottom: Spacing.xl },
  logoNex: { fontFamily: 'Poppins_900Black', fontSize: 32, color: Colors.primary },
  logoLeads: { fontFamily: 'Poppins_900Black', fontSize: 32, color: Colors.text },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  title: { ...Typography.headlineL, color: Colors.text, marginBottom: Spacing.sm },
  subtitle: { ...Typography.body, color: Colors.muted, marginBottom: Spacing.lg },
  resetBtn: { marginTop: Spacing.sm },
  successState: { alignItems: 'center', paddingVertical: Spacing.md },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.success}22`,
    borderWidth: 2,
    borderColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: { ...Typography.headlineL, color: Colors.text, marginBottom: Spacing.sm },
  successSubtitle: {
    ...Typography.body,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  signInBtn: { width: '100%' },
});
