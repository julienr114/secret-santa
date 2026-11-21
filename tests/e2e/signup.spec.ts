import { expect, test, type APIRequestContext } from '@playwright/test';
import { apiLogin, heading, hydrated, loginAsSuper } from './helpers';

// Open sign-up (README 22.2): anyone gets an account and may organise,
// with no request to anyone; the limit is 3 Secret Santa in progress per
// account (ticket 105).
test.describe.configure({ mode: 'serial' });

const SUPER = 'super-signup@example.com';
const NEWCOMER = 'nouvelle-venue@example.com';
const GROUP = { slug: 'famille-inscrite', name: 'Famille Inscrite' };
const state: { admin?: APIRequestContext } = {};

test.beforeAll(async ({ playwright, baseURL }) => {
  state.admin = await playwright.request.newContext({ baseURL });
  await apiLogin(state.admin, SUPER);
});

test.afterAll(async () => {
  await state.admin?.dispose();
});

test('a new address signs up, and does not reach the administration', async ({
  page,
}) => {
  await page.goto('/');
  await hydrated(page);
  await page.getByLabel('Adresse email').fill(NEWCOMER);
  await page.getByRole('button', { name: 'Recevoir un lien' }).click();
  await page.getByRole('link', { name: /Mode développement/ }).click();
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(heading(page)).toHaveText('Bonjour');
  await expect(page.getByText('Par quoi on commence ?')).toBeVisible();
  await expect(
    page.getByTestId('tab-bar').getByRole('link', { name: 'Admin' }),
  ).toHaveCount(0);

  expect((await page.request.get('/api/admin/accounts')).status()).toBe(403);
  await page.goto('/admin/comptes');
  await expect(heading(page)).toHaveText('Bonjour');
  await page.goto('/admin');
  await expect(heading(page)).toHaveText('Bonjour');
});

test('they create their group and organise up to 3 Secret Santa', async ({
  page,
}) => {
  await apiLogin(page.request, NEWCOMER);
  // Their profile first: who they will be in the group.
  await page.goto('/compte');
  await hydrated(page);
  await expect(heading(page)).toHaveText('Mon compte');
  const firstName = page
    .getByTestId('profile')
    .getByRole('button', { name: /^Prénom/ });
  await firstName.click();
  await page.getByRole('textbox').fill('Nina');
  const saved = page.waitForResponse(
    (r) => r.url().endsWith('/api/auth/profile') && r.ok(),
  );
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(firstName).toContainText('Nina');
  await saved;
  await page.goto('/');
  await hydrated(page);
  await expect(heading(page)).toHaveText('Bonjour Nina');
  await page.goto('/admin/groupes/nouveau');
  await hydrated(page);
  // Only the name: they organise it.
  await expect(page.getByText('Tu en seras l’organisateur.')).toBeVisible();
  await page.getByLabel('Nom du groupe').fill(GROUP.name);
  await expect(page.getByLabel('Adresse du premier organisateur')).toHaveCount(
    0,
  );
  await page.getByRole('button', { name: 'Créer le groupe' }).click();
  // A member a moment ago, now the organiser of the group.
  await expect(page).toHaveURL(new RegExp(`/f/${GROUP.slug}$`));
  await expect(heading(page)).toHaveText(GROUP.name);
  const { organizers } = await (
    await page.request.get(`/api/admin/${GROUP.slug}/organizers`)
  ).json();
  expect(organizers.map((o: { email: string }) => o.email)).toEqual([NEWCOMER]);
  // They start as the first person of their group, copied from the profile.
  const { persons } = await (
    await page.request.get(`/api/admin/${GROUP.slug}/persons`)
  ).json();
  expect(
    persons.map((p: { firstName: string; email: string }) => [
      p.firstName,
      p.email,
    ]),
  ).toEqual([['Nina', NEWCOMER]]);

  // Three Secret Santa, in the same party and the same year; the fourth
  // is refused by the server.
  const newSecretSanta = (label: string) =>
    page.request.post(`/api/admin/${GROUP.slug}/editions`, {
      data: { label, year: 2026, eventDate: '2026-12-25' },
    });
  for (const label of ['Les adultes', 'Les enfants', 'Les cousins']) {
    expect((await newSecretSanta(label)).status()).toBe(201);
  }
  const fourth = await newSecretSanta('Un de trop');
  expect(fourth.status()).toBe(403);
  expect((await fourth.json()).statusMessage).toBe(
    'secret_santa_limit_reached',
  );
  await page.goto('/');
  await hydrated(page);
  await expect(page.getByTestId('home-party')).toContainText(GROUP.name);
});

