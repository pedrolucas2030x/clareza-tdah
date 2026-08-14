# Clareza TDAH — Documento de Design

**Data:** 2026-08-13
**Status:** Aguardando aprovação do usuário
**Versão:** 1.0 (MVP)

---

## 1. Visão Geral

**Clareza TDAH** é um aplicativo mobile (iOS + Android) criado especificamente para pessoas com Transtorno de Déficit de Atenção e Hiperatividade (TDAH) organizarem suas vidas, rotinas e finanças de forma simples, sem sobrecarga cognitiva.

### Diferenciais para TDAH
- Interface limpa, sem poluição visual
- Botões grandes e áreas de toque generosas (mín. 48x48dp)
- Timer Pomodoro visual com cores calmantes
- Micro-animações que recompensam tarefas concluídas
- Modo escuro real (não apenas inversão de cores)
- Máximo 1 ação principal por tela
- Sem pop-ups inesperados; confirmações antes de ações destrutivas

### Público-alvo
Pessoas adultas com TDAH que buscam produtividade sem sobrecarga. Inicialmente português e inglês.

### Potencial SaaS
A arquitetura nasce pronta para escalar: autenticação, banco na nuvem, multi-idioma, e espaço para upgrade futuro (Stripe para cobrança, tier gratuito vs Pro, versão B2B para coaches/terapeutas). O MVP foca em validar o produto; monetização vem depois.

---

## 2. Stack Técnica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework mobile | React Native + Expo (managed) | Usuário já tem `.expo/` configurado; um codebase para iOS e Android |
| Linguagem | TypeScript | Segurança de tipos, menos bugs |
| UI Components | React Native Paper (Material Design) | Acessível, maduro, com suporte nativo a tema |
| Ícones | Lucide React Native | Leves e consistentes |
| Navegação | Expo Router (file-based) | Mais simples que React Navigation puro |
| Estado global | Zustand | Leve, simples, sem boilerplate |
| Backend | Supabase (Postgres + Auth + Storage) | Auth + banco + storage em um serviço; escala fácil |
| ORM/Cliente | @supabase/supabase-js (oficial) | |
| Internacionalização | i18next + react-i18next | Padrão de mercado |
| Datas | date-fns | Leve, tree-shakeable |
| Gráficos (v1.5) | Victory Native | |
| Local storage | AsyncStorage | Para cache offline e preferências |

**Por que Supabase e não Firebase:** Row Level Security (RLS) nativa do Postgres garante privacidade por linha; SQL permite queries complexas; Supabase Storage para avatares; plano gratuito generoso para começar.

---

## 3. Escopo da v1 (MVP)

### Incluído
1. Autenticação (e-mail + senha) com Supabase Auth
2. Perfil com foto (upload para Supabase Storage) + nome
3. Configurações: idioma (PT/EN), tema (claro/escuro/auto), moeda padrão
4. Lista de tarefas (to-do) com criar/editar/concluir/arquivar
5. Timer Pomodoro (25 min foco / 5 min descanso, configurável depois)
6. Rotina/agenda diária (blocos de horário por dia da semana)
7. Planilha de finanças (receitas e despesas com categorias)
8. Modo escuro funcional
9. Lembretes in-app (exibidos quando o app está aberto)
10. Internacionalização básica: Português (pt-BR) e Inglês (en)

### Fora do escopo (v1.5+)
- Relatórios e gráficos detalhados de progresso
- Notificações push (requer configuração nativa + certificados)
- Widgets na tela inicial do celular
- Sincronização com calendário externo (Google/Apple Calendar)
- Mais idiomas (es, fr, de, etc.)
- Compartilhamento de rotinas entre usuários
- Modo offline completo (apenas cache básico de leitura)
- Exportação de dados
- Integração bancária
- Versão B2B para profissionais de saúde
- Cobrança/Stripe

---

## 4. Estrutura do Projeto

