import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../src/store';
import { signupThunk, clearError } from '../../src/store/slices/authSlice';
import { ToastMessage } from '../../src/components/ui/ToastMessage';
import { AuthBackground } from '../../src/components/layout/AuthBackground';
import { useToast } from '../../src/hooks/useToast';
import { validateSignupForm } from '../../src/utils/validators';
import { authStyles, PLACEHOLDER, ICON_IDLE, ICON_ACTIVE } from './authStyles';

export default function SignupScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((s: RootState) => s.auth);
  const { toast, showError, showSuccess, hideToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [securePw, setSecurePw] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSignup = async () => {
    const validationError = validateSignupForm(name, email, password);
    if (validationError) {
      showError(validationError);
      return;
    }
    if (password.trim() !== confirm.trim()) {
      showError('Passwords do not match');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(clearError());
    const result = await dispatch(signupThunk({ name: name.trim(), email: email.trim(), password, confirmPassword: confirm }));
    if (signupThunk.fulfilled.match(result)) {
      showSuccess('Account created! Check your email for the verification code.');
      setTimeout(
        () => router.push({ pathname: '/auth/verify-otp', params: { email: email.trim() } }),
        1500
      );
    } else {
      showError((result.payload as string) ?? 'Signup failed');
    }
  };

  return (
    <AuthBackground>
        <View style={authStyles.form}>
          <Text style={authStyles.title}>Create Account</Text>
          <Text style={authStyles.subtitle}>Start generating leads today</Text>

          {/* Full name */}
          <View style={styles.compactGroup}>
            <View
              style={[
                authStyles.inputLine,
                focusedField === 'name' && authStyles.inputLineFocused,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={focusedField === 'name' ? ICON_ACTIVE : ICON_IDLE}
              />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor={PLACEHOLDER}
                autoCapitalize="words"
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                style={authStyles.input}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.compactGroup}>
            <View
              style={[
                authStyles.inputLine,
                focusedField === 'email' && authStyles.inputLineFocused,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={focusedField === 'email' ? ICON_ACTIVE : ICON_IDLE}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor={PLACEHOLDER}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                style={authStyles.input}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.compactGroup}>
            <View
              style={[
                authStyles.inputLine,
                focusedField === 'password' && authStyles.inputLineFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={focusedField === 'password' ? ICON_ACTIVE : ICON_IDLE}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password (Min 8 characters)"
                placeholderTextColor={PLACEHOLDER}
                secureTextEntry={securePw}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={authStyles.input}
              />
              <TouchableOpacity onPress={() => setSecurePw((s) => !s)} hitSlop={8}>
                <Ionicons
                  name={securePw ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={ICON_IDLE}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm password */}
          <View style={styles.compactGroup}>
            <View
              style={[
                authStyles.inputLine,
                focusedField === 'confirm' && authStyles.inputLineFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={focusedField === 'confirm' ? ICON_ACTIVE : ICON_IDLE}
              />
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Confirm Password"
                placeholderTextColor={PLACEHOLDER}
                secureTextEntry={secureConfirm}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
                style={authStyles.input}
              />
              <TouchableOpacity onPress={() => setSecureConfirm((s) => !s)} hitSlop={8}>
                <Ionicons
                  name={secureConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={ICON_IDLE}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary button */}
          <TouchableOpacity
            style={[authStyles.primaryBtn, styles.btnSpacing]}
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#021024" size="small" />
            ) : (
              <Text style={authStyles.primaryBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Secondary link */}
          <View style={authStyles.linksRow}>
            <Text style={styles.loginPrompt}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={authStyles.linkText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </AuthBackground>
  );
}

// Signup has more fields than login, so tighten the per-field spacing
// to keep everything on one screen.
const styles = StyleSheet.create({
  compactGroup: {
    marginBottom: 12,
  },
  btnSpacing: {
    marginTop: 8,
  },
  loginPrompt: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#ffffff',
  },
});
