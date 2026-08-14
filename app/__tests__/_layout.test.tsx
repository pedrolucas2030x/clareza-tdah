import { render } from '@testing-library/react-native';
import RootLayout from '../_layout';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  Stack: () => null,
  useRouter: () => ({ replace: mockReplace }),
  useSegments: jest.fn(),
}));

jest.mock('@/stores/useSettingsStore', () => ({
  useSettingsStore: jest.fn(),
}));

jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/lib/i18n', () => ({}));

import { useSegments } from 'expo-router';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuthStore } from '@/stores/useAuthStore';

describe('RootLayout auth redirect', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    (useSettingsStore as unknown as jest.Mock).mockReturnValue({
      theme: 'light',
      hydrate: jest.fn(),
    });
  });

  it('redirects to /login when there is no session outside the auth group', () => {
    (useSegments as jest.Mock).mockReturnValue(['']);
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      session: null,
      isInitialized: true,
      initialize: jest.fn(),
    });

    render(<RootLayout />);

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('redirects to / when there is a session inside the auth group', () => {
    (useSegments as jest.Mock).mockReturnValue(['(auth)', 'login']);
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      session: { access_token: 'abc' },
      isInitialized: true,
      initialize: jest.fn(),
    });

    render(<RootLayout />);

    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('does not redirect until auth is initialized', () => {
    (useSegments as jest.Mock).mockReturnValue(['']);
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      session: null,
      isInitialized: false,
      initialize: jest.fn(),
    });

    render(<RootLayout />);

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
