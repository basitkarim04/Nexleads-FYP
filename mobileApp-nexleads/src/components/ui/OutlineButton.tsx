import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface OutlineButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

export function OutlineButton({
  title,
  onPress,
  color = Colors.primary,
  style,
  disabled = false,
}: OutlineButtonProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.82}
      style={[styles.button, { borderColor: color }, disabled && styles.disabled, style]}
    >
      <Text style={[styles.label, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...Typography.button,
  },
});
