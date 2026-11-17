import { expect, test } from '@playwright/test';
import { heading, loginAsSuper } from './helpers';

// After a deployment, a tab still open keeps working (Correction 11): the
// pages are asked again before being shown from the cache, the file that
// announces a new version too, and a code file gone from the server
// reloads the page instead of leaving taps that do nothing.
const SUPER = 'super-deploy@example.com';

test('pages and the version file are asked again, code files kept', async ({
  request,
}) => {
  const home = await request.get('/');
  expect(home.headers()['cache-control']).toBe('no-cache');
  const personal = await request.get('/p/not-a-token');
  expect(personal.headers()['cache-control']).toBe('no-store');
  const version = await request.get('/_nuxt/builds/latest.json');
  expect(version.ok()).toBe(true);
  expect(version.headers()['cache-control']).toBe('no-cache');
  const script = (await home.text()).match(/\/_nuxt\/[^"]+\.js/)?.[0];
  expect(script).toBeTruthy();
  const code = await request.get(script!);
  expect(code.headers()['cache-control']).toContain('immutable');
});

test('a code file gone from the server reloads the page', async ({ page }) => {
  await loginAsSuper(page, SUPER);
  // What the tab has loaded so far. Any other code file is « gone », as
  // after a deployment that renamed them all, until the page is loaded
  // again: then it gets the new ones.
  const loaded = new Set(
    await page.evaluate(() =>
      performance.getEntriesByType('resource').map((entry) => entry.name),
    ),
  );
  const seen = { reloaded: false, gone: 0 };
  page.on('request', (request) => {
    if (request.isNavigationRequest()) seen.reloaded = true;
  });
  await page.route('**/_nuxt/*.js', (route) => {
    const url = route.request().url();
    if (seen.reloaded || loaded.has(url)) return route.continue();
    seen.gone += 1;
    return route.fulfill({ status: 404, body: 'Not found' });
  });
  await page.evaluate(() => {
    (window as { oldTab?: boolean }).oldTab = true;
  });
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Mon compte' }).click();
  await expect(heading(page)).toHaveText('Mon compte');
  await expect(page).toHaveURL(/\/compte$/);
  expect(seen.gone).toBeGreaterThan(0);
  // A new page, not the old tab carrying on.
  expect(
    await page.evaluate(() => (window as { oldTab?: boolean }).oldTab),
  ).toBeUndefined();
});
