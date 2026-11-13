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
  await expect(page.getByText('Message à partager')).toBeVisible();
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
  await expect(page.getByText(/2 sans adresse/)).toBeVisible();
  await page
    .getByRole('button', { name: 'Envoyer par email à 1 personne' })
    .click();
  await page.getByRole('button', { name: "Confirmer l'envoi à 1" }).click();
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
});
