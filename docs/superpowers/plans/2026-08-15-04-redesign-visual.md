# Clareza TDAH — Plano 04: Redesign Visual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar a paleta de cores Material Design 3 e o estilo visual definidos em mockups de referência (gerados no Google Stitch, seedados com as cores de marca já usadas no app) às 6 telas hoje funcionais — Login, Cadastro, Home, Lista de Tarefas, Formulário de Tarefa e Perfil/Configurações — sem alterar nenhuma lógica de negócio, chamada de API ou comportamento já testado.

**Architecture:** Este é um plano puramente de camada de apresentação. `src/lib/theme.ts` ganha o conjunto completo de tokens de cor MD3 (Task 1) — fonte única de verdade, consumida automaticamente por todo componente do React Native Paper. Cada tela subsequente (Tasks 3–9) mantém 100% dos hooks, handlers e chamadas de store já existentes; só a árvore de JSX/estilos muda, trocando `View`s simples por `Surface` (cards com elevação temática), adicionando ícones via `MaterialCommunityIcons` (já funciona no projeto, usado em `FAB`/`IconButton` desde o Plano 03) e configurando títulos de tela via `<Stack.Screen options={{ title }} />` no lugar do nome cru da rota.

**Tech Stack:** Expo SDK 50, TypeScript 5 (strict), Expo Router 3, React Native Paper 5 (MD3), react-i18next. Nenhuma dependência nova.

## Global Constraints

- A paleta definida na Task 1 (`src/lib/theme.ts`) é a única fonte de cores — nenhuma cor hexadecimal deve aparecer hardcoded fora dela. Componentes usam os componentes temáticos do Paper (`Surface`, `Button`, `TextInput`, `Chip`, etc.), que herdam o tema automaticamente via `PaperProvider` (já configurado em `app/_layout.tsx`).
- Ícones via nomes do MaterialCommunityIcons (conjunto padrão do React Native Paper/Expo — já usado em `FAB icon="plus"` e `IconButton icon="archive-outline"` no Plano 03, sem configuração extra). Se um nome de ícone não existir nessa biblioteca, use o mais próximo semanticamente e documente a troca no commit.
- **Nenhuma mudança de comportamento além do visual.** Hooks, chamadas de store, validações e testes existentes permanecem intactos — o que muda é a árvore de JSX e os estilos. Nenhuma task deste plano deve tocar `src/stores/`, `src/lib/tasks.ts`, `src/lib/profile.ts` ou qualquer teste existente.
- **Sem dados fictícios.** Nenhuma tela exibe números ou textos inventados (o mockup de Perfil mostra "142 Tarefas Concluídas" e "7 Dias de Sequência de Foco" como exemplo — o app só implementa contagem real de tarefas concluídas; "sequência de foco" não existe ainda e não entra na tela).
- **Fora de escopo** (explicitamente, para não haver ambiguidade durante a execução): categorias, subtarefas e campo de horário em "Nova Tarefa" (mudariam o modelo de dados da Task 2 do Plano 03); login social com Google (precisa de configuração OAuth no Supabase que não existe); navegação por abas (ainda não faz sentido com poucas telas de conteúdo real, conforme já decidido no Plano 03).
- Todas as strings de UI passam por `t('chave')` — zero hardcoded em componentes.
- Botões e áreas de toque com no mínimo 48x48dp (componentes do Paper já atendem isso por padrão).
- Commits em português, formato: `tipo(escopo): descrição`.
- Nenhuma das 6 telas deste plano tem teste unitário hoje (consistente com o padrão já estabelecido nos Planos 02/03: telas são verificadas por typecheck, não por testes de render) — as tasks deste plano seguem o mesmo padrão, verificadas por `npm run typecheck` + `npm test` (para garantir que a suíte existente continua passando, já que nenhuma lógica muda).

## Current State (o que já existe, não recriar)

