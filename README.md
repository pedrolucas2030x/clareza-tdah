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
```bash
npm install
```

2. Criar um projeto em [supabase.com](https://supabase.com), copiar a URL e a chave anônima (Settings → API), e rodar o SQL de `supabase/migrations/0001_profiles.sql` no SQL Editor do projeto.

3. Configurar variáveis de ambiente:
```bash
cp .env.example .env
```
Preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` com as credenciais do passo anterior.

4. Rodar o app:
```bash
npx expo start
```

## Testes

```bash
npm test
```

## Estrutura

- `app/` — Telas (Expo Router)
- `src/components/` — Componentes reutilizáveis
- `src/lib/` — Configurações (Supabase, i18n, tema)
- `src/stores/` — Estado global (Zustand)
- `src/locales/` — Traduções
- `src/types/` — TypeScript types
- `src/utils/` — Helpers

## Status

MVP em desenvolvimento. Veja `docs/superpowers/specs/2026-08-13-clareza-tdah-design.md` para o design completo.
