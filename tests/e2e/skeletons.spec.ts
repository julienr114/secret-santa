import { expect, test, type Page } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// A screen on its way (ticket 099, V3ChargementAccueil, V3ChargementFete):
// while its answer is held back, the home and the page of an event show a
// skeleton of their shape, then their content where the skeleton stood.

const ROSE = 'rose-squelette@example.com';

/**
 * Holds the answers of `url` back until the returned function is called.
 * @param page - The page.
 * @param url - The pattern of the answers held back.
 * @returns What lets them through.
 */
const holdBack = async (page: Page, url: string) => {
  const { promise, resolve } = Promise.withResolvers<undefined>();
  await page.route(url, async (route) => {
    await promise;
    await route.continue();
  });
  return () => resolve(undefined);
};

/** The top of an element in the page, in pixels. */
const topOf = async (page: Page, selector: string) =>
  (await page.locator(selector).first().boundingBox())?.y ?? -1;

test('the home and an event show their skeleton, then their content in its place', async ({
  page,
}) => {
  await apiLogin(page.request, ROSE);
  const created = await page.request.post('/api/parties', {
    data: {
      category: 'christmas',
      name: 'Noël chez Rose',
      date: `${new Date().getFullYear() + 1}-12-25`,
      recurring: true,
      memberIds: [],
    },
  });
  expect(created.ok()).toBe(true);
  const { slug } = (await created.json()) as { slug: string };

  // From « Quoi de neuf », the home: its answer held back.
  await page.goto('/quoi-de-neuf');
  await hydrated(page);
  const home = await holdBack(page, '**/api/home');
  await page.getByRole('link', { name: 'Accueil' }).click();
  const skeleton = page.locator('main > [aria-busy="true"]');
  await expect(skeleton).toBeVisible();
  await expect(skeleton.locator('section')).toHaveCount(3);
  const skeletonTop = await topOf(page, 'main > [aria-busy="true"]');
  const bannerTop = await topOf(page, 'header');
  home();
  await expect(page.getByTestId('home-party')).toContainText('Noël chez Rose');
  await expect(skeleton).toHaveCount(0);
  expect(await topOf(page, 'main > *')).toBe(skeletonTop);
  expect(await topOf(page, 'header')).toBe(bannerTop);

  // The event, its answer held back in turn.
  const party = await holdBack(page, `**/api/parties/${slug}`);
  await page.getByRole('link', { name: /Noël chez Rose/ }).click();
  await expect(skeleton).toBeVisible();
  await expect(skeleton.locator('section')).toHaveCount(2);
  const partyTop = await topOf(page, 'main > [aria-busy="true"]');
  party();
  await expect(page.getByTestId('party-category')).toBeVisible();
  await expect(skeleton).toHaveCount(0);
  expect(await topOf(page, 'main > *')).toBe(partyTop);

  // Back home, the screen already shown does not go through its skeleton.
  await page.goBack();
  await expect(page.getByTestId('home-party')).toBeVisible();
  await expect(skeleton).toHaveCount(0);
});
