# Clareza TDAH — Plano 02: Autenticação e Perfil Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar autenticação por e-mail/senha via Supabase Auth (com sessão persistida em SecureStore), proteção de rotas, e uma tela de Perfil (nome + foto via Supabase Storage) e de Configurações (idioma/tema/moeda sincronizados com o perfil remoto), com logout.

**Architecture:** Zustand `useAuthStore` guarda `session`/`user` do Supabase e é inicializado no layout raiz; o próprio `_layout.tsx` decide, via `expo-router`'s `useSegments`, se redireciona para `/login` (sem sessão) ou para `/` (com sessão, saindo do grupo `(auth)`). O token de sessão do Supabase é persistido com `expo-secure-store` (nunca AsyncStorage). Funções de acesso a dados (`src/lib/profile.ts`) ficam separadas das telas para serem testáveis sem precisar renderizar componentes React Native.

**Tech Stack:** Expo SDK 50, TypeScript 5 (strict), Expo Router 3, Zustand 4, React Native Paper 5, @supabase/supabase-js 2, expo-secure-store, expo-image-picker, Jest + jest-expo + @testing-library/react-native (novo neste plano).

## Global Constraints

- Linguagem: TypeScript estrito (`strict: true`) — já configurado em `tsconfig.json`.
- Todas as dependências novas instaladas com versões exatas via `npm install --save-exact`.
- Commits em português, formato: `tipo(escopo): descrição` (ex: `feat(auth): adicionar tela de login`).
- Variáveis de ambiente em `.env` (nunca commitar); `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` já documentadas em `.env.example`.
- Todas as strings de UI passam por `t('chave')` — zero hardcoded em componentes.
- Botões com altura mínima de 48dp (React Native Paper `Button` já atende isso por padrão).
- Token de sessão do Supabase deve ser armazenado com `expo-secure-store`, nunca com `AsyncStorage` (dado sensível).
- Cada tabela no Supabase tem Row Level Security habilitada; usuário só acessa `user_id = auth.uid()` (ou `id = auth.uid()` em `profiles`).

## Current State (o que já existe, não recriar)

- `src/types/index.ts`: `Language`, `ThemeMode`, `UserSettings`, `SUPPORTED_LANGUAGES`, `DEFAULT_LANGUAGE`, `DEFAULT_THEME`, `DEFAULT_CURRENCY`.
- `src/lib/supabase.ts`: cliente Supabase singleton (hoje com `storage: undefined` — Task 4 corrige isso).
- `src/lib/theme.ts`: `lightTheme`, `darkTheme` (React Native Paper MD3).
- `src/lib/i18n.ts`: i18next configurado, carrega `src/locales/pt-BR.json` e `src/locales/en.json`.
- `src/stores/useSettingsStore.ts`: Zustand store com `language`, `theme`, `currency`, `setLanguage`, `setTheme`, `setCurrency`, `hydrate` (persiste em AsyncStorage — correto para preferências não sensíveis).
- `app/_layout.tsx`: layout raiz com `SafeAreaProvider` + `PaperProvider` + `Stack` (Task 9 modifica para redirecionar por auth).
- `app/index.tsx`: Home placeholder (Task 11 adiciona um link para `/profile`).
- Dependências já instaladas em `package.json`: `@supabase/supabase-js`, `expo-secure-store`, `expo-image-picker`, `zustand`, `react-native-paper` — nenhuma precisa ser adicionada, exceto as de teste (Task 1).
- Não existe suíte de testes ainda (nenhum `jest`/`@testing-library` no projeto) — Task 1 monta essa base.

---

### Task 1: Configurar Jest + React Native Testing Library

**Files:**
- Modify: `package.json`
- Create: `jest.setup.js`
- Create: `src/types/__tests__/index.test.ts`

**Interfaces:**
- Produces: comando `npm test` rodando Jest com preset `jest-expo`; todas as tasks seguintes usam esse runner.

- [ ] **Step 1: Instalar as dependências de teste com versões exatas**

```bash
cd /c/Users/mindm/source/repos/clareza-tdah
npm install --save-exact --save-dev jest@29.7.0 jest-expo@50.0.4 @testing-library/react-native@12.4.3 react-test-renderer@18.2.0 @types/jest@29.5.12
```

Esperado: instalação sem erros (pode haver warnings de peer deps, normal).

- [ ] **Step 2: Adicionar o script `test` e a config do Jest no `package.json`**

