import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface ProfileRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  language: Profile['language'];
  theme: Profile['theme'];
  currency: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    language: row.language,
    theme: row.theme,
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return mapRow(data as ProfileRow);
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'fullName' | 'language' | 'theme' | 'currency' | 'avatarUrl'>>
): Promise<Profile> {
  const payload: Record<string, unknown> = {};
  if (updates.fullName !== undefined) payload.full_name = updates.fullName;
  if (updates.language !== undefined) payload.language = updates.language;
  if (updates.theme !== undefined) payload.theme = updates.theme;
  if (updates.currency !== undefined) payload.currency = updates.currency;
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data as ProfileRow);
}

export async function uploadAvatar(userId: string, fileUri: string): Promise<string> {
  const response = await fetch(fileUri);
  const arrayBuffer = await response.arrayBuffer();
  const path = `${userId}/avatar.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}
