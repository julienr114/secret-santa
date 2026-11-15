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
