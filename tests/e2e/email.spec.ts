import { expect, test, type APIRequestContext } from '@playwright/test';
import {
  heading,
  hydrated,
  apiLogin,
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
  for (const firstName of ['Ada', 'Bob', 'Cléo']) {
    await api.post(`${ADMIN}/persons`, { data: { firstName } });
  }
  const edition = await api.post(`${ADMIN}/editions`, {
    data: { label: 'Noël courrier', year: 2026 },
  });
  state.editionId = (await edition.json()).edition.id;
  await api.post(`${ADMIN}/editions/${state.editionId}/open`);
});

test.afterAll(async () => {
  await state.api?.dispose();
});

test('the guardian adds addresses and sends to those who have one', async ({
  page,
}) => {
  await loginAsOrganizer(page, SLUG, ORGANIZER);
  await page.getByText('Personnes', { exact: true }).click();
  await page.getByText('Ada', { exact: true }).click();
  await page.getByLabel('Email').fill('Ada@Example.com');
  await page.getByLabel('Email').blur();
  await expect(page.getByText('Enregistré').first()).toBeVisible();
  const { persons } = await (await page.request.get(`${ADMIN}/persons`)).json();
  expect(
    persons.find((p: { firstName: string }) => p.firstName === 'Ada').email,
  ).toBe('ada@example.com');

  await page.goto(`/admin/${SLUG}/editions/${state.editionId}`);
  await hydrated(page);
  // Bulk sending: tick who to write to, then choose the message. Ada, the
  // only one with an address, is ticked from the start; the others cannot.
  await page
    .getByRole('button', { name: 'Envoyer par email à plusieurs personnes' })
    .click();
  await expect(page.getByText('1 sélectionné')).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Sélectionner Ada' }),
  ).toBeChecked();
  await expect(
    page.getByRole('checkbox', { name: 'Sélectionner Bob' }),
  ).toBeDisabled();
  await page.getByText('Ada', { exact: true }).click();
  await expect(page.getByText('0 sélectionné')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Choisir le message' }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Tout sélectionner' }).click();
  await expect(page.getByText('1 sélectionné')).toBeVisible();
  await page.getByRole('button', { name: 'Choisir le message' }).click();
  await expect(page.getByText('Envoyer un email à 1 personne')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Invitation' })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Tirage fait' })).toHaveCount(0);
  await expect(page.getByText('Aperçu, pour Ada')).toBeVisible();
  await expect(page.getByText(/Salut Ada ! 🎁/)).toBeVisible();
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
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  await expect(page.getByText('1 sélectionné')).toHaveCount(0);

  // The send button of a row now asks how: phone, copy, or email to that
  // one person. Someone without an address cannot be emailed.
  await page.getByRole('button', { name: 'Envoyer le lien de Ada' }).click();
  await expect(page.getByText('Envoyer à Ada')).toBeVisible();
  await expect(page.getByText('Partager le message')).toBeVisible();
  await expect(page.getByText('Copier le message')).toBeVisible();
  await expect(page.getByText('ada@example.com')).toBeVisible();
  // The message and its language are chosen here, at the last moment.
  await expect(page.getByRole('radio', { name: 'Invitation' })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Relance' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Français' })).toBeChecked();
  await page.getByRole('radio', { name: 'English' }).click();
  await expect(page.getByRole('radio', { name: 'English' })).toBeChecked();
  // The sheet shows the message word for word, in the chosen language.
  await expect(page.getByTestId('message-preview')).toContainText('Hi Ada!');
  await page.getByRole('radio', { name: 'Relance' }).click();
  await expect(page.getByTestId('message-preview')).toContainText(
    'A quick reminder, Ada',
  );
  await page.getByRole('radio', { name: 'Invitation' }).click();
  // The organiser's own words go into the message: below it by default,
  // above it on demand.
  await page
    .getByLabel('Ajouter un mot (facultatif)')
    .fill('Rendez-vous chez Mamie');
  await expect(page.getByTestId('message-preview')).toContainText(
    /http\S+\s+Rendez-vous chez Mamie$/,
  );
  await page.getByRole('radio', { name: 'Au-dessus du message' }).click();
  await expect(page.getByTestId('message-preview')).toContainText(
    /^\s*Rendez-vous chez Mamie\s+Hi Ada!/,
  );
  const afterSwitch = await (await page.request.get(`${ADMIN}/persons`)).json();
  expect(
    afterSwitch.persons.find(
      (p: { firstName: string }) => p.firstName === 'Ada',
    ).language,
  ).toBe('en');
  await page.keyboard.press('Escape');
  // The list shows the language her messages will be written in.
  await expect(page.getByText('EN', { exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Envoyer le lien de Bob' }).click();
  await expect(page.getByText('Envoyer à Bob')).toBeVisible();
  await expect(
    page.getByText("Pas d'adresse email sur sa fiche"),
  ).toBeVisible();
  await page.keyboard.press('Escape');

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
  const person = await api.post(`${ADMIN}/persons`, {
    data: { firstName: 'Dana', email },
  });
  const personId = (await person.json()).person.id;

  // The address is known through the person: it gets a link and a home,
  // empty as long as she takes part in no edition.
  await apiLogin(page.request, email);
  await page.goto('/');
  await hydrated(page);
  await expect(heading(page)).toHaveText('Accueil');
  await expect(page.getByText(/Aucun tirage pour l’instant/)).toBeVisible();
  await expect(page.getByTestId('home-groups')).toHaveCount(0);

  const added = await api.post(
    `${ADMIN}/editions/${state.editionId}/participants`,
    { data: { personId } },
  );
  expect(added.ok()).toBe(true);
  await page.reload();
  await hydrated(page);
  const draw = page.getByTestId('home-draws').getByRole('link');
  await expect(draw).toContainText('Noël courrier');
  await expect(draw).toContainText('Famille Courrier · Dana');

  // A member has no admin: neither the API nor the screens.
  expect((await page.request.get('/api/admin/groups')).status()).toBe(403);
  expect((await page.request.get(`${ADMIN}/persons`)).status()).toBe(403);
  await page.goto(`/admin/${SLUG}`);
  await expect(heading(page)).toHaveText('Accueil');

  await page.getByTestId('home-draws').getByRole('link').click();
  await expect(page).toHaveURL(/\/p\/[A-Za-z0-9_-]{43}$/);
  await expect(page.getByText('Dana')).toBeVisible();
});

test('only the super-admin can delete a group, with everything in it', async ({
  page,
}) => {
  await loginAsOrganizer(page, SLUG, ORGANIZER);
  await expect(page.getByText('Supprimer le groupe')).toHaveCount(0);
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
  await page.goto(`/admin/${SLUG}`);
  await hydrated(page);
  await page.getByText('Supprimer le groupe').click();
  const confirm = page.getByRole('button', {
    name: 'Supprimer définitivement',
  });
  await expect(confirm).toBeDisabled();
  await page.getByLabel(/Recopie l’identifiant du groupe/).fill(SLUG);
  await confirm.click();
  await expect(heading(page)).toHaveText('Accueil');
  await expect(page.getByText('Famille Courrier')).toHaveCount(0);

  // Nothing is left behind: the group, its people and its edition are gone.
  const { groups } = await (await page.request.get('/api/admin/groups')).json();
  expect(groups.some((g: { slug: string }) => g.slug === SLUG)).toBe(false);
  expect((await page.request.get(`${ADMIN}/persons`)).status()).toBe(403);
  expect(
    (await page.request.get(`${ADMIN}/editions/${state.editionId}`)).status(),
  ).toBe(403);
});