Abra `package.json` e adicione o script `"test"` dentro de `"scripts"`, e um bloco `"jest"` no final do objeto (depois de `"private": true`):

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
    "typecheck": "tsc --noEmit",
    "test": "jest"
  },
  "dependencies": {
    "..." : "manter exatamente como está hoje, não copiar este placeholder"
  },
  "devDependencies": {
    "..." : "manter as existentes + as instaladas no Step 1"
  },
  "private": true,
  "jest": {
    "preset": "jest-expo",
    "setupFiles": [
      "./jest.setup.js"
    ]
  }
}
```

Não substitua `dependencies`/`devDependencies` pelo texto placeholder acima — edite apenas para adicionar o script `"test"` e o bloco `"jest"` ao final, mantendo o restante do arquivo intacto (o `npm install` do Step 1 já deve ter adicionado as 5 libs em `devDependencies` automaticamente).

- [ ] **Step 3: Criar `jest.setup.js`**

Crie `jest.setup.js`:

```javascript
import 'react-native-safe-area-context/jest/mock';
```

- [ ] **Step 4: Escrever um teste de sanidade para provar que o runner funciona**

Crie `src/types/__tests__/index.test.ts`:

```typescript
import { DEFAULT_CURRENCY, DEFAULT_LANGUAGE, DEFAULT_THEME, SUPPORTED_LANGUAGES } from '../index';

describe('type defaults', () => {
  it('defaults to Brazilian Portuguese', () => {
    expect(DEFAULT_LANGUAGE).toBe('pt-BR');
  });

  it('defaults to auto theme', () => {
    expect(DEFAULT_THEME).toBe('auto');
  });

  it('defaults currency to BRL', () => {
    expect(DEFAULT_CURRENCY).toBe('BRL');
  });

  it('supports pt-BR and en', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['pt-BR', 'en']);
  });
});
```

- [ ] **Step 5: Rodar os testes**

Run: `npm test`
Expected: `PASS src/types/__tests__/index.test.ts` com 4 testes passando, 0 falhas.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json jest.setup.js src/types/__tests__/index.test.ts
git commit -m "chore(test): configurar Jest e React Native Testing Library"
```

---

### Task 2: Criar projeto Supabase, tabela `profiles`, RLS e bucket de avatares

Esta task é majoritariamente manual (fora do editor de código) porque exige uma conta Supabase real. Documente o resultado, mas não há "rodar teste" tradicional — a verificação é via SQL/dashboard.

**Files:**
- Create: `supabase/migrations/0001_profiles.sql`

- [ ] **Step 1: Criar o projeto no Supabase**

Acesse https://supabase.com/dashboard, crie uma conta (se ainda não tiver) e clique em "New Project". Escolha um nome (ex: `clareza-tdah`), uma senha forte para o banco (guarde-a) e a região mais próxima. Aguarde a criação (leva 1–2 minutos).

- [ ] **Step 2: Copiar a URL e a chave anônima**

No dashboard do projeto: Settings → API. Copie "Project URL" e "anon public" key.

- [ ] **Step 3: Preencher o `.env` local**

Edite `.env` (não `.env.example`) na raiz do projeto:

```
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA-CHAVE-ANON-AQUI
```

- [ ] **Step 4: Criar o arquivo de migração SQL**

Crie `supabase/migrations/0001_profiles.sql`:

```sql
-- Tabela de perfis (1:1 com auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  language text not null default 'pt-BR',
  theme text not null default 'auto',
  currency text not null default 'BRL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Cria a linha em profiles automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Mantém updated_at correto em cada UPDATE
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Bucket de avatares (leitura pública, escrita restrita ao dono)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
```

- [ ] **Step 2: Rodar o SQL no Supabase**

No dashboard: SQL Editor → New query → cole o conteúdo de `supabase/migrations/0001_profiles.sql` → Run.

Esperado: "Success. No rows returned". Nenhum erro.

- [ ] **Step 3: Verificar no dashboard**

Table Editor → confirme que a tabela `profiles` existe com as colunas acima e o cadeado de RLS está fechado (ativo). Storage → confirme que o bucket `avatars` existe.

- [ ] **Step 4: Desabilitar confirmação de e-mail para desenvolvimento (opcional, recomendado)**

Authentication → Providers → Email → desmarque "Confirm email" (só para acelerar testes manuais; reative antes de ir para produção). Sem isso, `signUp` funciona mas o usuário só consegue logar depois de clicar num link de confirmação enviado por e-mail.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0001_profiles.sql
git commit -m "chore(supabase): adicionar migracao de profiles, RLS e bucket de avatares"
```

Não commite o `.env` preenchido (já está em `.gitignore`).

---

### Task 3: Tipos de autenticação e perfil

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Consumes: nada (arquivo já existe, só adiciona um export).
- Produces: `Profile` — usado por `src/lib/profile.ts` (Task 10), `app/profile.tsx` (Task 11), `app/settings.tsx` (Task 12).

- [ ] **Step 1: Escrever o teste**

Adicione ao final de `src/types/__tests__/index.test.ts` (criado na Task 1):

```typescript
import type { Profile } from '../index';

