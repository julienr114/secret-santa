import { expect, test, type APIRequestContext } from '@playwright/test';
import { apiLogin, heading, hydrated, seedMembers, seedSql } from './helpers';

// The year after and the years over (ticket 108, V3AccueilAnnee,
// V3FetesPassees, V3FeteAnneePassee, V3ListeReprise): an event that comes
// back, whose year is over, offers « Préparer » and « Reprendre ma liste
// de l'an dernier » two months before its date; its year over is in « Les
// événements passés », read only, with whom I gave to; nothing changes in
// it by any route; a Secret Santa not drawn yet is deleted.
test.describe.configure({ mode: 'serial' });

const HUGO = 'hugo-annees@example.com';
const NAMES = ['Zoé', 'Léo', 'Inès'];

/** A day from today, ISO. */
const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
const date = inDays(30);
const year = Number(date.slice(0, 4));
const lastYear = `${year - 1}${date.slice(4)}`;

const state: { api?: APIRequestContext; slug: string; oldId: string } = {
  slug: '',
  oldId: '',
};
const api = () => {
  if (!state.api) throw new Error('api context missing');
  return state.api;
};
const ok = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  expect(response.ok(), `${response.url()}: ${response.status()}`).toBe(true);
  return response.json();
};

test.beforeAll(async ({ playwright, baseURL }) => {
  state.api = await playwright.request.newContext({ baseURL });
  await apiLogin(api(), HUGO);
  await ok(
    await api().put('/api/auth/profile', { data: { firstName: 'Hugo' } }),
  );
  const { slug } = await ok(
    await api().post('/api/parties', {
      data: {
        category: 'christmas',
        name: 'Famille Annees',
        date,
        recurring: true,
        memberIds: [],
      },
    }),
  );
  state.slug = slug;
  const at = `/api/admin/${slug}`;
  // Members of before ticket 117: they are in both Secret Santa below.
  await seedMembers(slug, NAMES);
  // Last year: two Secret Santa drawn and closed, and Hugo's list.
  const ids: string[] = [];
  for (const label of [`Noël ${year}`, 'Les enfants']) {
    const { edition } = await ok(
      await api().post(`${at}/editions`, {
        data: { label, year, eventDate: date },
      }),
    );
    ids.push(edition.id);
    await ok(await api().post(`${at}/editions/${edition.id}/draw`));
    await ok(await api().post(`${at}/editions/${edition.id}/close`));
  }
  state.oldId = ids[0]!;
  const { id: listId } = await ok(
    await api().post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, party: slug },
    }),
  );
  // Everything moves one year back: that year is over.
  await seedSql(`
UPDATE party_years SET year = ${year - 1}, date = '${lastYear}'
  WHERE party_id = (SELECT id FROM parties WHERE slug = '${slug}');
UPDATE secret_santas SET label = 'Noël ${year - 1}' WHERE id = '${state.oldId}';
UPDATE gift_lists SET event_date = '${lastYear}' WHERE id = '${listId}';
`);
});

test.afterAll(async () => {
  await state.api?.dispose();
});

test('the home offers to prepare the year to come and to take my list again', async ({
  page,
}) => {
  await apiLogin(page.request, HUGO);
  await page.goto('/');
  await hydrated(page);
  const card = page
    .getByTestId('home-party')
    .filter({ hasText: 'Famille Annees' });
  await expect(card.getByTestId('home-prepare')).toHaveText(
    `Préparer Noël ${year}`,
  );
  await expect(card.getByTestId('home-resume')).toHaveText(
    'Reprendre ma liste de l’an dernier',
  );
  await expect(
    card.getByRole('link', { name: 'Créer une liste de cadeaux' }),
  ).toHaveCount(0);
  await expect(page.getByTestId('home-past')).toContainText('Famille Annees');

  // As many Secret Santa as last year, to prepare, their year moved on.
  await card.getByTestId('home-prepare').click();
  await expect(card.getByTestId('home-prepare')).toHaveCount(0);
  await expect(card.getByRole('link', { name: `Noël ${year}` })).toBeVisible();
  await expect(card.getByRole('link', { name: 'Les enfants' })).toBeVisible();
});

test('the year over is in « Les événements passés », read only', async ({
  page,
}) => {
  await apiLogin(page.request, HUGO);
  // The old address leads there.
  await page.goto('/tirages-passes');
  await hydrated(page);
  await expect(page).toHaveURL(/\/evenements-passes$/);
  await expect(heading(page)).toHaveText('Les événements passés');
  const section = page.getByTestId('past-year');
  await expect(section.getByRole('heading')).toHaveText(String(year - 1));
  const row = section.getByRole('link', { name: /Famille Annees/ });
  await expect(row).toContainText(/tu offrais à (Zoé|Léo|Inès)/);

  await row.click();
  await expect(page).toHaveURL(
    new RegExp(`/e/${state.slug}/annees/${year - 1}$`),
  );
  await expect(heading(page)).toHaveText('Famille Annees');
  await expect(page.getByTestId('past-year-name')).toHaveText(
    `Noël ${year - 1}`,
  );
  await expect(page.getByTestId('past-year-secret-santas')).toContainText(
    /Tu offrais à (Zoé|Léo|Inès)/,
  );
  await expect(page.getByTestId('past-year-lists')).toContainText(
    'Ma liste de cadeaux',
  );

  // Nothing changes in it, by any route.
  const at = `/api/admin/${state.slug}/editions/${state.oldId}`;
  const redraw = await page.request.post(`${at}/draw`);
  expect(redraw.status()).toBe(409);
  expect((await redraw.json()).statusMessage).toBe('year_over');
  const patch = await page.request.patch(at, { data: { label: 'Autre' } });
  expect(patch.status()).toBe(409);
  const made = await page.request.post(`/api/admin/${state.slug}/editions`, {
    data: { label: 'Encore', year: year - 1, eventDate: lastYear },
  });
  expect(made.status()).toBe(409);

  // The event shows it among its years over.
  await page.goto(`/e/${state.slug}`);
  await hydrated(page);
  await expect(page.getByTestId('party-past-years')).toContainText(
    `Noël ${year - 1}`,
  );
});

test('my list of last year is taken again, its ideas marked for me alone', async ({
  page,
}) => {
  await apiLogin(page.request, HUGO);
  await page.goto('/');
  await hydrated(page);
  await page
    .getByTestId('home-party')
    .filter({ hasText: 'Famille Annees' })
    .getByTestId('home-resume')
    .click();
  await expect(page).toHaveURL(/\/listes\/[^/?]+$/);
  await expect(page.getByTestId('resumed-from')).toContainText(
    `Reprise de Noël ${year - 1}.`,
  );
});

test('a Secret Santa not drawn yet is deleted from its settings', async ({
  page,
}) => {
  await apiLogin(page.request, HUGO);
  const { editions } = await ok(
    await page.request.get(`/api/admin/${state.slug}/editions`),
  );
  const prepared = (editions as { id: string; year: number }[]).find(
    (edition) => edition.year === year,
  );
  expect(prepared).toBeTruthy();
  await page.goto(`/admin/${state.slug}/editions/${prepared!.id}/reglages`);
  await hydrated(page);
  await page.getByTestId('delete-secret-santa').click();
  await page.getByTestId('delete-secret-santa-confirm').click();
  await expect(page).toHaveURL(new RegExp(`/e/${state.slug}$`));
  // The one of last year was drawn: it stays.
  const old = await page.request.delete(
    `/api/admin/${state.slug}/editions/${state.oldId}`,
  );
  expect(old.status()).toBe(409);
});
