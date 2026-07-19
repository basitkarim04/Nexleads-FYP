import React, { useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LeadInterest } from '../../types/lead.types';
import { Colors } from '../../theme/colors';
import { Radius } from '../../theme/spacing';

interface LeadInterestToggleProps {
  interest?: LeadInterest;
  onToggle: (interest: LeadInterest) => void;
}

export function LeadInterestToggle({ interest, onToggle }: LeadInterestToggleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = async (value: LeadInterest) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.25, useNativeDriver: true, speed: 40 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }),
    ]).start();
    onToggle(value);
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={() => handlePress('interested')}
        style={[
          styles.btn,
          interest === 'interested' && {
            backgroundColor: `${Colors.success}22`,
            borderColor: Colors.success,
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons
            name="thumbs-up"
            size={16}
            color={interest === 'interested' ? Colors.success : Colors.muted}
          />
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handlePress('not_interested')}
        style={[
          styles.btn,
          interest === 'not_interested' && {
            backgroundColor: `${Colors.danger}22`,
            borderColor: Colors.danger,
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons
            name="thumbs-down"
            size={16}
            color={interest === 'not_interested' ? Colors.danger : Colors.muted}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.glassCard,
  },
});