- `src/lib/theme.ts`: hoje define `lightTheme`/`darkTheme` com um subconjunto pequeno de cores (`primary`, `secondary`, `background`, `surface`) sobre `MD3LightTheme`/`MD3DarkTheme` do Paper, mais os exports não usados em nenhum outro arquivo `PRIMARY`/`PRIMARY_DARK` (confirmado via grep — podem ser removidos com segurança).
- `app/_layout.tsx`: já configura `Stack` com `headerStyle.backgroundColor: paperTheme.colors.primary` e `headerTintColor: '#fff'` — ou seja, qualquer tela dentro do Stack principal (Home, Tarefas, Formulário de Tarefa, Perfil, Configurações) **já ganha automaticamente** uma barra superior na cor primária com texto branco; hoje elas só mostram o nome cru da rota como título ("index", "tasks", "task-form", "profile", "settings") porque nenhuma configura `<Stack.Screen options={{ title }} />`. Este plano corrige isso tela por tela.
- `app/(auth)/_layout.tsx`: usa `headerShown: false` — Login e Cadastro continuam sem barra superior, o que já bate com os mockups (cartão centralizado, sem app bar).
- Todas as 6 telas já têm lógica 100% funcional (auth, CRUD de tarefas, perfil, configurações) — este plano não adiciona nem remove nenhuma capacidade, só reestiliza.
- `docs/superpowers/specs/2026-08-13-clareza-tdah-design.md`: spec original do projeto — as cores de marca usadas nele (`#6366f1` primary, `#8b5cf6` secondary, `#818cf8`/`#a78bfa` variantes dark) foram o "seed" usado para gerar a paleta MD3 completa deste plano; os tokens de dark mode já batem exatamente com o que está em `theme.ts` hoje, então a Task 1 só amplia o **light theme** com o conjunto completo de papéis de cor MD3 (o dark theme já está correto e ganha só os mesmos 4 overrides que já tinha).

---

### Task 1: Paleta de cores MD3 completa

**Files:**
- Modify: `src/lib/theme.ts`

**Interfaces:**
- Consumes: `MD3LightTheme`, `MD3DarkTheme`, `MD3Theme` de `react-native-paper` (já em uso).
- Produces: `lightTheme`, `darkTheme` com o conjunto completo de papéis de cor MD3 — consumidos automaticamente por `PaperProvider` em `app/_layout.tsx` (já existente) e por todo componente do Paper usado nas Tasks 3–9.

- [ ] **Step 1: Substituir o conteúdo de `src/lib/theme.ts`**

```typescript
import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4648d4',
    onPrimary: '#ffffff',
    primaryContainer: '#6063ee',
    onPrimaryContainer: '#fffbff',
    secondary: '#6b38d4',
    onSecondary: '#ffffff',
    secondaryContainer: '#8455ef',
    onSecondaryContainer: '#fffbff',
    tertiary: '#904900',
    onTertiary: '#ffffff',
    tertiaryContainer: '#b55d00',
    onTertiaryContainer: '#fffbff',
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
    background: '#f9f9f9',
    onBackground: '#1a1c1c',
    surface: '#f9f9f9',
    onSurface: '#1a1c1c',
    surfaceVariant: '#e2e2e2',
    onSurfaceVariant: '#464554',
    outline: '#767586',
    outlineVariant: '#c7c4d7',
    inverseSurface: '#2f3131',
    inverseOnSurface: '#f0f1f1',
    inversePrimary: '#c0c1ff',
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
```

Note: os exports `PRIMARY`/`PRIMARY_DARK` do arquivo antigo foram removidos — confirmado via grep que nenhum outro arquivo os importa.

- [ ] **Step 2: Verificar typecheck**

Run: `npm run typecheck`
Expected: sucesso, sem erros (todas as chaves de cor usadas — `primary`, `onPrimary`, `primaryContainer`, etc. — já existem no tipo `MD3Theme['colors']` do react-native-paper).

- [ ] **Step 3: Rodar a suíte de testes**

Run: `npm test`
Expected: PASS, todos os testes existentes continuam passando (nenhuma lógica mudou, só cores).

- [ ] **Step 4: Commit**

```bash
git add src/lib/theme.ts
git commit -m "feat(theme): adicionar paleta MD3 completa"
```

---

### Task 2: Novas traduções para o redesign

**Files:**
- Modify: `src/locales/pt-BR.json`
- Modify: `src/locales/en.json`

**Interfaces:**
- Produces: `auth.showPassword`, `auth.hidePassword`, `home.nextTasksEmpty`, `home.routineComingSoon`, `profile.tasksCompleted`, `settings.title` — consumidos pelas Tasks 3, 5, 6 (task-form reaproveita `tasks.loadFailed` já existente), 8 e 9.

