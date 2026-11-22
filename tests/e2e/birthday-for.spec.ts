import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { apiLogin, heading, hydrated, seedSql } from './helpers';

// A birthday knows whom it is for (ticket 118, V3FeteAnniversaire,
// V3FeteNouvelle, V3FeteAnneePassee): created for Zoé, it says her age
// next to its date, « Ses 3 ans » for a year over and « 2 cadeaux offerts
// à Zoé »; « Bientôt » no longer proposes hers, even at another date; its
// settings change whom it is for; « Quelqu'un d'autre » says no age; Zoé
// deleted, the event keeps its name and loses her age.
test.describe.configure({ mode: 'serial' });

const CAMILLE = 'camille-anniv@example.com';
// Another account: five login links an address at most.
const SOFIA = 'sofia-anniv@example.com';

/** A day from today, ISO. */
const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
const date = inDays(20);
const year = Number(date.slice(0, 4));
const lastYear = `${year - 1}${date.slice(4)}`;
// Zoé turns 4 this time, 3 the year before.
const birthDate = `${year - 4}${date.slice(4)}`;

const state: { zoe: string; slug: string } = { zoe: '', slug: '' };

const ok = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  expect(response.ok(), `${response.url()}: ${response.status()}`).toBe(true);
  return response.json();
};

/** The line under the name of the event: its date, how far, an age. */
const when = (page: Page) => page.getByTestId('party-when');

test('a birthday created for Zoé says her age next to its date', async ({
  page,
}) => {
  const api = page.request;
  await apiLogin(api, CAMILLE);
  await ok(
    await api.put('/api/auth/profile', { data: { firstName: 'Camille' } }),
  );
  const { id } = await ok(
    await api.post('/api/family', {
      data: { firstName: 'Zoé', avatar: { emoji: '🦄', color: 'pine' } },
    }),
  );
  state.zoe = id;
  await ok(await api.patch(`/api/family/${id}`, { data: { birthDate } }));

  // « Bientôt » proposes her birthday; « Préparer » opens it filled.
  await page.goto('/');
  await hydrated(page);
  const proposed = page
    .getByTestId('home-birthday')
    .filter({ hasText: 'L’anniversaire de Zoé' });
  await expect(proposed).toContainText('ses 4 ans');
  await proposed.getByRole('link', { name: 'Préparer' }).click();
  await expect(heading(page)).toHaveText('Pour quelle occasion ?');
  await expect(page.getByTestId('party-name')).toHaveValue(
    'L’anniversaire de Zoé',
  );
  await page.getByTestId('party-name').fill('L’anniversaire de Zoé 4');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page).toHaveURL(/\/e\/l-anniversaire-de-zoe-4[^/]*$/);
  state.slug = new URL(page.url()).pathname.split('/').at(-1) ?? '';
  await expect(when(page)).toContainText(/ · ses 4 ans$/);
});

test('« Bientôt » no longer proposes hers, even at another date', async ({
  page,
}) => {
  await apiLogin(page.request, CAMILLE);
  await ok(
    await page.request.patch(`/api/parties/${state.slug}`, {
      data: { date: inDays(25) },
    }),
  );
  await page.goto('/');
  await hydrated(page);
  await expect(
    page
      .getByTestId('home-party')
      .filter({ hasText: 'L’anniversaire de Zoé 4' }),
  ).toBeVisible();
  await expect(page.getByTestId('home-birthday')).toHaveCount(0);
});

test('its settings say whom it is for, and change it', async ({ page }) => {
  await apiLogin(page.request, CAMILLE);
  await page.goto(`/e/${state.slug}/reglages`);
  await hydrated(page);
  const row = page.getByTestId('party-for-whom');
  await expect(row).toContainText('Pour');
  await expect(row).toContainText('Zoé');

  await row.click();
  await page.getByRole('radio', { name: 'Personne' }).check();
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(row).toContainText('Personne');
  await page.goto(`/e/${state.slug}`);
  await hydrated(page);
  await expect(when(page)).not.toContainText(/ses \d+ ans/i);

  await page.goto(`/e/${state.slug}/reglages`);
  await hydrated(page);
  await page.getByTestId('party-for-whom').click();
  await page.getByRole('radio', { name: /Zoé/ }).check();
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByTestId('party-for-whom')).toContainText('Zoé');
});

test('its year over is « Ses 3 ans », with the gifts given to Zoé', async ({
  page,
}) => {
  const api = page.request;
  await apiLogin(api, CAMILLE);
  // Her list for the event, with two gifts given last year.
  const { id: listId } = await ok(
    await api.post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, party: state.slug },
    }),
  );
  await ok(
    await api.post(`/api/lists/${listId}/people`, {
      data: { memberId: state.zoe },
    }),
  );
  await seedSql(`
UPDATE party_years SET year = ${year - 1}, date = '${lastYear}'
  WHERE party_id = (SELECT id FROM parties WHERE slug = '${state.slug}');
UPDATE gift_lists SET event_date = '${lastYear}' WHERE id = '${listId}';
INSERT INTO gift_off_list (id, list_id, list_person_id, account_id, text, anonymous, created_at)
  SELECT 'off-' || n.k, p.list_id, p.id, l.account_id, 'Un livre', 0, '${lastYear}T10:00:00.000Z'
  FROM gift_list_people p JOIN gift_lists l ON l.id = p.list_id,
    (SELECT 'a' AS k UNION SELECT 'b') n
  WHERE p.list_id = '${listId}';
`);

  await page.goto(`/e/${state.slug}`);
  await hydrated(page);
  await expect(when(page)).toContainText(/ · ses 4 ans$/);
  const past = page.getByTestId('party-past-years');
  await expect(past).toContainText('Ses 3 ans');
  await expect(past).toContainText('2 cadeaux offerts à Zoé');

  await past.getByRole('link', { name: /Ses 3 ans/ }).click();
  await expect(page).toHaveURL(
    new RegExp(`/e/${state.slug}/annees/${year - 1}`),
  );
  await expect(page.getByTestId('past-year-name')).toHaveText('Ses 3 ans');
});

test('a birthday for « Quelqu’un d’autre » says no age', async ({ page }) => {
  const api = page.request;
  await apiLogin(api, SOFIA);
  const { slug } = await ok(
    await api.post('/api/parties', {
      data: {
        category: 'birthday',
        name: 'L’anniversaire de Karim',
        date,
        recurring: true,
        forMemberId: null,
      },
    }),
  );
  await page.goto(`/e/${slug}`);
  await hydrated(page);
  await expect(when(page)).toBeVisible();
  await expect(when(page)).not.toContainText(/ses \d+ ans/i);
  // Nobody else's people: refused.
  const other = await api.post('/api/parties', {
    data: {
      category: 'birthday',
      name: 'Pas à moi',
      date,
      recurring: true,
      forMemberId: 'not-mine',
    },
  });
  expect(other.status()).toBe(404);
});

test('Zoé deleted, the event keeps its name and loses her age', async ({
  page,
}) => {
  await apiLogin(page.request, CAMILLE);
  await ok(await page.request.delete(`/api/family/${state.zoe}`));
  await page.goto(`/e/${state.slug}`);
  await hydrated(page);
  await expect(heading(page)).toHaveText('L’anniversaire de Zoé 4');
  await expect(when(page)).not.toContainText(/ses \d+ ans/i);
  const past = page.getByTestId('party-past-years');
  // Her place on the list went with her, and what was given to her.
  await expect(past).toContainText(`Anniversaire ${year - 1}`);
  await expect(past).not.toContainText('Zoé');
  await expect(past).not.toContainText(/ses \d+ ans/i);
});
