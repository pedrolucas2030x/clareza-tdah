import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
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
        .catch(() => setFormError(t('tasks.loadFailed')))
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

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {existingTask ? t('tasks.editTask') : t('tasks.newTask')}
      </Text>
      <TextInput
        label={t('tasks.titleLabel')}
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        testID="task-title"
      />
      <TextInput
        label={t('tasks.descriptionLabel')}
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.input}
        testID="task-description"
      />
      <TextInput
        label={t('tasks.dueDateLabel')}
        value={dueDate}
        onChangeText={setDueDate}
        placeholder={t('tasks.dueDatePlaceholder')}
        autoCapitalize="none"
        style={styles.input}
        testID="task-due-date"
      />
      <Text variant="titleMedium">{t('tasks.priorityLabel')}</Text>
      <SegmentedButtons
        value={String(priority)}
        onValueChange={(value) => setPriority(Number(value) as TaskPriority)}
        buttons={[
          { value: '1', label: t('tasks.priorityLow') },
          { value: '2', label: t('tasks.priorityMedium') },
          { value: '3', label: t('tasks.priorityHigh') },
        ]}
        style={styles.input}
      />
      {formError ? (
        <HelperText type="error" visible testID="task-form-error">
          {formError}
        </HelperText>
      ) : null}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isSaving}
        disabled={isSaving}
        style={styles.button}
        testID="task-save"
      >
        {t('common.save')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 4 },
  loading: { alignItems: 'center', justifyContent: 'center' },
  title: { marginBottom: 16 },
  input: { marginBottom: 4 },
  button: { marginTop: 12 },
});
