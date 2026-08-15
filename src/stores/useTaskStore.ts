import { create } from 'zustand';
import {
  archiveTask as archiveTaskRequest,
  completeTask as completeTaskRequest,
  createTask as createTaskRequest,
  fetchTasks as fetchTasksRequest,
  updateTask as updateTaskRequest,
} from '@/lib/tasks';
import type { CreateTaskInput, Task } from '@/types';

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: (userId: string) => Promise<void>;
  createTask: (userId: string, input: CreateTaskInput) => Promise<void>;
  updateTask: (
    taskId: string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'dueDate' | 'priority'>>
  ) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  archiveTask: (taskId: string) => Promise<void>;
}

function replaceTask(tasks: Task[], updated: Task): Task[] {
  return tasks.map((task) => (task.id === updated.id ? updated : task));
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await fetchTasksRequest(userId);
      set({ tasks, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
    }
  },

  createTask: async (userId, input) => {
    const task = await createTaskRequest(userId, input);
    set({ tasks: [...get().tasks, task] });
  },

  updateTask: async (taskId, updates) => {
    const task = await updateTaskRequest(taskId, updates);
    set({ tasks: replaceTask(get().tasks, task) });
  },

  completeTask: async (taskId) => {
    try {
      const task = await completeTaskRequest(taskId);
      set({ tasks: replaceTask(get().tasks, task), error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  archiveTask: async (taskId) => {
    try {
      const task = await archiveTaskRequest(taskId);
      set({ tasks: replaceTask(get().tasks, task), error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
