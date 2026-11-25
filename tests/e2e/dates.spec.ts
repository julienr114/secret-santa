import { expect, test } from '@playwright/test';
import { apiLogin, hydrated, typeDate } from './helpers';

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
