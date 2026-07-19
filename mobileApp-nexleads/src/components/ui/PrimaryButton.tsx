import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  variant?: 'solid' | 'outline' | 'ghost';
  brutalism?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'solid',
  brutalism = false,
  style,
}: PrimaryButtonProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        styles.base,
        variant === 'solid' && styles.solid,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        brutalism && styles.brutalism,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'solid' ? '#fff' : Colors.primary} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && (
            <Ionicons
              name={icon as any}
              size={18}
              color={variant === 'solid' ? '#fff' : Colors.primary}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.label,
              variant === 'solid' && styles.labelSolid,
              variant === 'outline' && styles.labelOutline,
              variant === 'ghost' && styles.labelGhost,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  solid: {
    backgroundColor: Colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  brutalism: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  label: {
    ...Typography.button,
  },
  labelSolid: {
    color: '#fff',
  },
  labelOutline: {
    color: Colors.primary,
  },
  labelGhost: {
    color: Colors.primary,
  },
});
