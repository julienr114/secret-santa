import { expect, test, type APIRequestContext } from '@playwright/test';
import { addPeople, apiLogin, hydrated, loginAsSuper } from './helpers';

// « En cas d'urgence » (ticket 129, V3Admin, EnvoiSuspendu): what to
// watch today, the caps of the emails, and the three switches.
// « Suspendre les inscriptions » refuses a new account and a new event,
// never a login; « Suspendre les emails » shows the organiser who wants
// to send that sending is paused. Each switch is turned back off.
test.describe.configure({ mode: 'serial' });

const SUPER = 'super-emergency@example.com';
const SLUG = 'famille-urgence';
const ADMIN = `/api/admin/${SLUG}`;
const state: { api?: APIRequestContext; editionId: string } = {
  editionId: '',
};

test.beforeAll(async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL });
  state.api = api;
  await apiLogin(api, SUPER);
  await api.post('/api/admin/groups', {
    data: { slug: SLUG, name: 'Famille Urgence' },
  });
  await api.patch(`${ADMIN}/rules`, { data: { eventDate: '2026-12-25' } });
  const edition = await api.post(`${ADMIN}/editions`, {
    data: { label: 'Noël urgence', year: 2026, eventDate: '2026-12-25' },
  });
  state.editionId = (await edition.json()).edition.id;
  await addPeople(api, ADMIN, state.editionId, [
    { firstName: 'Ada', email: 'ada-urgence@example.com' },
  ]);
});

test.afterAll(async () => {
  await state.api?.patch('/api/admin/switches', { data: { signups: false } });
  await state.api?.patch('/api/admin/switches', { data: { emails: false } });
  await state.api?.dispose();
});

test('the dashboard shows today, the caps and three switches', async ({
  page,
}) => {
  await loginAsSuper(page, SUPER);
  await page.goto('/admin');
  await hydrated(page);
  for (const name of [
    'Requêtes refusées pour débit, aujourd’hui',
    'Connexions échouées, aujourd’hui',
    'Emails rejetés, aujourd’hui',
    'Erreurs du serveur, aujourd’hui',
  ]) {
    await expect(page.getByTestId('watch')).toContainText(name);
  }
  await expect(page.getByTestId('cap-emailsDay')).toContainText('sur 100');
  await expect(page.getByTestId('cap-emailsMonth')).toContainText('sur 3');
  // Q-039: the requests and the spend, on Cloudflare's own dashboard.
  await expect(
    page.getByTestId('cap-cloudflare').getByRole('link'),
  ).toHaveAttribute('href', 'https://dash.cloudflare.com/');
  for (const id of ['pause-emails', 'pause-signups', 'pause-secret-santas']) {
    await expect(page.getByTestId(id).getByRole('switch')).not.toBeChecked();
  }
});

test('sign-ups suspended: no new account nor event, a login still', async ({
  page,
  playwright,
  baseURL,
}) => {
  await loginAsSuper(page, SUPER);
  await page.goto('/admin');
  await hydrated(page);
  const saved = page.waitForResponse(
    (r) => r.url().endsWith('/api/admin/switches') && r.ok(),
  );
  await page.getByTestId('pause-signups').getByRole('switch').click();
  await saved;
  // A logged-in account of before, made while it was off.
  const member = await playwright.request.newContext({ baseURL });
  const visitor = await playwright.request.newContext({ baseURL });
  try {
    await state.api!.patch('/api/admin/switches', { data: { signups: false } });
    await apiLogin(member, 'urgence-membre@example.com');
    await state.api!.patch('/api/admin/switches', { data: { signups: true } });
    // A new address: refused.
    const fresh = await visitor.post('/api/auth/link', {
      data: { email: 'urgence-nouveau@example.com' },
    });
    expect(fresh.status()).toBe(403);
    expect((await fresh.json()).statusMessage).toBe('signups_paused');
    // An account that exists logs in.
    const known = await visitor.post('/api/auth/link', {
      data: { email: 'urgence-membre@example.com' },
    });
    expect(known.ok()).toBe(true);
    // No new event.
    const party = await member.post('/api/parties', {
      data: {
        category: 'other',
        name: 'Une fête en pause',
        date: '2027-01-10',
        recurring: false,
      },
    });
    expect(party.status()).toBe(403);
  } finally {
    await state.api!.patch('/api/admin/switches', { data: { signups: false } });
    await member.dispose();
    await visitor.dispose();
  }
});

test('emails suspended: the organiser sees that sending is paused', async ({
  page,
}) => {
  await loginAsSuper(page, SUPER);
  await state.api!.patch('/api/admin/switches', { data: { emails: true } });
  try {
    await page.goto(`/admin/${SLUG}/editions/${state.editionId}/emails`);
    await hydrated(page);
    await expect(page.getByTestId('emails-paused')).toContainText(
      'L’envoi d’emails est en pause pour tout le monde.',
    );
    await expect(
      page.getByRole('link', { name: 'Partager les liens' }),
    ).toHaveAttribute('href', `/admin/${SLUG}/editions/${state.editionId}`);
    // The server refuses the send too.
    const sent = await state.api!.post(
      `${ADMIN}/editions/${state.editionId}/emails`,
      { data: { type: 'invitation' } },
    );
    expect(sent.status()).toBe(503);
    expect((await sent.json()).statusMessage).toBe('emails_paused');
  } finally {
    await state.api!.patch('/api/admin/switches', { data: { emails: false } });
  }
});