describe('Profile shape', () => {
  it('accepts a full profile object', () => {
    const profile: Profile = {
      id: 'user-1',
      fullName: 'Ana Silva',
      avatarUrl: null,
      language: 'pt-BR',
      theme: 'auto',
      currency: 'BRL',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };
    expect(profile.id).toBe('user-1');
  });
});
```

- [ ] **Step 2: Rodar o teste para ver falhar**

Run: `npm test -- src/types`
Expected: FAIL — `Profile` não existe em `../index` (erro de tipo/compilação do teste).

- [ ] **Step 3: Adicionar o tipo `Profile`**

Abra `src/types/index.ts` e adicione ao final:

```typescript
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
```

- [ ] **Step 4: Rodar o teste para ver passar**

Run: `npm test -- src/types`
Expected: PASS, todos os testes de `src/types/__tests__/index.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/types/__tests__/index.test.ts
git commit -m "feat(types): adicionar tipo Profile"
```

---

### Task 4: Persistir sessão do Supabase com SecureStore

**Files:**
- Create: `src/lib/secureStoreAdapter.ts`
- Create: `src/lib/__tests__/secureStoreAdapter.test.ts`
- Modify: `src/lib/supabase.ts`

**Interfaces:**
- Produces: `secureStoreAdapter` (objeto com `getItem`/`setItem`/`removeItem`) — usado só por `src/lib/supabase.ts`.

- [ ] **Step 1: Escrever o teste**

Crie `src/lib/__tests__/secureStoreAdapter.test.ts`:

```typescript
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import * as SecureStore from 'expo-secure-store';
import { secureStoreAdapter } from '../secureStoreAdapter';

describe('secureStoreAdapter', () => {
  it('delegates getItem to SecureStore.getItemAsync', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('value');
    const result = await secureStoreAdapter.getItem('key');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('key');
    expect(result).toBe('value');
  });

  it('delegates setItem to SecureStore.setItemAsync', async () => {
    await secureStoreAdapter.setItem('key', 'value');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('key', 'value');
  });

  it('delegates removeItem to SecureStore.deleteItemAsync', async () => {
    await secureStoreAdapter.removeItem('key');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('key');
  });
});
```

- [ ] **Step 2: Rodar o teste para ver falhar**

Run: `npm test -- src/lib/__tests__/secureStoreAdapter.test.ts`
Expected: FAIL — não é possível encontrar o módulo `../secureStoreAdapter`.

- [ ] **Step 3: Implementar o adapter**

Crie `src/lib/secureStoreAdapter.ts`:

```typescript
import * as SecureStore from 'expo-secure-store';

export const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
```

- [ ] **Step 4: Rodar o teste para ver passar**

Run: `npm test -- src/lib/__tests__/secureStoreAdapter.test.ts`
Expected: PASS, 3 testes.

- [ ] **Step 5: Conectar o adapter ao cliente Supabase**

Abra `src/lib/supabase.ts` e troque `storage: undefined` por `storage: secureStoreAdapter`, adicionando o import:

```typescript
import { createClient } from '@supabase/supabase-js';
import { secureStoreAdapter } from '@/lib/secureStoreAdapter';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key';

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase não configurado. Preencha o .env antes de usar autenticação.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 6: Verificar typecheck**

Run: `npm run typecheck`
Expected: sucesso, sem erros.

- [ ] **Step 7: Commit**

```bash
git add src/lib/secureStoreAdapter.ts src/lib/__tests__/secureStoreAdapter.test.ts src/lib/supabase.ts
git commit -m "feat(auth): persistir sessao do Supabase com SecureStore"
```

---

### Task 5: Helpers de validação de formulário

**Files:**
- Create: `src/utils/validation.ts`
- Create: `src/utils/__tests__/validation.test.ts`

**Interfaces:**
- Produces: `isValidEmail(email: string): boolean`, `isValidPassword(password: string): boolean`, `validateSignup(fullName, email, password, confirmPassword): SignupValidationResult` — usados pelas telas de Login (Task 7) e Cadastro (Task 8).

- [ ] **Step 1: Escrever os testes**

Crie `src/utils/__tests__/validation.test.ts`:

```typescript
import { isValidEmail, isValidPassword, validateSignup } from '../validation';

describe('isValidEmail', () => {
  it('accepts a well-formed email', () => {
    expect(isValidEmail('ana@example.com')).toBe(true);
  });

  it('rejects an email without @', () => {
    expect(isValidEmail('ana.example.com')).toBe(false);
  });

  it('rejects an email without domain', () => {
    expect(isValidEmail('ana@')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('accepts a password with 8 or more characters', () => {
    expect(isValidPassword('12345678')).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(isValidPassword('1234567')).toBe(false);
  });
});

describe('validateSignup', () => {
  it('is valid when every field is correct and passwords match', () => {
    const result = validateSignup('Ana Silva', 'ana@example.com', '12345678', '12345678');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('flags an empty full name', () => {
    const result = validateSignup('  ', 'ana@example.com', '12345678', '12345678');
    expect(result.valid).toBe(false);
    expect(result.errors.fullName).toBe('required');
  });

  it('flags an invalid email', () => {
    const result = validateSignup('Ana Silva', 'not-an-email', '12345678', '12345678');
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBe('invalid');
  });

  it('flags a short password', () => {
    const result = validateSignup('Ana Silva', 'ana@example.com', '123', '123');
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBe('tooShort');
  });

  it('flags mismatched password confirmation', () => {
    const result = validateSignup('Ana Silva', 'ana@example.com', '12345678', '87654321');
    expect(result.valid).toBe(false);
    expect(result.errors.confirmPassword).toBe('mismatch');
  });
});
```