- [ ] **Step 1: Adicionar as chaves em `src/locales/pt-BR.json`**

Dentro do objeto `"auth"`, adicione (em qualquer posição dentro do objeto):

```json
"showPassword": "Mostrar senha",
"hidePassword": "Ocultar senha",
```

Dentro do objeto `"home"`, adicione:

```json
"nextTasksEmpty": "Nenhuma tarefa agendada para agora.",
"routineComingSoon": "Em breve",
```

Dentro do objeto `"profile"`, adicione:

```json
"tasksCompleted": "Tarefas concluídas",
```

Dentro do objeto `"settings"`, adicione:

```json
"title": "Configurações",
```

- [ ] **Step 2: Adicionar as chaves equivalentes em `src/locales/en.json`**

Dentro do objeto `"auth"`:

```json
"showPassword": "Show password",
"hidePassword": "Hide password",
```

Dentro do objeto `"home"`:

```json
"nextTasksEmpty": "No tasks scheduled for now.",
"routineComingSoon": "Coming soon",
```

Dentro do objeto `"profile"`:

```json
"tasksCompleted": "Tasks completed",
```

Dentro do objeto `"settings"`:

```json
"title": "Settings",
```

- [ ] **Step 3: Verificar que os JSONs são válidos**

Run: `node -e "require('./src/locales/pt-BR.json'); require('./src/locales/en.json'); console.log('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add src/locales/pt-BR.json src/locales/en.json
git commit -m "feat(i18n): adicionar traducoes do redesign visual"
```

---

### Task 3: Tela de Login

**Files:**
- Modify: `app/(auth)/login.tsx`

**Interfaces:**
- Consumes: `useAuthStore` (inalterado), `isValidEmail` (inalterado), paleta da Task 1, chaves `auth.showPassword`/`auth.hidePassword` da Task 2.
- Não produz nada novo — mantém a rota `/login` e todos os `testID`s existentes (`login-email`, `login-password`, `login-error`, `login-submit`).

- [ ] **Step 1: Substituir o conteúdo de `app/(auth)/login.tsx`**

```typescript
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText, Avatar, Surface } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { isValidEmail } from '@/utils/validation';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <View style={styles.screen}>
      <Surface style={styles.card} elevation={2}>
        <View style={styles.header}>
          <Avatar.Icon size={64} icon="brain" style={styles.avatar} />
          <Text variant="headlineSmall" style={styles.title}>
            {t('auth.loginTitle')}
          </Text>
        </View>
        <TextInput
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          left={<TextInput.Icon icon="email-outline" />}
          style={styles.input}
          testID="login-email"
        />
        <TextInput
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock-outline" />}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              accessibilityLabel={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              onPress={() => setShowPassword((prev) => !prev)}
            />
          }
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
          icon="login"
          style={styles.button}
          testID="login-submit"
        >
          {t('auth.loginButton')}
        </Button>
        <Link href="/signup" asChild>
          <Button mode="text">{t('auth.goToSignup')}</Button>
        </Link>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { borderRadius: 16, padding: 24, gap: 4 },
  header: { alignItems: 'center', gap: 8, marginBottom: 16 },
  avatar: { marginBottom: 4 },
  title: { textAlign: 'center' },
  input: { marginBottom: 4 },
  button: { marginTop: 12 },
});
```

- [ ] **Step 2: Verificar typecheck**

Run: `npm run typecheck`
Expected: sucesso.

- [ ] **Step 3: Commit**

```bash
git add app/(auth)/login.tsx
git commit -m "feat(design): redesenhar tela de login"
```

---

### Task 4: Tela de Cadastro

**Files:**
- Modify: `app/(auth)/signup.tsx`

**Interfaces:**
- Consumes: `useAuthStore`, `validateSignup` (inalterados), paleta da Task 1, chaves `auth.showPassword`/`auth.hidePassword` da Task 2.
- Não produz nada novo — mantém a rota `/signup` e todos os `testID`s existentes.

- [ ] **Step 1: Substituir o conteúdo de `app/(auth)/signup.tsx`**

