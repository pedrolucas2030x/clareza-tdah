import { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, TextInput, Button, Avatar, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { fetchProfile, updateProfile, uploadAvatar } from '@/lib/profile';
import type { Profile } from '@/types';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, signOut } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then((p) => {
      setProfile(p);
      setFullName(p.fullName);
    });
  }, [user]);

  const handlePickImage = async () => {
    if (!user) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setStatusMessage(t('profile.permissionDenied'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled) return;

    setIsUploading(true);
    try {
      const avatarUrl = await uploadAvatar(user.id, result.assets[0].uri);
      const updated = await updateProfile(user.id, { avatarUrl });
      setProfile(updated);
    } catch {
      setStatusMessage(t('profile.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setStatusMessage('');
    try {
      const updated = await updateProfile(user.id, { fullName: fullName.trim() });
      setProfile(updated);
      setStatusMessage(t('profile.saved'));
    } catch {
      setStatusMessage(t('profile.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profile.avatarUrl ? (
        <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
      ) : (
        <Avatar.Text size={96} label={(profile.fullName || '?').charAt(0).toUpperCase()} />
      )}
      <Button onPress={handlePickImage} loading={isUploading} disabled={isUploading} testID="pick-avatar">
        {t('profile.changePhoto')}
      </Button>
      <TextInput
        label={t('auth.fullName')}
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        testID="profile-name"
      />
      {statusMessage ? <Text testID="profile-status">{statusMessage}</Text> : null}
      <Button mode="contained" onPress={handleSave} loading={isSaving} disabled={isSaving} testID="profile-save">
        {t('common.save')}
      </Button>
      <Link href="/settings" asChild>
        <Button mode="outlined">{t('settings.language')} / {t('settings.theme')}</Button>
      </Link>
      <Button mode="outlined" onPress={() => signOut()} testID="profile-logout" style={styles.logout}>
        {t('profile.logout')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  input: { width: '100%' },
  logout: { marginTop: 24 },
});
