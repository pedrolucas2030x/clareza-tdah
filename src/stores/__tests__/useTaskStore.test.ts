jest.mock('@/lib/tasks', () => ({
  fetchTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  completeTask: jest.fn(),
  archiveTask: jest.fn(),
}));

import * as tasksLib from '@/lib/tasks';
import { useTaskStore } from '../useTaskStore';
import type { Task } from '@/types';

const fakeTask: Task = {
  id: 'task-1',
  userId: 'user-1',
  title: 'Estudar',
  description: null,
  dueDate: null,
  priority: 2,
  status: 'pending',
  completedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('useTaskStore', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [], isLoading: false, error: null });
    jest.clearAllMocks();
  });

  it('fetchTasks loads tasks for the user', async () => {
    (tasksLib.fetchTasks as jest.Mock).mockResolvedValue([fakeTask]);

    await useTaskStore.getState().fetchTasks('user-1');

    expect(tasksLib.fetchTasks).toHaveBeenCalledWith('user-1');
    expect(useTaskStore.getState().tasks).toEqual([fakeTask]);
    expect(useTaskStore.getState().isLoading).toBe(false);
  });

  it('fetchTasks stores the error message on failure', async () => {
    (tasksLib.fetchTasks as jest.Mock).mockRejectedValue(new Error('network down'));

    await useTaskStore.getState().fetchTasks('user-1');

    expect(useTaskStore.getState().error).toBe('network down');
    expect(useTaskStore.getState().tasks).toEqual([]);
  });

  it('createTask appends the new task', async () => {
    (tasksLib.createTask as jest.Mock).mockResolvedValue(fakeTask);

    await useTaskStore.getState().createTask('user-1', { title: 'Estudar' });

    expect(tasksLib.createTask).toHaveBeenCalledWith('user-1', { title: 'Estudar' });
    expect(useTaskStore.getState().tasks).toEqual([fakeTask]);
  });

  it('updateTask replaces the task with the updated version', async () => {
    useTaskStore.setState({ tasks: [fakeTask] });
    const edited = { ...fakeTask, title: 'Estudar TDAH' };
    (tasksLib.updateTask as jest.Mock).mockResolvedValue(edited);

    await useTaskStore.getState().updateTask('task-1', { title: 'Estudar TDAH' });

    expect(tasksLib.updateTask).toHaveBeenCalledWith('task-1', { title: 'Estudar TDAH' });
    expect(useTaskStore.getState().tasks).toEqual([edited]);
  });

  it('completeTask replaces the task with the updated version', async () => {
    useTaskStore.setState({ tasks: [fakeTask] });
    const doneTask = { ...fakeTask, status: 'done' as const, completedAt: '2026-01-02T00:00:00Z' };
    (tasksLib.completeTask as jest.Mock).mockResolvedValue(doneTask);

    await useTaskStore.getState().completeTask('task-1');

    expect(useTaskStore.getState().tasks).toEqual([doneTask]);
  });

  it('completeTask stores the error message on failure', async () => {
    useTaskStore.setState({ tasks: [fakeTask] });
    (tasksLib.completeTask as jest.Mock).mockRejectedValue(new Error('network down'));

    await useTaskStore.getState().completeTask('task-1');

    expect(useTaskStore.getState().error).toBe('network down');
    expect(useTaskStore.getState().tasks).toEqual([fakeTask]);
  });

  it('archiveTask replaces the task with the updated version', async () => {
    useTaskStore.setState({ tasks: [fakeTask] });
    const archived = { ...fakeTask, status: 'archived' as const };
    (tasksLib.archiveTask as jest.Mock).mockResolvedValue(archived);

    await useTaskStore.getState().archiveTask('task-1');

    expect(useTaskStore.getState().tasks).toEqual([archived]);
  });

  it('archiveTask stores the error message on failure', async () => {
    useTaskStore.setState({ tasks: [fakeTask] });
    (tasksLib.archiveTask as jest.Mock).mockRejectedValue(new Error('network down'));

    await useTaskStore.getState().archiveTask('task-1');

    expect(useTaskStore.getState().error).toBe('network down');
    expect(useTaskStore.getState().tasks).toEqual([fakeTask]);
  });
});