- [ ] **Step 2: Rodar os testes para ver falhar**

Run: `npm test -- src/utils`
Expected: FAIL — não é possível encontrar o módulo `../validation`.

- [ ] **Step 3: Implementar os helpers**

Crie `src/utils/validation.ts`:

```typescript
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export interface SignupValidationResult {
  valid: boolean;
  errors: {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
}

export function validateSignup(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string
): SignupValidationResult {
  const errors: SignupValidationResult['errors'] = {};

  if (fullName.trim().length === 0) {
    errors.fullName = 'required';
  }
  if (!isValidEmail(email)) {
    errors.email = 'invalid';
  }
  if (!isValidPassword(password)) {
    errors.password = 'tooShort';
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'mismatch';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
```

- [ ] **Step 4: Rodar os testes para ver passar**

Run: `npm test -- src/utils`
Expected: PASS, 9 testes.

- [ ] **Step 5: Commit**

```bash
git add src/utils/validation.ts src/utils/__tests__/validation.test.ts
git commit -m "feat(auth): adicionar validacao de formularios de login e cadastro"
```

---

### Task 6: Auth store (Zustand)

**Files:**
- Create: `src/stores/useAuthStore.ts`
- Create: `src/stores/__tests__/useAuthStore.test.ts`

**Interfaces:**
- Consumes: `supabase` de `@/lib/supabase` (Task 4).
- Produces: `useAuthStore` com estado `{ session, user, isLoading, isInitialized, error }` e ações `initialize()`, `signUp(email, password, fullName)`, `signIn(email, password)`, `signOut()` — usado por `app/_layout.tsx` (Task 9), `app/(auth)/login.tsx` (Task 7), `app/(auth)/signup.tsx` (Task 8), `app/profile.tsx` (Task 11).

- [ ] **Step 1: Escrever os testes**

Crie `src/stores/__tests__/useAuthStore.test.ts`:

```typescript
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
```

- [ ] **Step 2: Rodar os testes para ver falhar**

Run: `npm test -- src/stores/__tests__/useAuthStore.test.ts`
Expected: FAIL — não é possível encontrar o módulo `../useAuthStore`.

- [ ] **Step 3: Implementar a store**

Crie `src/stores/useAuthStore.ts`:

```typescript
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthStore {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, user: data.session?.user ?? null, isInitialized: true });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signUp: async (email, password, fullName) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
    set({ isLoading: false, session: data.session, user: data.user });
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
    set({ isLoading: false, session: data.session, user: data.user });
  },

  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({ isLoading: false, session: null, user: null });
  },
}));
```

- [ ] **Step 4: Rodar os testes para ver passar**

Run: `npm test -- src/stores/__tests__/useAuthStore.test.ts`
Expected: PASS, 5 testes.

- [ ] **Step 5: Verificar typecheck**

Run: `npm run typecheck`
Expected: sucesso.

- [ ] **Step 6: Commit**

```bash
git add src/stores/useAuthStore.ts src/stores/__tests__/useAuthStore.test.ts
git commit -m "feat(auth): adicionar store de autenticacao (Zustand)"
```

---

### Task 7: Traduções de autenticação e perfil

**Files:**
- Modify: `src/locales/pt-BR.json`
- Modify: `src/locales/en.json`

**Interfaces:**
- Produces: chaves `auth.*`, `profile.*`, `settings.*` — consumidas pelas Tasks 8, 9, 11, 12.

