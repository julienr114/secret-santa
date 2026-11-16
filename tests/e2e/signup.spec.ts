import { expect, test, type APIRequestContext } from '@playwright/test';
import { apiLogin, heading, hydrated, loginAsSuper } from './helpers';

// Open sign-up with a guard (README 22.2): anyone gets an account, nobody
// may create a group before a super-admin answers their request.
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

test('a new address signs up, and cannot create a group', async ({ page }) => {
  await page.goto('/');
  await hydrated(page);
  await page.getByLabel('Adresse email').fill(NEWCOMER);
  await page.getByRole('button', { name: 'Recevoir un lien' }).click();
  await page.getByRole('link', { name: /Mode développement/ }).click();
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(heading(page)).toHaveText('Bonjour');
  await expect(page.getByTestId('home-organize')).toContainText(
    'Demander à créer un groupe',
  );
  await expect(page.getByTestId('admin-nav')).toHaveCount(0);

  const created = await page.request.post('/api/admin/groups', { data: GROUP });
  expect(created.status()).toBe(403);
  expect((await page.request.get('/api/admin/accounts')).status()).toBe(403);
  await page.goto('/admin/comptes');
  await expect(heading(page)).toHaveText('Bonjour');
});

test('they ask for a group, once at a time', async ({ page }) => {
  await apiLogin(page.request, NEWCOMER);
  await page.goto('/');
  await hydrated(page);
  await page
    .getByRole('button', { name: 'Demander à créer un groupe' })
    .click();
  // Why a request, before saying for whom.
  await expect(page.getByTestId('request-sheet')).toContainText(
    'Pourquoi une demande ?',
  );
  await page.getByLabel('Ta demande').fill('Le Noël de ma famille');
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click();
  await expect(page.getByText(/^Demande envoyée le /)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Demander à créer un groupe' }),
  ).toHaveCount(0);

  const again = await page.request.post('/api/auth/group-requests', {
    data: { message: 'Encore' },
  });
  expect(again.status()).toBe(409);
});

test('the super-admin sees the request and accepts it', async ({ page }) => {
  await loginAsSuper(page, SUPER);
  // The badge of the bottom bar counts the requests awaiting an answer.
  await expect(page.getByTestId('admin-nav')).toContainText('1');
  await page.getByRole('link', { name: 'Comptes et demandes' }).click();
  await expect(heading(page)).toHaveText('Comptes');
  // The account asking comes first in the list, with a badge.
  await expect(page.getByTestId('accounts')).toContainText(
    '1 demande en attente',
  );
  const first = page.getByTestId('accounts').getByRole('listitem').first();
  await expect(first).toContainText(NEWCOMER);
  await expect(first).toContainText('À traiter');
  await first.getByText(NEWCOMER).click();
  // The account's page: its figures, and its request on top, answered in
  // a sheet that weighs it against the load of the app.
  await expect(page.getByTestId('account-tiles')).toContainText(
    'sur 0 autorisés',
  );
  await page.getByTestId('request-row').click();
  const request = page.getByTestId('group-request');
  await expect(request).toContainText('Le Noël de ma famille');
  await expect(page.getByTestId('app-load')).toContainText(
    'couverts par les offres gratuites',
  );
  await request.page().getByRole('button', { name: 'Accepter' }).click();
  await expect(page.getByTestId('quota')).toHaveText('1');
  await expect(page.getByTestId('request-row')).toHaveCount(0);
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(page.getByText('À traiter')).toHaveCount(0);
});

test('they create their group, organise it, and the quota is used up', async ({
  page,
}) => {
  await apiLogin(page.request, NEWCOMER);
  await page.goto('/');
  await hydrated(page);
  // The card on top says the request was accepted. Put off with "Plus
  // tard", it gives way to the next one: their profile, who they will be
  // in the group.
  const top = page.getByTestId('top-card');
  await expect(top).toContainText('Ta demande est acceptée');
  await top.getByRole('button', { name: 'Plus tard' }).click();
  await expect(top).toContainText('Dis-nous comment tu t’appelles');
  await top.getByRole('link', { name: 'Compléter mon profil' }).click();
  await expect(heading(page)).toHaveText('Mon compte');
  await page.getByLabel('Prénom', { exact: true }).fill('Nina');
  await page.getByLabel('Prénom', { exact: true }).blur();
  await expect(page.getByText('Enregistré').first()).toBeVisible();
  await page.goto('/');
  await hydrated(page);
  await expect(heading(page)).toHaveText('Bonjour Nina');
  await expect(top).toHaveCount(0);
  await page.getByRole('link', { name: 'Créer un groupe' }).click();
  // Only the name: they organise it, and see how many they may create.
  await expect(page.getByText('Tu en seras l’organisateur.')).toBeVisible();
  await expect(page.getByTestId('groups-left')).toHaveText(
    'Tu peux encore créer 1 groupe',
  );
  await page.getByLabel('Nom du groupe').fill(GROUP.name);
  await expect(page.getByLabel('Adresse du premier organisateur')).toHaveCount(
    0,
  );
  await page.getByRole('button', { name: 'Créer le groupe' }).click();
  // A member a moment ago, now the organiser of the group.
  await expect(page).toHaveURL(new RegExp(`/admin/${GROUP.slug}$`));
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

  const second = await page.request.post('/api/admin/groups', {
    data: { slug: 'une-de-trop', name: 'Une de trop' },
  });
  expect(second.status()).toBe(403);
  await page.goto('/');
  await hydrated(page);
  await expect(page.getByTestId('home-groups')).toContainText(GROUP.name);
  await expect(page.getByRole('link', { name: 'Créer un groupe' })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole('button', { name: /Organiser mon propre tirage/ }),
  ).toBeVisible();
});

test('the super-admin sees every group, sets a quota and disables an account', async ({
  page,
}) => {
  await loginAsSuper(page, SUPER);
  await page.getByRole('link', { name: 'Tous les groupes' }).click();
  await expect(heading(page)).toHaveText('Tous les groupes');
  await expect(page.getByText(GROUP.name)).toBeVisible();

  // The identifier comes from the name; a name used twice is numbered.
  const twin = await page.request.post('/api/admin/groups', {
    data: { name: GROUP.name },
  });
  expect((await twin.json()).group.slug).toBe(`${GROUP.slug}-2`);

  await page.goto('/admin/comptes');
  await hydrated(page);
  // A row opens the account's page: its groups with their link, its
  // quota changed at once, its names set by the admin.
  await page.getByTestId('accounts').getByText('Nina').click();
  await expect(page.getByRole('link', { name: GROUP.name })).toBeVisible();
  await expect(page.getByTestId('quota')).toHaveText('1');
  await page.getByRole('button', { name: 'Un groupe de plus' }).click();
  await expect(page.getByTestId('quota')).toHaveText('2');
  await page.getByRole('button', { name: 'Un groupe de plus' }).click();
  await expect(page.getByTestId('quota')).toHaveText('3');
  await page.getByLabel('Nom de famille', { exact: true }).fill('Martin');
  await page.getByLabel('Nom de famille', { exact: true }).blur();
  await expect(heading(page)).toHaveText('Nina Martin');

  // A super-admin cannot lock themselves out.
  const { accounts } = await (
    await page.request.get('/api/admin/accounts')
  ).json();
  const idOf = (email: string) =>
    accounts.find((a: { email: string }) => a.email === email).id;
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
  await page.getByRole('button', { name: /comptes? désactivés?/ }).click();
  await page.getByTestId('disabled-accounts').getByText('Nina').click();
  await expect(page.getByText('Réactiver le compte')).toBeVisible();
});
