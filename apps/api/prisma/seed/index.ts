// Seed entry point: `pnpm --filter @korea-project/api db:seed` (runs `prisma db seed`).
// Loads demo data for development. In Docker it runs automatically only when NODE_ENV !== 'production'.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import argon2 from 'argon2';
import { PrismaClient } from '../../src/generated/prisma/client';
import { cities, favorites, reviews, users } from './data';
import { runSeed } from './run';

function loadEnv(): void {
  const rootEnv = resolve(__dirname, '../../../../.env');
  if (!process.env.DATABASE_URL && existsSync(rootEnv)) process.loadEnvFile(rootEnv);
}

function requireEnv(name: string, minLength = 1): string {
  const value = process.env[name];
  if (!value || value.length < minLength) {
    throw new Error(`${name} is required${minLength > 1 ? ` (min ${minLength} characters)` : ''}`);
  }
  return value;
}

async function main(): Promise<void> {
  loadEnv();
  const databaseUrl = requireEnv('DATABASE_URL');
  const adminPassword = requireEnv('SEED_ADMIN_PASSWORD', 8);
  const userPassword = requireEnv('SEED_USER_PASSWORD', 8);
  const krwToBrl = Number(requireEnv('KRW_TO_BRL'));
  if (!(krwToBrl > 0)) throw new Error('KRW_TO_BRL must be a positive number');

  const passwordHashes = new Map<string, string>();
  for (const user of users) {
    const password = user.role === 'ADMIN' ? adminPassword : userPassword;
    passwordHashes.set(user.email.toLowerCase(), await argon2.hash(password));
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  try {
    const startedAt = Date.now();
    const summary = await runSeed(prisma, {
      cities,
      users,
      reviews,
      favorites,
      passwordHashes,
      krwToBrl,
    });
    console.log(`Seed finished in ${Date.now() - startedAt}ms. Rows in the database:`);
    console.table(summary);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error('Seed failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
