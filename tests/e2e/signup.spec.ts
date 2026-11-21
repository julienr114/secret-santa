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
  expect((await newSecretSanta('Les adultes')).status()).toBe(201);
  // From « Créer », by the screens, with no right of any kind: the party
  // they organise is offered, already with a Secret Santa this year
  // (V3TirageQuelleFete); « Continuer » opens the form.
  await page.goto('/');
  await hydrated(page);
  const createTab = page
    .getByTestId('tab-bar')
    .getByRole('button', { name: 'Créer' });
  await createTab.click();
  await page.getByTestId('create-secret-santa').click();
  const occasion = page.getByTestId('secret-santa-occasion');
  await expect(occasion).toContainText(GROUP.name);
  await expect(occasion).toContainText(
    'Noël · 1 membre · déjà un Secret Santa cette année',
  );
  await expect(occasion).toContainText('Une autre occasion');
  await expect(occasion.getByRole('radio', { name: /Famille/ })).toBeChecked();
  await occasion.getByRole('button', { name: 'Continuer' }).click();
  await expect(page).toHaveURL(
    new RegExp(`/admin/${GROUP.slug}/editions/nouvelle$`),
  );
  await page.getByTestId('new-secret-santa-nom').click();
  await page.getByLabel(/^Nom/).fill('Les enfants');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByTestId('new-secret-santa-nom')).toContainText(
    'Les enfants',
  );
  await page.getByRole('button', { name: 'Créer le Secret Santa' }).click();
  await expect(page).toHaveURL(
    new RegExp(`/admin/${GROUP.slug}/editions/[^/]+$`),
  );
  expect((await newSecretSanta('Les cousins')).status()).toBe(201);
  const fourth = await newSecretSanta('Un de trop');
  expect(fourth.status()).toBe(403);
  expect((await fourth.json()).statusMessage).toBe(
    'secret_santa_limit_reached',
  );
  // « Créer › Un Secret Santa » shows the limit and the three
  // (V3TirageLimite); nothing to ask anyone.
  await page.goto('/');
  await hydrated(page);
  await createTab.click();
  await page.getByTestId('create-secret-santa').click();
  await expect(page).toHaveURL(/\/secret-santa\/limite$/);
  await expect(heading(page)).toHaveText('Tu organises déjà 3 Secret Santa');
  await expect(
    page.getByText('C’est le maximum pour un compte.'),
  ).toBeVisible();
  await expect(
    page.getByTestId('limit-secret-santas').getByRole('link'),
  ).toHaveText([
    /^Famille Inscrite\s*Les adultes · pas encore tiré/,
    /^Famille Inscrite\s*Les enfants · pas encore tiré/,
    /^Famille Inscrite\s*Les cousins · pas encore tiré/,
  ]);
  await page.goto('/');
  await hydrated(page);
  await expect(page.getByTestId('home-party')).toContainText(GROUP.name);
});

