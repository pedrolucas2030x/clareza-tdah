import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  SegmentedButtons,
  Checkbox,
  IconButton,
  FAB,
  ActivityIndicator,
  List,
  HelperText,
} from 'react-native-paper';
import { router } from 'expo-router';
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

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={filter}
        onValueChange={(value) => setFilter(value as TaskStatus)}
        buttons={[
          { value: 'pending', label: t('tasks.filterPending') },
          { value: 'done', label: t('tasks.filterDone') },
          { value: 'archived', label: t('tasks.filterArchived') },
        ]}
        style={styles.filter}
      />
      {error ? (
        <HelperText type="error" visible testID="tasks-error">
          {t('tasks.loadFailed')}
        </HelperText>
      ) : null}
      {isLoading ? (
        <ActivityIndicator />
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
          renderItem={({ item }) => (
            <List.Item
              title={item.title}
              description={priorityLabel(item.priority)}
              onPress={() => router.push({ pathname: '/task-form', params: { id: item.id } })}
              left={() =>
                item.status === 'pending' ? (
                  <Checkbox
                    status="unchecked"
                    onPress={() => completeTask(item.id)}
                    testID={`task-complete-${item.id}`}
                  />
                ) : null
              }
              right={() =>
                item.status !== 'archived' ? (
                  <IconButton
                    icon="archive-outline"
                    onPress={() => archiveTask(item.id)}
                    testID={`task-archive-${item.id}`}
                  />
                ) : null
              }
              testID={`task-row-${item.id}`}
            />
          )}
        />
      )}
      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/task-form')} testID="task-create" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  filter: { marginBottom: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  emptyHint: { opacity: 0.6 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
