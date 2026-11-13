import { expect, test, type APIRequestContext } from '@playwright/test';
import {
  heading,
  hydrated,
  loginAsGuardian,
  loginAsSuper,
  SUPER_PASSWORD,
} from './helpers';

// Bulk sending by email is an option of the group that only the
// super-admin can switch on. The test server has no email key, so the send
// itself answers "not configured": what is checked here is who may do what,
// and what each screen shows.
test.describe.configure({ mode: 'serial' });

const SLUG = 'famille-courrier';
const PASSWORD = 'gardien-courrier-1';
const ADMIN = `/api/admin/${SLUG}`;
const state: { api?: APIRequestContext; groupId: string; editionId: string } = {
  groupId: '',
  editionId: '',
};

test.beforeAll(async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL });
  state.api = api;
  await api.post('/api/admin/login', {
    data: { scope: 'super', password: SUPER_PASSWORD },
  });
  const created = await api.post('/api/admin/groups', {
    data: { slug: SLUG, name: 'Famille Courrier', guardianPassword: PASSWORD },
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

test('off by default, and the guardian cannot switch it on', async ({
  page,
}) => {
  await loginAsGuardian(page, SLUG, PASSWORD);
  await expect(page.getByText('Envoi par email')).toHaveCount(0);

  const patch = await page.request.patch(`/api/admin/groups/${state.groupId}`, {
    data: { emailSending: true },
  });
  expect(patch.status()).toBe(403);
  const send = await page.request.post(
    `${ADMIN}/editions/${state.editionId}/emails`,
    { data: { type: 'invitation' } },
  );
  expect(send.status()).toBe(403);

  // No address is asked for, and nothing about email on the edition.
  await page.goto(`/admin/${SLUG}/personnes/nouvelle`);
  await hydrated(page);
  await expect(page.getByLabel('Prénom')).toBeVisible();
  await expect(page.getByLabel('Email')).toHaveCount(0);
  await page.goto(`/admin/${SLUG}/editions/${state.editionId}`);
  await hydrated(page);
  await expect(
    page.getByRole('button', { name: 'Envoyer le lien de Ada' }),
  ).toBeVisible();
  await expect(page.getByText(/par email/)).toHaveCount(0);
});

test('the super-admin switches it on from the group screen', async ({
  page,
}) => {
  await loginAsSuper(page);
  await page.goto(`/admin/${SLUG}`);
  await hydrated(page);
  await expect(heading(page)).toHaveText('Famille Courrier');
  await page.getByRole('switch', { name: 'Envoi par email' }).click();
  await expect(page.getByText('Activé', { exact: true })).toBeVisible();
});

test('the guardian adds addresses and sends to those who have one', async ({
  page,
}) => {
  await loginAsGuardian(page, SLUG, PASSWORD);
  // The switch itself stays out of the guardian's reach.
  await expect(page.getByRole('switch')).toHaveCount(0);

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

test('only the super-admin can delete a group, with everything in it', async ({
  page,
}) => {
  await loginAsGuardian(page, SLUG, PASSWORD);
  await expect(page.getByText('Supprimer le groupe')).toHaveCount(0);
  const refused = await page.request.post(
    `/api/admin/groups/${state.groupId}/delete`,
    { data: { confirm: SLUG } },
  );
  expect(refused.status()).toBe(403);

  await page.context().clearCookies();
  await loginAsSuper(page);
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
  await expect(page).toHaveURL(/\/admin\/groupes$/);
  await expect(page.getByText('Famille Courrier')).toHaveCount(0);

  // Nothing is left behind: the group, its people and its edition are gone.
  const { groups } = await (await page.request.get('/api/admin/groups')).json();
  expect(groups.some((g: { slug: string }) => g.slug === SLUG)).toBe(false);
  expect((await page.request.get(`${ADMIN}/persons`)).status()).toBe(403);
  expect(
    (await page.request.get(`${ADMIN}/editions/${state.editionId}`)).status(),
  ).toBe(403);
});
