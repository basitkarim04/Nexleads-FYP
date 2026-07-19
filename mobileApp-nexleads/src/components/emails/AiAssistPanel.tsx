import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getAiAssist, clearAiContent } from '../../store/slices/emailSlice';
import { GlassInput } from '../ui/GlassInput';
import { PrimaryButton } from '../ui/PrimaryButton';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

const { height } = Dimensions.get('window');

interface AiAssistPanelProps {
  visible: boolean;
  onClose: () => void;
  onApply: (content: string) => void;
  existingContent?: string;
}

export function AiAssistPanel({ visible, onClose, onApply, existingContent }: AiAssistPanelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { aiLoading, aiContent } = useSelector((s: RootState) => s.emails);
  const [mode, setMode] = useState<'generate' | 'rewrite'>('generate');
  const [prompt, setPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: height, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleGenerate = async () => {
    setErrorMsg('');
    const res = await dispatch(
      getAiAssist({
        mode,
        prompt,
        existingContent: mode === 'rewrite' ? existingContent : undefined,
      })
    );
    // Surface failures (e.g. backend "AI generation failed") instead of
    // silently stopping the spinner with no output.
    if (getAiAssist.rejected.match(res)) {
      setErrorMsg((res.payload as string) || 'AI generation failed. Please try again.');
    } else if (!(res.payload as { body?: string })?.body) {
      setErrorMsg('No content was generated. Try rephrasing your prompt.');
    }
  };

  const handleApply = () => {
    onApply(aiContent);
    dispatch(clearAiContent());
    setPrompt('');
    setErrorMsg('');
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Ionicons name="sparkles" size={20} color={Colors.primary2} />
            <Text style={styles.title}>AI Assist</Text>
          </View>

          <View style={styles.modeRow}>
            {(['generate', 'rewrite'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMode(m)}
                style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
              >
                <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <GlassInput
            placeholder={
              mode === 'generate'
                ? 'Describe the email you want...'
                : 'What should be changed?'
            }
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={3}
            style={styles.promptInput}
          />

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {aiContent ? (
            <>
              <ScrollView style={styles.resultBox} nestedScrollEnabled>
                <Text style={styles.resultText}>{aiContent}</Text>
              </ScrollView>
              <PrimaryButton title="Apply to Email" onPress={handleApply} style={styles.applyBtn} />
            </>
          ) : (
            <PrimaryButton
              title={aiLoading ? 'Generating...' : 'Generate'}
              onPress={handleGenerate}
              loading={aiLoading}
              disabled={!prompt.trim()}
              icon="sparkles-outline"
              style={styles.genBtn}
            />
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.bg2,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    maxHeight: height * 0.75,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.active,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.headlineM,
    color: Colors.text,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: Colors.glassCard,
    borderRadius: Radius.pill,
    padding: 4,
    marginBottom: Spacing.md,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    borderRadius: Radius.pill,
  },
  modeBtnActive: {
    backgroundColor: Colors.primary,
  },
  modeBtnText: {
    ...Typography.button,
    color: Colors.muted,
  },
  modeBtnTextActive: {
    color: '#fff',
  },
  promptInput: {
    minHeight: 80,
  },
  resultBox: {
    backgroundColor: Colors.glassInput,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    maxHeight: 160,
  },
  resultText: {
    ...Typography.body,
    color: Colors.text,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: `${Colors.danger}18`,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Colors.danger}44`,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  errorText: {
    ...Typography.captionXS,
    color: Colors.danger,
    flex: 1,
  },
  genBtn: {
    marginTop: Spacing.sm,
  },
  applyBtn: {
    marginTop: Spacing.sm,
  },
});
