import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Pressable } from 'react-native';
import { Text, Chip, IconButton, FAB, ActivityIndicator, Surface, HelperText } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTaskStore } from '@/stores/useTaskStore';
import type { Task, TaskStatus } from '@/types';

export default function TasksScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { tasks, isLoading, error, fetchTasks, completeTask, archiveTask } = useTaskStore();
  const [filter, setFilter] = useState<TaskStatus>('pending');

  useEffect(() => {
    if (user) fetchTasks(user.id);
  }, [user, fetchTasks]);

  const filteredTasks = tasks.filter((task) => task.status === filter);

  const priorityLabel = (priority: Task['priority']) =>
    priority === 3
      ? t('tasks.priorityHigh')
      : priority === 1
        ? t('tasks.priorityLow')
        : t('tasks.priorityMedium');

  const filters: { value: TaskStatus; label: string }[] = [
    { value: 'pending', label: t('tasks.filterPending') },
    { value: 'done', label: t('tasks.filterDone') },
    { value: 'archived', label: t('tasks.filterArchived') },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('tabs.tasks') }} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filters.map((item) => (
          <Chip
            key={item.value}
            selected={filter === item.value}
            onPress={() => setFilter(item.value)}
            style={styles.chip}
            testID={`filter-${item.value}`}
          >
            {item.label}
          </Chip>
        ))}
      </ScrollView>
      {error ? (
        <HelperText type="error" visible testID="tasks-error">
          {t('tasks.loadFailed')}
        </HelperText>
      ) : null}
      {isLoading ? (
        <ActivityIndicator style={styles.loading} />
      ) : filteredTasks.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge">{t('tasks.empty')}</Text>
          <Text variant="bodyMedium" style={styles.emptyHint}>
            {t('tasks.emptyHint')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(task) => task.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Surface style={styles.taskCard} elevation={1} testID={`task-row-${item.id}`}>
              {item.status === 'pending' ? (
                <IconButton
                  icon="checkbox-blank-circle-outline"
                  onPress={() => completeTask(item.id)}
                  accessibilityLabel={t('tasks.complete')}
                  testID={`task-complete-${item.id}`}
                />
              ) : (
                <IconButton icon="check-circle" disabled />
              )}
              <Pressable
                style={styles.taskInfo}
                onPress={() => router.push({ pathname: '/task-form', params: { id: item.id } })}
                testID={`task-open-${item.id}`}
              >
                <Text variant="bodyMedium">{item.title}</Text>
                <Text variant="labelMedium" style={styles.priorityText}>
                  {priorityLabel(item.priority)}
                </Text>
              </Pressable>
              {item.status !== 'archived' ? (
                <IconButton
                  icon="archive-outline"
                  onPress={() => archiveTask(item.id)}
                  accessibilityLabel={t('tasks.archive')}
                  testID={`task-archive-${item.id}`}
                />
              ) : null}
            </Surface>
          )}
        />
      )}
      <FAB
        icon="plus"
        label={t('tasks.newTask')}
        style={styles.fab}
        onPress={() => router.push('/task-form')}
        testID="task-create"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  filterRow: { gap: 8, paddingBottom: 8 },
  chip: { marginRight: 4 },
  loading: { marginTop: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  emptyHint: { opacity: 0.6 },
  list: { gap: 8, paddingBottom: 96 },
  taskCard: { borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  taskInfo: { flex: 1, paddingVertical: 8 },
  priorityText: { opacity: 0.6, marginTop: 2 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
