import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { apiLogin, heading, hydrated, loginAsOrganizer } from './helpers';

// Signing up to a Secret Santa by its invitation link (ticket 116): the
// link is that of a Secret Santa, not of its event; and keeping a draw
// opened by its personal link in an account (README 22.2). Logging in goes
// through the development link the test server shows on screen.
test.describe.configure({ mode: 'serial' });

const SUPER = 'super-invite@example.com';
const ORGANIZER = 'orga-invite@example.com';
const SLUG = 'famille-invite';
const ADMIN = `/api/admin/${SLUG}`;
const state: {
  api?: APIRequestContext;
  editionId: string;
  childrenId: string;
  code: string;
} = {
  editionId: '',
  childrenId: '',
  code: '',
};

/** Logs the page in from the login form, then follows the screen link. */
const loginOnScreen = async (page: Page, email: string) => {
  await page.getByLabel('Adresse email').fill(email);
  await page.getByRole('button', { name: 'Recevoir mon lien' }).click();
  await expect(page.getByTestId('login-sent')).toContainText(
    `Lien envoyé à ${email}`,
  );
  await page.getByRole('link', { name: /Mode développement/ }).click();
  await page.getByRole('button', { name: 'Se connecter' }).click();
};

/** The first names taking part in a Secret Santa. */
const participantsOf = async (id: string): Promise<string[]> => {
  const { participants } = await (
    await state.api!.get(`${ADMIN}/editions/${id}`)
  ).json();
  return participants.map((p: { firstName: string }) => p.firstName);
};

test.beforeAll(async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL });
  state.api = api;
  await apiLogin(api, SUPER);
  await api.post('/api/admin/groups', {
    data: { slug: SLUG, name: 'Famille Invite', organizers: [ORGANIZER] },
  });
  for (const firstName of ['Ada', 'Bob']) {
    await api.post(`${ADMIN}/persons`, { data: { firstName } });
  }
  // Two Secret Santa the same year: each has its own link.
  const adults = await api.post(`${ADMIN}/editions`, {
    data: { label: 'Les adultes', year: 2026, eventDate: '2026-12-25' },
  });
  state.editionId = (await adults.json()).edition.id;
  const children = await api.post(`${ADMIN}/editions`, {
    data: { label: 'Les enfants', year: 2026, eventDate: '2026-12-25' },
  });
  state.childrenId = (await children.json()).edition.id;
});

test.afterAll(async () => {
  await state.api?.dispose();
});

test('the organiser opens the link of a Secret Santa from its participants', async ({
  page,
}) => {
  await loginAsOrganizer(page, SLUG, ORGANIZER);
  // The line of the members no longer says « Inviter ».
  await expect(page.getByTestId('party-members')).not.toContainText('Inviter');
  await page.goto(`/admin/${SLUG}/editions/${state.editionId}/ajouter`);
  await hydrated(page);
  await page.getByRole('link', { name: /^Inviter par lien/ }).click();
  await expect(page).toHaveURL(
    new RegExp(`/admin/${SLUG}/editions/${state.editionId}/invitation$`),
  );
  // « Famille Invite · Secret Santa 2026 » above the title.
  await expect(
    page.getByRole('link', { name: 'Secret Santa 2026' }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Ceux qui s’inscrivent participent au Secret Santa et deviennent membres de l’événement.',
    ),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Créer le lien' }).click();
  // The message to share, as the guests will read it: two Secret Santa
  // this year, so its name between brackets.
  const message = page.getByTestId('invite-message');
  await expect(message).toContainText(
    'Tu es invité au Secret Santa « Famille Invite (Les adultes) »',
  );
  const text = (await message.textContent()) ?? '';
  state.code = text.trim().split('/').at(-1)!;
  expect(state.code).toMatch(/^[A-Za-z0-9_-]{16}$/);
  // The word on the page is written on its own page (README 23.3).
  await page.getByTestId('invite-word').click();
  await expect(page).toHaveURL(/\/invitation\/mot$/);
  await page.getByLabel(/^Ton mot/).fill('Bienvenue dans la famille !');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByTestId('invite-word')).toContainText(
    '« Bienvenue dans la famille ! »',
  );
  // Two places are enough here: typed, then one more and one less.
  await page.getByRole('button', { name: /^Places restantes/ }).click();
  const places = page.getByRole('spinbutton', { name: 'Places restantes' });
  await places.fill('2');
  await page.getByRole('button', { name: 'Une place de plus' }).click();
  await expect(places).toHaveValue('3');
  await page.getByRole('button', { name: 'Une place de moins' }).click();
  await expect(places).toHaveValue('2');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(
    page.getByRole('button', { name: /^Places restantes/ }),
  ).toContainText('2');
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(page).toHaveURL(
    new RegExp(`/admin/${SLUG}/editions/${state.editionId}$`),
  );

  // The old address of the event's link leads to its members.
  await page.goto(`/e/${SLUG}/invitation`);
  await expect(page).toHaveURL(new RegExp(`/e/${SLUG}/membres$`));
});

