import { expect, test, type APIRequestContext } from '@playwright/test';
import { apiLogin, heading, hydrated, loginAsSuper } from './helpers';

// Open sign-up with a guard (README 22.2): anyone gets an account, nobody
// may create a group before a super-admin answers their request.
test.describe.configure({ mode: 'serial' });

const SUPER = 'super-signup@example.com';
const NEWCOMER = 'nouvelle-venue@example.com';
const LATER = 'plus-tard@example.com';
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
  await expect(page.getByTestId('home-admin')).toHaveCount(0);

  const created = await page.request.post('/api/admin/groups', { data: GROUP });
  expect(created.status()).toBe(403);
  expect((await page.request.get('/api/admin/accounts')).status()).toBe(403);
  await page.goto('/admin/comptes');
  await expect(heading(page)).toHaveText('Bonjour');
  await page.goto('/admin');
  await expect(heading(page)).toHaveText('Bonjour');
});

test('they ask for a group, once at a time', async ({ page }) => {
  await apiLogin(page.request, NEWCOMER);
  await page.goto('/');
  await hydrated(page);
  await page.getByRole('link', { name: 'Demander à créer un groupe' }).click();
  // On its own page (README 23.3): the request, then why a request.
  await expect(page).toHaveURL(/\/demande$/);
  await expect(page.getByTestId('request-why')).toContainText(
    'Pourquoi une demande ?',
  );
  await page.getByLabel('Ta demande').fill('Le Noël de ma famille');
  // A page where one writes (README 23.3): its action is in the page, at
  // the end of the content, not in a band stuck to the bottom; the bar
  // at the bottom stays, and touching outside the field leaves it.
  await expect(page.getByTestId('inline-footer')).toBeVisible();
  await expect(page.getByTestId('sticky-footer')).toHaveCount(0);
  await expect(
    page.getByTestId('tab-bar').getByRole('link', { name: 'Accueil' }),
  ).toHaveAttribute('aria-current', 'page');
  await page.getByTestId('request-why').click();
  await expect(page.getByLabel('Ta demande')).not.toBeFocused();
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click();
  await expect(page.getByTestId('home-request')).toContainText(
    'Ta demande est partie',
  );
  // What they wrote, as they wrote it.
  await expect(page.getByTestId('home-request-message')).toHaveText(
    'Le Noël de ma famille',
  );
  await expect(
    page.getByRole('link', { name: 'Demander à créer un groupe' }),
  ).toHaveCount(0);

  const again = await page.request.post('/api/auth/group-requests', {
    data: { message: 'Encore' },
  });
  expect(again.status()).toBe(409);
});

test('the super-admin sees the request and accepts it', async ({
  page,
  playwright,
  baseURL,
}) => {
  // A second account, without a name, asks too, after her.
  const later = await playwright.request.newContext({ baseURL });
  await apiLogin(later, LATER);
  await later.post('/api/auth/group-requests', {
    data: { message: 'Pour ma coloc' },
  });
  await later.dispose();

  await loginAsSuper(page, SUPER);
  // The card on top names who has been waiting the longest.
  const top = page.getByTestId('top-card');
  await expect(top).toContainText('À faire maintenant · Administration');
  await expect(top).toContainText(
    new RegExp(
      `${NEWCOMER} attend ta réponse depuis le .+\\. Une autre demande attend aussi\\.`,
    ),
  );
  // The administration's row at the bottom of the home counts the
  // requests awaiting an answer.
  await expect(page.getByTestId('home-admin')).toContainText('2');
  await page.getByRole('link', { name: /^Administration/ }).click();
  await expect(heading(page)).toHaveText('Administration');
  // The oldest request in its card, on a stack: « 1 sur 2 »; « Traiter »
  // opens its page, which weighs it against the load of the app.
  const card = page.getByTestId('admin-request');
  await expect(card).toContainText('À traiter · 1 sur 2');
  await expect(card).toContainText(NEWCOMER);
  await expect(card).toContainText('Le Noël de ma famille');
  await card.getByRole('link', { name: 'Traiter' }).click();
  await expect(page).toHaveURL(/\/admin\/demandes\//);
  await expect(page.getByTestId('group-request')).toContainText(
    'Le Noël de ma famille',
  );
  await expect(page.getByTestId('app-load')).toContainText(
    'couverts par les offres gratuites',
  );
  await page.getByRole('button', { name: 'Accepter' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  // The next one takes its place; without a name, its address is the
  // title and is not said again under it.
  await expect(card).toContainText('À traiter · 1 demande de groupe');
  await expect(card.getByRole('heading')).toHaveText(LATER);
  await expect(card.getByText(LATER)).toHaveCount(1);
  await card.getByRole('link', { name: 'Traiter' }).click();
  // A ready-made word goes with the answer.
  await page.getByRole('button', { name: 'C’est complet' }).click();
  await expect(page.getByLabel(/Un mot en réponse/)).toHaveValue(
    /application est complète/,
  );
  await page.getByRole('button', { name: 'Refuser' }).click();
  await expect(card).toContainText('Aucune demande à traiter');

  // The account may now create one group, and waits for nothing.
  await page.getByRole('link', { name: /^Comptes/ }).click();
  await expect(heading(page)).toHaveText('Comptes');
  const row = page.getByTestId('accounts').getByRole('link', {
    name: new RegExp(NEWCOMER),
  });
  await expect(row).not.toContainText('À traiter');
  // The one refused says so on its line.
  await expect(
    page.getByTestId('accounts').getByRole('link', { name: new RegExp(LATER) }),
  ).toContainText('demande refusée');
  await row.click();
  await expect(page.getByTestId('quota')).toHaveText('1');
  await expect(page.getByTestId('request-row')).toHaveCount(0);
});

test('the one refused reads the word of the administrator', async ({
  page,
}) => {
  await apiLogin(page.request, LATER);
  await page.goto('/');
  await hydrated(page);
  await expect(page.getByTestId('home-request')).toContainText('refusée');
  await expect(page.getByTestId('home-request-note')).toHaveText(
    'Désolé, l’application est complète pour cette année. Retente ta chance l’an prochain !',
  );
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
    page.getByRole('link', { name: /Organiser mon propre tirage/ }),
  ).toBeVisible();
});

test('the super-admin sees every group, sets a quota and disables an account', async ({
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
  ).toContainText('Nina · 1 membre · pas de tirage en cours');
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
  // quota changed at once; its profile is read, not edited.
  await page.getByTestId('accounts').getByText('Nina').click();
  await expect(page.getByRole('link', { name: GROUP.name })).toContainText(
    'Organise · 1 membre · pas de tirage en cours',
  );
  await expect(page.getByTestId('quota')).toHaveText('1');
  await page.getByRole('button', { name: 'Un groupe de plus' }).click();
  await expect(page.getByTestId('quota')).toHaveText('2');
  await page.getByRole('button', { name: 'Un groupe de plus' }).click();
  await expect(page.getByTestId('quota')).toHaveText('3');
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
    draw: null,
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