test('the super-admin sees every group, sets a limit and disables an account', async ({
  page,
}) => {
  await loginAsSuper(page, SUPER);
  await page.goto('/admin/groupes');
  await hydrated(page);
  await expect(heading(page)).toHaveText('Groupes');
  await expect(page.getByText(GROUP.name)).toBeVisible();
  // Each line: who organises it, its members, where its draw stands.
  await expect(
    page.getByTestId('groups').getByRole('link', { name: GROUP.name }),
  ).toContainText('Nina · 1 membre · à préparer');
  // The search finds a group by its organiser too.
  await page.getByLabel('Chercher un groupe ou un organisateur').fill('Nina');
  await expect(page.getByTestId('groups')).toContainText(GROUP.name);

  // The identifier comes from the name; a name used twice is numbered.
  const twin = await page.request.post('/api/admin/groups', {
    data: { name: GROUP.name },
  });
  expect((await twin.json()).group.slug).toBe(`${GROUP.slug}-2`);

  await page.goto('/admin/comptes');
  await hydrated(page);
  // A row opens the account's page: its groups with their link, its
  // limit changed at once; its profile is read, not edited.
  await page.getByTestId('accounts').getByText('Nina').click();
  await expect(page.getByRole('link', { name: GROUP.name })).toContainText(
    'Organise · 1 membre · à préparer',
  );
  await expect(page.getByTestId('quota')).toHaveText('3');
  await expect(page.getByText('3 en cours · il lui en reste 0')).toBeVisible();
  await page.getByRole('button', { name: 'Un Secret Santa de plus' }).click();
  await expect(page.getByTestId('quota')).toHaveText('4');
  await expect(page.getByText('3 en cours · il lui en reste 1')).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await expect(
    page.getByText('Son profil (prénom, icône, langue) lui appartient'),
  ).toBeVisible();

  // A super-admin cannot lock themselves out.
  const { accounts } = await (
    await page.request.get('/api/admin/accounts')
  ).json();
  const idOf = (email: string) =>
    accounts.find((a: { email: string }) => a.email === email).id;
  const nina = accounts.find((a: { email: string }) => a.email === NEWCOMER);
  expect(nina.groups[0]).toMatchObject({
    name: GROUP.name,
    role: 'organizer',
    members: 1,
    draw: { status: 'preparing' },
  });
  const self = await page.request.patch(`/api/admin/accounts/${idOf(SUPER)}`, {
    data: { disabled: true },
  });
  expect(self.status()).toBe(409);

  // Disabling closes the sessions at once and stops the login links.
  const victim = await page.context().browser()!.newContext();
  await apiLogin(victim.request, NEWCOMER);
  expect((await victim.request.get('/api/auth/home')).status()).toBe(200);
  const disabled = await page.request.patch(
    `/api/admin/accounts/${idOf(NEWCOMER)}`,
    { data: { disabled: true } },
  );
  expect(disabled.ok()).toBe(true);
  expect((await victim.request.get('/api/auth/home')).status()).toBe(401);
  const link = await victim.request.post('/api/auth/link', {
    data: { email: NEWCOMER },
  });
  expect(await link.json()).toEqual({ ok: true });
  await victim.close();

  // Disabled accounts are folded at the end of the page, and open as well.
  await page.goto('/admin/comptes');
  await hydrated(page);
  await expect(page.getByTestId('accounts')).not.toContainText('Nina');
  await page.getByTestId('disabled-row').click();
  await expect(heading(page)).toHaveText('Comptes désactivés');
  await page.getByTestId('accounts').getByText('Nina').click();
  await expect(page.getByText('Réactiver le compte')).toBeVisible();
});
