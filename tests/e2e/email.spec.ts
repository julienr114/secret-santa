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
    data: { label: 'Noël courrier', year: 2026, eventDate: '2026-12-25' },
  });
  state.editionId = (await edition.json()).edition.id;
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
  await page.getByRole('link', { name: /^Membres/ }).click();
  await page.getByText('Ada', { exact: true }).click();
  await page.getByLabel(/^Adresse email/).fill('Ada@Example.com');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByText('Enregistré').first()).toBeVisible();
  const { persons } = await (await page.request.get(`${ADMIN}/persons`)).json();
  expect(
    persons.find((p: { firstName: string }) => p.firstName === 'Ada').email,
  ).toBe('ada@example.com');

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
  // Before the draw, only the messages of the preparation.
  await expect(page.getByRole('radio', { name: 'Invitation' })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Tirage fait' })).toHaveCount(0);
  // The message word for word, with the organiser's own words below it.
  const preview = page.getByTestId('email-preview');
  await expect(page.getByText('Aperçu, pour Ada')).toBeVisible();
  await expect(preview).toContainText('Salut Ada !');
  await page.getByRole('button', { name: 'Ajouter un mot' }).click();
  await page.getByLabel('Ajouter un mot').fill('Rendez-vous chez Mamie');
  await expect(preview.locator('p').last()).toHaveText(
    'Rendez-vous chez Mamie',
  );
  await ada.click();
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
  const person = await api.post(`${ADMIN}/persons`, {
    data: { firstName: 'Dana', email },
  });
  const personId = (await person.json()).person.id;

  // The address is known through the person: it gets a link and a home,
  // empty as long as she takes part in no edition.
  await apiLogin(page.request, email);
  await page.goto('/');
  await hydrated(page);
  await expect(heading(page)).toHaveText('Bonjour');
  await expect(page.getByText(/Aucun tirage pour l’instant/)).toBeVisible();
  await expect(page.getByTestId('home-organize')).toContainText(
    'Demander à créer un groupe',
  );

  const added = await api.post(
    `${ADMIN}/editions/${state.editionId}/participants`,
    { data: { personId } },
  );
  expect(added.ok()).toBe(true);
  await page.reload();
  await hydrated(page);
  // Her only draw is the card of the home: where it stands, what to do.
  const draw = page.getByTestId('draw-card');
  await expect(draw).toContainText('Famille Courrier · Noël courrier');
  await expect(draw).toContainText('Note quelques idées de cadeaux');

  // A member has no admin: neither the API nor the screens.
  expect((await page.request.get('/api/admin/groups')).status()).toBe(403);
  expect((await page.request.get(`${ADMIN}/persons`)).status()).toBe(403);
  await page.goto(`/admin/${SLUG}`);
  await expect(heading(page)).toHaveText('Bonjour');

  // No idea written yet: the card leads straight to the wish list.
  await draw.getByRole('link', { name: 'Mes idées' }).click();
  await expect(page).toHaveURL(/\/p\/[A-Za-z0-9_-]{43}\/souhaits$/);
  // Opened from home, the list says which draw it belongs to.
  await expect(page.getByTestId('draw-name')).toHaveText(
    'Famille Courrier · Noël courrier',
  );
  const personal = new URL(page.url()).pathname.replace(/\/souhaits$/, '');
  // Back from the list leads home, where the user came from: no loop
  // through the draw page.
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(heading(page)).toHaveText('Bonjour');

  // With an idea written, the card waits for the draw, and opens it.
  await page.request.put(`/api${personal}/wishes`, {
    data: { wishes: [{ label: 'Un livre' }] },
  });
  await page.reload();
  await hydrated(page);
  await expect(draw).toContainText('Le tirage n’a pas encore eu lieu');
  await draw.getByRole('link', { name: /Famille Courrier/ }).click();
  await expect(page).toHaveURL(new RegExp(`${personal}$`));
  await expect(page.getByText('Dana')).toBeVisible();
  // Opened from home, the draw shows the way back; opened from its link
  // (here a reload), it does not.
  await expect(page.getByRole('button', { name: 'Retour' })).toBeVisible();
  await page.reload();
  await hydrated(page);
  await expect(page.getByRole('button', { name: 'Retour' })).toHaveCount(0);
  // The name of the app still leads home.
  await page.getByRole('link', { name: /Under the Tree/ }).click();
  await expect(heading(page)).toHaveText('Bonjour');
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
