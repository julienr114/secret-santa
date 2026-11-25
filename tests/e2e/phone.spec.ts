import { expect, test } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// The app on the phone (ticket 124): installable (its manifest and its
// icons), offered once on the home of a phone's browser, and from « Me
// prévenir ». Subscribing and receiving need a real phone: Julien.
test.use({ storageState: { cookies: [], origins: [] } });

const ME = 'phone-app@example.com';

test('the app is installable: its manifest, its icons, its worker', async ({
  request,
}) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBe('/');
  for (const icon of manifest.icons) {
    expect((await request.get(icon.src)).ok()).toBe(true);
  }
  const worker = await request.get('/sw.js');
  expect(worker.ok()).toBe(true);
  // No offline mode: the worker answers no request in place of the server.
  expect(await worker.text()).not.toContain("addEventListener('fetch'");
});

test('on an iPhone browser, the home offers to install once', async ({
  page,
}) => {
  await apiLogin(page.request, ME);
  await page.goto('/');
  await hydrated(page);
  await expect(page.getByTestId('install-steps')).toContainText(
    'Touche « Partager », en bas de Safari.',
  );
  await page.getByRole('button', { name: 'Plus tard' }).click();
  await expect(page.getByTestId('install-steps')).toHaveCount(0);
  await page.reload();
  await hydrated(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('install-steps')).toHaveCount(0);
  // Still offered from « Me prévenir ».
  await page.goto('/compte/me-prevenir');
  await hydrated(page);
  await page.getByTestId('install-row').click();
  await expect(page.getByTestId('install-steps')).toBeVisible();
});