- [ ] **Step 1: Substituir `src/locales/pt-BR.json` pelo conteúdo completo abaixo**

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
  },
  "auth": {
    "loginTitle": "Entrar",
    "signupTitle": "Criar conta",
    "email": "E-mail",
    "password": "Senha",
    "confirmPassword": "Confirmar senha",
    "fullName": "Nome completo",
    "loginButton": "Entrar",
    "signupButton": "Criar conta",
    "goToSignup": "Não tem conta? Criar conta",
    "goToLogin": "Já tem conta? Entrar",
    "invalidEmail": "Digite um e-mail válido",
    "passwordRequired": "Digite sua senha",
    "passwordTooShort": "A senha precisa ter no mínimo 8 caracteres",
    "passwordMismatch": "As senhas não coincidem",
    "nameRequired": "Digite seu nome",
    "loginFailed": "Não foi possível entrar. Verifique seu e-mail e senha",
    "signupFailed": "Não foi possível criar sua conta. Tente novamente"
  },
  "profile": {
    "changePhoto": "Trocar foto",
    "permissionDenied": "Precisamos de acesso às suas fotos para trocar o avatar",
    "uploadFailed": "Não foi possível enviar a foto",
    "saved": "Salvo com sucesso",
    "saveFailed": "Não foi possível salvar",
    "logout": "Sair"
  },
  "settings": {
    "language": "Idioma",
    "theme": "Tema",
    "themeLight": "Claro",
    "themeDark": "Escuro",
    "themeAuto": "Automático",
    "currency": "Moeda"
  }
}
```

- [ ] **Step 2: Substituir `src/locales/en.json` pelo conteúdo completo abaixo**

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
  },
  "auth": {
    "loginTitle": "Log in",
    "signupTitle": "Create account",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm password",
    "fullName": "Full name",
    "loginButton": "Log in",
    "signupButton": "Create account",
    "goToSignup": "No account? Create one",
    "goToLogin": "Already have an account? Log in",
    "invalidEmail": "Enter a valid email",
    "passwordRequired": "Enter your password",
    "passwordTooShort": "Password must be at least 8 characters",
    "passwordMismatch": "Passwords do not match",
    "nameRequired": "Enter your name",
    "loginFailed": "Could not log in. Check your email and password",
    "signupFailed": "Could not create your account. Please try again"
  },
  "profile": {
    "changePhoto": "Change photo",
    "permissionDenied": "We need access to your photos to change the avatar",
    "uploadFailed": "Could not upload the photo",
    "saved": "Saved successfully",
    "saveFailed": "Could not save",
    "logout": "Log out"
  },
  "settings": {
    "language": "Language",
    "theme": "Theme",
    "themeLight": "Light",
    "themeDark": "Dark",
    "themeAuto": "Automatic",
    "currency": "Currency"
  }
}
```

- [ ] **Step 3: Verificar que os JSONs são válidos**

Run: `node -e "require('./src/locales/pt-BR.json'); require('./src/locales/en.json'); console.log('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add src/locales/pt-BR.json src/locales/en.json
git commit -m "feat(i18n): adicionar traducoes de autenticacao, perfil e configuracoes"
```

---

### Task 8: Tela de Login

**Files:**
- Create: `app/(auth)/_layout.tsx`
- Create: `app/(auth)/login.tsx`

**Interfaces:**
- Consumes: `useAuthStore` (Task 6, `signIn`/`isLoading`), `isValidEmail` (Task 5), chaves `auth.*` (Task 7).
- Produces: rota `/login`.

- [ ] **Step 1: Criar o layout do grupo `(auth)`**

Crie `app/(auth)/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- [ ] **Step 2: Criar a tela de login**

Crie `app/(auth)/login.tsx`:

```typescript
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { isValidEmail } from '@/utils/validation';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async () => {
    setFormError('');
    if (!isValidEmail(email)) {
      setFormError(t('auth.invalidEmail'));
      return;
    }
    if (password.length === 0) {
      setFormError(t('auth.passwordRequired'));
      return;
    }
    try {
      await signIn(email, password);
      router.replace('/');
    } catch {
      setFormError(t('auth.loginFailed'));
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {t('auth.loginTitle')}
      </Text>
      <TextInput
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        testID="login-email"
      />
      <TextInput
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        testID="login-password"
      />
      {formError ? (
        <HelperText type="error" visible testID="login-error">
          {formError}
        </HelperText>
      ) : null}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
        testID="login-submit"
      >
        {t('auth.loginButton')}
      </Button>
      <Link href="/signup" asChild>
        <Button mode="text">{t('auth.goToSignup')}</Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 12 },
  title: { marginBottom: 16 },
  input: { marginBottom: 4 },
  button: { marginTop: 12 },
});
```

- [ ] **Step 3: Verificar typecheck**

Run: `npm run typecheck`
Expected: sucesso.

- [ ] **Step 4: Commit**

```bash
git add app/(auth)/_layout.tsx app/(auth)/login.tsx
git commit -m "feat(auth): adicionar tela de login"
```

---

### Task 9: Tela de Cadastro

**Files:**
- Create: `app/(auth)/signup.tsx`

**Interfaces:**
- Consumes: `useAuthStore` (Task 6, `signUp`/`isLoading`), `validateSignup` (Task 5), chaves `auth.*` (Task 7).
- Produces: rota `/signup`.

- [ ] **Step 1: Criar a tela de cadastro**

Crie `app/(auth)/signup.tsx`:

```typescript
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { validateSignup } from '@/utils/validation';

