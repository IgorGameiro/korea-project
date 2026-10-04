# korea-project

South Korea travel guide: cities, neighborhoods, places (restaurants, nightlife, hiking, attractions, cafés, shopping, culture, nature), accommodations and a trip cost calculator. The site is in **English by default**, with **Brazilian Portuguese** as an option; prices are shown in KRW plus USD or BRL.

> **Status:** Phase 3 — REST API complete. See the [Roadmap](#roadmap).

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

A single `.env` at the repository root is used by the API, the Prisma CLI, the seed, Docker Compose and the web app (its `next.config.ts` loads it for runs outside Docker; values already in the environment win). The full list, with comments, is in [`.env.example`](.env.example).

The API **validates its variables at startup** ([`env.validation.ts`](apps/api/src/config/env.validation.ts)) and refuses to boot if one is missing or invalid, listing every problem at once.

| Variable                                                                | Used for                                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                          | Prisma connection (overridden in Compose to point at `postgres`)                |
| `TEST_DATABASE_URL`                                                     | Database for `pnpm test:e2e`; its name must contain `_test`                     |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` | Postgres container (port 5433 on the host)                                      |
| `API_PORT`, `CORS_ORIGINS`, `SWAGGER_ENABLED`                           | API HTTP settings                                                               |
| `JWT_*`, `COOKIE_SECURE`                                                | Authentication (Phase 3); secrets need at least 32 characters                   |
| `TRUST_PROXY`                                                           | Proxy hops whose `X-Forwarded-For` the API trusts (1: the web gateway)          |
| `INTERNAL_API_TOKEN`                                                    | Secret of the web server's own API calls (build/ISR), exempt from rate limits   |
| `THROTTLE_*`                                                            | Global rate limit and the stricter ones for `/auth/*` and `/search`             |
| `CACHE_TTL_MS`                                                          | Default cache TTL                                                               |
| `SEED_ADMIN_PASSWORD`, `SEED_USER_PASSWORD`                             | Passwords of the demo accounts created by the seed                              |
| `KRW_TO_BRL`, `KRW_TO_USD`                                              | Exchange rates written to the `ExchangeRate` table by the seed (**estimates**)  |
| `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`                           | URLs seen by the browser (inlined into the web build)                           |
| `API_INTERNAL_URL`                                                      | API URL used by Next.js server rendering (in Compose: `http://api:3001/api/v1`) |
| `NEXT_PUBLIC_MAP_TILE_URL`, `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION`          | Map tile provider; empty = public OSM tiles (development only, see below)       |

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

## API endpoints

All routes are under `/api/v1` and documented in Swagger (`/api/docs`). Localized routes accept `?locale=en|pt-BR` (else `Accept-Language`, else `en`) and answer with `Content-Language`; every localized item says which language its text is in (`locale`), after falling back to English. Lists return `{ data, meta: { page, limit, total, totalPages } }`. Errors return `{ error: { code, message, details? } }`.

| Area           | Routes                                                                                                                                                                                                                                                 | Access                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| Health         | `GET /health`                                                                                                                                                                                                                                          | public                   |
| Auth           | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me`                                                                                                                                                                  | public / Bearer for `me` |
| Cities         | `GET /cities?featured=`, `GET /cities/:slug` (districts + place counts per category)                                                                                                                                                                   | public                   |
| Places         | `GET /cities/:slug/places` (filters `category`, `districtId`, `priceLevel=1,2`, `tags=a,b`, `difficulty`, `minRating`, `search`; `sort=rating\|price`), `GET /places/:slug` (city, district, newest reviews), `GET /cities/:slug/map` (cached markers) | public                   |
| Accommodations | `GET /cities/:slug/accommodations?tier=&type=&districtId=&sort=price\|-price`                                                                                                                                                                          | public                   |
| Reviews        | `GET /places/:slug/reviews`, `POST /places/:id/reviews`, `PATCH`/`DELETE /reviews/:id` (author or admin)                                                                                                                                               | public / Bearer          |
| Favorites      | `GET`/`POST`/`DELETE /places/:id/favorite`                                                                                                                                                                                                             | Bearer                   |
| Profile        | `GET /users/me/reviews`, `GET /users/me/favorites`                                                                                                                                                                                                     | Bearer                   |
| Costs          | `POST /cost-estimates/calculate` `{ citySlug, people, days, tier, currency? }`                                                                                                                                                                         | public                   |
| Exchange rates | `GET /exchange-rates` (with `updatedAt`)                                                                                                                                                                                                               | public                   |
| Admin          | CRUD under `/admin/cities`, `/admin/districts`, `/admin/places`, `/admin/accommodations`, `/admin/cost-estimates`; `PUT /admin/exchange-rates/:currency` `{ rate }` (USD or BRL)                                                                       | ADMIN                    |

**Auth flow:** the access token (15 min) is returned in the body and sent as `Authorization: Bearer`. The refresh token lives in an `HttpOnly`, `SameSite=Lax` cookie scoped to `/api/v1/auth`; it is rotated on every refresh and only its SHA-256 hash is stored. Reusing a rotated token revokes every session of that login. In production the web and the API must share a site (e.g. `example.com` and `api.example.com`) for the cookie to be sent.

**Exchange rates:** prices are stored in KRW. Rates live in the `ExchangeRate` table, one row per base + target (`KRW→USD`, `KRW→BRL`). In development the seed writes them from `KRW_TO_USD` / `KRW_TO_BRL`; **in production (no seed) an admin must set them** with `PUT /admin/exchange-rates/:currency` (upsert, `rate > 0`, at most 8 decimals). Every write invalidates the cached rates. A missing rate makes the calculator answer `503 EXCHANGE_RATE_UNAVAILABLE`, never a zero or NaN amount.

**Admin translations:** create requires `translations.en`; on update, only the locales sent are changed, partial fields keep the rest, and `"pt-BR": null` removes the Portuguese text (`en` cannot be removed).

**Module graph** (no cycles): `cities ← districts ← places ← reviews / favorites`, plus `accommodations`, `cost-estimates`, `exchange-rates`, `users ← auth`. Endpoints that combine domains (`GET /cities/:slug`, `GET /places/:slug`) live in small composition modules (`city-overview`, `place-overview`) that only call services.

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

## Web architecture

Next.js App Router in [`apps/web`](apps/web), with next-intl for routing and messages.

- **Rendering:** Home, city pages (`/cities/[slug]`) and city sections (`/cities/[slug]/[section]`) are statically generated and refreshed with ISR (every 5 minutes). When the API is not reachable at build time (e.g. the Docker image build), city pages are generated on their first request instead, and the Home is built with a friendly "cities unavailable" notice that ISR replaces.
- **Filters stay out of the static pages:** section filters live in the URL (`?district=hongdae&price=1,2&rating=4&difficulty=easy&sort=price&page=2`, stays: `tier`, `type`, `sort=price-desc`). The proxy ([`src/proxy.ts`](apps/web/src/proxy.ts)) rewrites a section URL that has filter parameters to the internal dynamic route `[section]/filtered`, so the unfiltered page never reads the query string and stays static. The address bar keeps the public URL, filtered pages are `noindex` with a canonical to the unfiltered page, and the internal route answers 404 when requested directly. Every filter value is validated ([`filters.ts`](apps/web/src/features/sections/filters.ts)); an invalid value falls back to the default.
- **Currency:** the server never reads the currency cookie (that would make pages dynamic). The HTML renders the locale's default currency and a client provider applies the visitor's choice after hydration.
- **Session (no tokens in localStorage):** the access token lives only in memory; the refresh token is an httpOnly cookie. On every page load the browser calls `POST /api/v1/auth/refresh` to restore the session (the header shows a neutral placeholder meanwhile). Refreshing is single-flight — requests that expire together share one refresh — and serialized across tabs with the Web Locks API, because refresh tokens rotate and a token presented twice revokes the whole session. Static pages render the signed-out shell; everything user-specific runs on the client, so ISR is unaffected.
- **Same-origin API gateway:** browser calls go to the site's own `/api/v1/*` ([`app/api/v1/[...path]/route.ts`](apps/web/src/app/api/v1/[...path]/route.ts)), which forwards them at runtime to `API_INTERNAL_URL`. The refresh cookie is therefore a first-party cookie of the site (no CORS, no third-party-cookie blocking). The gateway passes `X-Forwarded-For` through and the API trusts one hop (`TRUST_PROXY=1`), so rate limits apply per visitor, not to the web server.
- **Server-side calls are not rate limited:** builds and ISR regenerations all come from the web server's single IP (a full build renders 350+ pages). They send `X-Internal-Token: $INTERNAL_API_TOKEN`, which the API exempts from throttling (constant-time comparison). The token is server-only, and the gateway strips that header from browser requests, so visitors stay limited.
- **API client:** typed with `openapi-typescript` from the API's OpenAPI document (`pnpm --filter @korea-project/web gen:api`, output committed in `src/lib/api/schema.d.ts`).
- **Map:** `MapView` ([`src/features/map`](apps/web/src/features/map)) takes provider-agnostic points; Leaflet lives only in `leaflet-map.tsx`, loaded with `next/dynamic` (`ssr: false`). Swapping to Mapbox GL JS means writing another component with the same props. Markers have a per-category icon and a text label (never color alone), and every map comes with a keyboard-navigable list of its places with a "Show on map" button.

## Before production (mandatory)

- [ ] **A reverse proxy in front of the web app must set `X-Forwarded-For`.** Next.js only fills that header with the socket address when the client sent none, so a web server exposed directly would let clients choose the IP the API rate-limits (and brute-force logins). Put Next behind nginx, a load balancer or a CDN that appends the real client IP, and keep `TRUST_PROXY` equal to the number of proxies between the visitor and the API that you control.
- [ ] **Do not expose the API port publicly** when `TRUST_PROXY` > 0 (direct clients could spoof `X-Forwarded-For`). Browsers only need the web app; publish the API (or Swagger) only on a private network.
- [ ] **A strong, private `INTERNAL_API_TOKEN`** (e.g. `openssl rand -base64 36`), the same in the API and the web server, never exposed to browsers (no `NEXT_PUBLIC_` prefix). Rotate it if it leaks: whoever has it bypasses the rate limits.
- [ ] **HTTPS and `COOKIE_SECURE=true`**, so the refresh cookie is only sent over TLS.

- [ ] **Map tiles — OpenStreetMap tile usage policy.** The default tiles come from `tile.openstreetmap.org`, which is run by volunteers and donations. Its [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) forbids heavy use, requires a valid identifying User-Agent/Referer and visible attribution, and the service can block a site at any time without notice. Before going live, review the policy and either confirm the expected traffic complies or set `NEXT_PUBLIC_MAP_TILE_URL` / `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` to a commercial or self-hosted tile provider. Keep the attribution visible either way.

## Extension points

- **Automatic exchange rates (not implemented):** add a provider client and a scheduled job (e.g. `@nestjs/schedule`) that calls `ExchangeRatesService.upsert(currency, rate, '<provider>')`. Nothing else changes: the table, the cache invalidation and every reader already go through that service. Keep the admin route as a manual override.

## Roadmap

1. ✅ Monorepo setup, Docker Compose, lint/format, `.env.example`, NestJS skeleton
2. ✅ Prisma schema (with i18n), migrations and seed
3. ✅ API: auth, users, cities, districts, places, accommodations, reviews, favorites, cost estimates, exchange rates + tests
4. ✅ Web: base layout, design system, locale routing, Home, cross-city search, city page and sections, map
5. Cost calculator, place page, reviews, auth, favorites
6. Admin panel, SEO, optimizations, tests, final README with an extension guide
