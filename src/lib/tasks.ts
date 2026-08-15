import { supabase } from '@/lib/supabase';
import type { CreateTaskInput, Task, TaskStatus } from '@/types';

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Task['priority'];
  status: Task['status'];
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: TaskRow): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    priority: row.priority,
    status: row.status,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchTasks(userId: string, status?: TaskStatus): Promise<Task[]> {
  let query = supabase.from('tasks').select('*').eq('user_id', userId);
  if (status) {
    query = query.eq('status', status);
  }
  const { data, error } = await query.order('created_at', { ascending: true });
  if (error) throw error;
  return (data as TaskRow[]).map(mapRow);
}

export async function fetchTask(taskId: string): Promise<Task> {
  const { data, error } = await supabase.from('tasks').select('*').eq('id', taskId).single();
  if (error) throw error;
  return mapRow(data as TaskRow);
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      due_date: input.dueDate ?? null,
      priority: input.priority ?? 2,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as TaskRow);
}

export async function updateTask(
  taskId: string,
  updates: Partial<Pick<Task, 'title' | 'description' | 'dueDate' | 'priority'>>
): Promise<Task> {
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
  if (updates.priority !== undefined) payload.priority = updates.priority;

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as TaskRow);
}

export async function completeTask(taskId: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'done', completed_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as TaskRow);
}

export async function archiveTask(taskId: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'archived' })
    .eq('id', taskId)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as TaskRow);
}