```
clareza-tdah/
├── app/                          # Expo Router (file-based)
│   ├── (auth)/                   # Telas de login/cadastro
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                   # Navegação principal
│   │   ├── _layout.tsx           # Tab bar
│   │   ├── index.tsx             # Home / Hoje
│   │   ├── tasks.tsx             # Lista de tarefas
│   │   ├── focus.tsx             # Timer Pomodoro
│   │   ├── routine.tsx           # Agenda/rotina
│   │   ├── finances.tsx          # Planilha de finanças
│   │   └── profile.tsx           # Perfil
│   ├── _layout.tsx               # Layout raiz
│   └── settings.tsx              # Configurações
├── src/
│   ├── components/               # Componentes reutilizáveis
│   │   ├── TaskItem.tsx
│   │   ├── PomodoroTimer.tsx
│   │   ├── RoutineBlock.tsx
│   │   ├── TransactionRow.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── ThemeToggle.tsx
│   ├── lib/
│   │   ├── supabase.ts           # Cliente Supabase
│   │   └── i18n.ts               # Configuração de idiomas
│   ├── stores/                   # Zustand
│   │   ├── useAuthStore.ts
│   │   ├── useTaskStore.ts
│   │   ├── useTimerStore.ts
│   │   ├── useRoutineStore.ts
│   │   ├── useFinanceStore.ts
│   │   └── useSettingsStore.ts
│   ├── locales/                  # Traduções
│   │   ├── pt-BR.json
│   │   └── en.json
│   ├── types/                    # TypeScript types
│   │   ├── database.types.ts     # Gerado do Supabase
│   │   └── index.ts
│   └── utils/                    # Helpers
│       ├── date.ts
│       ├── currency.ts
│       └── validation.ts
├── assets/                       # Imagens, fontes
├── app.json                      # Configuração Expo
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. Modelo de Dados (Supabase/Postgres)

Todas as tabelas têm Row Level Security (RLS) habilitada. Cada usuário só acessa registros onde `user_id = auth.uid()`.

### 5.1 `profiles`
Perfil estendido do usuário (1:1 com `auth.users`).

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | uuid | PK, FK→auth.users.id | Mesmo ID do auth |
| `full_name` | text | NOT NULL | Nome de exibição |
| `avatar_url` | text | NULL | URL no Supabase Storage |
| `language` | text | NOT NULL DEFAULT 'pt-BR' | 'pt-BR' ou 'en' |
| `theme` | text | NOT NULL DEFAULT 'auto' | 'light', 'dark', 'auto' |
| `currency` | text | NOT NULL DEFAULT 'BRL' | Código ISO 4217 |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() | Trigger de auto-update |

**Trigger:** `on_auth_user_created` em `auth.users` cria automaticamente uma linha em `profiles` ao cadastrar.

### 5.2 `tasks`
Tarefas do usuário.

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | uuid | PK DEFAULT gen_random_uuid() | |
| `user_id` | uuid | NOT NULL, FK→auth.users.id | |
| `title` | text | NOT NULL | Título da tarefa |
| `description` | text | NULL | Detalhes opcionais |
| `due_date` | timestamptz | NULL | Data/hora de vencimento |
| `priority` | smallint | NOT NULL DEFAULT 2 | 1=baixa, 2=média, 3=alta |
| `status` | text | NOT NULL DEFAULT 'pending' | 'pending', 'done', 'archived' |
| `completed_at` | timestamptz | NULL | Quando foi concluída |
| `routine_id` | uuid | NULL, FK→routines.id | Vínculo opcional com rotina |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() | |

**Índices:** `(user_id, status)`, `(user_id, due_date)`

### 5.3 `pomodoro_sessions`
Histórico de sessões de foco.

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | uuid | PK | |
| `user_id` | uuid | NOT NULL, FK→auth.users.id | |
| `task_id` | uuid | NULL, FK→tasks.id | Tarefa foco (opcional) |
| `duration_minutes` | smallint | NOT NULL | Duração em minutos |
| `started_at` | timestamptz | NOT NULL | |
| `ended_at` | timestamptz | NULL | NULL se em andamento |
| `completed` | boolean | NOT NULL DEFAULT false | Finalizou ou foi interrompido |

**Índices:** `(user_id, started_at DESC)`

### 5.4 `routines`
Blocos da rotina diária.

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | uuid | PK | |
| `user_id` | uuid | NOT NULL, FK→auth.users.id | |
| `title` | text | NOT NULL | Ex: "Acordar", "Exercício" |
| `start_time` | time | NOT NULL | Horário de início |
| `end_time` | time | NOT NULL | Horário de fim |
| `days_of_week` | smallint[] | NOT NULL DEFAULT '{0,1,2,3,4,5,6}' | 0=domingo, 6=sábado |
| `color` | text | NOT NULL DEFAULT '#6366f1' | Cor do bloco em hex |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | |

**Índices:** `(user_id, start_time)`

### 5.5 `transactions`
Receitas e despesas financeiras.

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | uuid | PK | |
| `user_id` | uuid | NOT NULL, FK→auth.users.id | |
| `type` | text | NOT NULL | 'income' ou 'expense' |
| `amount` | numeric(12,2) | NOT NULL CHECK (amount >= 0) | Valor sempre positivo |
| `category` | text | NOT NULL | Ex: "Alimentação", "Salário" |
| `description` | text | NULL | |
| `date` | date | NOT NULL | Data da transação |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | |

**Índices:** `(user_id, date DESC)`, `(user_id, type)`

### 5.6 `reminders`
Lembretes in-app.

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | uuid | PK | |
| `user_id` | uuid | NOT NULL, FK→auth.users.id | |
| `task_id` | uuid | NULL, FK→tasks.id | Vínculo opcional |
| `title` | text | NOT NULL | Texto do lembrete |
| `remind_at` | timestamptz | NOT NULL | Quando avisar |
| `shown` | boolean | NOT NULL DEFAULT false | Já foi exibido? |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | |

**Índices:** `(user_id, remind_at)` para busca eficiente de lembretes pendentes.

### 5.7 Row Level Security (resumo)

Para cada tabela, política padrão:
```sql
-- SELECT/UPDATE/DELETE
USING (user_id = auth.uid())
-- INSERT
WITH CHECK (user_id = auth.uid())
```

Para `profiles`, política de SELECT permite que usuários vejam apenas o próprio perfil, e UPDATE apenas o próprio. Bucket `avatars` no Storage tem política equivalente.

---

## 6. Fluxo de Telas e Navegação

### 6.1 Autenticação
```
Splash Screen
   ↓
