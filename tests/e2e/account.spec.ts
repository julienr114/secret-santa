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

test('creating an account asks for a first name', async ({ page }) => {
  await page.goto('/login');
  await hydrated(page);
  await page.getByRole('tab', { name: 'Créer un compte' }).click();
  const submit = page.getByRole('button', { name: 'Créer mon compte' });
  await page.getByLabel('Adresse email').fill('mila@example.com');
  await expect(submit).toBeDisabled();
  await page.getByLabel('Prénom').fill('Mila');
  await submit.click();
  await page.getByRole('link', { name: /Mode développement/ }).click();
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(heading(page)).toHaveText('Bonjour Mila');
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

  // Reading the address it logs in with does not use it up either.
  const peek = await page.request.get(
    `/api/auth/link-email?token=${tokenOf(href)}`,
  );
  expect(peek.status()).toBe(200);
  expect(await peek.json()).toEqual({ email: ADMIN_EMAIL });
  expect(peek.headers()['cache-control']).toContain('no-store');

  await page.goto(href);
  await hydrated(page);
  await expect(heading(page)).toHaveText('Se connecter sur cet appareil ?');
  await expect(page.getByTestId('login-email')).toHaveText(
    `Tu vas être connecté avec ${ADMIN_EMAIL} pendant 30 jours.`,
  );
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(heading(page)).toHaveText('Bonjour');
  expect((await page.request.get('/api/admin/groups')).status()).toBe(200);

  // The same link a second time is refused, and the page says how to get
  // a new one.
  const again = await page.request.post('/api/auth/confirm', {
    data: { token: tokenOf(href) },
  });
  expect(again.status()).toBe(410);
  expect(
    (
      await page.request.get(`/api/auth/link-email?token=${tokenOf(href)}`)
    ).status(),
  ).toBe(410);
  // The page says so at once, without a tap.
  await page.goto(href);
  await hydrated(page);
  await expect(heading(page)).toHaveText('Ce lien ne marche plus');
  await expect(
    page.getByRole('link', { name: 'Demander un nouveau lien' }),
  ).toBeVisible();
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

  await page.getByRole('button', { name: 'Mon compte', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Mon compte' }).click();
  await expect(heading(page)).toHaveText('Mon compte');
  await expect(page.getByText(ADMIN_EMAIL)).toBeVisible();
  await expect(page.getByText('Cet appareil', { exact: true })).toHaveCount(1);
  // This device since it logged in; the other one and the two sessions of
  // the tests above, when last seen.
  await expect(page.getByText(/^Connecté le /)).toHaveCount(1);
  await expect(page.getByText(/^Vu le /)).toHaveCount(3);

  // The profile in rows: a last name, typed in its sheet, saved at once.
  const lastName = page
    .getByTestId('profile')
    .getByRole('button', { name: /^Nom de famille/ });
  await expect(lastName).toContainText('Ajouter');
  await lastName.click();
  await page.getByRole('textbox').fill('Martin');
  const saved = page.waitForResponse(
    (r) => r.url().endsWith('/api/auth/profile') && r.ok(),
  );
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(lastName).toContainText('Martin');
  await saved;
  const profile = await (await page.request.get('/api/auth/sessions')).json();
  expect(profile.lastName).toBe('Martin');
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
  await expect(
    page.getByText('Appareil déconnecté', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/^Vu le /)).toHaveCount(2);

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

test('an address is sent so many links an hour; beyond, the same answer and no link', async ({
  playwright,
  baseURL,
}) => {
  const api = await playwright.request.newContext({ baseURL });
  // Three an hour in production; five on the test server, whose specs
  // log the same accounts in several times (scripts/e2e-server.sh).
  // One after the other: each request counts those before it.
  const answers = await Array.from({ length: 7 }).reduce<
    Promise<Awaited<ReturnType<typeof requestLink>>[]>
  >(
    async (done) => [
      ...(await done),
      await requestLink(api, 'third@example.com'),
    ],
    Promise.resolve([]),
  );
  // The answer never changes (lot 38 A): nobody learns from it whether
  // the address has an account, nor that it was sent enough.
  expect(answers.map((answer) => answer.status)).toEqual(
    Array.from({ length: 7 }, () => 200),
  );
  // Only the first five carry a link (the test server shows it).
  expect(answers.map((answer) => Boolean(answer.body.devLink))).toEqual([
    true,
    true,
    true,
    true,
    true,
    false,
    false,
  ]);
  await api.dispose();
});

test('a client that asks too much reads why, and what to do', async ({
  page,
}) => {
  // The server refuses this client (429), as the rate limit would.
  await page.route('**/api/auth/link', (route) =>
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({
        statusCode: 429,
        statusMessage: 'too_many_requests',
      }),
    }),
  );
  await page.goto('/login');
  await hydrated(page);
  await page.getByLabel('Adresse email').fill('pressee@example.com');
  await page.getByRole('button', { name: /^Recevoir/ }).click();
  const notice = page.getByTestId('login-too-many');
  await expect(notice).toContainText('Trop de demandes d’un coup.');
  await expect(notice).toContainText(
    'Si tu as déjà demandé un lien, regarde dans tes emails : il est valable 15 minutes.',
  );
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
