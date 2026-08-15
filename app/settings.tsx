import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, SegmentedButtons, TextInput, Button, Surface } from 'react-native-paper';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { updateProfile } from '@/lib/profile';
import type { Language, ThemeMode } from '@/types';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { language, theme, currency, setLanguage, setTheme, setCurrency } = useSettingsStore();
  const [currencyInput, setCurrencyInput] = useState(currency);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setCurrencyInput(currency);
  }, [currency]);

  const handleLanguageChange = async (value: string) => {
    const next = value as Language;
    await setLanguage(next);
    i18n.changeLanguage(next);
    if (user) await updateProfile(user.id, { language: next });
  };

  const handleThemeChange = async (value: string) => {
    const next = value as ThemeMode;
    await setTheme(next);
    if (user) await updateProfile(user.id, { theme: next });
  };

  const handleCurrencySave = async () => {
    const next = currencyInput.trim().toUpperCase();
    await setCurrency(next);
    if (user) await updateProfile(user.id, { currency: next });
    setStatusMessage(t('profile.saved'));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('settings.title') }} />
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleMedium">{t('settings.language')}</Text>
        <SegmentedButtons
          value={language}
          onValueChange={handleLanguageChange}
          buttons={[
            { value: 'pt-BR', label: 'Português' },
            { value: 'en', label: 'English' },
          ]}
          style={styles.field}
        />
        <Text variant="titleMedium">{t('settings.theme')}</Text>
        <SegmentedButtons
          value={theme}
          onValueChange={handleThemeChange}
          buttons={[
            { value: 'light', label: t('settings.themeLight') },
            { value: 'dark', label: t('settings.themeDark') },
            { value: 'auto', label: t('settings.themeAuto') },
          ]}
          style={styles.field}
        />
        <Text variant="titleMedium">{t('settings.currency')}</Text>
        <TextInput
          value={currencyInput}
          onChangeText={setCurrencyInput}
          autoCapitalize="characters"
          maxLength={3}
          style={styles.field}
          testID="settings-currency"
        />
        <Button mode="contained" onPress={handleCurrencySave} testID="settings-save-currency">
          {t('common.save')}
        </Button>
        {statusMessage ? <Text testID="settings-status">{statusMessage}</Text> : null}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  section: { borderRadius: 16, padding: 16, gap: 8 },
  field: { marginBottom: 8 },
});
