#!/bin/sh
# Entry point of the `migrate` service in docker compose (Dockerfile target: migrator).
# Applies pending migrations, then loads the demo seed outside production — or in production when
# SEED_DEMO_DATA=true (a demo deployment). The seed is idempotent, so running it on every
# `docker compose up` is safe.
set -eu

pnpm --filter @korea-project/api db:deploy

if [ "${NODE_ENV:-}" != "production" ] || [ "${SEED_DEMO_DATA:-false}" = "true" ]; then
  pnpm --filter @korea-project/api db:seed
else
  echo "NODE_ENV=production: skipping the demo seed (set SEED_DEMO_DATA=true to load it)."
fi
