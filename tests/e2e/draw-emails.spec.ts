import { expect, test, type APIRequestContext } from '@playwright/test';
import { addPeople, apiLogin, hydrated, loginAsOrganizer } from './helpers';

// Au tirage, l'application prévient chacun (ticket 169): the organiser
// reads before the draw that an email will leave, and after it who is
// left to tell by hand; the announcement of the draw is no longer theirs
// to email. The test server has no email key: the sending fails, and
// the follow-up says so.
test.describe.configure({ mode: 'serial' });

const SLUG = 'famille-tirage-mail';
const SUPER = 'super-tirage-mail@example.com';
const ORGANIZER = 'orga-tirage-mail@example.com';
const ADMIN = `/api/admin/${SLUG}`;
const state: { api?: APIRequestContext; editionId: string } = {
  editionId: '',
};

test.beforeAll(async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL });
  state.api = api;
  await apiLogin(api, SUPER);
  await api.post('/api/admin/groups', {
    data: { slug: SLUG, name: 'Famille Tirage', organizers: [ORGANIZER] },
  });
  const edition = await api.post(`${ADMIN}/editions`, {
    data: { label: 'Noël tirage', year: 2026, eventDate: '2026-12-25' },
  });
  state.editionId = (await edition.json()).edition.id;
  await addPeople(api, ADMIN, state.editionId, [
    'Rose',
    { firstName: 'Inès', email: 'ines-tirage@example.com' },
    { firstName: 'Louis', email: 'louis-tirage@example.com' },
  ]);
});

test.afterAll(async () => {
  await state.api?.dispose();
});

test('before the draw, everyone gets their link by email but Rose', async ({
  page,
}) => {
  await loginAsOrganizer(page, SLUG, ORGANIZER);
  await page.goto(`/admin/${SLUG}/editions/${state.editionId}`);
  await hydrated(page);
  await page.getByRole('button', { name: 'Lancer le tirage' }).click();
  const sheet = page.getByTestId('draw-sheet');
  await expect(sheet).toContainText('Chacun reçoit son lien par email');
  await expect(sheet).toContainText(
    'Sauf Rose, sans adresse : tu lui partageras son lien',
  );
});

test('after the draw, the organiser no longer emails the announcement', async ({
  page,
}) => {
  const api = state.api!;
  const at = `${ADMIN}/editions/${state.editionId}`;
  const drawn = await (await api.post(`${at}/draw`)).json();
  expect(drawn.emails).toEqual({ sent: 0, failed: 'email_not_configured' });
  // The announcement is the app's; the reminder stays the organiser's.
  const refused = await api.post(`${at}/emails`, {
    data: { type: 'drawn', audience: 'all' },
  });
  expect(refused.status()).toBe(409);

  await loginAsOrganizer(page, SLUG, ORGANIZER);
  await page.goto(`/admin/${SLUG}/editions/${state.editionId}`);
  await hydrated(page);
  const card = page.getByTestId('action-card');
  await expect(
    card.getByRole('heading', { name: 'Les emails ne sont pas partis' }),
  ).toBeVisible();
  await expect(
    card.getByRole('button', { name: 'Renvoyer les emails' }),
  ).toBeVisible();
  const list = page.getByTestId('participants');
  await expect(list).toContainText('Pas d’adresse email');
  await expect(list).toContainText('Pas encore envoyé');

  // Rose gets « Le lien de Rose »: share, copy, or add her address.
  await page.getByRole('button', { name: 'Envoyer le lien de Rose' }).click();
  await expect(page.getByText('Le lien de Rose').first()).toBeVisible();
  await expect(page.getByTestId('add-address')).toContainText(
    'Son lien partira par email',
  );
  await page.keyboard.press('Escape');

  // Several by email: only the reminder.
  await page.goto(`/admin/${SLUG}/editions/${state.editionId}/emails`);
  await hydrated(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Envoyer un rappel',
  );
});
