import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../theme/colors';

interface KeyboardAwareWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function KeyboardAwareWrapper({ children, style }: KeyboardAwareWrapperProps) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={[styles.content, style]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    flexGrow: 1,
  },
});
