import { expect, test, type APIRequestContext } from '@playwright/test';
import { addPeople, apiLogin, hydrated, loginAsSuper } from './helpers';

// Emails to the organisers (README 22.2). The test server has no email
// key: sending fails quietly, so what is checked is the settings, that
// nothing breaks, and that the morning task marks the reminder as done.
test.describe.configure({ mode: 'serial' });

const SUPER = 'super-notify@example.com';
const SLUG = 'famille-notif';
const ADMIN = `/api/admin/${SLUG}`;
const state: { api?: APIRequestContext; editionId: string } = {
  editionId: '',
};

/** An ISO day, `days` from today. */
const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

test.beforeAll(async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL });
  state.api = api;
  await apiLogin(api, SUPER);
  await api.post('/api/admin/groups', {
    data: {
      slug: SLUG,
      name: 'Famille Notif',
      organizers: ['orga-notif@example.com'],
    },
  });
  await api.patch(`${ADMIN}/rules`, { data: { eventDate: inDays(2) } });
  const edition = await api.post(`${ADMIN}/editions`, {
    data: { label: 'Noël notif', year: 2026, eventDate: inDays(2) },
  });
  state.editionId = (await edition.json()).edition.id;
  await addPeople(api, ADMIN, state.editionId, ['Ada', 'Bob', 'Cléo']);
  await api.post(`${ADMIN}/editions/${state.editionId}/draw`);
});

test.afterAll(async () => {
  await state.api?.dispose();
});

test('the three emails are on by default and can be turned off', async ({
  page,
}) => {
  await loginAsSuper(page, SUPER);
  // All three are settings of the Secret Santa (ticket 116): « Quelqu'un
  // s'inscrit par le lien » first, the event keeps none.
  await page.goto(`/admin/${SLUG}/editions/${state.editionId}/reglages`);
  await hydrated(page);
  const section = page.getByTestId('notifications');
  await expect(
    section.getByRole('switch', { name: 'Rappel 3 jours avant le jour J' }),
  ).toBeChecked();
  const joined = section.getByRole('switch', {
    name: 'Quelqu’un s’inscrit par le lien',
  });
  await expect(joined).toBeChecked();
  // A switch saves as soon as it is turned: no « Enregistrer ».
  const saved = page.waitForResponse(
    (r) =>
      r.url().endsWith(`/editions/${state.editionId}`) &&
      r.request().method() === 'PATCH',
  );
  await joined.click();
  await saved;
  await expect(joined).not.toBeChecked();
  const { rules } = await (
    await page.request.get(`${ADMIN}/editions/${state.editionId}`)
  ).json();
  expect(rules.notifyJoined).toBe(false);
  expect(rules.notifyReminder).toBe(true);
  await page.goto(`/e/${SLUG}/reglages`);
  await hydrated(page);
  await expect(page.getByText('Quelqu’un s’inscrit par le lien')).toHaveCount(
    0,
  );
});

test('the morning task reminds once, a few days before the exchange', async ({
  request,
}) => {
  const before = await (
    await state.api!.get(`${ADMIN}/editions/${state.editionId}`)
  ).json();
  expect(before.edition.reminderSentAt).toBeNull();

  const run = await request.get('/__scheduled?cron=0+8+*+*+*');
  expect(run.ok()).toBe(true);
  await expect
    .poll(async () => {
      const after = await (
        await state.api!.get(`${ADMIN}/editions/${state.editionId}`)
      ).json();
      return after.edition.reminderSentAt;
    })
    .not.toBeNull();
});
