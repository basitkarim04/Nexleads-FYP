import React from 'react';
import { View, StatusBar, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function ScreenWrapper({ children, style, edges = ['top', 'left', 'right'] }: ScreenWrapperProps) {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  inner: {
    flex: 1,
  },
});
