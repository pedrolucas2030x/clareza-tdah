import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  HelperText,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { fetchTask } from '@/lib/tasks';
import { validateTaskForm } from '@/utils/validation';
import type { Task, TaskPriority } from '@/types';

export default function TaskFormScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuthStore();
  const { tasks, createTask, updateTask } = useTaskStore();
  const [fetchedTask, setFetchedTask] = useState<Task | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const existingTask = id ? (tasks.find((task) => task.id === id) ?? fetchedTask ?? undefined) : undefined;

  const [title, setTitle] = useState(existingTask?.title ?? '');
  const [description, setDescription] = useState(existingTask?.description ?? '');
  const [dueDate, setDueDate] = useState(existingTask?.dueDate?.slice(0, 10) ?? '');
  const [priority, setPriority] = useState<TaskPriority>(existingTask?.priority ?? 2);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (id && !tasks.find((task) => task.id === id)) {
      setIsLoadingTask(true);
      fetchTask(id)
        .then((task) => {
          setFetchedTask(task);
          setTitle(task.title);
          setDescription(task.description ?? '');
          setDueDate(task.dueDate?.slice(0, 10) ?? '');
          setPriority(task.priority);
        })
        .catch(() => {
          setFetchFailed(true);
          setFormError(t('tasks.loadFailed'));
        })
        .finally(() => setIsLoadingTask(false));
    }
  }, [id]);

  const handleSubmit = async () => {
    setFormError('');
    const result = validateTaskForm(title, dueDate);
    if (!result.valid) {
      if (result.errors.title) setFormError(t('tasks.titleRequired'));
      else if (result.errors.dueDate) setFormError(t('tasks.dueDateInvalid'));
      return;
    }
    setIsSaving(true);
    try {
      const input = {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate.trim() || null,
        priority,
      };
      if (existingTask) {
        await updateTask(existingTask.id, input);
      } else if (user) {
        await createTask(user.id, input);
      } else {
        throw new Error('No authenticated user');
      }
      router.back();
    } catch {
      setFormError(t('tasks.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingTask) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator testID="task-form-loading" />
      </View>
    );
  }

  if (fetchFailed) {
    return (
      <View style={[styles.container, styles.loading]}>
        <HelperText type="error" visible testID="task-form-error">
          {formError}
        </HelperText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: existingTask ? t('tasks.editTask') : t('tasks.newTask'),
          headerRight: () => (
            <Button
              onPress={handleSubmit}
              loading={isSaving}
              disabled={isSaving}
              textColor="#fff"
              testID="task-save"
            >
              {t('common.save')}
            </Button>
          ),
        }}
      />
      <Surface style={styles.field} elevation={1}>
        <TextInput
          label={t('tasks.titleLabel')}
          value={title}
          onChangeText={setTitle}
          mode="flat"
          underlineColor="transparent"
          testID="task-title"
        />
      </Surface>
      <Surface style={styles.field} elevation={1}>
        <TextInput
          label={t('tasks.descriptionLabel')}
          value={description}
          onChangeText={setDescription}
          multiline
          mode="flat"
          underlineColor="transparent"
          left={<TextInput.Icon icon="text-box-outline" />}
          style={styles.descriptionInput}
          testID="task-description"
        />
      </Surface>
      <Surface style={styles.field} elevation={1}>
        <TextInput
          label={t('tasks.dueDateLabel')}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder={t('tasks.dueDatePlaceholder')}
          autoCapitalize="none"
          mode="flat"
          underlineColor="transparent"
          left={<TextInput.Icon icon="calendar-blank-outline" />}
          testID="task-due-date"
        />
      </Surface>
      <Text variant="titleMedium" style={styles.sectionLabel}>
        {t('tasks.priorityLabel')}
      </Text>
      <SegmentedButtons
        value={String(priority)}
        onValueChange={(value) => setPriority(Number(value) as TaskPriority)}
        buttons={[
          { value: '1', label: t('tasks.priorityLow') },
          { value: '2', label: t('tasks.priorityMedium') },
          { value: '3', label: t('tasks.priorityHigh') },
        ]}
        style={styles.field}
      />
      {formError ? (
        <HelperText type="error" visible testID="task-form-error">
          {formError}
        </HelperText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  loading: { alignItems: 'center', justifyContent: 'center' },
  field: { borderRadius: 12, marginBottom: 4 },
  descriptionInput: { minHeight: 96 },
  sectionLabel: { marginTop: 8 },
});
