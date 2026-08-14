import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CURRENCY, DEFAULT_LANGUAGE, DEFAULT_THEME, Language, ThemeMode, UserSettings } from '@/types';

const STORAGE_KEY = '@clareza:settings';

interface SettingsStore extends UserSettings {
  setLanguage: (lang: Language) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  language: DEFAULT_LANGUAGE,
  theme: DEFAULT_THEME,
  currency: DEFAULT_CURRENCY,

  setLanguage: async (language) => {
    set({ language });
    await persist(get());
  },

  setTheme: async (theme) => {
    set({ theme });
    await persist(get());
  },

  setCurrency: async (currency) => {
    set({ currency });
    await persist(get());
  },

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: UserSettings = JSON.parse(stored);
        set({ ...parsed });
      }
    } catch (e) {
      console.warn('Failed to hydrate settings', e);
    }
  },
}));

async function persist(state: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      language: state.language,
      theme: state.theme,
      currency: state.currency,
    }));
  } catch (e) {
    console.warn('Failed to persist settings', e);
  }
}
