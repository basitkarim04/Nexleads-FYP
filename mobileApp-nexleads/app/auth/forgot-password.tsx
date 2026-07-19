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
import { forgotPasswordThunk } from '../../src/store/slices/authSlice';
import { ToastMessage } from '../../src/components/ui/ToastMessage';
import { AuthBackground } from '../../src/components/layout/AuthBackground';
import { useToast } from '../../src/hooks/useToast';
import { isValidEmail } from '../../src/utils/validators';
import { authStyles, PLACEHOLDER, ICON_IDLE, ICON_ACTIVE } from './authStyles';
import { Colors } from '@/theme/colors';

export default function ForgotPasswordScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((s: RootState) => s.auth);
  const { toast, showError, showSuccess, hideToast } = useToast();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSend = async () => {
    if (!isValidEmail(email)) {
      showError('Enter a valid email address');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await dispatch(forgotPasswordThunk({ email: email.trim() }));
    if (forgotPasswordThunk.fulfilled.match(result)) {
      setSent(true);
      showSuccess('Reset link sent! Check your email.');
    } else {
      showError((result.payload as string) ?? 'Failed to send reset link');
    }
  };

  return (
    <AuthBackground>
      <View style={authStyles.form}>
        {sent ? (
          <View style={styles.successState}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={38} color="#021024" />
            </View>
            <Text style={authStyles.title}>Email Sent!</Text>
            <Text style={[authStyles.subtitle, styles.successSubtitle]}>
              Check your inbox for the password reset link.
            </Text>

            <TouchableOpacity
              style={[authStyles.primaryBtn, styles.fullWidth]}
              onPress={() => router.replace('/auth/login')}
              activeOpacity={0.85}
            >
              <Text style={authStyles.primaryBtnText}>Back to Log In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={authStyles.title}>Forgot password</Text>
            <Text style={authStyles.subtitle}>
              Enter your email and we'll send you a reset link.
            </Text>

            {/* Email */}
            <View style={authStyles.fieldGroup}>
              <View
                style={[authStyles.inputLine, focused && authStyles.inputLineFocused]}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={focused ? ICON_ACTIVE : ICON_IDLE}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={PLACEHOLDER}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  style={authStyles.input}
                />
              </View>
            </View>

            {/* Primary button */}
            <TouchableOpacity
              style={[authStyles.primaryBtn, styles.sendBtn]}
              onPress={handleSend}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#021024" size="small" />
              ) : (
                <Text style={authStyles.primaryBtnText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            {/* Secondary link */}
            <View style={authStyles.linksRow}>
              <TouchableOpacity onPress={() => router.back()} style={authStyles.linksRow}>
                <Ionicons name="arrow-back" size={22} color={Colors.bg} />
                <Text style={authStyles.linkText}>
                  Back to Log In</Text>
              </TouchableOpacity>

            </View>
          </>
        )}
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

const styles = StyleSheet.create({
  sendBtn: {
    marginTop: 8,
  },
  successState: {
    alignItems: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7cc7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#7cc7ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  successSubtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
});
