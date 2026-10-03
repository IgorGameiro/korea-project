# korea-project

South Korea travel guide: cities, neighborhoods, places (restaurants, nightlife, hiking, attractions, cafés, shopping, culture, nature), accommodations and a trip cost calculator. The site is in **English by default**, with **Brazilian Portuguese** as an option; prices are shown in KRW plus USD or BRL.

> **Status:** Phase 2 — database schema, migrations and seed. See the [Roadmap](#roadmap).

## Stack

| Layer    | Technology                                                                         |
| -------- | ---------------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router) · React 19 · Tailwind CSS 4                                |
| Backend  | NestJS 12 · Swagger/OpenAPI · Terminus · Throttler · Cache Manager                 |
| Database | PostgreSQL 18 · Prisma 7 (driver adapter `@prisma/adapter-pg`)                     |
| Monorepo | pnpm 12 workspaces · Turborepo                                                     |
| Quality  | TypeScript 6 · ESLint 9 · Prettier · Husky + lint-staged · Jest/Supertest · Vitest |
| Infra    | Docker Compose · Node.js 24 LTS                                                    |

Every dependency is pinned to an exact version (no `^`) in the `package.json` files.

## Repository layout

```
apps/
  api/        NestJS — REST API under /api/v1, Swagger at /api/docs
    prisma/   schema.prisma, migrations/, seed/ (demo data)
  web/        Next.js — the website
packages/
  shared/     types and constants shared by api and web (enums, locales, currencies, OpeningHours…)
docker-compose.yml           production-like stack (optimized images)
docker-compose.override.yml  development overrides (hot reload, demo seed), applied by default
```

## Prerequisites

- Node.js 24 (`nvm use` reads `.nvmrc`)
- pnpm 12 via Corepack: `corepack enable pnpm`
- Docker with Compose v2 and Buildx (for the database and/or the full stack)

### Docker on macOS with Colima

Any Docker runtime works (Docker Desktop, OrbStack, Colima). With Colima:

```bash
brew install colima docker docker-compose docker-buildx
# register the compose/buildx plugins in ~/.docker/config.json:
#   { "cliPluginsExtraDirs": ["/opt/homebrew/lib/docker/cli-plugins"] }
colima start --cpu 4 --memory 6 --vm-type vz --mount-type virtiofs --mount-inotify
```

`--mount-inotify` is required for hot reload in development: without it, containers never receive macOS file-change events. The option is saved in `~/.colima/default/colima.yaml`, so afterwards a plain `colima start` is enough.

## Getting started

```bash
cp .env.example .env
```

### Option A — everything in Docker

```bash
docker compose up --build
```

Starts `postgres` → `migrate` (applies migrations, loads the demo seed, exits) → `api` → `web`, in development mode with hot reload for `apps/api/src` and `apps/web/src`. Changes to `packages/shared` or to dependencies need `docker compose up --build` (or `docker compose restart api web`).

To run the production images only (no override, **no demo seed**):

```bash
docker compose -f docker-compose.yml up --build
```

### Option B — database in Docker, apps on the host

```bash
pnpm install
docker compose up -d postgres
pnpm --filter @korea-project/api db:deploy
pnpm --filter @korea-project/api db:seed
pnpm dev            # api on :3001 and web on :3000, in watch mode
```

### URLs

| What          | URL                                        |
| ------------- | ------------------------------------------ |
| Website       | http://localhost:3000                      |
| API           | http://localhost:3001/api/v1               |
| Health check  | http://localhost:3001/api/v1/health        |
| Swagger UI    | http://localhost:3001/api/docs             |
| OpenAPI JSON  | http://localhost:3001/api/docs-json        |
| Postgres host | `localhost:5433` (user/password in `.env`) |

## Scripts (repository root)