test('someone with the link signs up to that Secret Santa, not to the other', async ({
  page,
  playwright,
  baseURL,
}) => {
  await page.goto(`/rejoindre/${state.code}`);
  await hydrated(page);
  await expect(page.getByText('Tu es invité au Secret Santa')).toBeVisible();
  await expect(heading(page)).toHaveText('Famille Invite (Les adultes)');
  // Ada, Bob and the organiser take part already.
  await expect(
    page.getByText('🎄 Noël · le 25 décembre 2026 · 3 inscrits'),
  ).toBeVisible();
  await expect(page.getByTestId('invite-words')).toHaveText(
    'Bienvenue dans la famille !',
  );
  await loginOnScreen(page, 'zoe-invite@example.com');
  // Back on the invitation once logged in: a first name, then take part.
  await expect(page).toHaveURL(new RegExp(`/rejoindre/${state.code}$`));
  await expect(page.getByTestId('invite-account')).toContainText(
    'Connecté avec zoe-invite@example.com',
  );
  await page.getByLabel('Prénom').fill('Zoé');
  await page.getByRole('button', { name: 'Participer' }).click();
  // In this Secret Santa, and so in its event: her draw is one tap away.
  const joined = page.getByTestId('invite-joined');
  await expect(joined).toContainText('Bienvenue dans Famille Invite');
  await expect(joined).toContainText('Tu participes à Les adultes.');
  await expect(
    joined.getByRole('link', { name: 'Voir mon tirage' }),
  ).toBeVisible();

  const { persons } = await (await state.api!.get(`${ADMIN}/persons`)).json();
  const zoe = persons.find((p: { firstName: string }) => p.firstName === 'Zoé');
  expect(zoe.email).toBe('zoe-invite@example.com');
  expect(await participantsOf(state.editionId)).toContain('Zoé');
  expect(await participantsOf(state.childrenId)).not.toContain('Zoé');
  // The event reads it in the journal.
  const { entries } = await (
    await state.api!.get(`${ADMIN}/journal?locale=fr`)
  ).json();
  expect(entries.map((e: { text: string }) => e.text)).toContain(
    'Zoé est de la partie',
  );
  // The organiser reads it in « Quoi de neuf », with the Secret Santa.
  const organiser = await playwright.request.newContext({ baseURL });
  await apiLogin(organiser, ORGANIZER);
  const { sections } = await (await organiser.get('/api/news')).json();
  const news = sections
    .flatMap((section: { news: unknown[] }) => section.news)
    .find((line: { kind: string }) => line.kind === 'joined');
  expect(news).toMatchObject({ name: 'Zoé', detail: 'Les adultes' });
  await organiser.dispose();

  // Coming back to the link: already in.
  await page.reload();
  await hydrated(page);
  await expect(page.getByTestId('invite-joined')).toContainText(
    'Tu participes à Les adultes.',
  );
});

test('a member who signs up to the other Secret Santa takes no place', async ({
  page,
}) => {
  const opened = await state.api!.post(
    `${ADMIN}/editions/${state.childrenId}/invite`,
    { data: { open: true, places: 1 } },
  );
  const { inviteCode } = await opened.json();
  await apiLogin(page.request, 'zoe-invite@example.com');
  const signed = await page.request.post(`/api/invite/${inviteCode}/join`, {
    data: { firstName: 'Zoé' },
  });
  expect(signed.status()).toBe(201);
  expect(await participantsOf(state.childrenId)).toContain('Zoé');
  const { invite } = await (
    await state.api!.get(`${ADMIN}/editions/${state.childrenId}`)
  ).json();
  expect(invite.places).toBe(1);
});

test('a participant keeps a draw opened by its personal link in an account', async ({
  page,
}) => {
  const { participants } = await (
    await state.api!.get(`${ADMIN}/editions/${state.editionId}`)
  ).json();
  const ada = participants.find(
    (p: { firstName: string }) => p.firstName === 'Ada',
  );
  const { messages } = await (
    await state.api!.get(
      `${ADMIN}/editions/${state.editionId}/messages?type=invitation`,
    )
  ).json();
  const personal = new URL(messages[ada.participationId].link).pathname;

  await page.goto(personal);
  await hydrated(page);
  const card = page.getByTestId('account-invite');
  await expect(card).toContainText('Garde tes Secret Santa au même endroit');
  await card.getByRole('link', { name: 'Créer mon compte' }).click();
  // The link opens on the creation of an account, the first name filled.
  await expect(page.getByLabel('Prénom')).toHaveValue('Ada');
  await page.getByLabel('Adresse email').fill('ada-invite@example.com');
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await page.getByRole('link', { name: /Mode développement/ }).click();
  await page.getByRole('button', { name: 'Se connecter' }).click();
  // Back on the draw, logged in: add it to the account.
  await expect(page).toHaveURL(new RegExp(`${personal}$`));
  await card.getByRole('button', { name: 'Ajouter à mon compte' }).click();
  await expect(
    page.getByText('Secret Santa ajouté à ton compte').first(),
  ).toBeVisible();
  await expect(card).toHaveCount(0);
  await page.goto('/');
  await hydrated(page);
  await expect(page.getByTestId('home-party')).toContainText('Famille Invite');
});

