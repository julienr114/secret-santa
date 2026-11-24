import { expect, test, type APIRequestContext } from '@playwright/test';
import {
  addPeople,
  apiLogin,
  heading,
  hydrated,
  loginAsOrganizer,
  loginAsSuper,
} from './helpers';

// Sending by email is open to every group. The test server has no email
// key, so the send itself answers "not configured": what is checked here
// is who may do what, and what each screen shows.
test.describe.configure({ mode: 'serial' });

const SLUG = 'famille-courrier';
const SUPER = 'super-email@example.com';
const ORGANIZER = 'orga-courrier@example.com';
const ADMIN = `/api/admin/${SLUG}`;
const state: { api?: APIRequestContext; groupId: string; editionId: string } = {
  groupId: '',
  editionId: '',
};

test.beforeAll(async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL });
  state.api = api;
  await apiLogin(api, SUPER);
  const created = await api.post('/api/admin/groups', {
    data: { slug: SLUG, name: 'Famille Courrier', organizers: [ORGANIZER] },
  });
  state.groupId = (await created.json()).group.id;
  const edition = await api.post(`${ADMIN}/editions`, {
    data: { label: 'Noël courrier', year: 2026, eventDate: '2026-12-25' },
  });
  state.editionId = (await edition.json()).edition.id;
  await addPeople(api, ADMIN, state.editionId, ['Ada', 'Bob', 'Cléo']);
  // The organiser is a person of the group, with an address: this
  // edition goes without them, so that only Ada can be emailed.
  const { participants } = await (
    await api.get(`${ADMIN}/editions/${state.editionId}`)
  ).json();
  const orga = participants.find(
    (p: { email: string | null }) => p.email === ORGANIZER,
  );
  await api.delete(
    `${ADMIN}/editions/${state.editionId}/participants/${orga.participationId}`,
  );
});

test.afterAll(async () => {
  await state.api?.dispose();
});