```typescript
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText, Avatar, Surface } from 'react-native-paper';
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
  const [showPassword, setShowPassword] = useState(false);
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
    <View style={styles.screen}>
      <Surface style={styles.card} elevation={2}>
        <View style={styles.header}>
          <Avatar.Icon size={64} icon="brain" style={styles.avatar} />
          <Text variant="headlineSmall" style={styles.title}>
            {t('auth.signupTitle')}
          </Text>
        </View>
        <TextInput
          label={t('auth.fullName')}
          value={fullName}
          onChangeText={setFullName}
          left={<TextInput.Icon icon="account-outline" />}
          style={styles.input}
          testID="signup-name"
        />
        <TextInput
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          left={<TextInput.Icon icon="email-outline" />}
          style={styles.input}
          testID="signup-email"
        />
        <TextInput
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock-outline" />}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              accessibilityLabel={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              onPress={() => setShowPassword((prev) => !prev)}
            />
          }
          style={styles.input}
          testID="signup-password"
        />
        <TextInput
          label={t('auth.confirmPassword')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock-check-outline" />}
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
          icon="account-plus-outline"
          style={styles.button}
          testID="signup-submit"
        >
          {t('auth.signupButton')}
        </Button>
        <Link href="/login" asChild>
          <Button mode="text">{t('auth.goToLogin')}</Button>
        </Link>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { borderRadius: 16, padding: 24, gap: 4 },
  header: { alignItems: 'center', gap: 8, marginBottom: 16 },
  avatar: { marginBottom: 4 },
  title: { textAlign: 'center' },
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
git commit -m "feat(design): redesenhar tela de cadastro"
```

---

### Task 5: Tela Home

**Files:**
- Modify: `app/index.tsx`

**Interfaces:**
- Consumes: `useSettingsStore` (inalterado), `useAuthStore.user` (já existe no projeto), `useTaskStore` (`tasks`, `fetchTasks` — Plano 03), paleta da Task 1, chaves `home.nextTasksEmpty`/`home.routineComingSoon` da Task 2.
- Mantém os `testID`s `go-to-profile` e `go-to-tasks`; adiciona `go-to-settings` (a Home passa a linkar direto para `/settings` também, já que ainda não há navegação por abas).

- [ ] **Step 1: Substituir o conteúdo de `app/index.tsx`**

```typescript
import { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, IconButton } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTaskStore } from '@/stores/useTaskStore';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { language, setLanguage, theme, setTheme } = useSettingsStore();
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();

  useEffect(() => {
    if (user) fetchTasks(user.id);
  }, [user, fetchTasks]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greetingMorning');
    if (hour < 18) return t('home.greetingAfternoon');
    return t('home.greetingEvening');
  })();

  const nextTasks = tasks
    .filter((task) => task.status === 'pending')
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return b.priority - a.priority;
    })
    .slice(0, 3);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: t('common.appName'),
          headerLeft: () => (
            <IconButton
              icon="account-circle"
              iconColor="#fff"
              onPress={() => router.push('/profile')}
              testID="go-to-profile"
            />
          ),
          headerRight: () => (
            <IconButton
              icon="cog-outline"
              iconColor="#fff"
              onPress={() => router.push('/settings')}
              testID="go-to-settings"
            />
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.greeting}>
          <Text variant="headlineMedium" style={styles.greetingText}>
            {greeting} 👋
          </Text>
        </View>
        <Surface style={styles.card} elevation={1}>
          <Text variant="bodyMedium">
            {t('settings.language')}: {language}
          </Text>
          <Text variant="bodyMedium">
            {t('settings.theme')}: {theme}
          </Text>
          <View style={styles.row}>
            <Button mode="contained" onPress={() => setLanguage(language === 'pt-BR' ? 'en' : 'pt-BR')}>
              {t('settings.language')}
            </Button>
            <Button
              mode="outlined"
              onPress={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light')}
            >
              {t('settings.theme')}
            </Button>
          </View>
        </Surface>
        <Surface style={styles.card} elevation={1}>
          <Button
            mode="text"
            icon="check-circle-outline"
            onPress={() => router.push('/tasks')}
            contentStyle={styles.cardHeaderButton}
            testID="go-to-tasks"
          >
            {t('home.nextTasks')}
          </Button>
          {nextTasks.length === 0 ? (
            <Text variant="bodyMedium" style={styles.emptyText}>
              {t('home.nextTasksEmpty')}
            </Text>
          ) : (
            nextTasks.map((task) => (
              <Text key={task.id} variant="bodyMedium" style={styles.taskRow}>
                {task.title}
              </Text>
            ))
          )}
        </Surface>
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium">{t('home.currentRoutine')}</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {t('home.routineComingSoon')}
          </Text>
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 24, gap: 16 },
  greeting: { alignItems: 'center', marginBottom: 8 },
  greetingText: { textAlign: 'center' },
  card: { borderRadius: 16, padding: 16, gap: 8 },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cardHeaderButton: { justifyContent: 'flex-start' },
  emptyText: { opacity: 0.6 },
  taskRow: { paddingVertical: 4 },
});
```

