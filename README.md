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

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
```
Preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` com suas credenciais do Supabase.

3. Rodar o app:
```bash
npx expo start
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