| Script              | What it does                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm dev`          | Runs every app in watch mode (Turborepo)                                                       |
| `pnpm build`        | Production build of every package                                                              |
| `pnpm lint`         | ESLint in every package                                                                        |
| `pnpm typecheck`    | `tsc --noEmit` in every package                                                                |
| `pnpm test`         | Unit tests (Jest in api, Vitest in web, `node --test` in shared)                               |
| `pnpm test:e2e`     | API end-to-end tests with Supertest against `TEST_DATABASE_URL` (**needs a running Postgres**) |
| `pnpm format`       | Prettier on the whole repository                                                               |
| `pnpm format:check` | Checks formatting (useful in CI)                                                               |

Package scripts run with `pnpm --filter @korea-project/api <script>`:

| Script        | What it does                                                              |
| ------------- | ------------------------------------------------------------------------- |
| `db:generate` | Generates the Prisma client into `src/generated/prisma` (git-ignored)     |
| `db:migrate`  | Creates and applies a new migration in development (`prisma migrate dev`) |
| `db:deploy`   | Applies pending migrations (`prisma migrate deploy`)                      |
| `db:seed`     | Loads the demo data (`prisma db seed`)                                    |

The Husky pre-commit hook runs ESLint `--fix` and Prettier on staged files only.

## Environment variables

A single `.env` at the repository root is used by the API, the Prisma CLI, the seed and Docker Compose. The full list, with comments, is in [`.env.example`](.env.example).

The API **validates its variables at startup** ([`env.validation.ts`](apps/api/src/config/env.validation.ts)) and refuses to boot if one is missing or invalid, listing every problem at once.

| Variable                                                                | Used for                                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                          | Prisma connection (overridden in Compose to point at `postgres`)                |
| `TEST_DATABASE_URL`                                                     | Database for `pnpm test:e2e`; its name must contain `_test`                     |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` | Postgres container (port 5433 on the host)                                      |
| `API_PORT`, `CORS_ORIGINS`, `SWAGGER_ENABLED`                           | API HTTP settings                                                               |
| `JWT_*`, `COOKIE_SECURE`                                                | Authentication (Phase 3); secrets need at least 32 characters                   |
| `THROTTLE_*`                                                            | Global rate limit and the stricter one for `/auth/*`                            |
| `CACHE_TTL_MS`                                                          | Default cache TTL                                                               |
| `SEED_ADMIN_PASSWORD`, `SEED_USER_PASSWORD`                             | Passwords of the demo accounts created by the seed                              |
| `KRW_TO_BRL`, `KRW_TO_USD`                                              | Exchange rates written to the `ExchangeRate` table by the seed (**estimates**)  |
| `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`                           | URLs seen by the browser (inlined into the web build)                           |
| `API_INTERNAL_URL`                                                      | API URL used by Next.js server rendering (in Compose: `http://api:3001/api/v1`) |

## Internationalization

- **Languages:** English (`en`, default) and Brazilian Portuguese (`pt-BR`) — BCP 47 tags, defined once in [`packages/shared/src/i18n.ts`](packages/shared/src/i18n.ts).
- **Content:** translatable text lives in `CityTranslation`, `DistrictTranslation` and `PlaceTranslation`, one row per entity and locale (`@@unique([entityId, locale])`). Every entity has an `en` row; the API falls back to it when the requested locale is missing.
- **Language-neutral fields:** slugs and tags are English keys (tag labels are translated in the web app); addresses are romanized; proper names (e.g. hotel chains) are not translated.
- **Reviews** are user content and are shown in the language they were written in (`Review.locale`); they are never machine-translated.
- **Routes (Phase 4):** a single set of English routes (`/cities`, `/places`, `/plan`); English at the root, Portuguese under `/pt`, with `hreflang` alternates and `x-default`.
- **Currency** is chosen independently of the language. Defaults: English → USD, Portuguese → BRL; KRW is always shown. Rates come from the `ExchangeRate` table.

## Database

The schema is in [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma); its header comment documents the conventions:

- **IDs** are UUID v7 (time-ordered) stored as native `uuid`.
- **Money in KRW** is an integer; exchange rates are `Decimal`.
- **Integrity:** content tables use `onDelete: Restrict` (remove children first); refresh tokens, favorites and translations cascade with their owner. CHECK constraints (ratings 1–5, price level 1–4, non-negative money, coordinate ranges, supported locales) are hand-written in the migration SQL because Prisma cannot declare them — Prisma ignores them when diffing, so later migrations keep them.
- **Denormalized ratings:** `Place.ratingAvg` / `ratingCount` are derived from reviews.

To change the schema: edit `schema.prisma`, run `pnpm --filter @korea-project/api db:migrate --name <change>`, review the generated SQL (especially anything that drops columns) and commit the migration folder.

## Demo data (seed)