- [ ] **Step 2: Verificar typecheck**

Run: `npm run typecheck`
Expected: sucesso.

- [ ] **Step 3: Commit**

```bash
git add app/index.tsx
git commit -m "feat(design): redesenhar tela Home com card de proximas tarefas real"
```

---

### Task 6: Tela de Lista de Tarefas

**Files:**
- Modify: `app/tasks.tsx`

**Interfaces:**
- Consumes: `useAuthStore`, `useTaskStore` (inalterados — mesmas ações `fetchTasks`/`completeTask`/`archiveTask`), paleta da Task 1, chaves `tasks.*` já existentes (Plano 03).
- Mantém rota `/tasks` e os `testID`s `task-complete-{id}`, `task-archive-{id}`, `task-create`, `tasks-error`; renomeia o antigo `task-row-{id}` (que ficava no `List.Item` inteiro) para o `Surface` do card, e adiciona `task-open-{id}` na área tocável que navega para edição (o toque em qualquer lugar do card fora dos botões abre `/task-form?id=...`).

- [ ] **Step 1: Substituir o conteúdo de `app/tasks.tsx`**

```typescript
import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Pressable } from 'react-native';
import { Text, Chip, IconButton, FAB, ActivityIndicator, Surface, HelperText } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTaskStore } from '@/stores/useTaskStore';
import type { Task, TaskStatus } from '@/types';

export default function TasksScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { tasks, isLoading, error, fetchTasks, completeTask, archiveTask } = useTaskStore();
  const [filter, setFilter] = useState<TaskStatus>('pending');

  useEffect(() => {
    if (user) fetchTasks(user.id);
  }, [user, fetchTasks]);

  const filteredTasks = tasks.filter((task) => task.status === filter);

  const priorityLabel = (priority: Task['priority']) =>
    priority === 3
      ? t('tasks.priorityHigh')
      : priority === 1
        ? t('tasks.priorityLow')
        : t('tasks.priorityMedium');

  const filters: { value: TaskStatus; label: string }[] = [
    { value: 'pending', label: t('tasks.filterPending') },
    { value: 'done', label: t('tasks.filterDone') },
    { value: 'archived', label: t('tasks.filterArchived') },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('tabs.tasks') }} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filters.map((item) => (
          <Chip
            key={item.value}
            selected={filter === item.value}
            onPress={() => setFilter(item.value)}
            style={styles.chip}
            testID={`filter-${item.value}`}
          >
            {item.label}
          </Chip>
        ))}
      </ScrollView>
      {error ? (
        <HelperText type="error" visible testID="tasks-error">
          {t('tasks.loadFailed')}
        </HelperText>
      ) : null}
      {isLoading ? (
        <ActivityIndicator style={styles.loading} />
      ) : filteredTasks.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge">{t('tasks.empty')}</Text>
          <Text variant="bodyMedium" style={styles.emptyHint}>
            {t('tasks.emptyHint')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(task) => task.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Surface style={styles.taskCard} elevation={1} testID={`task-row-${item.id}`}>
              {item.status === 'pending' ? (
                <IconButton
                  icon="checkbox-blank-circle-outline"
                  onPress={() => completeTask(item.id)}
                  accessibilityLabel={t('tasks.complete')}
                  testID={`task-complete-${item.id}`}
                />
              ) : (
                <IconButton icon="check-circle" disabled />
              )}
              <Pressable
                style={styles.taskInfo}
                onPress={() => router.push({ pathname: '/task-form', params: { id: item.id } })}
                testID={`task-open-${item.id}`}
              >
                <Text variant="bodyMedium">{item.title}</Text>
                <Text variant="labelMedium" style={styles.priorityText}>
                  {priorityLabel(item.priority)}
                </Text>
              </Pressable>
              {item.status !== 'archived' ? (
                <IconButton
                  icon="archive-outline"
                  onPress={() => archiveTask(item.id)}
                  accessibilityLabel={t('tasks.archive')}
                  testID={`task-archive-${item.id}`}
                />
              ) : null}
            </Surface>
          )}
        />
      )}
      <FAB
        icon="plus"
        label={t('tasks.newTask')}
        style={styles.fab}
        onPress={() => router.push('/task-form')}
        testID="task-create"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  filterRow: { gap: 8, paddingBottom: 8 },
  chip: { marginRight: 4 },
  loading: { marginTop: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  emptyHint: { opacity: 0.6 },
  list: { gap: 8, paddingBottom: 96 },
  taskCard: { borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  taskInfo: { flex: 1, paddingVertical: 8 },
  priorityText: { opacity: 0.6, marginTop: 2 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
```