test('the super-admin sees every party, sets a limit and disables an account', async ({
  page,
}) => {
  await loginAsSuper(page, SUPER);
  await page.goto('/admin/groupes');
  await hydrated(page);
  await expect(heading(page)).toHaveText('Fêtes');
  await expect(page.getByText(GROUP.name)).toBeVisible();
  // Each line: who organises it, its members, where its draw stands.
  await expect(
    page.getByTestId('groups').getByRole('link', { name: GROUP.name }),
  ).toContainText('Nina · 1 membre · à préparer');
  // The search finds a group by its organiser too.
  await page.getByLabel('Chercher une fête ou un organisateur').fill('Nina');
  await expect(page.getByTestId('groups')).toContainText(GROUP.name);

  // The identifier comes from the name; a name used twice is numbered.
  const twin = await page.request.post('/api/admin/groups', {
    data: { name: GROUP.name },
  });
  expect((await twin.json()).group.slug).toBe(`${GROUP.slug}-2`);

  await page.goto('/admin/comptes');
  await hydrated(page);
  // At its limit, the account says so on the list (V3AdminComptes).
  await expect(
    page.getByTestId('accounts').getByRole('link', { name: /Nina/ }),
  ).toContainText('à sa limite de Secret Santa');
  // A row opens the account's page (V3AdminCompte): its limit changed at
  // once, its parties with their link; its profile is read, not edited.
  await page.getByTestId('accounts').getByText('Nina').click();
  await expect(
    page.getByTestId('account-parties').getByRole('link', { name: GROUP.name }),
  ).toContainText('Organise · 1 membre · Secret Santa à préparer');
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

  // At 4, a fourth Secret Santa is allowed, and a fifth refused.
  const victim = await page.context().browser()!.newContext();
  await apiLogin(victim.request, NEWCOMER);
  const another = (label: string) =>
    victim.request.post(`/api/admin/${GROUP.slug}/editions`, {
      data: { label, year: 2026, eventDate: '2026-12-25' },
    });
  expect((await another('Les voisins')).status()).toBe(201);
  expect((await another('Un de trop')).status()).toBe(403);

  // Disabling closes the sessions at once and stops the login links.
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

test('the super-admin pauses new Secret Santa; lists may still be created', async ({
  page,
  browser,
}) => {
  await loginAsSuper(page, SUPER);
  await page.goto('/admin');
  await hydrated(page);
  // What to watch: numbers, nothing waits (V3Admin).
  await expect(page.getByTestId('watch-at-limit')).toContainText(
    'Comptes à leur limite de Secret Santa',
  );
  await expect(page.getByTestId('watch-full-parties')).toContainText(
    'Fêtes à 30 membres',
  );
  const pause = page
    .getByTestId('pause-secret-santas')
    .getByRole('switch', { name: /Suspendre les nouveaux Secret Santa/ });
  await expect(pause).not.toBeChecked();
  const saved = page.waitForResponse(
    (r) => r.url().endsWith('/api/admin/switches') && r.ok(),
  );
  await pause.click();
  await saved;
  await expect(pause).toBeChecked();
  const other = await browser.newContext();
  try {
    const organiser = await other.newPage();
    await apiLogin(organiser.request, 'en-pause@example.com');
    const party = await organiser.request.post('/api/admin/groups', {
      data: { name: 'Fête en pause' },
    });
    expect(party.ok()).toBe(true);
    const { slug } = (await party.json()).group;
    // The server refuses a new Secret Santa, to a super-admin too.
    const refused = await organiser.request.post(
      `/api/admin/${slug}/editions`,
      { data: { label: 'Noël', year: 2026, eventDate: '2026-12-25' } },
    );
    expect(refused.status()).toBe(403);
    expect((await refused.json()).statusMessage).toBe('secret_santa_paused');
    const superRefused = await page.request.post(
      `/api/admin/${slug}/editions`,
      { data: { label: 'Noël', year: 2026, eventDate: '2026-12-25' } },
    );
    expect(superRefused.status()).toBe(403);
    // « Créer › Un Secret Santa » shows the pause (V3TiragePause).
    await organiser.goto('/');
    await hydrated(organiser);
    await organiser
      .getByTestId('tab-bar')
      .getByRole('button', { name: 'Créer' })
      .click();
    await organiser.getByTestId('create-secret-santa').click();
    await expect(organiser).toHaveURL(/\/secret-santa\/pause$/);
    await expect(heading(organiser)).toHaveText(
      'Les nouveaux Secret Santa sont en pause',
    );
    await expect(
      organiser.getByText(
        'Ceux qui existent continuent. Reviens dans quelques jours.',
      ),
    ).toBeVisible();
    // The form of a new one sends there too.
    await organiser.goto(`/admin/${slug}/editions/nouvelle`);
    await expect(organiser).toHaveURL(/\/secret-santa\/pause$/);
    // A list may still be created.
    const list = await organiser.request.post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' } },
    });
    expect(list.ok()).toBe(true);
  } finally {
    await other.close();
    await state.admin?.patch('/api/admin/switches', {
      data: { newSecretSantas: false },
    });
  }
  await page.reload();
  await hydrated(page);
  await expect(pause).not.toBeChecked();
});
