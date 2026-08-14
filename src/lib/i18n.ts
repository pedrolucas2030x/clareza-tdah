import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { DEFAULT_LANGUAGE, Language, SUPPORTED_LANGUAGES } from '@/types';
import ptBR from '@/locales/pt-BR.json';
import en from '@/locales/en.json';

const resources = {
  'pt-BR': { translation: ptBR },
  en: { translation: en },
};

function detectInitialLanguage(): Language {
  const deviceLocale = Localization.getLocales()?.[0]?.languageCode;
  if (deviceLocale === 'pt') return 'pt-BR';
  if (deviceLocale === 'en') return 'en';
  return DEFAULT_LANGUAGE;
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3',
    react: {
      useSuspense: false,
    },
  });

export default i18n;
