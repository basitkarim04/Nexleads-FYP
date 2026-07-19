import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../src/store';
import { loginThunk, clearError } from '../../src/store/slices/authSlice';
import { ToastMessage } from '../../src/components/ui/ToastMessage';
import { AuthBackground } from '../../src/components/layout/AuthBackground';
import { useToast } from '../../src/hooks/useToast';
import { validateLoginForm } from '../../src/utils/validators';
import { authStyles, PLACEHOLDER, ICON_IDLE, ICON_ACTIVE } from './authStyles';

export default function LoginScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((s: RootState) => s.auth);
  const { toast, showError, hideToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [remember, setRemember] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    const validationError = validateLoginForm(email, password);
    if (validationError) {
      showError(validationError);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(clearError());
    const result = await dispatch(loginThunk({ email: email.trim(), password }));
    if (loginThunk.fulfilled.match(result)) {
      const user = result.payload.user;
      router.replace(user.type === 'Admin' ? '/admin' : '/(app)/dashboard');
    } else {
      showError((result.payload as string) ?? 'Login failed');
    }
  };

  return (
    <AuthBackground>
        <View style={authStyles.form}>
          <Text style={authStyles.title}>Welcome back</Text>
          <Text style={authStyles.subtitle}>Sign in to your NexLeads account</Text>

          {/* Email */}
          <View style={authStyles.fieldGroup}>
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
                placeholder="you@example.com"
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
          <View style={authStyles.fieldGroup}>
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
                placeholder="Your password"
                placeholderTextColor={PLACEHOLDER}
                secureTextEntry={secure}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={authStyles.input}
              />
              <TouchableOpacity onPress={() => setSecure((s) => !s)} hitSlop={8}>
                <Ionicons
                  name={secure ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={ICON_IDLE}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember me */}
          <View style={authStyles.row}>
            <TouchableOpacity
              style={authStyles.checkboxRow}
              onPress={() => setRemember((r) => !r)}
              activeOpacity={0.7}
            >
              <View style={[authStyles.checkbox, remember && authStyles.checkboxChecked]}>
                {remember && <Ionicons name="checkmark" size={13} color="#021024" />}
              </View>
              <Text style={authStyles.rememberText}>Remember me</Text>
            </TouchableOpacity>
          </View>

          {/* Primary button */}
          <TouchableOpacity
            style={authStyles.primaryBtn}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#021024" size="small" />
            ) : (
              <Text style={authStyles.primaryBtnText}>Log In</Text>
            )}
        </TouchableOpacity>

          {/* Secondary links */}
          <View style={authStyles.linksRow}>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text style={authStyles.linkText}>Sign up</Text>
            </TouchableOpacity>
            <Text style={authStyles.linkDivider}>|</Text>
            <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
              <Text style={authStyles.linkText}>Lost your Password?</Text>
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
