import { expect, test } from '@playwright/test';
import { apiLogin, hydrated, seedSql, typeDate } from './helpers';

// A date in one field (ticket 160, regles-d-ecran.md, « Les dates »):
// typed in one go, the date in full under it, a date out of its years
// refused by us; and a date opens its page, never a sheet.
const ME = 'dates-one-field@example.com';

test('an event: typed in one go, the date in full, out of bounds refused', async ({
  page,
}) => {
  await apiLogin(page.request, ME);
  await page.goto('/e/nouvelle?pour=liste');
  await hydrated(page);
  await page.getByRole('radio', { name: 'Autre' }).click();
  const year = new Date().getFullYear();
  await typeDate(page, 'party-date', `1412${year + 1}`);
  await expect(page.getByTestId('party-date-full')).toHaveText(
    new Intl.DateTimeFormat('fr', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${year + 1}-12-14T12:00:00Z`)),
  );
  await expect(page.getByTestId('party-date')).toHaveAttribute(
    'aria-label',
    /date/i,
  );
  await typeDate(page, 'party-date', `1412${year + 9}`);
  await expect(page.getByTestId('party-date-full')).toHaveText(
    `Une date entre ${year} et ${year + 2}.`,
  );
});

test('the date of a list opens its page, and is taken away there', async ({
  page,
}) => {
  await apiLogin(page.request, ME);
  const { id } = await (
    await page.request.post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, title: 'Une liste datée' },
    })
  ).json();
  await page.goto(`/listes/${id}`);
  await hydrated(page);
  await page.getByTestId('list-date').click();
  await expect(page).toHaveURL(new RegExp(`/listes/${id}/date$`));
  const year = new Date().getFullYear();
  await typeDate(page, 'list-date', `2412${year}`);
  await page.getByTestId('list-date-validate').click();
  await expect(page).toHaveURL(new RegExp(`/listes/${id}$`));
  await expect(page.getByTestId('list-date')).toContainText('24 décembre');
  await page.getByTestId('list-date').click();
  await page.getByTestId('list-date-clear').click();
  await expect(page).toHaveURL(new RegExp(`/listes/${id}$`));
  await expect(page.getByTestId('list-date')).not.toContainText('24 décembre');
});

test('the date of an event, from its settings, on its page', async ({
  page,
}) => {
  await apiLogin(page.request, ME);
  const year = new Date().getFullYear();
  const { slug } = await (
    await page.request.post('/api/parties', {
      data: {
        category: 'other',
        name: 'Une fête à dater',
        date: `${year + 1}-06-20`,
        recurring: false,
      },
    })
  ).json();
  await page.goto(`/e/${slug}/reglages`);
  await hydrated(page);
  await page.getByTestId('party-date-row').click();
  await expect(page).toHaveURL(new RegExp(`/e/${slug}/reglages/date$`));
  await expect(page.getByTestId('party-date-full')).toContainText('20 juin');
  await typeDate(page, 'party-date', `2107${year + 1}`);
  await page.getByTestId('party-date-validate').click();
  await expect(page).toHaveURL(new RegExp(`/e/${slug}/reglages$`));
  await expect(page.getByTestId('party-date-row')).toContainText('21 juillet');
});

test('an event is not created in the past', async ({ page }) => {
  await apiLogin(page.request, ME);
  const year = new Date().getFullYear();
  const refused = await page.request.post('/api/parties', {
    data: {
      category: 'other',
      name: 'Trop tard',
      date: `${year - 1}-06-20`,
      recurring: false,
    },
  });
  expect(refused.status()).toBe(400);
  expect((await refused.json()).statusMessage).toBe('date_past');
});

test('an archived event: not offered for a Secret Santa, its settings reachable, its date put right', async ({
  page,
}) => {
  await apiLogin(page.request, ME);
  const year = new Date().getFullYear();
  const today = new Date().toLocaleDateString('sv-SE');
  const { slug } = await (
    await page.request.post('/api/parties', {
      data: {
        category: 'christmas',
        name: 'Noël archivé',
        date: `${year}-12-31`,
        recurring: false,
      },
    })
  ).json();
  // Dated in the past by mistake, before the field refused it: archived.
  await seedSql(
    `UPDATE party_years SET date = '${year}-01-02' WHERE party_id = (SELECT id FROM parties WHERE slug = '${slug}'); UPDATE parties SET usual_date = '01-02' WHERE slug = '${slug}';`,
  );
  // Not offered for a new Secret Santa.
  const { parties } = await (
    await page.request.get('/api/secret-santas/new')
  ).json();
  expect(parties.map((party: { slug: string }) => party.slug)).not.toContain(
    slug,
  );
  // Its year page leads its organiser to its settings.
  await page.goto(`/e/${slug}/annees/${year}`);
  await hydrated(page);
  await page.getByTestId('past-year-settings').click();
  await expect(page).toHaveURL(new RegExp(`/e/${slug}/reglages$`));
  // The field refuses a date already past.
  await page.goto(`/e/${slug}/reglages/date`);
  await hydrated(page);
  await typeDate(page, 'party-date', `0101${year}`);
  await expect(page.getByTestId('party-date-full')).toHaveText(
    'Une date à partir d’aujourd’hui.',
  );
  await expect(page.getByTestId('party-date-validate')).toBeDisabled();
  // A date to come of its year puts it right: open again, offered again.
  const target = `${year}-12-31` >= today ? `${year}-12-31` : today;
  const fixed = await page.request.patch(`/api/parties/${slug}`, {
    data: { date: target },
  });
  expect(fixed.status()).toBe(200);
  const santa = await page.request.post(`/api/admin/${slug}/editions`, {
    data: { label: `Noël ${year}`, year, eventDate: target },
  });
  expect(santa.status()).toBe(201);
});
