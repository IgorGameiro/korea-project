#!/bin/sh
# Entry point of the `migrate` service in docker compose (Dockerfile target: migrator).
# Applies pending migrations, then loads the demo seed unless NODE_ENV is "production".
# The seed is idempotent, so running it on every `docker compose up` is safe.
set -eu

pnpm --filter @korea-project/api db:deploy

if [ "${NODE_ENV:-}" = "production" ]; then
  echo "NODE_ENV=production: skipping demo seed."
else
  pnpm --filter @korea-project/api db:seed
fi
