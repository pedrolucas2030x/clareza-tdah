jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '../useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      session: null,
      user: null,
      isLoading: false,
      isInitialized: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  it('signIn stores session and user on success', async () => {
    const fakeSession = { access_token: 'abc' } as any;
    const fakeUser = { id: 'user-1', email: 'a@b.com' } as any;
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { session: fakeSession, user: fakeUser },
      error: null,
    });

    await useAuthStore.getState().signIn('a@b.com', 'senha123');

    expect(useAuthStore.getState().session).toBe(fakeSession);
    expect(useAuthStore.getState().user).toBe(fakeUser);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('signIn stores the error message and rethrows on failure', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid login credentials' },
    });

    await expect(useAuthStore.getState().signIn('a@b.com', 'wrong')).rejects.toBeTruthy();
    expect(useAuthStore.getState().error).toBe('Invalid login credentials');
    expect(useAuthStore.getState().session).toBeNull();
  });

  it('signUp stores session and user on success', async () => {
    const fakeSession = { access_token: 'abc' } as any;
    const fakeUser = { id: 'user-1' } as any;
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { session: fakeSession, user: fakeUser },
      error: null,
    });

    await useAuthStore.getState().signUp('a@b.com', 'senha123', 'Ana Silva');

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'senha123',
      options: { data: { full_name: 'Ana Silva' } },
    });
    expect(useAuthStore.getState().session).toBe(fakeSession);
  });

  it('signOut clears session and user', async () => {
    useAuthStore.setState({ session: { access_token: 'abc' } as any, user: { id: 'user-1' } as any });
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('initialize loads the current session and marks itself initialized', async () => {
    const fakeSession = { access_token: 'abc', user: { id: 'user-1' } } as any;
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: fakeSession } });
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });

    await useAuthStore.getState().initialize();

    expect(useAuthStore.getState().session).toBe(fakeSession);
    expect(useAuthStore.getState().isInitialized).toBe(true);
  });
});
