import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessageProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onHide: () => void;
}

const iconMap: Record<ToastType, string> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'warning',
  info: 'information-circle',
};

const colorMap: Record<ToastType, string> = {
  success: Colors.success,
  error: Colors.danger,
  warning: Colors.warning,
  info: Colors.primary,
};

export function ToastMessage({
  message,
  type = 'info',
  visible,
  onHide,
}: ToastMessageProps) {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(onHide);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, translateY, onHide]);

  if (!visible) return null;

  const color = colorMap[type];

  return (
    <Animated.View
      style={[styles.container, { borderLeftColor: color, transform: [{ translateY }] }]}
    >
      <Ionicons name={iconMap[type] as any} size={20} color={color} style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.glassCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  message: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
});
