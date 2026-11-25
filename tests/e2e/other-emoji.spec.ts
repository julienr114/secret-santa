import { expect, test } from '@playwright/test';
import { apiLogin, hydrated, typeDate } from './helpers';
import { emojiImagePath } from '../../shared/utils/emojiImage';

const SPARKLES = `img[src="${emojiImagePath('✨')}"]`;

// An event « Autre » has its emoji everywhere (ticket 176): ✨, as its
// tile at the creation, on the home and on its own page.
const ME = 'autre-emoji@example.com';

test('an event « Autre » shows ✨ on the home and on its page', async ({
  page,
}) => {
  await apiLogin(page.request, ME);
  await page.goto('/e/nouvelle');
  await hydrated(page);
  await page.getByTestId('category-other').click();
  await page.getByTestId('party-name').fill('Pot de départ');
  const year = new Date().getFullYear();
  await typeDate(page, 'party-date', `1412${year + 1}`);
  await page.getByTestId('party-create').click();
  await expect(page).toHaveURL(/\/e\/[^/]+/);
  await expect(
    page.getByTestId('party-category').locator(SPARKLES),
  ).toBeVisible();
  await page.goto('/');
  await hydrated(page);
  const card = page
    .getByTestId('home-party')
    .filter({ hasText: 'Pot de départ' });
  await expect(card.locator(SPARKLES)).toBeVisible();
});
