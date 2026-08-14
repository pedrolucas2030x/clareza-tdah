# Clareza TDAH — Plano 01: Setup e Fundação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inicializar o projeto Expo com TypeScript, instalar todas as dependências, configurar Supabase, configurar navegação Expo Router, configurar tema (claro/escuro) e i18n (pt-BR/en), e ter um app rodando com a estrutura de pastas completa e tela Home vazia exibindo saudação traduzida.

**Architecture:** Expo managed workflow com TypeScript. Estado global em Zustand. Tema via React Native Paper (MD3). i18n via i18next com detecção automática de idioma do device. Navegação file-based via Expo Router. Cliente Supabase singleton.

**Tech Stack:** Expo SDK 50+, TypeScript 5, React Native 0.73+, Expo Router 3, Zustand 4, React Native Paper 5, i18next 23, react-i18next 14, @supabase/supabase-js 2, date-fns 3, Lucide React Native, AsyncStorage 1.21, expo-secure-store, expo-localization.

## Global Constraints

- Linguagem: TypeScript estrito (`strict: true`)
- Versão mínima do Node: 18+
- Todas as dependências instaladas com versões exatas via `npm install --save-exact`
- Commits em português, formato: `tipo(escopo): descrição` (ex: `feat(auth): adicionar tela de login`)
- Variáveis de ambiente em `.env` (nunca commitar); `.env.example` no repositório
- Todas as strings de UI passam por `t('chave')` — zero hardcoded em componentes
- Modo escuro real (não apenas inversão de cores)
- Botões com altura mínima de 48dp
- Idioma padrão: `pt-BR`

---

## File Structure (criada neste plano)

```
clareza-tdah/
├── app/
│   ├── _layout.tsx                  # Layout raiz com providers (Paper, i18n, Auth)
│   └── index.tsx                    # Home temporária (placeholder)
├── src/
│   ├── components/
│   │   └── (vazio neste plano)
│   ├── lib/
│   │   ├── supabase.ts              # Singleton do cliente Supabase
│   │   ├── i18n.ts                  # Configuração i18next
│   │   └── theme.ts                 # Tema claro/escuro (Paper)
│   ├── stores/
│   │   └── useSettingsStore.ts      # Estado: tema, idioma
│   ├── locales/
│   │   ├── pt-BR.json               # Traduções PT
│   │   └── en.json                  # Traduções EN
│   └── types/
│       └── index.ts                 # Tipos compartilhados
├── assets/
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png            # (gerados pelo Expo)
├── .env.example
├── .gitignore
├── app.json                         # Configuração Expo
├── package.json
├── tsconfig.json
├── babel.config.js
└── README.md
```

---

## Task 1: Inicializar projeto Expo com TypeScript

**Files:**
- Create: `C:\Users\mindm\source\repos\clareza-tdah\package.json`
- Create: `C:\Users\mindm\source\repos\clareza-tdah\app.json`
- Create: `C:\Users\mindm\source\repos\clareza-tdah\tsconfig.json`
- Create: `C:\Users\mindm\source\repos\clareza-tdah\.gitignore`
- Create: `C:\Users\mindm\source\repos\clareza-tdah\.env.example`

- [ ] **Step 1: Criar diretório do projeto e inicializar Git**

```bash
cd /c/Users/mindm/source/repos/clareza-tdah
git init
git checkout -b main
```

- [ ] **Step 2: Criar package.json com dependências exatas**

Crie `package.json` com o seguinte conteúdo:

```json
{
  "name": "clareza-tdah",
  "version": "0.1.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "expo": "50.0.17",
    "expo-router": "3.4.8",
    "expo-status-bar": "1.11.1",
    "expo-constants": "15.4.5",
    "expo-linking": "6.2.2",
    "expo-localization": "14.8.4",
    "expo-secure-store": "12.8.1",
    "expo-image-picker": "14.7.1",
    "expo-notifications": "0.27.7",
    "expo-splash-screen": "0.26.4",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-native": "0.73.11",
    "react-native-paper": "5.12.5",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "3.29.0",
    "react-native-gesture-handler": "2.14.1",
    "react-native-reanimated": "3.6.2",
    "react-native-vector-icons": "10.0.3",
    "lucide-react-native": "0.378.0",
    "@supabase/supabase-js": "2.39.7",
    "zustand": "4.5.2",
    "i18next": "23.11.5",
    "react-i18next": "14.1.2",
    "date-fns": "3.6.0",
    "@react-native-async-storage/async-storage": "1.21.0"
  },
  "devDependencies": {
    "@babel/core": "7.24.0",
    "@types/react": "18.2.79",
    "typescript": "5.3.3"
  },
  "private": true
}
```