test('the guardian adds addresses and sends to those who have one', async ({
  page,
}) => {
  await loginAsOrganizer(page, SLUG, ORGANIZER);
  await page.getByTestId('party-members').click();
  await page.getByText('Ada', { exact: true }).click();
  // Written on its row (ticket 162): what it sets off said under it while
  // one writes; no « Enregistrer ».
  const email = page.getByLabel('Adresse email');
  await email.fill('pas-une-adresse');
  await expect(
    page.getByText('Cette personne recevra un email', { exact: false }),
  ).toBeVisible();
  await email.press('Enter');
  await expect(page.getByTestId('inline-error')).toHaveText(
    'Adresse email invalide',
  );
  await expect(page.getByRole('button', { name: 'Enregistrer' })).toHaveCount(
    0,
  );
  await email.fill('Ada@Example.com');
  await email.press('Enter');
  await expect(page.getByText('Enregistré').first()).toBeVisible();
  const { persons } = await (await page.request.get(`${ADMIN}/persons`)).json();
  expect(
    persons.find((p: { firstName: string }) => p.firstName === 'Ada').email,
  ).toBe('ada@example.com');
  // One address, one person of the group: neither a new person nor Bob
  // can take Ada's.
  const twin = await page.request.post(
    `${ADMIN}/editions/${state.editionId}/persons`,
    {
      data: { firstName: 'Ada bis', email: 'ada@example.com' },
    },
  );
  expect(twin.status()).toBe(409);
  const bob = persons.find((p: { firstName: string }) => p.firstName === 'Bob');
  const taken = await page.request.patch(`${ADMIN}/persons/${bob.id}`, {
    data: { email: 'ADA@example.com' },
  });
  expect(taken.status()).toBe(409);
  // On screen, the row says why, under itself (an error of the server).
  await page.goto(`/admin/${SLUG}/personnes/${bob.id}`);
  await hydrated(page);
  await page.getByLabel('Adresse email').fill('ada@example.com');
  await page.getByLabel('Adresse email').press('Enter');
  await expect(page.getByTestId('inline-error')).toHaveText(
    'Cette adresse est déjà celle d’une autre personne de l’événement.',
  );

  await page.goto(`/admin/${SLUG}/editions/${state.editionId}`);
  await hydrated(page);
  // Sending by email to several people: one screen. Ada, the only one
  // with an address, is ticked from the start; the others can only get
  // one.
  await page.getByText('Prévenir avant le tirage').click();
  await expect(heading(page)).toHaveText('Envoyer par email');
  const count = page.getByTestId('email-count');
  await expect(count).toHaveText('1 sélectionné sur 3');
  const ada = page.getByRole('checkbox', { name: 'Sélectionner Ada' });
  await expect(ada).toBeChecked();
  await expect(
    page.getByRole('link', { name: "Ajouter l'adresse de Bob" }),
  ).toBeVisible();
  // The message word for word, then « Personnaliser le message »: only the
  // messages of the preparation, and a word that comes back with it.
  const preview = page.getByTestId('email-preview');
  await expect(page.getByText('Aperçu, pour Ada')).toBeVisible();
  await expect(preview).toContainText('Salut Ada !');
  await page.getByRole('link', { name: /^Personnaliser le message/ }).click();
  await expect(heading(page)).toHaveText('Personnaliser le message');
  await expect(page.getByText('Pour la personne sélectionnée')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Invitation' })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Tirage fait' })).toHaveCount(0);
  await page.getByLabel(/^Un mot en plus/).fill('Rendez-vous chez Mamie');
  await expect(page.getByTestId('customize-preview')).toContainText(
    /Rendez-vous chez Mamie$/,
  );
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(heading(page)).toHaveText('Envoyer par email');
  await expect(preview).toContainText(/Rendez-vous chez Mamie$/);
  await expect(count).toHaveText('1 sélectionné sur 3');
  await ada.click();
  await expect(count).toHaveText('0 sélectionné sur 3');
  // Nobody ticked: the preview still shows a message, as on the email
  // screen, and not an endless loading.
  await page.getByRole('link', { name: /^Modifier le message/ }).click();
  await expect(heading(page)).toHaveText('Personnaliser le message');
  await expect(page.getByTestId('customize-preview')).toContainText(
    'Salut Ada !',
  );
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(count).toHaveText('0 sélectionné sur 3');
  await page.getByRole('button', { name: 'Tout sélectionner' }).click();
  await expect(count).toHaveText('1 sélectionné sur 3');
  await page.getByRole('button', { name: 'Envoyer 1 email' }).click();
  // No key on the test server: a clear refusal, and nobody marked as sent.
  await expect(
    page.getByText(/n'est pas configuré sur le serveur/).first(),
  ).toBeVisible();
  const { participants } = await (
    await page.request.get(`${ADMIN}/editions/${state.editionId}`)
  ).json();
  expect(
    participants.every(
      (p: { messageSentAt: string | null }) => p.messageSentAt === null,
    ),
  ).toBe(true);

  // Only the messages of the current stage can be sent.
  const drawn = await page.request.post(
    `${ADMIN}/editions/${state.editionId}/emails`,
    { data: { type: 'drawn' } },
  );
  expect(drawn.status()).toBe(409);
  const tooMany = await page.request.post(
    `${ADMIN}/editions/${state.editionId}/emails`,
    { data: { type: 'invitation', participationIds: [] } },
  );
  expect(tooMany.status()).toBe(400);
});

test('a participant logs in with their address and finds their draw', async ({
  page,
}) => {
  const api = state.api!;
  const email = 'dana-accueil@example.com';
  // She comes into the event by its Secret Santa (ticket 117).
  await addPeople(api, ADMIN, state.editionId, [{ firstName: 'Dana', email }]);

  // The address is known through the person: it gets a link and a home,
  // where the party is.
  await apiLogin(page.request, email);
  await page.goto('/');
  await hydrated(page);
  await expect(heading(page)).toHaveText('Bonjour');
  const card = page.getByTestId('home-party');
  await expect(card).toContainText('Famille Courrier');
  // Her Secret Santa is a line of the party's card.
  const santa = card.getByRole('link', { name: 'Le Secret Santa' });
  await expect(santa).toBeVisible();

  // A member has no admin: neither the API nor the screens.
  expect((await page.request.get('/api/admin/groups')).status()).toBe(403);
  expect((await page.request.get(`${ADMIN}/persons`)).status()).toBe(403);
  // The old address of the group leads to its party, which a member sees
  // without its settings (ticket 104).
  await page.goto(`/admin/${SLUG}`);
  await expect(page).toHaveURL(new RegExp(`/e/${SLUG}$`));
  await expect(heading(page)).toHaveText('Famille Courrier');
  await expect(
    page.getByRole('link', { name: 'Réglages de l’événement' }),
  ).toHaveCount(0);
  await page.goto('/');
  await hydrated(page);

  // A second organiser: the page now speaks of « tes organisateurs ».
  await api.post(`${ADMIN}/organizers`, {
    data: { firstName: 'Second', email: 'second-courrier@example.com' },
  });
  await santa.click();
  await expect(page).toHaveURL(/\/p\/[A-Za-z0-9_-]{43}$/);
  await expect(page.getByText('Dana')).toBeVisible();
  await expect(
    page.getByText(/Tes organisateurs te feront signe/),
  ).toBeVisible();
  // Logged in, the draw shows the way back, opened from home or from its
  // link (here a reload): to the home (ticket 114).
  await expect(page.getByRole('button', { name: 'Retour' })).toBeVisible();
  await page.reload();
  await hydrated(page);
  await expect(page.getByRole('button', { name: 'Retour' })).toBeVisible();
  // The name of the app still leads home.
  await page.getByRole('link', { name: /Under the Tree/ }).click();
  await expect(heading(page)).toHaveText('Bonjour');
});