- [ ] **Step 2: Verificar typecheck**

Run: `npm run typecheck`
Expected: sucesso.

- [ ] **Step 3: Commit**

```bash
git add app/tasks.tsx
git commit -m "feat(design): redesenhar tela de lista de tarefas"
```

---

### Task 7: Tela de Formulário de Tarefa

**Files:**
- Modify: `app/task-form.tsx`

**Interfaces:**
- Consumes: `useAuthStore`, `useTaskStore`, `fetchTask` (Plano 03, já existe), `validateTaskForm` — todos inalterados. Paleta da Task 1.
- Mantém rota `/task-form`, `testID`s `task-title`, `task-description`, `task-due-date`, `task-form-error`, `task-form-loading`; move `task-save` do botão inferior para o botão no cabeçalho (`headerRight`).

- [ ] **Step 1: Substituir o conteúdo de `app/task-form.tsx`**

```typescript
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  HelperText,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { fetchTask } from '@/lib/tasks';
import { validateTaskForm } from '@/utils/validation';
import type { Task, TaskPriority } from '@/types';

export default function TaskFormScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuthStore();
  const { tasks, createTask, updateTask } = useTaskStore();
  const [fetchedTask, setFetchedTask] = useState<Task | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const existingTask = id ? (tasks.find((task) => task.id === id) ?? fetchedTask ?? undefined) : undefined;

  const [title, setTitle] = useState(existingTask?.title ?? '');
  const [description, setDescription] = useState(existingTask?.description ?? '');
  const [dueDate, setDueDate] = useState(existingTask?.dueDate?.slice(0, 10) ?? '');
  const [priority, setPriority] = useState<TaskPriority>(existingTask?.priority ?? 2);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (id && !tasks.find((task) => task.id === id)) {
      setIsLoadingTask(true);
      fetchTask(id)
        .then((task) => {
          setFetchedTask(task);
          setTitle(task.title);
          setDescription(task.description ?? '');
          setDueDate(task.dueDate?.slice(0, 10) ?? '');
          setPriority(task.priority);
        })
        .catch(() => {
          setFetchFailed(true);
          setFormError(t('tasks.loadFailed'));
        })
        .finally(() => setIsLoadingTask(false));
    }
  }, [id]);

  const handleSubmit = async () => {
    setFormError('');
    const result = validateTaskForm(title, dueDate);
    if (!result.valid) {
      if (result.errors.title) setFormError(t('tasks.titleRequired'));
      else if (result.errors.dueDate) setFormError(t('tasks.dueDateInvalid'));
      return;
    }
    setIsSaving(true);
    try {
      const input = {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate.trim() || null,
        priority,
      };
      if (existingTask) {
        await updateTask(existingTask.id, input);
      } else if (user) {
        await createTask(user.id, input);
      } else {
        throw new Error('No authenticated user');
      }
      router.back();
    } catch {
      setFormError(t('tasks.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingTask) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator testID="task-form-loading" />
      </View>
    );
  }

  if (fetchFailed) {
    return (
      <View style={[styles.container, styles.loading]}>
        <HelperText type="error" visible testID="task-form-error">
          {formError}
        </HelperText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: existingTask ? t('tasks.editTask') : t('tasks.newTask'),
          headerRight: () => (
            <Button
              onPress={handleSubmit}
              loading={isSaving}
              disabled={isSaving}
              textColor="#fff"
              testID="task-save"
            >
              {t('common.save')}
            </Button>
          ),
        }}
      />
      <Surface style={styles.field} elevation={1}>
        <TextInput
          label={t('tasks.titleLabel')}
          value={title}
          onChangeText={setTitle}
          mode="flat"
          underlineColor="transparent"
          testID="task-title"
        />
      </Surface>
      <Surface style={styles.field} elevation={1}>
        <TextInput
          label={t('tasks.descriptionLabel')}
          value={description}
          onChangeText={setDescription}
          multiline
          mode="flat"
          underlineColor="transparent"
          left={<TextInput.Icon icon="text-box-outline" />}
          style={styles.descriptionInput}
          testID="task-description"
        />
      </Surface>
      <Surface style={styles.field} elevation={1}>
        <TextInput
          label={t('tasks.dueDateLabel')}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder={t('tasks.dueDatePlaceholder')}
          autoCapitalize="none"
          mode="flat"
          underlineColor="transparent"
          left={<TextInput.Icon icon="calendar-blank-outline" />}
          testID="task-due-date"
        />
      </Surface>
      <Text variant="titleMedium" style={styles.sectionLabel}>
        {t('tasks.priorityLabel')}
      </Text>
      <SegmentedButtons
        value={String(priority)}
        onValueChange={(value) => setPriority(Number(value) as TaskPriority)}
        buttons={[
          { value: '1', label: t('tasks.priorityLow') },
          { value: '2', label: t('tasks.priorityMedium') },
          { value: '3', label: t('tasks.priorityHigh') },
        ]}
        style={styles.field}
      />
      {formError ? (
        <HelperText type="error" visible testID="task-form-error">
          {formError}
        </HelperText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  loading: { alignItems: 'center', justifyContent: 'center' },
  field: { borderRadius: 12, marginBottom: 4 },
  descriptionInput: { minHeight: 96 },
  sectionLabel: { marginTop: 8 },
});
```

