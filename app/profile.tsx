import { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, TextInput, Button, Avatar, ActivityIndicator, Surface, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { fetchProfile, updateProfile, uploadAvatar } from '@/lib/profile';
import type { Profile } from '@/types';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, signOut } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
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
    fetchTasks(user.id);
  }, [user]);

  const completedCount = tasks.filter((task) => task.status === 'done').length;

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
        <Stack.Screen options={{ title: t('tabs.profile') }} />
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('tabs.profile') }} />
      <View style={styles.avatarSection}>
        {profile.avatarUrl ? (
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Avatar.Text size={96} label={(profile.fullName || '?').charAt(0).toUpperCase()} />
        )}
        <IconButton
          icon="pencil"
          mode="contained"
          size={32}
          onPress={handlePickImage}
          loading={isUploading}
          disabled={isUploading}
          style={styles.editAvatarButton}
          accessibilityLabel={t('profile.changePhoto')}
          testID="pick-avatar"
        />
      </View>
      <Surface style={styles.card} elevation={1}>
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
      </Surface>
      <Surface style={styles.statCard} elevation={1}>
        <Text variant="headlineMedium">{completedCount}</Text>
        <Text variant="labelMedium" style={styles.statLabel}>
          {t('profile.tasksCompleted')}
        </Text>
      </Surface>
      <Link href="/settings" asChild>
        <Button mode="outlined" style={styles.settingsLink}>
          {t('settings.language')} / {t('settings.theme')}
        </Button>
      </Link>
      <Button
        mode="contained-tonal"
        onPress={() => signOut()}
        icon="logout"
        testID="profile-logout"
        style={styles.logout}
      >
        {t('profile.logout')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarSection: { alignItems: 'center' },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  editAvatarButton: { marginTop: -20 },
  card: { width: '100%', borderRadius: 16, padding: 16, gap: 8 },
  input: { width: '100%' },
  statCard: { width: '100%', borderRadius: 16, padding: 16, alignItems: 'center', gap: 4 },
  statLabel: { opacity: 0.7 },
  settingsLink: { width: '100%' },
  logout: { width: '100%', marginTop: 8 },
});
