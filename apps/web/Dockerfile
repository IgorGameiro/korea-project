# syntax=docker/dockerfile:1
# Build context: repository root.  docker build -f apps/web/Dockerfile .
#
# Targets:
#   dev     next dev with hot reload (used by docker-compose.override.yml)
#   runner  production image using Next.js standalone output (default)

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS pruner
COPY . .
RUN npx --yes turbo@2.11.7 prune @korea-project/web --docker

FROM base AS deps
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS source
COPY --from=pruner /app/out/full/ .
COPY tsconfig.base.json eslint.config.base.mjs ./

# --- Development ------------------------------------------------------------
FROM source AS dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @korea-project/shared build && pnpm --filter @korea-project/web exec next dev --hostname 0.0.0.0 --port 3000"]

# --- Production build -------------------------------------------------------
FROM source AS builder
# NEXT_PUBLIC_* values are inlined into the client bundle at build time.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN pnpm turbo run build --filter=@korea-project/web

FROM node:${NODE_VERSION}-alpine AS runner
# HOSTNAME must stay 0.0.0.0 (or empty): with HOSTNAME=127.0.0.1, Next 16.3's standalone server turns
# the proxy's locale rewrites (/ -> /en) into 307 self-redirects (see vercel/next.js#91844).
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=node:node /app/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