export default function SignupScreen() {
  const { t } = useTranslation();
  const { signUp, isLoading } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async () => {
    setFormError('');
    const result = validateSignup(fullName, email, password, confirmPassword);
    if (!result.valid) {
      if (result.errors.fullName) setFormError(t('auth.nameRequired'));
      else if (result.errors.email) setFormError(t('auth.invalidEmail'));
      else if (result.errors.password) setFormError(t('auth.passwordTooShort'));
      else if (result.errors.confirmPassword) setFormError(t('auth.passwordMismatch'));
      return;
    }
    try {
      await signUp(email, password, fullName.trim());
      router.replace('/');
    } catch {
      setFormError(t('auth.signupFailed'));
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {t('auth.signupTitle')}
      </Text>
      <TextInput
        label={t('auth.fullName')}
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        testID="signup-name"
      />
      <TextInput
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        testID="signup-email"
      />
      <TextInput
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        testID="signup-password"
      />
      <TextInput
        label={t('auth.confirmPassword')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
        testID="signup-confirm-password"
      />
      {formError ? (
        <HelperText type="error" visible testID="signup-error">
          {formError}
        </HelperText>
      ) : null}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
        testID="signup-submit"
      >
        {t('auth.signupButton')}
      </Button>
      <Link href="/login" asChild>
        <Button mode="text">{t('auth.goToLogin')}</Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 12 },
  title: { marginBottom: 16 },
  input: { marginBottom: 4 },
  button: { marginTop: 12 },
});
```

- [ ] **Step 2: Verificar typecheck**

Run: `npm run typecheck`
Expected: sucesso.

- [ ] **Step 3: Commit**

```bash
git add app/(auth)/signup.tsx
git commit -m "feat(auth): adicionar tela de cadastro"
```

---

### Task 10: Proteção de rotas no layout raiz

**Files:**
- Modify: `app/_layout.tsx`
- Create: `app/__tests__/_layout.test.tsx`

**Interfaces:**
- Consumes: `useAuthStore` (Task 6, `session`/`isInitialized`/`initialize`), rotas `/login` (Task 8) e `/` (já existe).

- [ ] **Step 1: Escrever o teste**

Crie `app/__tests__/_layout.test.tsx`:

```typescript
import { render } from '@testing-library/react-native';
import RootLayout from '../_layout';

const replaceMock = jest.fn();

jest.mock('expo-router', () => ({
  Stack: () => null,
  useRouter: () => ({ replace: replaceMock }),
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
    replaceMock.mockClear();
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

    expect(replaceMock).toHaveBeenCalledWith('/login');
  });

  it('redirects to / when there is a session inside the auth group', () => {
    (useSegments as jest.Mock).mockReturnValue(['(auth)', 'login']);
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      session: { access_token: 'abc' },
      isInitialized: true,
      initialize: jest.fn(),
    });

    render(<RootLayout />);

    expect(replaceMock).toHaveBeenCalledWith('/');
  });

  it('does not redirect until auth is initialized', () => {
    (useSegments as jest.Mock).mockReturnValue(['']);
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      session: null,
      isInitialized: false,
      initialize: jest.fn(),
    });

    render(<RootLayout />);

    expect(replaceMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar o teste para ver falhar**

Run: `npm test -- app/__tests__/_layout.test.tsx`
Expected: FAIL — `RootLayout` ainda não chama `useAuthStore`/redireciona.

- [ ] **Step 3: Modificar o layout raiz**

Substitua o conteúdo de `app/_layout.tsx` por:

```typescript
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import '@/lib/i18n';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { lightTheme, darkTheme } from '@/lib/theme';

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const { theme, hydrate } = useSettingsStore();
  const { session, isInitialized, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    hydrate();
    initialize();
  }, [hydrate, initialize]);

  useEffect(() => {
    if (!isInitialized) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/login');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [session, isInitialized, segments, router]);

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
            contentStyle: { backgroundColor: paperTheme.colors.background },
          }}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 4: Rodar o teste para ver passar**

Run: `npm test -- app/__tests__/_layout.test.tsx`
Expected: PASS, 3 testes.

- [ ] **Step 5: Verificar typecheck**

Run: `npm run typecheck`
Expected: sucesso.

- [ ] **Step 6: Commit**

```bash
git add app/_layout.tsx app/__tests__/_layout.test.tsx
git commit -m "feat(auth): proteger rotas redirecionando por estado de sessao"
```

---

### Task 11: Funções de acesso ao perfil (Supabase)

**Files:**
- Create: `src/lib/profile.ts`
- Create: `src/lib/__tests__/profile.test.ts`

**Interfaces:**
- Consumes: `supabase` (Task 4), `Profile` (Task 3).
- Produces: `fetchProfile(userId): Promise<Profile>`, `updateProfile(userId, updates): Promise<Profile>`, `uploadAvatar(userId, fileUri): Promise<string>` — usados por `app/profile.tsx` (Task 12) e `app/settings.tsx` (Task 13).

- [ ] **Step 1: Escrever os testes**

Crie `src/lib/__tests__/profile.test.ts`:

```typescript
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
```

- [ ] **Step 2: Rodar os testes para ver falhar**

Run: `npm test -- src/lib/__tests__/profile.test.ts`
Expected: FAIL — não é possível encontrar o módulo `../profile`.

- [ ] **Step 3: Implementar `src/lib/profile.ts`**

```typescript
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
```

- [ ] **Step 4: Rodar os testes para ver passar**

Run: `npm test -- src/lib/__tests__/profile.test.ts`
Expected: PASS, 4 testes.

- [ ] **Step 5: Verificar typecheck**

Run: `npm run typecheck`
Expected: sucesso.

- [ ] **Step 6: Commit**

```bash
git add src/lib/profile.ts src/lib/__tests__/profile.test.ts
git commit -m "feat(profile): adicionar funcoes de leitura, atualizacao e upload de avatar"
```

---

### Task 12: Tela de Perfil

**Files:**
- Create: `app/profile.tsx`
- Modify: `app/index.tsx`

**Interfaces:**
- Consumes: `useAuthStore` (Task 6, `user`/`signOut`), `fetchProfile`/`updateProfile`/`uploadAvatar` (Task 11), chaves `profile.*`/`auth.fullName`/`common.save` (Task 7).
- Produces: rota `/profile`.

- [ ] **Step 1: Criar a tela de perfil**

Crie `app/profile.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, TextInput, Button, Avatar, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { fetchProfile, updateProfile, uploadAvatar } from '@/lib/profile';
import type { Profile } from '@/types';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, signOut } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then((p) => {
      setProfile(p);
      setFullName(p.fullName);
    });
  }, [user]);

  const handlePickImage = async () => {
    if (!user) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setStatusMessage(t('profile.permissionDenied'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled) return;

    setIsUploading(true);
    try {
      const avatarUrl = await uploadAvatar(user.id, result.assets[0].uri);
      const updated = await updateProfile(user.id, { avatarUrl });
      setProfile(updated);
    } catch {
      setStatusMessage(t('profile.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setStatusMessage('');
    try {
      const updated = await updateProfile(user.id, { fullName: fullName.trim() });
      setProfile(updated);
      setStatusMessage(t('profile.saved'));
    } catch {
      setStatusMessage(t('profile.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profile.avatarUrl ? (
        <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
      ) : (
        <Avatar.Text size={96} label={(profile.fullName || '?').charAt(0).toUpperCase()} />
      )}
      <Button onPress={handlePickImage} loading={isUploading} disabled={isUploading} testID="pick-avatar">
        {t('profile.changePhoto')}
      </Button>
      <TextInput
        label={t('auth.fullName')}
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        testID="profile-name"
      />
      {statusMessage ? <Text testID="profile-status">{statusMessage}</Text> : null}
      <Button mode="contained" onPress={handleSave} loading={isSaving} disabled={isSaving} testID="profile-save">
        {t('common.save')}
      </Button>
      <Link href="/settings" asChild>
        <Button mode="outlined">{t('settings.language')} / {t('settings.theme')}</Button>
      </Link>
      <Button mode="outlined" onPress={() => signOut()} testID="profile-logout" style={styles.logout}>
        {t('profile.logout')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  input: { width: '100%' },
  logout: { marginTop: 24 },
});
```

- [ ] **Step 2: Adicionar link para o Perfil na Home**

Abra `app/index.tsx`. Adicione o import `Link` de `expo-router` e um botão de navegação. Substitua o conteúdo completo do arquivo por:

```typescript
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Link } from 'expo-router';
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
      <Link href="/profile" asChild>
        <Button mode="outlined" style={styles.button} testID="go-to-profile">
          {t('tabs.profile')}
        </Button>
      </Link>
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

Run: `npm run typecheck`
Expected: sucesso.

- [ ] **Step 4: Commit**

```bash
git add app/profile.tsx app/index.tsx
git commit -m "feat(profile): adicionar tela de perfil com upload de foto"
```

---

### Task 13: Tela de Configurações

**Files:**
- Create: `app/settings.tsx`

**Interfaces:**
- Consumes: `useSettingsStore` (existente), `useAuthStore` (Task 6, `user`), `updateProfile` (Task 11), chaves `settings.*` (Task 7).
- Produces: rota `/settings`.

- [ ] **Step 1: Criar a tela de configurações**

Crie `app/settings.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, SegmentedButtons, TextInput, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { updateProfile } from '@/lib/profile';
import type { Language, ThemeMode } from '@/types';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { language, theme, currency, setLanguage, setTheme, setCurrency } = useSettingsStore();
  const [currencyInput, setCurrencyInput] = useState(currency);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setCurrencyInput(currency);
  }, [currency]);

  const handleLanguageChange = async (value: string) => {
    const next = value as Language;
    await setLanguage(next);
    i18n.changeLanguage(next);
    if (user) await updateProfile(user.id, { language: next });
  };

  const handleThemeChange = async (value: string) => {
    const next = value as ThemeMode;
    await setTheme(next);
    if (user) await updateProfile(user.id, { theme: next });
  };

  const handleCurrencySave = async () => {
    const next = currencyInput.trim().toUpperCase();
    await setCurrency(next);
    if (user) await updateProfile(user.id, { currency: next });
    setStatusMessage(t('profile.saved'));
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium">{t('settings.language')}</Text>
      <SegmentedButtons
        value={language}
        onValueChange={handleLanguageChange}
        buttons={[
          { value: 'pt-BR', label: 'Português' },
          { value: 'en', label: 'English' },
        ]}
        style={styles.field}
      />

      <Text variant="titleMedium">{t('settings.theme')}</Text>
      <SegmentedButtons
        value={theme}
        onValueChange={handleThemeChange}
        buttons={[
          { value: 'light', label: t('settings.themeLight') },
          { value: 'dark', label: t('settings.themeDark') },
          { value: 'auto', label: t('settings.themeAuto') },
        ]}
        style={styles.field}
      />

      <Text variant="titleMedium">{t('settings.currency')}</Text>
      <TextInput
        value={currencyInput}
        onChangeText={setCurrencyInput}
        autoCapitalize="characters"
        maxLength={3}
        style={styles.field}
        testID="settings-currency"
      />
      <Button mode="contained" onPress={handleCurrencySave} testID="settings-save-currency">
        {t('common.save')}
      </Button>
      {statusMessage ? <Text testID="settings-status">{statusMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 8 },
  field: { marginBottom: 16 },
});
```

- [ ] **Step 2: Verificar typecheck**

Run: `npm run typecheck`
Expected: sucesso.

- [ ] **Step 3: Commit**

```bash
git add app/settings.tsx
git commit -m "feat(settings): adicionar tela de configuracoes sincronizada com o perfil"
```

---

### Task 14: Rodar a suíte completa e atualizar o README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Rodar toda a suíte de testes**

Run: `npm test`
Expected: todos os testes de todas as tasks anteriores passando (types, secureStoreAdapter, validation, useAuthStore, profile, _layout — mínimo 25 testes).

- [ ] **Step 2: Rodar o typecheck completo**

Run: `npm run typecheck`
Expected: sucesso, sem erros.

- [ ] **Step 3: Atualizar o README**

Abra `README.md` e substitua a seção `## Setup` para incluir o passo do Supabase, e adicione uma seção `## Testes`:

```markdown
## Setup

1. Instalar dependências:
\`\`\`bash
npm install
\`\`\`

2. Criar um projeto em [supabase.com](https://supabase.com), copiar a URL e a chave anônima (Settings → API), e rodar o SQL de `supabase/migrations/0001_profiles.sql` no SQL Editor do projeto.

3. Configurar variáveis de ambiente:
\`\`\`bash
cp .env.example .env
\`\`\`
Preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` com as credenciais do passo anterior.

4. Rodar o app:
\`\`\`bash
npx expo start
\`\`\`

## Testes

\`\`\`bash
npm test
\`\`\`
```

Mantenha as demais seções (`## Stack`, `## Estrutura`, `## Status`) como estão.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: documentar setup do Supabase e comando de testes"
```

---

## Self-Review do Plano

1. **Spec coverage:** Autenticação (e-mail/senha), perfil com foto, configurações (idioma/tema/moeda), logout, RLS em `profiles` e no bucket `avatars` — todos cobertos (Tasks 2–13). Confirmação de e-mail documentada como passo opcional a desabilitar em dev (Task 2, Step 4). "Excluir conta" (LGPD) e telas de tarefas/foco/rotina/finanças ficam para planos futuros, como já indicado no Plano 01.
2. **Placeholders:** Nenhum — todo código é completo e executável, sem TODOs.
3. **Type consistency:** `Profile` (Task 3) é usado com os mesmos nomes de campo em `src/lib/profile.ts` (Task 11), `app/profile.tsx` (Task 12) e `app/settings.tsx` (Task 13). `useAuthStore`'s `signIn`/`signUp`/`signOut`/`initialize` (Task 6) são chamados com as mesmas assinaturas em todas as telas que os consomem.
4. **Dependência externa:** Task 2 é manual (criar conta/projeto Supabase) — sem ela, Tasks 6 em diante rodam e passam nos testes (que mockam o Supabase), mas o app real só autentica de verdade depois que `.env` tiver credenciais reais.

---

## Próximo Plano

**Plano 03 — Tarefas (CRUD)** deve cobrir: tabela `tasks` (já desenhada na spec), tela de lista com filtros, criar/editar/concluir/arquivar, e a primeira aba real do app (o grupo `(tabs)` da spec só faz sentido a partir daqui, quando há mais de uma tela de conteúdo além de Perfil/Configurações).