test('with an address already known, one tap sends the login link', async ({
  page,
}) => {
  const { persons } = await (await state.api!.get(`${ADMIN}/persons`)).json();
  const bob = persons.find((p: { firstName: string }) => p.firstName === 'Bob');
  await state.api!.patch(`${ADMIN}/persons/${bob.id}`, {
    data: { email: 'bob-invite@example.com' },
  });
  const { participants } = await (
    await state.api!.get(`${ADMIN}/editions/${state.editionId}`)
  ).json();
  const row = participants.find(
    (p: { firstName: string }) => p.firstName === 'Bob',
  );
  const { messages } = await (
    await state.api!.get(
      `${ADMIN}/editions/${state.editionId}/messages?type=invitation`,
    )
  ).json();
  const personal = new URL(messages[row.participationId].link).pathname;

  await page.goto(personal);
  await hydrated(page);
  const card = page.getByTestId('account-invite');
  await card
    .getByRole('button', { name: 'Recevoir mon lien à bob-invite@example.com' })
    .click();
  await expect(card).toContainText('Lien envoyé à bob-invite@example.com');
  await card.getByRole('link', { name: /Mode développement/ }).click();
  await page.getByRole('button', { name: 'Se connecter' }).click();
  // Back on the draw: it is already in the account, named Bob.
  await expect(page).toHaveURL(new RegExp(`${personal}$`));
  await expect(card).toHaveCount(0);
  await page.goto('/');
  await hydrated(page);
  await expect(heading(page)).toHaveText('Bonjour Bob');
});

test('the link stops at its places, then at its last day', async ({
  page,
  playwright,
  baseURL,
}) => {
  // One place left: a second newcomer takes it, a third is refused.
  const second = await playwright.request.newContext({ baseURL });
  await apiLogin(second, 'leo-invite@example.com');
  const joined = await second.post(`/api/invite/${state.code}/join`, {
    data: { firstName: 'Léo' },
  });
  expect(joined.status()).toBe(201);
  await apiLogin(page.request, 'late-invite@example.com');
  const full = await page.request.post(`/api/invite/${state.code}/join`, {
    data: { firstName: 'Lou' },
  });
  expect(full.status()).toBe(409);
  await page.goto(`/rejoindre/${state.code}`);
  await hydrated(page);
  await expect(page.getByText(/plus de place par ce lien/)).toBeVisible();

  // More places, but a last day already past.
  await state.api!.post(`${ADMIN}/editions/${state.editionId}/invite`, {
    data: { open: true, places: 5, until: '2020-01-01' },
  });
  const late = await page.request.post(`/api/invite/${state.code}/join`, {
    data: { firstName: 'Lou' },
  });
  expect(late.status()).toBe(410);
  const expired = await (
    await page.request.get(`/api/invite/${state.code}`)
  ).json();
  expect(expired).toMatchObject({
    closed: 'invite_expired',
    expiredAfter: '2020-01-01',
  });
  await page.goto(`/rejoindre/${state.code}`);
  await hydrated(page);
  await expect(page.getByTestId('invite-closed')).toContainText(
    'Ce lien d’invitation n’est plus valable depuis le 2 janvier',
  );
  const unknown = await page.request.get('/api/invite/AAAAAAAAAAAAAAAA');
  expect(unknown.status()).toBe(404);
  await page.goto('/rejoindre/AAAAAAAAAAAAAAAA');
  await hydrated(page);
  await expect(page.getByTestId('invite-closed')).toContainText(
    'Ce lien d’invitation ne marche plus',
  );
  await second.dispose();
});

test('after the draw, the link signs nobody up', async ({ page }) => {
  await state.api!.post(`${ADMIN}/editions/${state.editionId}/invite`, {
    data: { open: true, places: 5, until: '2099-12-31' },
  });
  const draw = await state.api!.post(
    `${ADMIN}/editions/${state.editionId}/draw`,
  );
  expect(draw.ok()).toBe(true);
  await apiLogin(page.request, 'max-invite@example.com');
  const refused = await page.request.post(`/api/invite/${state.code}/join`, {
    data: { firstName: 'Max' },
  });
  expect(refused.status()).toBe(409);
  expect(await participantsOf(state.editionId)).not.toContain('Max');
  const { persons } = await (await state.api!.get(`${ADMIN}/persons`)).json();
  expect(
    persons.some((p: { firstName: string }) => p.firstName === 'Max'),
  ).toBe(false);
  await page.goto(`/rejoindre/${state.code}`);
  await hydrated(page);
  const closed = page.getByTestId('invite-closed');
  await expect(closed).toContainText('Le tirage a déjà eu lieu');
  await expect(closed).toContainText(
    'Préviens l’organisateur de Famille Invite.',
  );
});