test('the word added to the messages is written on its own page', async ({
  page,
}) => {
  await loginAsOrganizer(page, SLUG, ORGANIZER);
  // A setting of the Secret Santa (ticket 105).
  const settings = `/admin/${SLUG}/editions/${state.editionId}/reglages`;
  await page.goto(settings);
  await hydrated(page);
  const row = page.getByTestId('group-note');
  await row.click();
  await expect(page).toHaveURL(/\/mot-messages$/);
  // « Retour » gives it up (README 23.3).
  await page.getByLabel(/^Ton mot/).fill('Oublié');
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(row).not.toContainText('Oublié');
  await row.click();
  await page.getByLabel(/^Ton mot/).fill('Rendez-vous à 19 h !');
  await page.getByText('Au-dessus du message').click();
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page).toHaveURL(new RegExp(`${settings}$`));
  await expect(row).toContainText('Rendez-vous à 19 h !');
  const { rules } = await (
    await page.request.get(`${ADMIN}/editions/${state.editionId}`)
  ).json();
  expect(rules).toMatchObject({
    messageNote: 'Rendez-vous à 19 h !',
    messageNotePosition: 'before',
  });
});

test('only the super-admin can delete a group, with everything in it', async ({
  page,
}) => {
  await loginAsOrganizer(page, SLUG, ORGANIZER);
  await page.goto(`/admin/${SLUG}/reglages`);
  await hydrated(page);
  await expect(page.getByText('Supprimer l’événement')).toHaveCount(0);
  const refused = await page.request.post(
    `/api/admin/groups/${state.groupId}/delete`,
    { data: { confirm: SLUG } },
  );
  expect(refused.status()).toBe(403);

  await page.context().clearCookies();
  await loginAsSuper(page, SUPER);
  // The identifier must be typed exactly, in the API as on screen.
  const careless = await page.request.post(
    `/api/admin/groups/${state.groupId}/delete`,
    { data: { confirm: 'autre-chose' } },
  );
  expect(careless.status()).toBe(400);
  await page.goto(`/admin/${SLUG}/reglages`);
  await hydrated(page);
  await page.getByText('Supprimer l’événement').click();
  await expect(
    page.getByRole('button', { name: 'Garder l’événement' }),
  ).toBeVisible();
  const confirm = page.getByRole('button', {
    name: 'Supprimer définitivement',
  });
  await expect(confirm).toBeDisabled();
  await page.getByLabel(/Recopie l’identifiant de l’événement/).fill(SLUG);
  await confirm.click();
  await expect(heading(page)).toHaveText('Bonjour');
  await expect(page.getByText('Famille Courrier')).toHaveCount(0);

  // Nothing is left behind: the group, its people and its edition are gone.
  const { groups } = await (await page.request.get('/api/admin/groups')).json();
  expect(groups.some((g: { slug: string }) => g.slug === SLUG)).toBe(false);
  expect((await page.request.get(`${ADMIN}/persons`)).status()).toBe(403);
  expect(
    (await page.request.get(`${ADMIN}/editions/${state.editionId}`)).status(),
  ).toBe(403);
});