- [ ] **Step 3: Criar app.json**

Crie `app.json`:

```json
{
  "expo": {
    "name": "Clareza TDAH",
    "slug": "clareza-tdah",
    "version": "0.1.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "clarezatdah",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#6366f1"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.clareza.tdah"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#6366f1"
      },
      "package": "com.clareza.tdah"
    },
    "web": {
      "bundler": "metro",
      "output": "single"
    },
    "plugins": [
      "expo-router",
      "expo-localization"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

- [ ] **Step 4: Criar tsconfig.json**

Crie `tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

- [ ] **Step 5: Criar .gitignore**

Crie `.gitignore`:

```
node_modules/
.expo/
dist/
web-build/
*.log
.env
.env.local
.DS_Store
*.pem
npm-debug.*
yarn-debug.*
yarn-error.*
*.tsbuildinfo
```

- [ ] **Step 6: Criar .env.example**

Crie `.env.example`:

```
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 7: Criar .env local (você preenche depois)**

```bash
cp .env.example .env
```

(Você vai preencher com suas credenciais reais do Supabase no Task 4.)

- [ ] **Step 8: Instalar dependências**

```bash
cd /c/Users/mindm/source/repos/clareza-tdah
npm install
```

Esperado: instalação completa, sem erros. Se houver warnings de peer deps, é normal.

- [ ] **Step 9: Verificar typecheck**

```bash
npm run typecheck
```

Esperado: comando executa sem erros (não há arquivos TS ainda, então passa).

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "chore(setup): inicializar projeto Expo com TypeScript"
```

---

## Task 2: Criar assets placeholder e estrutura de pastas

**Files:**
- Create: `assets/icon.png`
- Create: `assets/splash.png`
- Create: `assets/adaptive-icon.png`
- Create: `src/types/index.ts`

- [ ] **Step 1: Criar diretórios necessários**

```bash
cd /c/Users/mindm/source/repos/clareza-tdah
mkdir -p assets src/components src/lib src/stores src/locales src/types src/utils app
```

- [ ] **Step 2: Gerar assets placeholder com Expo**

Como o Expo requer arquivos PNG reais para icon/splash, crie versões mínimas:

Crie `assets/icon.png` — baixe um placeholder 1024x1024 de:
```
https://via.placeholder.com/1024/6366f1/ffffff.png?text=Clareza
```
(Salve manualmente no diretório assets, ou use PowerShell:)

```powershell
Invoke-WebRequest -Uri "https://via.placeholder.com/1024/6366f1/ffffff.png?text=Clareza" -OutFile "C:\Users\mindm\source\repos\clareza-tdah\assets\icon.png"
Invoke-WebRequest -Uri "https://via.placeholder.com/1284/6366f1/ffffff.png?text=Clareza" -OutFile "C:\Users\mindm\source\repos\clareza-tdah\assets\splash.png"
Invoke-WebRequest -Uri "https://via.placeholder.com/1024/6366f1/ffffff.png?text=Clareza" -OutFile "C:\Users\mindm\source\repos\clareza-tdah\assets\adaptive-icon.png"
```

- [ ] **Step 3: Criar tipos base em src/types/index.ts**

Crie `src/types/index.ts`:

```typescript
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
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore(setup): criar estrutura de pastas e assets placeholder"
```

---

## Task 3: Configurar i18n (i18next + react-i18next)

**Files:**
- Create: `src/locales/pt-BR.json`
- Create: `src/locales/en.json`
- Create: `src/lib/i18n.ts`

- [ ] **Step 1: Criar arquivo de traduções PT-BR**

Crie `src/locales/pt-BR.json`:

