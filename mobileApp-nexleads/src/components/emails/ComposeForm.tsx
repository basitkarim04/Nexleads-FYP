import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { composeEmail, saveDraft } from '../../store/slices/emailSlice';
import { GlassInput } from '../ui/GlassInput';
import { PrimaryButton } from '../ui/PrimaryButton';
import { AiAssistPanel } from './AiAssistPanel';
import { useToast } from '../../hooks/useToast';
import { ToastMessage } from '../ui/ToastMessage';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface ComposeFormProps {
  defaultTo?: string;
  defaultSubject?: string;
  leadId?: string;
  // Bulk mode: when provided, the email is sent to every lead in this list
  // (via the backend's leadIds field) and the single "To" field is hidden.
  leadIds?: string[];
  onSent?: () => void;
}

export function ComposeForm({
  defaultTo = '',
  defaultSubject = '',
  leadId,
  leadIds,
  onSent,
}: ComposeFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { sending } = useSelector((s: RootState) => s.emails);
  const { toast, showSuccess, hideToast } = useToast();

  const isBulk = Array.isArray(leadIds) && leadIds.length > 0;

  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [showAi, setShowAi] = useState(false);

  const handlePickDoc = async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: true });
    if (!result.canceled) {
      const names = result.assets.map((a) => a.name);
      setAttachments((prev) => [...prev, ...names]);
    }
  };

  const handleSend = async () => {
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('body', body);
    if (leadId) {
      formData.append('leadIds', JSON.stringify([leadId]));
    } else if (isBulk) {
      formData.append('leadIds', JSON.stringify(leadIds));
    } else {
      formData.append('to', to);
    }
    const result = await dispatch(composeEmail(formData));
    if (composeEmail.fulfilled.match(result)) {
      onSent?.();
    }
  };

  const handleDraft = async () => {
    const result = await dispatch(saveDraft({ to, subject, body, leadId }));
    if (saveDraft.fulfilled.match(result)) {
      showSuccess('Draft saved');
      setTimeout(() => onSent?.(), 800);
    }
  };

  return (
    <View style={styles.container}>
      {isBulk ? (
        <View style={styles.bulkBanner}>
          <Ionicons name="people-outline" size={18} color={Colors.primary} />
          <Text style={styles.bulkBannerText}>
            Sending to {leadIds!.length} selected lead{leadIds!.length === 1 ? '' : 's'}
          </Text>
        </View>
      ) : (
        <GlassInput
          label="To"
          placeholder="recipient@email.com"
          value={to}
          onChangeText={setTo}
          icon="person-outline"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      )}
      <GlassInput
        label="Subject"
        placeholder="Email subject..."
        value={subject}
        onChangeText={setSubject}
        icon="text-outline"
      />

      <Text style={styles.bodyLabel}>Message</Text>
      <View style={styles.bodyWrap}>
        <TextInput
          style={styles.bodyInput}
          placeholder="Write your message..."
          placeholderTextColor={Colors.muted}
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
        />
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={handlePickDoc} style={styles.toolbarBtn}>
            <Ionicons name="attach" size={18} color={Colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAi(true)} style={styles.toolbarBtn}>
            <Ionicons name="sparkles" size={18} color={Colors.primary2} />
          </TouchableOpacity>
        </View>
      </View>

      {attachments.length > 0 && (
        <View style={styles.attachments}>
          {attachments.map((name, i) => (
            <View key={i} style={styles.attachChip}>
              <Ionicons name="document-outline" size={13} color={Colors.muted} />
              <Text style={styles.attachText}>{name}</Text>
              <TouchableOpacity onPress={() => setAttachments((a) => a.filter((_, j) => j !== i))}>
                <Ionicons name="close" size={13} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        {/* Drafts target a single recipient; hide for bulk sends. */}
        {!isBulk && (
          <TouchableOpacity onPress={handleDraft} style={styles.draftBtn}>
            <Text style={styles.draftText}>Save Draft</Text>
          </TouchableOpacity>
        )}
        <PrimaryButton
          title={isBulk ? 'Send to all Selected' : 'Send'}
          onPress={handleSend}
          loading={sending}
          disabled={(!isBulk && !to) || !subject || !body}
          icon="send"
          brutalism
        />
      </View>

      <AiAssistPanel
        visible={showAi}
        onClose={() => setShowAi(false)}
        onApply={(content) => setBody(content)}
        existingContent={body}
      />

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
  },
  bulkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.primary}18`,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Colors.primary}44`,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  bulkBannerText: {
    ...Typography.body,
    color: Colors.primary,
    fontFamily: 'Poppins_600SemiBold',
  },
  bodyLabel: {
    ...Typography.label,
    color: Colors.muted,
    marginBottom: Spacing.xs,
    marginLeft: 2,
  },
  bodyWrap: {
    backgroundColor: Colors.glassInput,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassInputBorder,
    marginBottom: Spacing.md,
    minHeight: 200,
  },
  bodyInput: {
    ...Typography.body,
    color: Colors.text,
    padding: Spacing.md,
    minHeight: 160,
  },
  toolbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  toolbarBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.glassCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  attachments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  attachChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.glassCard,
    borderRadius: Radius.pill,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  attachText: {
    ...Typography.captionXS,
    color: Colors.muted,
    maxWidth: 120,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.md,
  },
  draftBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  draftText: {
    ...Typography.button,
    color: Colors.muted,
  },
});
