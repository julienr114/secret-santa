import { expect, test } from '@playwright/test';
import { apiLogin } from './helpers';

// The home of an account (README 11 and 22.10). What its top card needs
// comes from the home route: for each group organised, where its current
// edition stands.
test.describe.configure({ mode: 'serial' });

const SLUG = 'famille-accueil';
const SUPER = 'super-home@example.com';
const ORGANIZER = 'orga-accueil@example.com';
const ADMIN = `/api/admin/${SLUG}`;

test('the home tells an organiser where their edition stands', async ({
  playwright,
  baseURL,
}) => {
  const admin = await playwright.request.newContext({ baseURL });
  await apiLogin(admin, SUPER);
  await admin.post('/api/admin/groups', {
    data: { slug: SLUG, name: 'Famille Accueil', organizers: [ORGANIZER] },
  });
  for (const firstName of ['Ada', 'Bob', 'Cléo']) {
    await admin.post(`${ADMIN}/persons`, { data: { firstName } });
  }
  const created = await admin.post(`${ADMIN}/editions`, {
    data: { label: 'Noël accueil', year: 2026, eventDate: '2026-12-24' },
  });
  const editionId = (await created.json()).edition.id;

  const organizer = await playwright.request.newContext({ baseURL });
  await apiLogin(organizer, ORGANIZER);
  const current = async () =>
    (await (await organizer.get('/api/auth/home')).json()).groups[0].current;

  // To prepare: the draw is checked, nobody is counted as to notify yet.
  expect(await current()).toMatchObject({
    id: editionId,
    status: 'preparing',
    eventDate: '2026-12-24',
    drawPossible: true,
  });

  // Drawn: everyone is to notify, nobody has looked.
  expect((await admin.post(`${ADMIN}/editions/${editionId}/draw`)).ok()).toBe(
    true,
  );
  const drawn = await current();
  expect(drawn).toMatchObject({ status: 'drawn', notOpened: 0, viewed: 0 });
  expect(drawn.toNotify).toBe(drawn.participants);
  expect(drawn.toNotify).toBeGreaterThanOrEqual(3);

  await admin.dispose();
  await organizer.dispose();
});

test('the home says when the journal of a draw has news', async ({
  page,
  playwright,
  baseURL,
}) => {
  const SLUG2 = 'famille-signal';
  const AT = `/api/admin/${SLUG2}`;
  const ZOE = 'zoe-signal@example.com';
  const admin = await playwright.request.newContext({ baseURL });
  await apiLogin(admin, SUPER);
  await admin.post('/api/admin/groups', {
    data: { slug: SLUG2, name: 'Famille Signal' },
  });
  const ids: Record<string, string> = {};
  for (const [firstName, email] of [
    ['Zoé', ZOE],
    ['Yann', null],
    ['Xavier', null],
  ] as const) {
    const { person } = await (
      await admin.post(`${AT}/persons`, {
        data: { firstName, ...(email ? { email } : {}) },
      })
    ).json();
    ids[firstName] = person.id;
  }
  const { edition } = await (
    await admin.post(`${AT}/editions`, {
      data: { label: 'Noël signal', year: 2026, eventDate: '2099-12-24' },
    })
  ).json();
  await admin.post(`${AT}/editions/${edition.id}/draw`);
  const { participants } = await (
    await admin.get(`${AT}/editions/${edition.id}`)
  ).json();
  const zoe = participants.find(
    (p: { firstName: string }) => p.firstName === 'Zoé',
  );
  // Her link is renewed: she alone is told.
  await admin.post(`${AT}/participations/${zoe.participationId}/regenerate`);

  await apiLogin(page.request, ZOE);
  const signal = async () =>
    (await (await page.request.get('/api/auth/home')).json()).draws[0].journal;
  expect(await signal()).toMatchObject({
    count: 1,
    alert: { type: 'link_regenerated' },
  });
  await page.goto('/');
  await expect(page.getByTestId('journal-signal')).toContainText(
    /Du nouveau au journal\. Ton lien a été régénéré le .+\./,
  );

  // The organiser looks at Yann's result: two alerts, one line.
  await admin.post(`${AT}/editions/${edition.id}/reveal-one`, {
    data: { personId: ids.Yann, sentence: 'JE VEUX VOIR LE TIRAGE' },
  });
  await page.reload();
  await expect(page.getByTestId('journal-signal')).toContainText(
    '2 alertes depuis ta dernière visite.',
  );
  // Opening the journal clears it.
  const seen = page.waitForResponse(
    (r) => r.url().endsWith('/journal-seen') && r.ok(),
  );
  await page.getByTestId('journal-signal').click();
  await seen;
  expect(await signal()).toBeNull();

  // Xavier never opened the journal: a draw cancelled then made again
  // is still told to him, the count starting from the edition.
  await admin.post(`${AT}/editions/${edition.id}/redraw`, {
    data: { reason: 'Un oubli' },
  });
  await admin.post(`${AT}/editions/${edition.id}/draw`);
  const xavier = participants.find(
    (p: { firstName: string }) => p.firstName === 'Xavier',
  );
  const { link } = await (
    await admin.post(`${AT}/participations/${xavier.participationId}/link`)
  ).json();
  const state = await (
    await page.request.get(`/api/p/${new URL(link).pathname.split('/').pop()}`)
  ).json();
  // The access to Yann's result and the cancelled draw.
  expect(state.journalAlerts).toBe(2);
  await admin.dispose();
});