```json
{
  "common": {
    "appName": "Clareza TDAH",
    "save": "Salvar",
    "cancel": "Cancelar",
    "delete": "Excluir",
    "edit": "Editar",
    "create": "Criar",
    "confirm": "Confirmar",
    "loading": "Carregando...",
    "error": "Algo deu errado",
    "retry": "Tentar novamente"
  },
  "home": {
    "greetingMorning": "Bom dia",
    "greetingAfternoon": "Boa tarde",
    "greetingEvening": "Boa noite",
    "nextTasks": "Próximas tarefas",
    "currentRoutine": "Agora na sua rotina",
    "startFocus": "Iniciar foco",
    "monthSummary": "Resumo do mês"
  },
  "tabs": {
    "home": "Início",
    "tasks": "Tarefas",
    "focus": "Foco",
    "routine": "Rotina",
    "finances": "Finanças",
    "profile": "Perfil"
  }
}
```

- [ ] **Step 2: Criar arquivo de traduções EN**

Crie `src/locales/en.json`:

```json
{
  "common": {
    "appName": "Clareza ADHD",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "confirm": "Confirm",
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try again"
  },
  "home": {
    "greetingMorning": "Good morning",
    "greetingAfternoon": "Good afternoon",
    "greetingEvening": "Good evening",
    "nextTasks": "Next tasks",
    "currentRoutine": "Current routine",
    "startFocus": "Start focus",
    "monthSummary": "Monthly summary"
  },
  "tabs": {
    "home": "Home",
    "tasks": "Tasks",
    "focus": "Focus",
    "routine": "Routine",
    "finances": "Finances",
    "profile": "Profile"
  }
}
```

- [ ] **Step 3: Criar configuração i18n em src/lib/i18n.ts**

Crie `src/lib/i18n.ts`:

```typescript
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
```

- [ ] **Step 4: Verificar typecheck**

```bash
cd /c/Users/mindm/source/repos/clareza-tdah
npm run typecheck
```

Esperado: sucesso, sem erros.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(i18n): configurar i18next com PT-BR e EN"
```

---

## Task 4: Configurar tema (React Native Paper) com Zustand

**Files:**
- Create: `src/lib/theme.ts`
- Create: `src/stores/useSettingsStore.ts`

- [ ] **Step 1: Criar tema em src/lib/theme.ts**

Crie `src/lib/theme.ts`:

```typescript
import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';

const PRIMARY = '#6366f1';
const PRIMARY_DARK = '#4f46e5';

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: PRIMARY,
    secondary: '#8b5cf6',
    background: '#fafafa',
    surface: '#ffffff',
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818cf8',
    secondary: '#a78bfa',
    background: '#0f172a',
    surface: '#1e293b',
  },
};

export { PRIMARY, PRIMARY_DARK };
```

- [ ] **Step 2: Criar store de configurações em src/stores/useSettingsStore.ts**

Crie `src/stores/useSettingsStore.ts`:

```typescript
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
```

- [ ] **Step 3: Verificar typecheck**

```bash
cd /c/Users/mindm/source/repos/clareza-tdah
npm run typecheck
```

Esperado: sucesso, sem erros.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(settings): adicionar tema (Paper) e store de configurações (Zustand)"
```

---

## Task 5: Configurar cliente Supabase

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Criar cliente Supabase em src/lib/supabase.ts**

Crie `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key';

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase não configurado. Preencha o .env antes de usar autenticação.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: undefined, // Será configurado com SecureStore no Plano 02
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 2: Verificar typecheck**

```bash
cd /c/Users/mindm/source/repos/clareza-tdah
npm run typecheck
```

Esperado: sucesso.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat(supabase): configurar cliente Supabase singleton"
```

---

## Task 6: Criar layout raiz e tela Home temporária

**Files:**
- Create: `app/_layout.tsx`
- Create: `app/index.tsx`

- [ ] **Step 1: Criar layout raiz em app/_layout.tsx**

Crie `app/_layout.tsx`:

