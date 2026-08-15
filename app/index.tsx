import { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, IconButton } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTaskStore } from '@/stores/useTaskStore';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { language, setLanguage, theme, setTheme } = useSettingsStore();
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();

  useEffect(() => {
    if (user) fetchTasks(user.id);
  }, [user, fetchTasks]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greetingMorning');
    if (hour < 18) return t('home.greetingAfternoon');
    return t('home.greetingEvening');
  })();

  const nextTasks = tasks
    .filter((task) => task.status === 'pending')
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return b.priority - a.priority;
    })
    .slice(0, 3);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: t('common.appName'),
          headerLeft: () => (
            <IconButton
              icon="account-circle"
              iconColor="#fff"
              onPress={() => router.push('/profile')}
              testID="go-to-profile"
            />
          ),
          headerRight: () => (
            <IconButton
              icon="cog-outline"
              iconColor="#fff"
              onPress={() => router.push('/settings')}
              testID="go-to-settings"
            />
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.greeting}>
          <Text variant="headlineMedium" style={styles.greetingText}>
            {greeting} 👋
          </Text>
        </View>
        <Surface style={styles.card} elevation={1}>
          <Text variant="bodyMedium">
            {t('settings.language')}: {language}
          </Text>
          <Text variant="bodyMedium">
            {t('settings.theme')}: {theme}
          </Text>
          <View style={styles.row}>
            <Button mode="contained" onPress={() => setLanguage(language === 'pt-BR' ? 'en' : 'pt-BR')}>
              {t('settings.language')}
            </Button>
            <Button
              mode="outlined"
              onPress={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light')}
            >
              {t('settings.theme')}
            </Button>
          </View>
        </Surface>
        <Surface style={styles.card} elevation={1}>
          <Button
            mode="text"
            icon="check-circle-outline"
            onPress={() => router.push('/tasks')}
            contentStyle={styles.cardHeaderButton}
            testID="go-to-tasks"
          >
            {t('home.nextTasks')}
          </Button>
          {nextTasks.length === 0 ? (
            <Text variant="bodyMedium" style={styles.emptyText}>
              {t('home.nextTasksEmpty')}
            </Text>
          ) : (
            nextTasks.map((task) => (
              <Text key={task.id} variant="bodyMedium" style={styles.taskRow}>
                {task.title}
              </Text>
            ))
          )}
        </Surface>
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium">{t('home.currentRoutine')}</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {t('home.routineComingSoon')}
          </Text>
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 24, gap: 16 },
  greeting: { alignItems: 'center', marginBottom: 8 },
  greetingText: { textAlign: 'center' },
  card: { borderRadius: 16, padding: 16, gap: 8 },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cardHeaderButton: { justifyContent: 'flex-start' },
  emptyText: { opacity: 0.6 },
  taskRow: { paddingVertical: 4 },
});
