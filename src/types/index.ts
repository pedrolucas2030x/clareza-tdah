export type Language = 'pt-BR' | 'en';
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface UserSettings {
  language: Language;
  theme: ThemeMode;
  currency: string;
}

export const SUPPORTED_LANGUAGES: Language[] = ['pt-BR', 'en'];
export const DEFAULT_LANGUAGE: Language = 'pt-BR';
export const DEFAULT_THEME: ThemeMode = 'auto';
export const DEFAULT_CURRENCY = 'BRL';

export interface Profile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  language: Language;
  theme: ThemeMode;
  currency: string;
  createdAt: string;
  updatedAt: string;
}
