# korea-project

Guia de viagem da Coreia do Sul para brasileiros: cidades, bairros, lugares (restaurantes, baladas, trilhas, atrações, cafés, compras, cultura), hospedagens e simulador de custos da viagem em BRL/KRW.

> **Status:** Fase 1 — setup do monorepo e esqueleto da API. As fases seguintes estão descritas em [Roadmap](#roadmap).

## Stack

| Camada    | Tecnologia                                                                         |
| --------- | ---------------------------------------------------------------------------------- |
| Front-end | Next.js 16 (App Router) · React 19 · Tailwind CSS 4                                |
| Back-end  | NestJS 12 · Swagger/OpenAPI · Terminus · Throttler · Cache Manager                 |
| Banco     | PostgreSQL 18 · Prisma 7 (driver adapter `@prisma/adapter-pg`)                     |
| Monorepo  | pnpm 12 workspaces · Turborepo                                                     |
| Qualidade | TypeScript 6 · ESLint 9 · Prettier · Husky + lint-staged · Jest/Supertest · Vitest |
| Infra     | Docker Compose · Node.js 24 LTS                                                    |

Todas as versões estão fixadas (sem `^`) nos `package.json`.

## Estrutura

```
apps/
  api/        NestJS — API REST em /api/v1, Swagger em /api/docs
  web/        Next.js — site em pt-BR
packages/
  shared/     tipos e enums compartilhados (PlaceCategory, CostTier, Paginated, ApiErrorBody…)
docker-compose.yml           stack "produção" (imagens otimizadas)
docker-compose.override.yml  overrides de desenvolvimento (hot reload), aplicado por padrão
```

## Pré-requisitos

- Node.js 24 (`nvm use` lê o `.nvmrc`)
- pnpm 12 via Corepack: `corepack enable pnpm`
- Docker com Compose v2 (para banco e/ou stack completa)

## Começando

```bash
cp .env.example .env
```

### Opção A — tudo no Docker

```bash
docker compose up --build
```

Sobe `postgres` → `migrate` (aplica migrations e encerra) → `api` → `web`, em modo desenvolvimento com hot reload em `src/`.

Para rodar as imagens de produção (sem o override):

```bash
docker compose -f docker-compose.yml up --build
```

### Opção B — só o banco no Docker, apps no host

```bash
pnpm install
docker compose up -d postgres
pnpm dev            # api em :3001 e web em :3000, com watch
```

### Endereços

| O quê         | URL                                        |
| ------------- | ------------------------------------------ |
| Site          | http://localhost:3000                      |
| API           | http://localhost:3001/api/v1               |
| Healthcheck   | http://localhost:3001/api/v1/health        |
| Swagger UI    | http://localhost:3001/api/docs             |
| OpenAPI JSON  | http://localhost:3001/api/docs-json        |
| Postgres host | `localhost:5433` (usuário/senha do `.env`) |

## Scripts (raiz)

| Script              | O que faz                                                   |
| ------------------- | ----------------------------------------------------------- |
| `pnpm dev`          | Sobe todos os apps em modo watch (Turborepo)                |
| `pnpm build`        | Build de produção de todos os pacotes                       |
| `pnpm lint`         | ESLint em todos os pacotes                                  |
| `pnpm typecheck`    | `tsc --noEmit` em todos os pacotes                          |
| `pnpm test`         | Testes unitários (Jest na api, Vitest no web)               |
| `pnpm test:e2e`     | Testes e2e da API com Supertest (**requer Postgres ativo**) |
| `pnpm format`       | Prettier em todo o repositório                              |
| `pnpm format:check` | Verifica formatação (útil em CI)                            |

Scripts específicos de um pacote: `pnpm --filter @korea-project/api <script>` — por exemplo `db:generate`, `db:migrate` (cria migration em dev) e `db:deploy` (aplica migrations).

O hook de pre-commit (Husky) roda ESLint `--fix` e Prettier apenas nos arquivos staged.

## Variáveis de ambiente

Um único `.env` na raiz é usado pela API, pelo Prisma CLI e pelo Docker Compose. A lista completa, com comentários, está em [`.env.example`](.env.example).

A API **valida todas as variáveis na inicialização** ([`env.validation.ts`](apps/api/src/config/env.validation.ts)) e não sobe se faltar alguma ou se houver valor inválido, listando todos os problemas de uma vez.

| Variável                                                                | Uso                                                                      |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`                                                          | Conexão do Prisma (no Compose é sobrescrita para `postgres`)             |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` | Container do Postgres (porta 5433 no host)                               |
| `API_PORT`, `CORS_ORIGINS`, `SWAGGER_ENABLED`                           | HTTP da API                                                              |
| `JWT_*`, `COOKIE_SECURE`                                                | Autenticação (Fase 3); segredos com ≥ 32 caracteres                      |
| `THROTTLE_*`                                                            | Rate limit global e o mais restrito de `/auth/*`                         |
| `CACHE_TTL_MS`                                                          | TTL padrão do cache                                                      |
| `KRW_TO_BRL`                                                            | Câmbio usado no MVP (**estimativa**, revisar)                            |
| `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`                           | URLs vistas pelo navegador (embutidas no build do web)                   |
| `API_INTERNAL_URL`                                                      | URL da API usada pelo SSR do Next (no Compose: `http://api:3001/api/v1`) |

## Arquitetura da API

Monolito modular: um módulo Nest por domínio em `apps/api/src/modules/`, com camadas **controller → service → repository**. Módulos só conversam pelos services exportados uns dos outros, nunca acessando tabelas de outro domínio.

O que já está pronto na Fase 1:

- **Bootstrap** ([`main.ts`](apps/api/src/main.ts), [`setup-app.ts`](apps/api/src/setup-app.ts)): prefixo `/api`, versionamento por URI (`v1`), Helmet, CORS por env, cookie-parser, Swagger, graceful shutdown. Os testes e2e usam o mesmo `configureApp()`.
- **Config** ([`src/config`](apps/api/src/config)): validação do env + namespaces tipados (`app`, `database`, `jwt`, `throttle`, `cache`, `exchange`), injetados com `@Inject(appConfig.KEY)`.
- **Prisma** ([`src/prisma`](apps/api/src/prisma)): `PrismaModule` global e `PrismaService` (client gerado em `src/generated/prisma`, ignorado no git).
- **Common** ([`src/common`](apps/api/src/common)):
  - `AllExceptionsFilter`: toda resposta de erro sai como `{ error: { code, message, details? } }`. Erros do Prisma são mapeados (`P2002` → 409, `P2025` → 404, `P2003` → 409); 5xx nunca vaza detalhes internos.
  - `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`) com erros por campo em `details`.
  - Interceptors de logging de requisições e de serialização (`ClassSerializerInterceptor`, para `@Exclude()` em campos como `passwordHash`).
  - Decorators `@Public()`, `@Roles()`, `@CurrentUser()` (consumidos pelos guards da Fase 3).
  - `PaginationQueryDto` + `paginate()` para o formato `{ data, meta: { page, limit, total, totalPages } }`.
  - Throttler com dois limites: `default` em todas as rotas e `auth`, mais restrito, aplicado automaticamente em `/api/v{n}/auth/*`.
  - `AppCacheModule`: cache em memória, ponto único para trocar por Redis.
- **Health** ([`modules/health`](apps/api/src/modules/health)): `GET /api/v1/health` com `SELECT 1` no Postgres.

O front deve traduzir erros pelo `code` (as mensagens da API são para desenvolvedores), o que mantém o caminho aberto para i18n.

## Roadmap

1. ✅ Setup do monorepo, Docker Compose, lint/format, `.env.example`, esqueleto do NestJS
2. Prisma schema, migrations e seed
3. API: auth, users, cities, districts, places, accommodations, reviews, favorites, cost-estimates + testes
4. Front: layout base, design system, Home, página de cidade, mapa
5. Calculador de custos, página de lugar, reviews, auth, favoritos
6. Painel admin, SEO, otimizações, testes, README final com guia de extensão
