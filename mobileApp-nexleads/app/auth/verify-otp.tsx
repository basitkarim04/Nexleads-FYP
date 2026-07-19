import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../src/store';
import { verifyOtpThunk } from '../../src/store/slices/authSlice';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { ToastMessage } from '../../src/components/ui/ToastMessage';
import { useToast } from '../../src/hooks/useToast';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Radius, Spacing } from '../../src/theme/spacing';

const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((s: RootState) => s.auth);
  const { email } = useLocalSearchParams<{ email: string }>();
  const { toast, showError, hideToast } = useToast();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  const translateY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (text: string, index: number) => {
    const char = text.slice(-1);
    const next = [...otp];
    next[index] = char;
    setOtp(next);
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      showError('Please enter all 6 digits');
      return;
    }
    const result = await dispatch(verifyOtpThunk({ email: email ?? '', otp: code }));
    if (verifyOtpThunk.fulfilled.match(result)) {
      router.replace('/(app)/dashboard');
    } else {
      showError((result.payload as string) ?? 'Invalid OTP');
    }
  };

  const handleResend = () => {
    setCountdown(60);
    setOtp(Array(OTP_LENGTH).fill(''));
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, { transform: [{ translateY }], opacity }]}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoNex}>Nex</Text>
          <Text style={styles.logoLeads}>Leads</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <View style={styles.otpRow}>
            {Array(OTP_LENGTH)
              .fill(null)
              .map((_, i) => (
                <TextInput
                  key={i}
                  ref={(r) => {
                    inputRefs.current[i] = r;
                  }}
                  style={[styles.otpBox, otp[i] ? styles.otpBoxFilled : null]}
                  value={otp[i]}
                  onChangeText={(t) => handleChange(t, i)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                  maxLength={1}
                  keyboardType="numeric"
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
          </View>

          <PrimaryButton
            title="Verify Code"
            onPress={handleVerify}
            loading={isLoading}
            brutalism
            disabled={otp.join('').length < OTP_LENGTH}
          />

          <View style={styles.resendRow}>
            {countdown > 0 ? (
              <Text style={styles.countdownText}>Resend in {countdown}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backText}>← Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

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
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  inner: {
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
    alignItems: 'center',
  },
  title: { ...Typography.headlineL, color: Colors.text, marginBottom: Spacing.sm },
  subtitle: {
    ...Typography.body,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  emailText: { color: Colors.primary, fontFamily: 'Poppins_600SemiBold' },
  otpRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  otpBox: {
    width: 48,
    height: 56,
    backgroundColor: Colors.glassInput,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    borderRadius: Radius.md,
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: Colors.text,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}15`,
  },
  resendRow: { marginTop: Spacing.md, alignItems: 'center' },
  countdownText: { ...Typography.body, color: Colors.muted },
  resendText: { ...Typography.body, color: Colors.primary, fontFamily: 'Poppins_600SemiBold' },
  backLink: { marginTop: Spacing.md },
  backText: { ...Typography.body, color: Colors.muted },
});
