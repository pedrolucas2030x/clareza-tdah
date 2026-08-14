import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { language, setLanguage, theme, setTheme } = useSettingsStore();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greetingMorning');
    if (hour < 18) return t('home.greetingAfternoon');
    return t('home.greetingEvening');
  })();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">{greeting} 👋</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        {t('common.appName')}
      </Text>
      <Text variant="bodyMedium" style={styles.info}>
        Idioma atual: {language} | Tema: {theme}
      </Text>
      <Button
        mode="contained"
        onPress={() => setLanguage(language === 'pt-BR' ? 'en' : 'pt-BR')}
        style={styles.button}
      >
        Trocar idioma
      </Button>
      <Button
        mode="outlined"
        onPress={() =>
          setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light')
        }
        style={styles.button}
      >
        Trocar tema
      </Button>
      <Link href="/profile" asChild>
        <Button mode="outlined" style={styles.button} testID="go-to-profile">
          {t('tabs.profile')}
        </Button>
      </Link>
      <Link href="/tasks" asChild>
        <Button mode="contained" style={styles.button} testID="go-to-tasks">
          {t('tabs.tasks')}
        </Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  subtitle: {
    marginBottom: 8,
  },
  info: {
    opacity: 0.6,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
