jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: { from: jest.fn() },
  },
}));

import { supabase } from '@/lib/supabase';
import { fetchProfile, updateProfile, uploadAvatar } from '../profile';

describe('fetchProfile', () => {
  it('maps the database row to a Profile', async () => {
    const single = jest.fn().mockResolvedValue({
      data: {
        id: 'user-1',
        full_name: 'Ana',
        avatar_url: null,
        language: 'pt-BR',
        theme: 'auto',
        currency: 'BRL',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      error: null,
    });
    const eq = jest.fn().mockReturnValue({ single });
    const select = jest.fn().mockReturnValue({ eq });
    (supabase.from as jest.Mock).mockReturnValue({ select });

    const profile = await fetchProfile('user-1');

    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(profile.fullName).toBe('Ana');
    expect(profile.id).toBe('user-1');
  });

  it('throws when Supabase returns an error', async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: new Error('not found') });
    const eq = jest.fn().mockReturnValue({ single });
    const select = jest.fn().mockReturnValue({ eq });
    (supabase.from as jest.Mock).mockReturnValue({ select });

    await expect(fetchProfile('missing')).rejects.toThrow('not found');
  });
});

describe('updateProfile', () => {
  it('sends only the changed fields as snake_case columns', async () => {
    const single = jest.fn().mockResolvedValue({
      data: {
        id: 'user-1',
        full_name: 'Novo Nome',
        avatar_url: null,
        language: 'pt-BR',
        theme: 'auto',
        currency: 'BRL',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
      error: null,
    });
    const select = jest.fn().mockReturnValue({ single });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    (supabase.from as jest.Mock).mockReturnValue({ update });

    const profile = await updateProfile('user-1', { fullName: 'Novo Nome' });

    expect(update).toHaveBeenCalledWith({ full_name: 'Novo Nome' });
    expect(profile.fullName).toBe('Novo Nome');
  });
});

describe('uploadAvatar', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('uploads the file and returns a cache-busted public URL', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: async () => new ArrayBuffer(8),
    }) as unknown as typeof fetch;

    const upload = jest.fn().mockResolvedValue({ error: null });
    const getPublicUrl = jest.fn().mockReturnValue({
      data: { publicUrl: 'https://x.supabase.co/storage/v1/object/public/avatars/user-1/avatar.jpg' },
    });
    (supabase.storage.from as jest.Mock).mockReturnValue({ upload, getPublicUrl });

    const url = await uploadAvatar('user-1', 'file:///tmp/photo.jpg');

    expect(upload).toHaveBeenCalledWith(
      'user-1/avatar.jpg',
      expect.any(ArrayBuffer),
      { contentType: 'image/jpeg', upsert: true }
    );
    expect(url).toContain('https://x.supabase.co/storage/v1/object/public/avatars/user-1/avatar.jpg?t=');
  });
});
