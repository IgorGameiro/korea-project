import { expect, type Page, test } from '@playwright/test';

// The SPEC's acceptance flow (§11): choose a city → see the map and sections → simulate the cost →
// create an account → review a place. Plus: sign up → reload → session restored.

const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function register(page: Page, name: string) {
  const email = `e2e-${unique()}@example.com`;
  await page.goto('/register');
  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('a long enough password');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expectSignedIn(page, name);
  return email;
}

/** The header shows the visitor's name next to "Log out". */
async function expectSignedIn(page: Page, name: string) {
  const header = page.getByRole('banner');
  await expect(header.getByRole('button', { name: 'Log out' })).toBeVisible();
  await expect(header.getByText(name, { exact: true })).toBeVisible();
}

test('choose a city, explore its map and sections, and estimate the trip', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('link', { name: /^Seoul/ })
    .first()
    .click();
  await expect(page.getByRole('heading', { level: 1, name: /Seoul/ })).toBeVisible();

  // The map loads when it comes into view, with an accessible list of its places.
  const map = page.getByRole('region', { name: 'Map of Seoul' });
  await map.scrollIntoViewIfNeeded();
  await expect(map.locator('.leaflet-container')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Show on map: / }).first()).toBeVisible();

  // Trip cost: changing the travelers updates the estimate (computed by the API).
  const result = page.getByRole('region', { name: 'Estimated cost' });
  await expect(result.getByText('2 travelers · 5 days')).toBeVisible();
  await page.getByRole('button', { name: 'More travelers' }).click();
  await expect(result.getByText('3 travelers · 5 days · 4 nights · 2 rooms')).toBeVisible();

  // A section with a filter in the URL.
  await page
    .getByRole('navigation', { name: 'City sections' })
    .getByRole('link', { name: /Hiking/ })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: 'Hiking in Seoul' })).toBeVisible();
  await page.getByLabel('Trail difficulty').selectOption('easy');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page).toHaveURL(/\/cities\/seoul\/hiking\?difficulty=easy$/);
  await expect(page.getByRole('heading', { level: 2, name: /\d+ places?$/ })).toBeVisible();
});

test('create an account and review a place; the rating updates for the author', async ({
  page,
}) => {
  await register(page, 'E2E Reviewer');

  await page.goto('/places/seoul-forest');
  const rating = page.getByRole('img', { name: /out of 5|No reviews/ }).first();
  const before =
    (await page
      .getByText(/^\d+ reviews?$|^No reviews yet$/)
      .first()
      .textContent()) ?? '';
  const count = (text: string) => Number(text.match(/\d+/)?.[0] ?? 0);

  await page.getByText('5 stars', { exact: true }).click({ force: true });
  await page.getByLabel('Title').fill('Great walk');
  await page
    .getByRole('textbox', { name: 'Your review' })
    .fill('Shady paths and deer — lovely in the afternoon.');
  await page.getByRole('button', { name: 'Publish review' }).click();

  await expect(
    page.getByRole('status').filter({ hasText: 'Your review is published.' }),
  ).toBeVisible();
  await expect(
    page.getByText(`${count(before) + 1} review`, { exact: false }).first(),
  ).toBeVisible();
  await expect(rating).toBeVisible();

  // Clean up: delete it (with confirmation).
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete review' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Your review was deleted.' }),
  ).toBeVisible();
});

test('sign up → reload → the session is restored', async ({ page }) => {
  await register(page, 'E2E Session');
  await page.reload();
  // A neutral placeholder first, then the user again — without logging in a second time.
  await expectSignedIn(page, 'E2E Session');
  await page.goto('/account');
  await expect(page.getByRole('heading', { level: 1, name: 'My account' })).toBeVisible();
});

test('anonymous visitors are sent to the login page from protected pages', async ({ page }) => {
  await page.goto('/account');
  await expect(page).toHaveURL(/\/login\?next=%2Faccount/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin/);
});
