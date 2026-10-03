import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Name of the database in a postgres URL ("postgresql://u:p@host:5433/name?x=y" -> "name"). */
export function databaseName(url: string): string {
  return decodeURIComponent(new URL(url).pathname.replace(/^\//, ''));
}

/**
 * Guard: e2e tests drop and recreate their database, so they refuse to run unless its name
 * contains "_test". This makes it impossible to wipe the development database by mistake.
 */
export function assertTestDatabase(url: string | undefined): string {
  if (!url) throw new Error('Refusing to run e2e tests: DATABASE_URL is not set.');
  const name = databaseName(url);
  if (!name.includes('_test')) {
    throw new Error(
      `Refusing to run e2e tests against database "${name}": its name must contain "_test". ` +
        'Set TEST_DATABASE_URL (see .env.example).',
    );
  }
  if (!/^[A-Za-z0-9_]+$/.test(name)) {
    throw new Error(`Refusing to run e2e tests: unexpected characters in database name "${name}".`);
  }
  return url;
}

/**
 * Loads the root .env (without overriding variables already set), points DATABASE_URL at
 * TEST_DATABASE_URL when provided, and checks it is a test database.
 */
export function loadTestEnv(): string {
  const rootEnv = resolve(__dirname, '../../../.env');
  if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);
  if (process.env.TEST_DATABASE_URL) process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  return assertTestDatabase(process.env.DATABASE_URL);
}
