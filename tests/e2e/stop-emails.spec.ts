import { createHmac } from 'node:crypto';
import { expect, test, type APIRequestContext } from '@playwright/test';
import { addPeople, apiLogin, hydrated, loginAsSuper } from './helpers';

// « Ne plus recevoir d'emails » (ticket 130, StopDemande, StopConfirme,
// StopSaisie, StopEnvoi): opening the link blocks nothing, the button
// does, « Annuler » lifts it; with an account, « Par email » goes to
// « Aucun email » and « Me prévenir » lifts it; whoever types the
// address is told; « Signaler cet envoi » reaches the super-admin.
test.describe.configure({ mode: 'serial' });

// The secret of the test server (scripts/e2e-server.sh): the test signs
// the links as the server does.
const SECRET = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
const b64url = (data: Buffer) =>
  data
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
const signed = (domain: string, text: string) =>
  `${b64url(Buffer.from(text))}.${b64url(
    createHmac('sha256', `${domain}:${SECRET}`).update(text).digest(),
  )}`;
const stopToken = (email: string) => signed('email-stop', email);

const SUPER = 'super-stop@example.com';
const SLUG = 'famille-stop';
const ADMIN = `/api/admin/${SLUG}`;
const REFUSER = 'refuse-stop@example.com';
const HOLDER = 'compte-stop@example.com';
const state: {
  api?: APIRequestContext;
  editionId: string;
  partyId: string;
  personId: string;
} = { editionId: '', partyId: '', personId: '' };

test.beforeAll(async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL });
  state.api = api;
  await apiLogin(api, SUPER);
  const { group } = await (
    await api.post('/api/admin/groups', {
      data: { slug: SLUG, name: 'Famille Stop' },
    })
  ).json();
  state.partyId = group.id;
  await api.patch(`${ADMIN}/rules`, { data: { eventDate: '2026-12-25' } });
  const edition = await api.post(`${ADMIN}/editions`, {
    data: { label: 'Noël stop', year: 2026, eventDate: '2026-12-25' },
  });
  state.editionId = (await edition.json()).edition.id;
  const [refuser] = await addPeople(api, ADMIN, state.editionId, [
    { firstName: 'Hugo', email: REFUSER },
    { firstName: 'Léa', email: 'lea-stop@example.com' },
  ]);
  state.personId = refuser!.id;
});

test.afterAll(async () => {
  await state.api?.dispose();
});

test('opening the link blocks nothing; the button does; « Annuler » lifts it', async ({
  page,
  request,
}) => {
  const token = stopToken(REFUSER);
  await page.goto(`/arreter/${token}`);
  await hydrated(page);
  await expect(page.getByTestId('stop-ask')).toContainText(REFUSER);
  expect((await (await request.get(`/api/stop/${token}`)).json()).blocked).toBe(
    false,
  );
  await page.getByTestId('stop-yes').click();
  await expect(page.getByTestId('stop-done')).toContainText('C’est noté');
  expect((await (await request.get(`/api/stop/${token}`)).json()).blocked).toBe(
    true,
  );
  await page.getByTestId('stop-cancel').click();
  await expect(page.getByTestId('stop-ask')).toBeVisible();
  expect((await (await request.get(`/api/stop/${token}`)).json()).blocked).toBe(
    false,
  );
  // A link the server did not sign leads nowhere.
  await page.goto(`/arreter/${stopToken('autre@example.com').slice(0, -2)}xx`);
  await hydrated(page);
  await expect(page.getByTestId('stop-unknown')).toBeVisible();
});

test('whoever types the address is told, and the bulk send puts it aside', async ({
  page,
  request,
}) => {
  await request.post(`/api/stop/${stopToken(REFUSER)}`);
  await loginAsSuper(page, SUPER);
  await page.goto(`/e/${SLUG}/membres/${state.personId}`);
  await hydrated(page);
  await expect(page.getByTestId('email-block-note')).toContainText(
    'La personne qui a cette adresse a demandé à ne plus recevoir d’emails d’Under the Tree.',
  );
  await page.goto(`/admin/${SLUG}/editions/${state.editionId}/emails`);
  await hydrated(page);
  await expect(page.getByTestId('email-people')).toContainText(
    'A demandé à ne plus recevoir d’emails',
  );
});

test('with an account: « Aucun email » too, and « Me prévenir » lifts it', async ({
  page,
  request,
}) => {
  await apiLogin(page.request, HOLDER);
  await request.post(`/api/stop/${stopToken(HOLDER)}`);
  const account = await (await page.request.get('/api/auth/sessions')).json();
  expect(account.emailNews).toBe('none');
  expect(account.emailBlocked).toBe(true);
  await page.goto('/compte/me-prevenir');
  await hydrated(page);
  await expect(page.getByTestId('email-blocked')).toBeVisible();
  await page.getByTestId('email-unblock').click();
  await expect(page.getByTestId('email-blocked')).toHaveCount(0);
  // « Aucun email » stays: it says how it differs from the link.
  await expect(page.getByTestId('none-differs')).toBeVisible();
});

test('« Signaler cet envoi » reaches the super-admin, who cuts the emails', async ({
  page,
}) => {
  const token = signed('email-report', `${state.partyId}|`);
  await page.goto(`/signaler/${token}`);
  await hydrated(page);
  await page.getByTestId('report-send').click();
  await expect(page.getByTestId('report-done')).toBeVisible();
  await loginAsSuper(page, SUPER);
  await page.goto('/admin/envois-signales');
  await hydrated(page);
  const party = page
    .getByTestId('reported-party')
    .filter({ hasText: 'Famille Stop' });
  await expect(party).toContainText('1 signalement');
  const cut = party.getByTestId('cut-emails').getByRole('switch');
  await cut.click();
  await expect(cut).toBeChecked();
});
