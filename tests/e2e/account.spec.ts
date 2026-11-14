import { expect, test, type APIRequestContext } from '@playwright/test';
import { heading, hydrated } from './helpers';

// Accounts (README 22.5): login by a magic link, sessions that can be
// revoked. The test server returns the link on screen (development mode)
// instead of emailing it; admin@example.com and second@example.com are
// declared as super-admins.
test.describe.configure({ mode: 'serial' });

const ADMIN_EMAIL = 'admin@example.com';
const tokenOf = (link: string) => new URL(link).pathname.split('/').at(-1);
const requestLink = async (api: APIRequestContext, email: string) => {
  const response = await api.post('/api/auth/link', { data: { email } });
  return { status: response.status(), body: await response.json() };
};

test('an address that is not one is refused', async ({ page }) => {
  await page.goto('/login');
  await hydrated(page);
  await page.getByLabel('Adresse email').fill('pas-une-adresse');
  await expect(
    page.getByRole('button', { name: 'Recevoir un lien' }),
  ).toBeDisabled();
  const invalid = await requestLink(page.request, 'pas-une-adresse');
  expect(invalid.status).toBe(400);
});

test('a declared super-admin logs in with a link, used by a gesture and only once', async ({
  page,
}) => {
  await page.goto('/login');
  await hydrated(page);
  await page.getByLabel('Adresse email').fill(` ${ADMIN_EMAIL.toUpperCase()} `);
  await page.getByRole('button', { name: 'Recevoir un lien' }).click();
  const devLink = page.getByRole('link', { name: /Mode développement/ });
  await expect(devLink).toBeVisible();
  const href = (await devLink.getAttribute('href')) ?? '';
  expect(href).toMatch(/\/login\/[A-Za-z0-9_-]{43}$/);

  // Opening the link, as a mail scanner would, does not use it up.
  const preview = await page.request.get(href);
  expect(preview.status()).toBe(200);
  expect(preview.headers()['cache-control']).toContain('no-store');
  expect(preview.headers()['referrer-policy']).toBe('no-referrer');
  expect((await page.request.get('/api/admin/groups')).status()).toBe(401);

  await page.goto(href);
  await hydrated(page);
  await expect(heading(page)).toHaveText('Connexion');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(heading(page)).toHaveText('Bonjour');
  expect((await page.request.get('/api/admin/groups')).status()).toBe(200);

  // The same link a second time is refused.
  const again = await page.request.post('/api/auth/confirm', {
    data: { token: tokenOf(href) },
  });
  expect(again.status()).toBe(410);
});

test('asking for a new link invalidates the previous one', async ({
  playwright,
  baseURL,
}) => {
  const api = await playwright.request.newContext({ baseURL });
  const first = await requestLink(api, ADMIN_EMAIL);
  const second = await requestLink(api, ADMIN_EMAIL);
  const stale = await api.post('/api/auth/confirm', {
    data: { token: tokenOf(first.body.devLink) },
  });
  expect(stale.status()).toBe(410);
  for (const token of ['', 'x'.repeat(43), '../../etc']) {
    const forged = await api.post('/api/auth/confirm', { data: { token } });
    expect(forged.status(), token).toBe(410);
  }
  const fresh = await api.post('/api/auth/confirm', {
    data: { token: tokenOf(second.body.devLink) },
  });
  expect(fresh.status()).toBe(200);
  expect((await fresh.json()).user.role).toBe('super_admin');
  await api.dispose();
});

test('my account lists the devices, and logging out everywhere closes them all', async ({
  page,
  playwright,
  baseURL,
}) => {
  // A second device, logged in on the same account.
  const other = await playwright.request.newContext({ baseURL });
  const otherLink = await requestLink(other, ADMIN_EMAIL);
  await other.post('/api/auth/confirm', {
    data: { token: tokenOf(otherLink.body.devLink) },
  });
  expect((await other.get('/api/admin/groups')).status()).toBe(200);

  const link = await requestLink(page.request, ADMIN_EMAIL);
  await page.goto(link.body.devLink);
  await hydrated(page);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(heading(page)).toHaveText('Bonjour');

  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Mon compte' }).click();
  await expect(heading(page)).toHaveText('Mon compte');
  await expect(page.getByText(ADMIN_EMAIL)).toBeVisible();
  await expect(page.getByText('Cet appareil', { exact: true })).toHaveCount(1);
  // This device, the other one, and the two sessions of the tests above.
  await expect(page.getByText(/^Vu le /)).toHaveCount(4);
  const sessions = await (await page.request.get('/api/auth/sessions')).json();
  const mine = sessions.sessions.find((s: { current: boolean }) => s.current);
  expect(
    (await page.request.post(`/api/auth/sessions/${mine.id}/revoke`)).status(),
  ).toBe(409);

  // One other device logs out on its own; this one stays in.
  await page
    .getByRole('button', { name: /^Déconnecter / })
    .first()
    .click();
  await expect(page.getByText('Appareil déconnecté')).toBeVisible();
  await expect(page.getByText(/^Vu le /)).toHaveCount(3);

  await page.getByText('Déconnecter partout').click();
  await page.getByRole('button', { name: 'Déconnecter partout' }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect((await page.request.get('/api/admin/groups')).status()).toBe(401);
  // The other device is out too, although its cookie is untouched.
  expect((await other.get('/api/admin/groups')).status()).toBe(401);
  await other.dispose();
});

test('logging out revokes the session, not only the cookie', async ({
  playwright,
  baseURL,
}) => {
  const api = await playwright.request.newContext({ baseURL });
  const link = await requestLink(api, 'second@example.com');
  await api.post('/api/auth/confirm', {
    data: { token: tokenOf(link.body.devLink) },
  });
  const stolen = await api.storageState();
  await api.post('/api/admin/logout');
  const thief = await playwright.request.newContext({
    baseURL,
    storageState: stolen,
  });
  expect((await thief.get('/api/admin/groups')).status()).toBe(401);
  await Promise.all([api.dispose(), thief.dispose()]);
});

test('link requests are limited for one address', async ({
  playwright,
  baseURL,
}) => {
  const api = await playwright.request.newContext({ baseURL });
  // One after the other: each request counts those before it.
  const statuses = await Array.from({ length: 6 }).reduce<Promise<number[]>>(
    async (done) => [
      ...(await done),
      (await requestLink(api, 'third@example.com')).status,
    ],
    Promise.resolve([]),
  );
  expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  await api.dispose();
});

test('without a session, the home page is the login', async ({ page }) => {
  await page.goto('/');
  await hydrated(page);
  await expect(heading(page)).toHaveText('Under the Tree');
  await expect(page.getByLabel('Adresse email')).toBeVisible();
  // The old address of the login leads to the same page, and an admin
  // page to /login.
  await page.goto('/admin');
  await expect(page.getByLabel('Adresse email')).toBeVisible();
  await page.goto('/admin/comptes');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel('Adresse email')).toBeVisible();
});
