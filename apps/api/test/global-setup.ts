import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { Client } from 'pg';
import { databaseName, loadTestEnv } from './test-database';

/**
 * Runs once before the e2e suite: recreates the *_test database from scratch, applies every
 * migration and loads the seed, so tests start from a known state and never touch dev data.
 */
export default async function globalSetup(): Promise<void> {
  const url = loadTestEnv();
  const name = databaseName(url);

  // Connect to the maintenance database of the same server to drop/create the test one.
  const admin = new URL(url);
  admin.pathname = '/postgres';
  admin.search = '';
  const client = new Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    await client.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    await client.query(`CREATE DATABASE "${name}"`);
  } finally {
    await client.end();
  }

  const run = (command: string) =>
    execSync(command, {
      cwd: resolve(__dirname, '..'),
      env: { ...process.env, DATABASE_URL: url },
      stdio: ['ignore', 'ignore', 'inherit'],
    });
  run('pnpm exec prisma migrate deploy');
  run('pnpm exec tsx prisma/seed/index.ts');
}
