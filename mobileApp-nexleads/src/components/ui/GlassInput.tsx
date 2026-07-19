import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface GlassInputProps extends TextInputProps {
  label?: string;
  icon?: string;
  error?: string;
  secureToggle?: boolean;
}

export function GlassInput({
  label,
  icon,
  error,
  secureToggle,
  style,
  ...props
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(props.secureTextEntry ?? false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.container,
          focused && styles.focused,
          !!error && styles.errorBorder,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon as any}
            size={18}
            color={focused ? Colors.primary : Colors.muted}
            style={styles.icon}
          />
        )}
        <TextInput
          {...props}
          secureTextEntry={secureToggle ? secure : props.secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={Colors.muted}
          style={[styles.input, style]}
        />
        {secureToggle && (
          <TouchableOpacity onPress={() => setSecure((s) => !s)} style={styles.toggle}>
            <Ionicons
              name={secure ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.muted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.label,
    color: Colors.muted,
    marginBottom: Spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassInput,
    borderWidth: 1,
    borderColor: Colors.glassInputBorder,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 50,
  },
  focused: {
    borderColor: Colors.primary,
  },
  errorBorder: {
    borderColor: Colors.danger,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  toggle: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  error: {
    ...Typography.captionXS,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
});