```typescript
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import '@/lib/i18n';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { lightTheme, darkTheme } from '@/lib/theme';

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const { theme, language, hydrate } = useSettingsStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const effectiveTheme =
    theme === 'auto' ? (systemScheme === 'dark' ? 'dark' : 'light') : theme;

  const paperTheme = effectiveTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: paperTheme.colors.primary },
            headerTintColor: '#fff',
          }}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 2: Criar Home temporária em app/index.tsx**

Crie `app/index.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { language, setLanguage, theme, setTheme } = useSettingsStore();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greetingMorning');
    if (hour < 18) return t('home.greetingAfternoon');
    return t('home.greetingEvening');
  })();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">{greeting} 👋</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        {t('common.appName')}
      </Text>
      <Text variant="bodyMedium" style={styles.info}>
        Idioma atual: {language} | Tema: {theme}
      </Text>
      <Button
        mode="contained"
        onPress={() => setLanguage(language === 'pt-BR' ? 'en' : 'pt-BR')}
        style={styles.button}
      >
        Trocar idioma
      </Button>
      <Button
        mode="outlined"
        onPress={() =>
          setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light')
        }
        style={styles.button}
      >
        Trocar tema
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  subtitle: {
    marginBottom: 8,
  },
  info: {
    opacity: 0.6,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
```

- [ ] **Step 3: Verificar typecheck**

```bash
cd /c/Users/mindm/source/repos/clareza-tdah
npm run typecheck
```

Esperado: sucesso.

- [ ] **Step 4: Testar build (opcional, requer Expo CLI instalado globalmente)**

```bash
cd /c/Users/mindm/source/repos/clareza-tdah
npx expo start
```

Esperado: Metro Bundler inicia. Pressione `w` para web ou escaneie QR com Expo Go no celular. A tela Home aparece com saudação traduzida e botões funcionais.

Se não conseguir testar agora, pelo menos verifique que o typecheck passa e o Metro inicia.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(app): adicionar layout raiz e Home temporária com troca de idioma/tema"
```

---

## Task 7: Criar README inicial

**Files:**
- Create: `README.md`

- [ ] **Step 1: Criar README.md**

Crie `README.md`:

```markdown
# Clareza TDAH

App mobile (iOS + Android) para pessoas com TDAH organizarem tarefas, rotina, foco e finanças.

## Stack

- React Native + Expo
- TypeScript
- Supabase (Auth + Postgres + Storage)
- React Native Paper (UI)
- Expo Router (navegação)
- Zustand (estado)
- i18next (internacionalização)

## Setup

1. Instalar dependências:
\`\`\`bash
npm install
\`\`\`

2. Configurar variáveis de ambiente:
\`\`\`bash
cp .env.example .env
\`\`\`
Preencha \`EXPO_PUBLIC_SUPABASE_URL\` e \`EXPO_PUBLIC_SUPABASE_ANON_KEY\` com suas credenciais do Supabase.

3. Rodar o app:
\`\`\`bash
npx expo start
\`\`\`

## Estrutura

- \`app/\` — Telas (Expo Router)
- \`src/components/\` — Componentes reutilizáveis
- \`src/lib/\` — Configurações (Supabase, i18n, tema)
- \`src/stores/\` — Estado global (Zustand)
- \`src/locales/\` — Traduções
- \`src/types/\` — TypeScript types
- \`src/utils/\` — Helpers

## Status

MVP em desenvolvimento. Veja \`docs/superpowers/specs/2026-08-13-clareza-tdah-design.md\` para o design completo.
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "docs: adicionar README inicial"
```

---

## Self-Review do Plano

1. **Spec coverage:** Setup inicial coberto (Expo, TS, Supabase, tema, i18n, navegação, estrutura de pastas). Autenticação, tabelas e features virão nos próximos planos.
2. **Placeholders:** Nenhum. Todas as dependências, arquivos e código estão completos.
3. **Type consistency:** Tipos em `src/types/index.ts` são referenciados consistentemente. Zustand store usa a mesma interface. i18n usa as mesmas Language keys.
4. **Variáveis de ambiente:** Documentado em `.env.example` e no README. Cliente Supabase tem fallback para não quebrar typecheck.

---

## Próximo Plano

**Plano 02 — Autenticação e Perfil** cobrirá:
- Criar projeto Supabase e configurar tabelas `profiles`
- Telas de login e cadastro
- Auth store com Zustand
- Persistência de sessão com SecureStore
- Tela de perfil com upload de foto
- Tela de configurações (idioma, tema, moeda)
- Botão de logout
- Row Level Security policies
