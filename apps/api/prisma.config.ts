import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma 7 no longer loads .env on its own. Locally the env lives at the repo root
// (the Prisma CLI always runs from apps/api via the package scripts);
// in Docker the variables come from the container environment and no file exists.
const rootEnv = resolve(process.cwd(), '../../.env');
if (!process.env.DATABASE_URL && existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv);
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Run explicitly with `prisma db seed` (Prisma 7 no longer seeds after migrate dev/reset).
    seed: 'tsx prisma/seed/index.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
