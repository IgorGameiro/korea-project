import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests of the SPEC's acceptance flow, run against a running stack (dev or production
 * compose): `pnpm --filter @korea-project/web e2e`, with E2E_BASE_URL to point elsewhere.
 * They use the installed Google Chrome (channel "chrome"), so no browser download is needed.
 * One worker: the tests create users and reviews in the shared database.
 */
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

// The tests sign up throwaway accounts: never against a real site by accident.
const { hostname } = new URL(baseURL);
if (!['localhost', '127.0.0.1'].includes(hostname) && process.env.E2E_ALLOW_REMOTE !== 'true') {
  throw new Error(
    `Refusing to run the e2e tests against ${hostname}: they create accounts and reviews. ` +
      'Set E2E_ALLOW_REMOTE=true for a disposable staging stack.',
  );
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    channel: 'chrome',
    trace: 'retain-on-failure',
    locale: 'en-US',
    timezoneId: 'Asia/Seoul',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ],
});