[`apps/api/prisma/seed`](apps/api/prisma/seed) loads 4 cities (Seoul, Busan, Jeju, Incheon) with 19 neighborhoods, 130 well-known places across 8 categories (texts in English and Portuguese), 36 accommodations, daily cost estimates per travel style, demo users, reviews in both languages, favorites and exchange rates.

- **Idempotent:** every row is upserted by its natural key in a single transaction, so it can run any number of times.
- **When it runs:** in Docker, the `migrate` service seeds after migrating **only when `NODE_ENV` is not `production`** (the development override sets `development`). Manually: `pnpm --filter @korea-project/api db:seed`.
- **Demo accounts:** `admin@example.com` (ADMIN, password `SEED_ADMIN_PASSWORD`) and `ana.souza@`, `bruno.lima@`, `carla.mendes@`, `diego.rocha@`, `emily.carter@`, `grace.kim@example.com` (password `SEED_USER_PASSWORD`).
- **Integrity tests** ([`seed-data.spec.ts`](apps/api/prisma/seed/seed-data.spec.ts)) check slugs, translations, coordinates, opening hours, category counts and references, without a database.

> ⚠️ **Prices, opening hours, average spend and exchange rates are planning estimates**, not verified data — review them before relying on them. Images are placeholders from [picsum.photos](https://picsum.photos) (deterministic per slug), to be replaced with real photos.

## Testing

- **Unit tests** (`pnpm test`) need no database.
- **End-to-end tests** (`pnpm test:e2e`) run the full Nest app with Supertest against `TEST_DATABASE_URL` (default: `korea_project_test` on the Compose Postgres). Before the suite, [`global-setup.ts`](apps/api/test/global-setup.ts) **drops and recreates** that database, applies the migrations and loads the seed, so every run starts from the same state and never touches development data.
- **Safety guard:** the e2e suite refuses to run unless the database name contains `_test` ([`test-database.ts`](apps/api/test/test-database.ts)).

## API architecture

Modular monolith: one Nest module per domain in `apps/api/src/modules/`, with **controller → service → repository** layers. Modules only talk to each other through exported services and never access another domain's tables.

Ready so far:

- **Bootstrap** ([`main.ts`](apps/api/src/main.ts), [`setup-app.ts`](apps/api/src/setup-app.ts)): `/api` prefix, URI versioning (`v1`), Helmet, CORS from env, cookie-parser, Swagger, graceful shutdown. The e2e tests use the same `configureApp()`.
- **Config** ([`src/config`](apps/api/src/config)): env validation plus typed namespaces (`app`, `database`, `jwt`, `throttle`, `cache`), injected with `@Inject(appConfig.KEY)`.
- **Prisma** ([`src/prisma`](apps/api/src/prisma)): global `PrismaModule` and `PrismaService` (client generated into `src/generated/prisma`, git-ignored).
- **Common** ([`src/common`](apps/api/src/common)):
  - `AllExceptionsFilter`: every error response is `{ error: { code, message, details? } }`. Prisma errors are mapped (`P2002` → 409, `P2025` → 404, `P2003` → 409); 5xx responses never leak internals.
  - Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) with per-field errors in `details`.
  - Request logging and serialization interceptors (`ClassSerializerInterceptor`, for `@Exclude()` on fields such as `passwordHash`).
  - `@Public()`, `@Roles()` and `@CurrentUser()` decorators (consumed by the Phase 3 guards).
  - `PaginationQueryDto` + `paginate()` for the `{ data, meta: { page, limit, total, totalPages } }` shape.
  - Throttler with two limits: `default` on every route and a stricter `auth` one, applied automatically to `/api/v{n}/auth/*`.
  - `AppCacheModule`: in-memory cache, the single place to switch to Redis.
- **Health** ([`modules/health`](apps/api/src/modules/health)): `GET /api/v1/health` runs `SELECT 1` against Postgres.

API error messages are meant for developers; the web app translates errors by `code`.

## Roadmap

1. ✅ Monorepo setup, Docker Compose, lint/format, `.env.example`, NestJS skeleton
2. ✅ Prisma schema (with i18n), migrations and seed
3. API: auth, users, cities, districts, places, accommodations, reviews, favorites, cost estimates, exchange rates + tests
4. Web: base layout, design system, locale routing, Home, city page, map
5. Cost calculator, place page, reviews, auth, favorites
6. Admin panel, SEO, optimizations, tests, final README with an extension guide
