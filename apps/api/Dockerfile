# syntax=docker/dockerfile:1
# Build context: repository root.  docker build -f apps/api/Dockerfile .
#
# Targets:
#   dev       hot reload (used by docker-compose.override.yml)
#   migrator  applies migrations and, unless NODE_ENV=production, loads the demo seed
#             (needs the Prisma CLI and tsx, which are dev dependencies)
#   runner    production image (default)

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

# --- Keep only the api and its workspace dependencies ------------------------
FROM base AS pruner
COPY . .
RUN npx --yes turbo@2.11.7 prune @korea-project/api --docker

# --- Install dependencies (cached while manifests/lockfile are unchanged) ----
FROM base AS deps
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS source
COPY --from=pruner /app/out/full/ .
COPY tsconfig.base.json ./

# --- Development ------------------------------------------------------------
FROM source AS dev
ENV NODE_ENV=development
EXPOSE 3001
CMD ["sh", "-c", "pnpm --filter @korea-project/shared build && pnpm --filter @korea-project/api db:generate && pnpm --filter @korea-project/api dev"]

# --- Migrations ---------------------------------------------------------------
FROM source AS migrator
# The seed imports the generated Prisma client and the built shared package.
RUN pnpm --filter @korea-project/shared build && pnpm --filter @korea-project/api db:generate
WORKDIR /app/apps/api
CMD ["sh", "scripts/migrate.sh"]

# --- Production build -------------------------------------------------------
FROM source AS builder
RUN pnpm turbo run build --filter=@korea-project/api
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter @korea-project/api deploy --prod /prod/api

FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder --chown=node:node /prod/api ./
USER node
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.API_PORT||3001)+'/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main.js"]
