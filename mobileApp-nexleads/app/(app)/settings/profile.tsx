import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../src/store';
import { fetchProfile, updatePersonalInfo, uploadProfilePicture } from '../../../src/store/slices/userSlice';
import { updateUser } from '../../../src/store/slices/authSlice';
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper';
import { GlassInput } from '../../../src/components/ui/GlassInput';
import { PrimaryButton } from '../../../src/components/ui/PrimaryButton';
import { Avatar } from '../../../src/components/ui/Avatar';
import { ToastMessage } from '../../../src/components/ui/ToastMessage';
import { useToast } from '../../../src/hooks/useToast';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing } from '../../../src/theme/spacing';

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.auth.user);
  const profile = useSelector((s: RootState) => s.user.profile);
  const { loading } = useSelector((s: RootState) => s.user);
  const { toast, showSuccess, showError, hideToast } = useToast();

  // Prefer the freshly-fetched profile (which carries the latest profilePicture
  // and bio); fall back to the stored auth user until that loads. The stored
  // auth user can be stale and miss a recently-uploaded profile picture.
  const user = profile ?? authUser;
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [uploading, setUploading] = useState(false);

  // Pull the full, current profile on mount so the avatar + fields reflect the
  // latest server state rather than whatever was cached at login.
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Once the profile arrives, sync the editable fields if the user hasn't typed.
  useEffect(() => {
    if (profile) {
      setName((prev) => (prev ? prev : profile.name ?? ''));
      setBio((prev) => (prev ? prev : profile.bio ?? ''));
    }
  }, [profile]);

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showError('Permission to access gallery is required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: asset.uri,
        type: asset.mimeType ?? 'image/jpeg',
        name: asset.fileName ?? 'profile.jpg',
      } as any);
      const res = await dispatch(uploadProfilePicture(formData));
      setUploading(false);
      if (uploadProfilePicture.fulfilled.match(res)) {
        dispatch(updateUser(res.payload));
        showSuccess('Profile picture updated!');
      } else {
        showError('Failed to upload image');
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showError('Name is required');
      return;
    }
    const result = await dispatch(updatePersonalInfo({ name: name.trim(), bio: bio.trim() || undefined }));
    if (updatePersonalInfo.fulfilled.match(result)) {
      dispatch(updateUser(result.payload));
      showSuccess('Profile updated!');
    } else {
      showError('Failed to update profile');
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <Avatar uri={user?.profilePicture} name={user?.name} size={96} />
          <TouchableOpacity onPress={handlePickImage} style={styles.editAvatarBtn} disabled={uploading}>
            <Ionicons name={uploading ? 'hourglass-outline' : 'camera-outline'} size={16} color="#fff" />
            <Text style={styles.editAvatarText}>{uploading ? 'Uploading...' : 'Change Photo'}</Text>
          </TouchableOpacity>
        </View>

        <GlassInput
          label="Full Name"
          placeholder="Your full name"
          value={name}
          onChangeText={setName}
          icon="person-outline"
          autoCapitalize="words"
        />
        <GlassInput
          label="Bio"
          placeholder="Tell us about yourself..."
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
        />

        <View style={styles.readonlyField}>
          <Text style={styles.readonlyLabel}>Email</Text>
          <Text style={styles.readonlyValue}>{user?.email}</Text>
        </View>

        <View style={styles.readonlyField}>
          <Text style={styles.readonlyLabel}>NexLeads Email</Text>
          <Text style={styles.readonlyValue}>{user?.nexleadsEmail}</Text>
        </View>

        <PrimaryButton
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          brutalism
          style={styles.saveBtn}
        />
      </ScrollView>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  backBtn: { padding: 4 },
  title: { ...Typography.headlineM, color: Colors.text },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
  editAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    marginTop: Spacing.sm,
  },
  editAvatarText: { ...Typography.label, color: '#fff' },
  readonlyField: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.glassInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.md,
    opacity: 0.7,
  },
  readonlyLabel: { ...Typography.captionXS, color: Colors.muted, marginBottom: 2 },
  readonlyValue: { ...Typography.body, color: Colors.text },
  saveBtn: { marginTop: Spacing.sm },
});