- [ ] **Step 2: Verificar typecheck**

Run: `npm run typecheck`
Expected: sucesso.

- [ ] **Step 3: Commit**

```bash
git add app/task-form.tsx
git commit -m "feat(design): redesenhar tela de criar/editar tarefa"
```

---

### Task 8: Tela de Perfil

**Files:**
- Modify: `app/profile.tsx`

**Interfaces:**
- Consumes: `useAuthStore`, `useTaskStore` (`tasks`/`fetchTasks` — Plano 03), `fetchProfile`/`updateProfile`/`uploadAvatar` (inalterados). Paleta da Task 1, chave `profile.tasksCompleted` da Task 2.
- Mantém rota `/profile` e `testID`s `pick-avatar`, `profile-name`, `profile-status`, `profile-save`, `profile-logout`.

- [ ] **Step 1: Substituir o conteúdo de `app/profile.tsx`**

```typescript
import { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, TextInput, Button, Avatar, ActivityIndicator, Surface, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { fetchProfile, updateProfile, uploadAvatar } from '@/lib/profile';
import type { Profile } from '@/types';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, signOut } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
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
    fetchTasks(user.id);
  }, [user]);

  const completedCount = tasks.filter((task) => task.status === 'done').length;

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
      <Stack.Screen options={{ title: t('tabs.profile') }} />
      <View style={styles.avatarSection}>
        {profile.avatarUrl ? (
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Avatar.Text size={96} label={(profile.fullName || '?').charAt(0).toUpperCase()} />
        )}
        <IconButton
          icon="pencil"
          mode="contained"
          size={20}
          onPress={handlePickImage}
          loading={isUploading}
          disabled={isUploading}
          style={styles.editAvatarButton}
          testID="pick-avatar"
        />
      </View>
      <Surface style={styles.card} elevation={1}>
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
      </Surface>
      <Surface style={styles.statCard} elevation={1}>
        <Text variant="headlineMedium">{completedCount}</Text>
        <Text variant="labelMedium" style={styles.statLabel}>
          {t('profile.tasksCompleted')}
        </Text>
      </Surface>
      <Link href="/settings" asChild>
        <Button mode="outlined" style={styles.settingsLink}>
          {t('settings.language')} / {t('settings.theme')}
        </Button>
      </Link>
      <Button
        mode="contained-tonal"
        onPress={() => signOut()}
        icon="logout"
        testID="profile-logout"
        style={styles.logout}
      >
        {t('profile.logout')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarSection: { alignItems: 'center' },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  editAvatarButton: { marginTop: -20 },
  card: { width: '100%', borderRadius: 16, padding: 16, gap: 8 },
  input: { width: '100%' },
  statCard: { width: '100%', borderRadius: 16, padding: 16, alignItems: 'center', gap: 4 },
  statLabel: { opacity: 0.7 },
  settingsLink: { width: '100%' },
  logout: { width: '100%', marginTop: 8 },
});
```

