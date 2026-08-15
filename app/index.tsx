import { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, IconButton } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTaskStore } from '@/stores/useTaskStore';

export default function HomeScreen() {
  const { t } = useTranslation();
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
              size={32}
              onPress={() => router.push('/profile')}
              accessibilityLabel={t('tabs.profile')}
              testID="go-to-profile"
            />
          ),
          headerRight: () => (
            <IconButton
              icon="cog-outline"
              iconColor="#fff"
              size={32}
              onPress={() => router.push('/settings')}
              accessibilityLabel={t('settings.title')}
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
  cardHeaderButton: { justifyContent: 'flex-start' },
  emptyText: { opacity: 0.6 },
  taskRow: { paddingVertical: 4 },
});
