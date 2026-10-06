# korea-project

**🌐 Live demo: [korea-project-one.vercel.app](https://korea-project-one.vercel.app)** · API docs: [Swagger](https://korea-project-api.onrender.com/api/docs)

> The demo runs on free plans: the API sleeps after 15 minutes without visits, so the first login or cost estimate can take about a minute. Pages load right away.

South Korea travel guide: cities, neighborhoods, places (restaurants, nightlife, hiking, attractions, cafés, shopping, culture, nature), accommodations and a trip cost calculator. The site is in **English by default**, with **Brazilian Portuguese** as an option; prices are shown in KRW plus USD or BRL.

> **Status:** all six phases are complete (MVP). See the [Roadmap](#roadmap), the [Extension guide](#extension-guide) and the [Before production](#before-production-mandatory) checklist.

## Stack

| Layer    | Technology                                                                                      |
| -------- | ----------------------------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router) · React 19 · Tailwind CSS 4                                             |
| Backend  | NestJS 12 · Swagger/OpenAPI · Terminus · Throttler · Cache Manager                              |
| Database | PostgreSQL 18 · Prisma 7 (driver adapter `@prisma/adapter-pg`)                                  |
| Monorepo | pnpm 12 workspaces · Turborepo                                                                  |
| Quality  | TypeScript 6 · ESLint 9 · Prettier · Husky + lint-staged · Jest/Supertest · Vitest · Playwright |
| Infra    | Docker Compose · Node.js 24 LTS                                                                 |

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

To run the production images only (no override, `NODE_ENV=production`, **no demo seed**):

```bash
docker compose -f docker-compose.yml up --build
```

A production database starts empty: create the content through `/admin` (an ADMIN user is needed; see the seed's `admin@example.com`) and set the exchange rates. For a **demo deployment** with the sample content, load the seed once with `SEED_DEMO_DATA=true`:

```bash
SEED_DEMO_DATA=true docker compose -f docker-compose.yml up --build
```

The web image is built without a reachable API, so the pages prebuilt by `next build` (home, plan) start with their "could not be loaded" fallback. Right after starting, the web server waits for the API's health check and invalidates them ([`startup-refresh.ts`](apps/web/src/lib/startup-refresh.ts), called from [`instrumentation.ts`](apps/web/src/instrumentation.ts)), so the first visitors already get live content. The log says `Startup: prebuilt pages invalidated…`.

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
| `pnpm e2e`          | Browser tests (Playwright) of the acceptance flow against a running stack (**see Testing**)    |
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
| `SEED_DEMO_DATA`                                                        | `true` loads the demo seed even with `NODE_ENV=production` (demo deployments)   |
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
- **When it runs:** in Docker, the `migrate` service seeds after migrating **only when `NODE_ENV` is not `production`** (the development override sets `development`), or when `SEED_DEMO_DATA=true`. Manually: `pnpm --filter @korea-project/api db:seed`.
- **Demo accounts:** `admin@example.com` (ADMIN, password `SEED_ADMIN_PASSWORD`) and `ana.souza@`, `bruno.lima@`, `carla.mendes@`, `diego.rocha@`, `emily.carter@`, `grace.kim@example.com` (password `SEED_USER_PASSWORD`).
- **Integrity tests** ([`seed-data.spec.ts`](apps/api/prisma/seed/seed-data.spec.ts)) check slugs, translations, coordinates, opening hours, category counts and references, without a database.

> ⚠️ **Prices, opening hours, average spend and exchange rates are planning estimates**, not verified data — review them before relying on them. 82 places and the 4 cities have credited Wikimedia Commons photos; the other places use placeholders from [picsum.photos](https://picsum.photos) (deterministic per slug).

## Testing

- **Unit tests** (`pnpm test`) need no database.
- **End-to-end tests** (`pnpm test:e2e`) run the full Nest app with Supertest against `TEST_DATABASE_URL` (default: `korea_project_test` on the Compose Postgres). Before the suite, [`global-setup.ts`](apps/api/test/global-setup.ts) **drops and recreates** that database, applies the migrations and loads the seed, so every run starts from the same state and never touches development data.
- **Safety guard:** the e2e suite refuses to run unless the database name contains `_test` ([`test-database.ts`](apps/api/test/test-database.ts)).
- **Web unit and component tests** (Vitest + Testing Library + jest-axe) cover the components, hooks, proxy, filters, SEO helpers, security headers and route handlers.
- **Browser tests** ([`apps/web/e2e`](apps/web/e2e), Playwright) run the SPEC's acceptance flow on desktop and mobile (Pixel 7) viewports: choose a city → the map and its place list → the cost calculator → a section with a filter in the URL; sign up → review a place → the count updates → delete it; sign up → reload → the session is restored; anonymous visitors are redirected from `/account` and `/admin` to the login page. They run against a **running stack** (dev or production compose, with the demo seed) and use the installed Google Chrome, so nothing is downloaded:

  ```bash
  docker compose up -d
  pnpm e2e
  ```

  `E2E_BASE_URL` points them elsewhere (default `http://localhost:3000`). They create throwaway accounts, so the config **refuses any host other than localhost** unless `E2E_ALLOW_REMOTE=true` (for a disposable staging stack only). On failure, a trace is kept in `apps/web/test-results/` (`pnpm --filter @korea-project/web exec playwright show-trace <trace.zip>`).

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

- **Rendering:** Home, city pages (`/cities/[slug]`) and city sections (`/cities/[slug]/[section]`) are statically generated and refreshed with ISR (every 5 minutes). When the API is not reachable at build time (e.g. the Docker image build), city and place pages are generated on their first request instead, and the Home is built with a friendly "cities unavailable" notice that the server replaces as soon as it starts and the API answers (see Getting started). `loading.tsx` skeletons must not read request data (they receive no route params): their translated label comes from a client component, otherwise every on-demand ISR page fails with `DYNAMIC_SERVER_USAGE`.
- **Filters stay out of the static pages:** section filters live in the URL (`?district=hongdae&price=1,2&rating=4&difficulty=easy&sort=price&page=2`, stays: `tier`, `type`, `sort=price-desc`). The proxy ([`src/proxy.ts`](apps/web/src/proxy.ts)) rewrites a section URL that has filter parameters to the internal dynamic route `[section]/filtered`, so the unfiltered page never reads the query string and stays static. The address bar keeps the public URL, filtered pages are `noindex` with a canonical to the unfiltered page, and the internal route answers 404 when requested directly. Every filter value is validated ([`filters.ts`](apps/web/src/features/sections/filters.ts)); an invalid value falls back to the default.
- **Currency:** the server never reads the currency cookie (that would make pages dynamic). The HTML renders the locale's default currency and a client provider applies the visitor's choice after hydration.
- **Session (no tokens in localStorage):** the access token lives only in memory; the refresh token is an httpOnly cookie. On every page load the browser calls `POST /api/v1/auth/refresh` to restore the session (the header shows a neutral placeholder meanwhile). Refreshing is single-flight — requests that expire together share one refresh — and serialized across tabs with the Web Locks API, because refresh tokens rotate and a token presented twice revokes the whole session. Static pages render the signed-out shell; everything user-specific runs on the client, so ISR is unaffected.
- **Same-origin API gateway:** browser calls go to the site's own `/api/v1/*` ([`app/api/v1/[...path]/route.ts`](apps/web/src/app/api/v1/[...path]/route.ts)), which forwards them at runtime to `API_INTERNAL_URL`. The refresh cookie is therefore a first-party cookie of the site (no CORS, no third-party-cookie blocking). The gateway passes `X-Forwarded-For` through and the API trusts one hop (`TRUST_PROXY=1`), so rate limits apply per visitor, not to the web server.
- **Admin changes show up at once:** every content fetch made while rendering carries the cache tag `content`. After each create, update or delete, the admin calls `POST /api/revalidate` ([route](apps/web/src/app/api/revalidate/route.ts)), which accepts only an ADMIN token (checked against `GET /auth/me`) and invalidates that tag (`expire: 0`) and every route. Everything is invalidated on purpose, rather than a computed list of pages: a city appears on the home page, its sections, each place breadcrumb and the search, and a missed dependency would quietly serve stale data. Pages regenerate lazily, on their next visit. If the refresh fails the change is still saved, and pages catch up within their ISR window (5 minutes at most).
- **Admin (`/admin`, English only):** client-rendered screens for cities, districts, places (with a visual opening-hours editor that uses the same shared validation as the API), stays, cost estimates, exchange rates and review moderation. The browser hides it from non-admins, but the API enforces the ADMIN role on every admin route.
- **SEO:** `generateMetadata` on every page (title, description, canonical, hreflang with `x-default`, Open Graph with the page's photo or a default image generated at `/og` and `/pt/og`, Twitter card); [`sitemap.xml`](apps/web/src/app/sitemap.ts) with every indexable page in both languages and their alternates; [`robots.txt`](apps/web/src/app/robots.ts) blocks only `/admin` and `/api/` (search, login and account pages use `noindex`, which crawlers can only see if they may fetch them); JSON-LD on the home page (WebSite + SearchAction), cities (TouristDestination + breadcrumb) and places (Restaurant, CafeOrCoffeeShop, BarOrPub, Store or TouristAttraction, with address, geo, price range, opening hours, rating and breadcrumb).
- **No `dangerouslySetInnerHTML`, with one audited exception:** ESLint's `react/no-danger` is an error everywhere except [`json-ld.tsx`](apps/web/src/components/seo/json-ld.tsx), because JSON-LD must be raw text inside `<script>`. Its content comes only from our own API and is serialized with `<`, `>`, `&` and U+2028/2029 escaped, so no value can close the element (covered by an injection test).
- **Photos and credits:** 82 places and the 4 cities show real photos from Wikimedia Commons ([`photos.ts`](apps/api/prisma/seed/data/photos.ts)). Each was matched through the place's Wikidata item (its official image, P18) or a Commons search, and **checked visually** to really show the place (16 wrong matches were rejected, e.g. a map of Paradise, Kansas for "Paradise City"). The other places keep an illustrative placeholder. Photos carry their credit (`{ url, credit: { author, license, licenseUrl, sourceUrl } }`, validated by the shared `validatePhotos`); the gallery and the city hero show "Photo: author · license" linked to the file page and the license text, and [`/credits`](apps/web/src/app/[locale]/credits/page.tsx) lists them all. A seed test fails if a real photo lacks its credit.
- **Security headers** ([`security-headers.ts`](apps/web/security-headers.ts), applied in `next.config.ts`): Content-Security-Policy, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, and HSTS over HTTPS. The CSP allows scripts, styles, fonts and connections only from the site, images only from the site (remote photos go through `next/image`) and the tile server, and no plugins, framing or foreign form posts; `'unsafe-eval'` only in development. It keeps `'unsafe-inline'` for scripts on purpose: pages are static (ISR), and Next.js needs dynamic rendering for per-request nonces; its experimental SRI covers script files but not the inline React payload of each page (tested: 9 inline scripts blocked, the page stops working).
- **Performance** (Lighthouse 13.5, mobile, production build): home 92, city 94, place 95 for performance; 100 for accessibility, best practices and SEO (city accessibility 100). What made the difference: Korean names use the system's Korean font (the Noto Sans KR web font added 248 render-blocking `@font-face` rules to every page); Inter ships only its `latin` subset and ₩ is drawn by a `local()` face, so one 49 KB font file loads; photos are served as AVIF; the first visible image loads eagerly with high priority; the review form (React Hook Form + Zod) and the map (Leaflet + tiles) load only when needed; anonymous visitors make no session-refresh request (a readable `has_session` hint cookie, no secret, says when a session exists). Page weight went from 631/1,512/989 KB to 350/381/314 KB (home/city/place).
- **Server-side calls are not rate limited:** builds and ISR regenerations all come from the web server's single IP (a full build renders 350+ pages). They send `X-Internal-Token: $INTERNAL_API_TOKEN`, which the API exempts from throttling (constant-time comparison). The token is server-only, and the gateway strips that header from browser requests, so visitors stay limited.
- **API client:** typed with `openapi-typescript` from the API's OpenAPI document (`pnpm --filter @korea-project/web gen:api`, output committed in `src/lib/api/schema.d.ts`).
- **Map:** `MapView` ([`src/features/map`](apps/web/src/features/map)) takes provider-agnostic points; Leaflet lives only in `leaflet-map.tsx`, loaded with `next/dynamic` (`ssr: false`). Swapping to Mapbox GL JS means writing another component with the same props. Markers have a per-category icon and a text label (never color alone), and every map comes with a keyboard-navigable list of its places with a "Show on map" button.

## Before production (mandatory)

- [ ] **A reverse proxy in front of the web app must set `X-Forwarded-For`.** Next.js only fills that header with the socket address when the client sent none, so a web server exposed directly would let clients choose the IP the API rate-limits (and brute-force logins). Put Next behind nginx, a load balancer or a CDN that appends the real client IP, and keep `TRUST_PROXY` equal to the number of proxies between the visitor and the API that you control.
- [ ] **Do not expose the API port publicly** when `TRUST_PROXY` > 0 (direct clients could spoof `X-Forwarded-For`). Browsers only need the web app; publish the API (or Swagger) only on a private network.
- [ ] **Photos: copy them to your own storage.** The MVP hotlinks Wikimedia Commons thumbnails (allowed, and Next's image optimizer caches them), but for production copy each file to your storage (S3/Cloudinary, see Extension points) and keep its credit: Wikimedia asks heavy users not to hotlink, and a renamed or deleted file would break the image. Replace the remaining placeholders with real, licensed photos.
- [ ] **A strong, private `INTERNAL_API_TOKEN`** (e.g. `openssl rand -base64 36`), the same in the API and the web server, never exposed to browsers (no `NEXT_PUBLIC_` prefix). Rotate it if it leaks: whoever has it bypasses the rate limits.
- [ ] **HTTPS and `COOKIE_SECURE=true`**, so the refresh cookie is only sent over TLS. Set `NEXT_PUBLIC_SITE_URL` to the real https origin (canonical URLs, sitemap, Open Graph) and `CORS_ORIGINS` to it.
- [ ] **New secrets:** `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (`openssl rand -base64 48`), a strong `POSTGRES_PASSWORD`. The values in `.env.example` are public.
- [ ] **No demo data:** keep `SEED_DEMO_DATA=false`. If a demo seed was ever loaded, delete the demo accounts or at least change their passwords — `admin@example.com` is an ADMIN.
- [ ] **Exchange rates set by an admin** (`/admin/exchange-rates`), otherwise the calculator answers "rate unavailable" for USD/BRL.
- [ ] **Swagger:** `SWAGGER_ENABLED=false` unless the API documentation is meant to be public.
- [ ] **Database backups** (e.g. scheduled `pg_dump` or the managed provider's snapshots) and `prisma migrate deploy` as a release step, never `migrate dev` or `migrate reset`.
- [ ] **Review the estimates** (prices, opening hours, average spend) before presenting them as current.

- [ ] **Map tiles — OpenStreetMap tile usage policy.** The default tiles come from `tile.openstreetmap.org`, which is run by volunteers and donations. Its [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) forbids heavy use, requires a valid identifying User-Agent/Referer and visible attribution, and the service can block a site at any time without notice. Before going live, review the policy and either confirm the expected traffic complies or set `NEXT_PUBLIC_MAP_TILE_URL` / `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` to a commercial or self-hosted tile provider. Keep the attribution visible either way.

## Free deployment (Vercel + Render + Neon)

A demo deployment on free plans: the website on **Vercel** (Hobby), the API on **Render** (free web service, Docker) and PostgreSQL 18 on **Neon** (free). Free plans change; check each provider's pricing page.

```
browser ──► Vercel (Next.js, ISR + /api/v1 gateway) ──► Render (NestJS API) ──► Neon (Postgres 18)
```

Trade-offs of the free plans: the Render API **sleeps after 15 minutes** without requests and takes about a minute to wake up. Pages stay fast (they are static, and a failed ISR refresh keeps the last good page), but login, reviews and the calculator wait for the API on the first request. Open `<api>/api/v1/health` a minute before a demo.

### 1. Secrets

Generate new values (never reuse the ones in `.env.example`, they are public):

```bash
openssl rand -base64 48
```

Run it once each for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` and `INTERNAL_API_TOKEN`, and pick strong passwords for the demo accounts (`SEED_ADMIN_PASSWORD`, `SEED_USER_PASSWORD`): the site is public and `admin@example.com` is an ADMIN.

### 2. Database (Neon)

Create a project with **Postgres 18** (a migration uses `uuidv7()`). Copy the **direct** connection string (not the `-pooler` one; Prisma migrations need a direct connection) and keep `sslmode=require`.

Apply the migrations and load the demo content from your machine, with a git-ignored `.env.neon` at the repository root:

```bash
DATABASE_URL=postgresql://<user>:<password>@<host>.neon.tech/<db>?sslmode=require
SEED_ADMIN_PASSWORD=<strong password>
SEED_USER_PASSWORD=<strong password>
KRW_TO_BRL=0.0039
KRW_TO_USD=0.00072
```

```bash
set -a
source .env.neon
set +a
pnpm --filter @korea-project/api db:deploy
pnpm --filter @korea-project/api db:seed
```

Future migrations are applied the same way (`db:deploy`), before deploying the code that needs them.

### 3. API (Render)

New **Web Service** from the GitHub repository, **Docker** runtime, Dockerfile path `apps/api/Dockerfile`, build context `.` (the default target is the production image), free instance type, health check path `/api/v1/health`. Environment:

| Variable                                  | Value                                                           |
| ----------------------------------------- | --------------------------------------------------------------- |
| `NODE_ENV`                                | `production`                                                    |
| `API_PORT`                                | `10000` (the port Render routes to)                             |
| `DATABASE_URL`                            | the Neon direct connection string                               |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | generated in step 1                                             |
| `INTERNAL_API_TOKEN`                      | generated in step 1 (the same value goes to Vercel)             |
| `COOKIE_SECURE`                           | `true`                                                          |
| `TRUST_PROXY`                             | `2` (Render's proxy + the Vercel gateway)                       |
| `CORS_ORIGINS`                            | the Vercel URL, e.g. `https://korea-project.vercel.app`         |
| `SWAGGER_ENABLED`                         | `true` to show the API docs in the portfolio, `false` otherwise |

### 4. Website (Vercel)

Import the repository, set **Root Directory** to `apps/web` (install and build commands come from [`apps/web/vercel.json`](apps/web/vercel.json); the build runs Turborepo from the repository root, so `packages/shared` is built first). Environment variables (Production):

| Variable                       | Value                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` (uses the pnpm version pinned in `packageManager`)                          |
| `API_INTERNAL_URL`             | `https://<render-service>.onrender.com/api/v1`                                  |
| `INTERNAL_API_TOKEN`           | the same value as the API                                                       |
| `NEXT_PUBLIC_SITE_URL`         | the Vercel URL, e.g. `https://korea-project.vercel.app` (rebuild if it changes) |

Wake the API (`/api/v1/health`) before each deploy: the build prerenders the pages from it. If it does not answer, the build still succeeds and the pages are generated on their first visit.

Browsers only talk to the Vercel site: its `/api/v1/*` gateway forwards to Render, so the refresh cookie is first-party and the CSP stays `connect-src 'self'`.

**Known limitation of the free setup:** the Render URL is public (private networking is a paid feature), so a client calling it directly could send a forged `X-Forwarded-For` and dodge the per-IP rate limits. Acceptable for a demo; in production, keep the API on a private network (see Before production).

## Extension guide

The MVP keeps infrastructure minimal on purpose (one API process, in-memory cache, Postgres only). Each item below names the single place to change.

### A new API module

1. `apps/api/src/modules/<name>/` with `<name>.module.ts`, `<name>.controller.ts`, `<name>.service.ts`, `<name>.repository.ts` (the only file that touches Prisma) and `dto/` (class-validator, `@ApiProperty` for Swagger).
2. Register the module in [`app.module.ts`](apps/api/src/app.module.ts). Routes are versioned automatically (`/api/v1/...`); add `@Public()` to public endpoints (JWT is required by default) and `@Roles('ADMIN')` to admin ones.
3. Other modules use it only through its **exported service**, never its tables. If it combines domains, put that in a small composition module (like `city-overview`).
4. Schema changes: edit `schema.prisma`, `db:migrate --name <change>`, review the SQL. Translatable text goes in a `<Entity>Translation` table with the locale CHECK constraint (copy it from the i18n migration).
5. Regenerate the web client: `pnpm --filter @korea-project/web gen:api` (API running) and commit `schema.d.ts`.
6. Tests: a `*.spec.ts` unit test next to the service and an e2e spec in `apps/api/test/`.

### Redis cache

Everything injects `CACHE_MANAGER`; the store is chosen only in [`app-cache.module.ts`](apps/api/src/common/cache/app-cache.module.ts). Add `@keyv/redis`, a `REDIS_URL` variable (validated in `env.validation.ts`), `stores: [new KeyvRedis(url)]` in the factory and a `redis` service in `docker-compose.yml`. Needed as soon as the API runs **more than one instance**: the in-memory cache and the cache invalidation after admin writes are per process. With several instances, also move the throttler storage to Redis (`@nest-lab/throttler-storage-redis`), or limits become per instance.

### Background jobs (BullMQ)

For work that should not run inside a request (sending emails, importing photos, recomputing aggregates, fetching exchange rates): add `@nestjs/bullmq` with the same Redis, a `jobs` module with one queue per kind of work, and processors that call the existing services. Run the processors in a separate container (same image, another entrypoint) so a slow job never delays the API.

### Domain events (event-emitter)

Today side effects are direct calls (e.g. a review write recomputes the place's `ratingAvg`). To decouple them, add `@nestjs/event-emitter`, emit events from the owning service after the transaction commits (`review.created`, `place.updated`…) and move side effects into listeners (cache invalidation, a BullMQ job, notifications). Keep anything that must be consistent with the write (the rating) inside the transaction.

### Uploads (S3 or Cloudinary)

Photos are stored as `{ url, credit }` objects in JSON columns and validated by the shared `validatePhotos` ([`packages/shared`](packages/shared/src)), so storage can change without a migration:

1. An `uploads` API module with an ADMIN-only endpoint that returns a **pre-signed upload URL** (S3/R2: `@aws-sdk/s3-presigner`; Cloudinary: a signed upload preset). The browser uploads directly; the API never streams files.
2. Validate type and size in the signature (images only, e.g. ≤ 10 MB) and store only the final public URL.
3. Add the bucket/CDN host to `images.remotePatterns` in [`next.config.ts`](apps/web/next.config.ts) (the CSP needs nothing else: images go through `next/image`).
4. In the admin [photos editor](apps/web/src/features/admin/places/photos-editor.tsx), add an "Upload" button next to the URL field. Keep the credit fields: they are required for third-party photos.

### Map provider and map tiles

- **Tiles only** (same Leaflet map): set `NEXT_PUBLIC_MAP_TILE_URL` and `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` (inlined at build time, so rebuild the web image). The tile host is added to the CSP's `img-src` automatically ([`security-headers.ts`](apps/web/security-headers.ts)).
- **Another library** (e.g. Mapbox GL JS, MapLibre): `MapView` takes provider-agnostic points and only `leaflet-map.tsx` knows Leaflet. Write another component with the same props, load it with `next/dynamic` (`ssr: false`), and extend the CSP (`connect-src`/`worker-src` for vector tiles, `script-src` if the library needs a CDN). Keep the accessible place list and the per-category icons.

### Exchange-rate provider

Add a provider client (e.g. an ECB or Open Exchange Rates API) and a scheduled job (`@nestjs/schedule`, or a BullMQ repeatable job) that calls `ExchangeRatesService.upsert(currency, rate, '<provider>')`. Nothing else changes: the table, the cache invalidation and every reader already go through that service. Keep the admin route as a manual override, and keep the "rate unavailable" behavior when the provider fails rather than storing a zero.

### A new language

1. Add the BCP 47 tag to `LOCALES` and its default currency to `DEFAULT_CURRENCY_BY_LOCALE` in [`packages/shared/src/i18n.ts`](packages/shared/src/i18n.ts).
2. A migration that updates the locale CHECK constraints of every translation table (and `Review.locale`).
3. `apps/web/src/messages/<tag>.json` with every key of `en.json` (a test fails on missing keys), and, if the URL prefix differs from the tag, an entry in `localePrefix.prefixes` in [`routing.ts`](apps/web/src/i18n/routing.ts).
4. Translate the content in `/admin` (missing translations fall back to English, and the API says which locale it returned). The sitemap and the hreflang alternates pick the new locale up from `LOCALES`.

### A new place category

1. Add it to `enum PlaceCategory` in `schema.prisma` (migration) and to the shared enum in [`packages/shared/src/enums.ts`](packages/shared/src/enums.ts).
2. Web: its icon and color in [`categories.ts`](apps/web/src/lib/categories.ts) (`CATEGORY_META`), its section slug in [`sections.ts`](apps/web/src/lib/sections.ts), its labels in both message files (`categoryShortcuts`, `city.sections`) and its schema.org type in [`structured-data.ts`](apps/web/src/lib/structured-data.ts).
3. Regenerate the API client; TypeScript then points at every `Record<PlaceCategory, …>` that still lacks it.

## Roadmap

1. ✅ Monorepo setup, Docker Compose, lint/format, `.env.example`, NestJS skeleton
2. ✅ Prisma schema (with i18n), migrations and seed
3. ✅ API: auth, users, cities, districts, places, accommodations, reviews, favorites, cost estimates, exchange rates + tests
4. ✅ Web: base layout, design system, locale routing, Home, cross-city search, city page and sections, map
5. ✅ Cost calculator, place page, reviews, auth, favorites
6. ✅ Admin panel, SEO, real photos, optimizations (performance and security headers), browser tests, final README with an extension guide

Possible next steps: automatic exchange rates, uploads to own storage, Redis + several API instances, more cities and languages (see the [Extension guide](#extension-guide)).