- [ ] **Step 2: Verificar typecheck**

Run: `npm run typecheck`
Expected: sucesso.

- [ ] **Step 3: Commit**

```bash
git add app/profile.tsx
git commit -m "feat(design): redesenhar tela de perfil com estatistica real de tarefas concluidas"
```

---

### Task 9: Tela de Configurações

**Files:**
- Modify: `app/settings.tsx`

**Interfaces:**
- Consumes: `useSettingsStore`, `useAuthStore`, `updateProfile` (inalterados). Paleta da Task 1, chave `settings.title` da Task 2.
- Mantém rota `/settings` e `testID`s `settings-currency`, `settings-save-currency`, `settings-status`.

- [ ] **Step 1: Substituir o conteúdo de `app/settings.tsx`**

```typescript
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, SegmentedButtons, TextInput, Button, Surface } from 'react-native-paper';
import { Stack } from 'expo-router';
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
      <Stack.Screen options={{ title: t('settings.title') }} />
      <Surface style={styles.section} elevation={1}>
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
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  section: { borderRadius: 16, padding: 16, gap: 8 },
  field: { marginBottom: 8 },
});
```

- [ ] **Step 2: Verificar typecheck**

Run: `npm run typecheck`
Expected: sucesso.

- [ ] **Step 3: Commit**

```bash
git add app/settings.tsx
git commit -m "feat(design): redesenhar tela de configuracoes"
```

---

## Self-Review do Plano

1. **Spec coverage:** As 6 telas com lógica já implementada (Login, Cadastro, Home, Lista de Tarefas, Formulário de Tarefa, Perfil) mais Configurações (acessada a partir do Perfil) recebem a paleta MD3 completa e a estrutura visual dos mockups (cards com `Surface`, ícones, cabeçalhos com título traduzido). Foco, Rotina e Finanças ficam de fora, documentado explicitamente em Global Constraints e no "Próximo Plano" — não são esquecimento, são features que ainda não existem.
2. **Placeholders:** Nenhum — todo código é completo e executável.
3. **Type consistency:** Nenhuma task deste plano cria ou altera tipos/interfaces — todas consomem `Task`, `Profile`, `Language`, `ThemeMode` exatamente como já definidos, e todas as ações de store (`fetchTasks`, `completeTask`, `archiveTask`, `createTask`, `updateTask`, `fetchProfile`, `updateProfile`, `uploadAvatar`, `signIn`, `signUp`, `signOut`) são chamadas com as mesmas assinaturas já existentes.
4. **Dependência externa:** Nenhuma — todas as tasks são autocontidas no repositório, sem passos manuais fora do editor.
5. **Sem dados fictícios:** confirmado — a única "estatística" nova (Perfil) usa contagem real de `tasks` já carregada da store; o card de Rotina mostra um texto honesto de "em breve" em vez do exemplo fictício do mockup ("Sua rotina matinal está concluída").

---

## Próximo Plano

**Plano 05 — Foco (Pomodoro)** continua sendo o próximo passo natural do roadmap (já indicado no Plano 03): tabela `pomodoro_sessions`, timer circular animado, histórico de sessões, vínculo opcional com uma tarefa. A tela de Foco do mockup deste plano (`code (9).html`) já dá a referência visual completa para quando essa funcionalidade for implementada. Depois viriam Rotina e Finanças, cada uma com seu próprio plano, reaproveitando a paleta MD3 já estabelecida aqui.