[Se não logado] → Login ↔ Cadastro → Home
[Se logado]    → Home
```

**Login:** E-mail + senha + botão "Entrar" + link "Criar conta" + "Esqueci a senha"

**Cadastro:** Nome completo + e-mail + senha + confirmação de senha + foto opcional (pode pular e adicionar depois) → cria usuário + profile automático via trigger → login automático

### 6.2 Navegação por abas

5 abas no rodapé + acesso ao Perfil via ícone na Home ou Configurações:

| Aba | Ícone | Conteúdo principal |
|-----|-------|---------------------|
| 🏠 Home | house | Resumo do dia, atalhos rápidos |
| ✅ Tarefas | check-square | Lista completa, filtros, criar/editar |
| ⏱️ Foco | timer | Timer Pomodoro, histórico recente |
| 📅 Rotina | calendar | Blocos do dia, criar/editar |
| 💰 Finanças | dollar-sign | Saldo, lista de transações |
| 👤 Perfil | user | Foto, nome, configurações, sair |

### 6.3 Tela Home
- Saudação personalizada ("Bom dia, {nome} 👋") com base na hora local
- Data atual formatada
- Card "Próximas tarefas" (top 3 pendentes ordenadas por prioridade + due_date)
- Card "Bloco atual da rotina" (baseado em hora atual)
- Botão grande "Iniciar foco" (abre Pomodoro)
- Card "Resumo financeiro do mês" (entradas - saídas)

### 6.4 Fluxos-chave

**Criar tarefa:** Tarefas (botão +) → Modal: título, descrição, data, prioridade, rotina → Salva → Volta para lista com toast de sucesso.

**Iniciar Pomodoro:** Foco → Botão "Iniciar" → Tela cheia com timer circular animado → Conclui (vibra + som suave) → Salva sessão no histórico → Volta para Foco.

**Adicionar transação:** Finanças (botão +) → Modal: tipo (receita/despesa), valor, categoria (dropdown), descrição, data → Salva → Atualiza saldo.

**Criar rotina:** Rotina (botão +) → Modal: título, horário início/fim, dias da semana (chips), cor → Salva.

**Lembrete dispara (in-app):** App aberto → Polling a cada 30s verifica lembretes pendentes → Modal/Banner no topo "🔔 {título}" + botões "Ver" / "Dispensar" → marca como `shown=true`.

**Trocar tema/idioma:** Perfil → Seção "Preferências" → Toggle → Aplica imediatamente e persiste.

---

## 7. Princípios de UX (TDAH-friendly)

1. **Máximo 1 ação principal por tela** — o olho do usuário sabe exatamente o que fazer
2. **Botões grandes** — mínimo 48x48dp de área tocável
3. **Contraste alto** — texto sempre legível em ambos os temas
4. **Sem pop-ups inesperados** — toasts no rodapé, nunca modais intrusivos sem motivo
5. **Confirmações antes de ações destrutivas** — excluir, sair, etc.
6. **Animações suaves mas não distrativas** — duração 200-300ms, easing natural
7. **Modo escuro real** — cores escolhidas para dark mode, não apenas inversão
8. **Feedback imediato** — toda ação tem resposta visual em < 200ms
9. **Linguagem clara e direta** — sem jargões ou textos longos
10. **Empty states acolhedores** — telas vazias com ilustração e dica do que fazer

---

## 8. Internacionalização

- Idiomas suportados na v1: `pt-BR` (padrão) e `en`
- Detecção automática do idioma do device no primeiro acesso, com opção de trocar manualmente
- Persistência da escolha em `profiles.language`
- Arquivos: `src/locales/pt-BR.json` e `src/locales/en.json`
- Todas as strings de UI passam por `t('chave')` — zero string hardcoded em componentes

---

## 9. Armazenamento e Privacidade

- **Dados em nuvem:** Supabase (Postgres) com RLS — cada usuário só acessa seus próprios dados
- **Foto de perfil:** Supabase Storage, bucket `avatars` com políticas de acesso restritas
- **Token de autenticação:** armazenado com segurança pelo Expo SecureStore
- **Cache local:** AsyncStorage apenas para preferências (idioma, tema) e cache de leitura temporário
- **LGPD/GDPR:** botão "Excluir conta" no Perfil remove todos os dados do usuário em cascata

---

## 10. Critérios de Sucesso do MVP

- [ ] Usuário consegue se cadastrar, logar e deslogar
- [ ] Usuário consegue fazer upload de foto de perfil
- [ ] Usuário consegue criar, editar, concluir e arquivar tarefas
- [ ] Timer Pomodoro inicia, conta corretamente, registra sessão no histórico
- [ ] Usuário consegue criar blocos de rotina e vê-los na Home
- [ ] Usuário consegue adicionar receitas e despesas, vê saldo atualizado
- [ ] Modo escuro funciona em todas as telas
- [ ] App detecta e respeita idioma do device (PT/EN)
- [ ] Todas as ações destrutivas pedem confirmação
- [ ] App roda sem crashes em iOS e Android via Expo Go

---

## 11. Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Escopo grande causar bloqueio | Caminho A (MVP enxuto); features adiáveis claramente listadas |
| Supabase ficar indisponível | Mensagens amigáveis de erro; retry automático; cache local para leitura |
| Configuração de autenticação confusa | Documentar passo a passo no README; seguir exatamente o guia do Supabase |
| Performance do timer em background | Pausar/retomar corretamente; salvar estado; testar em ambos os OS |
| Traduções incompletas | Manter chaves centralizadas; revisar todas as telas antes de release |

---

## 12. Próximos Passos (após aprovação)

1. Criar projeto Supabase e configurar tabelas + RLS
2. Inicializar projeto Expo com template TypeScript
3. Configurar dependências (Zustand, i18next, Paper, etc.)
4. Implementar auth e telas de login/cadastro
5. Implementar perfil e configurações (tema, idioma)
6. Implementar CRUD de tarefas
7. Implementar Pomodoro
8. Implementar rotinas
9. Implementar finanças
10. Implementar lembretes in-app
11. Testes manuais em iOS e Android
12. Build de produção e publicação (opcional, se o usuário quiser)
