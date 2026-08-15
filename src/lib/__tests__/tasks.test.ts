jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from '@/lib/supabase';
import { archiveTask, completeTask, createTask, fetchTask, fetchTasks, updateTask } from '../tasks';

const row = {
  id: 'task-1',
  user_id: 'user-1',
  title: 'Estudar',
  description: null,
  due_date: null,
  priority: 2,
  status: 'pending',
  completed_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('fetchTasks', () => {
  it('maps rows to tasks without a status filter', async () => {
    const order = jest.fn().mockResolvedValue({ data: [row], error: null });
    const chain: any = {};
    chain.eq = jest.fn(() => chain);
    chain.order = order;
    const select = jest.fn().mockReturnValue(chain);
    (supabase.from as jest.Mock).mockReturnValue({ select });

    const tasks = await fetchTasks('user-1');

    expect(supabase.from).toHaveBeenCalledWith('tasks');
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: true });
    expect(tasks).toEqual([
      {
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
      },
    ]);
  });

  it('applies the status filter when provided', async () => {
    const order = jest.fn().mockResolvedValue({ data: [row], error: null });
    const chain: any = {};
    chain.eq = jest.fn(() => chain);
    chain.order = order;
    const select = jest.fn().mockReturnValue(chain);
    (supabase.from as jest.Mock).mockReturnValue({ select });

    await fetchTasks('user-1', 'pending');

    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(chain.eq).toHaveBeenCalledWith('status', 'pending');
  });

  it('throws when Supabase returns an error', async () => {
    const order = jest.fn().mockResolvedValue({ data: null, error: new Error('boom') });
    const chain: any = {};
    chain.eq = jest.fn(() => chain);
    chain.order = order;
    const select = jest.fn().mockReturnValue(chain);
    (supabase.from as jest.Mock).mockReturnValue({ select });

    await expect(fetchTasks('user-1')).rejects.toThrow('boom');
  });
});

describe('fetchTask', () => {
  it('maps a single row to a task', async () => {
    const single = jest.fn().mockResolvedValue({ data: row, error: null });
    const eq = jest.fn().mockReturnValue({ single });
    const select = jest.fn().mockReturnValue({ eq });
    (supabase.from as jest.Mock).mockReturnValue({ select });

    const task = await fetchTask('task-1');

    expect(supabase.from).toHaveBeenCalledWith('tasks');
    expect(eq).toHaveBeenCalledWith('id', 'task-1');
    expect(task).toEqual({
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
    });
  });

  it('throws when Supabase returns an error', async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: new Error('boom') });
    const eq = jest.fn().mockReturnValue({ single });
    const select = jest.fn().mockReturnValue({ eq });
    (supabase.from as jest.Mock).mockReturnValue({ select });

    await expect(fetchTask('task-1')).rejects.toThrow('boom');
  });
});

describe('createTask', () => {
  it('sends defaults for the fields that were not provided', async () => {
    const single = jest.fn().mockResolvedValue({ data: row, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    (supabase.from as jest.Mock).mockReturnValue({ insert });

    await createTask('user-1', { title: 'Estudar' });

    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      title: 'Estudar',
      description: null,
      due_date: null,
      priority: 2,
    });
  });

  it('sends the optional fields when provided', async () => {
    const single = jest.fn().mockResolvedValue({ data: row, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    (supabase.from as jest.Mock).mockReturnValue({ insert });

    await createTask('user-1', {
      title: 'Estudar',
      description: 'Revisar capitulo 3',
      dueDate: '2026-12-31',
      priority: 3,
    });

    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      title: 'Estudar',
      description: 'Revisar capitulo 3',
      due_date: '2026-12-31',
      priority: 3,
    });
  });
});

describe('updateTask', () => {
  it('sends only the changed fields as snake_case columns', async () => {
    const updatedRow = { ...row, title: 'Estudar TDAH' };
    const single = jest.fn().mockResolvedValue({ data: updatedRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    (supabase.from as jest.Mock).mockReturnValue({ update });

    const task = await updateTask('task-1', { title: 'Estudar TDAH' });

    expect(update).toHaveBeenCalledWith({ title: 'Estudar TDAH' });
    expect(eq).toHaveBeenCalledWith('id', 'task-1');
    expect(task.title).toBe('Estudar TDAH');
  });
});

describe('completeTask', () => {
  it('sets status to done and stamps completed_at', async () => {
    const doneRow = { ...row, status: 'done', completed_at: '2026-01-02T00:00:00Z' };
    const single = jest.fn().mockResolvedValue({ data: doneRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    (supabase.from as jest.Mock).mockReturnValue({ update });

    const task = await completeTask('task-1');

    expect(update).toHaveBeenCalledWith({ status: 'done', completed_at: expect.any(String) });
    expect(task.status).toBe('done');
  });
});

describe('archiveTask', () => {
  it('sets status to archived', async () => {
    const archivedRow = { ...row, status: 'archived' };
    const single = jest.fn().mockResolvedValue({ data: archivedRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    (supabase.from as jest.Mock).mockReturnValue({ update });

    const task = await archiveTask('task-1');

    expect(update).toHaveBeenCalledWith({ status: 'archived' });
    expect(task.status).toBe('archived');
  });
});
