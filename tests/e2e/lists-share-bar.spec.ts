import { expect, test } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// The bar of a list unrolls where it is (ticket 135, docs/spec/v3/
// listes.md, « La barre du haut d'une liste »): on a small screen, with
// ten events, it stays stuck on top and its own content scrolls down to
// « Enregistrer », not the page.
const CAMILLE = 'camille-barre@example.com';

test.use({ viewport: { width: 320, height: 568 } });

test('ten events on a small screen: the bar stays on top, its content scrolls', async ({
  page,
}) => {
  await apiLogin(page.request, CAMILLE);
  const slugs = await Promise.all(
    Array.from({ length: 10 }, async (_, index) => {
      const created = await page.request.post('/api/parties', {
        data: {
          category: 'christmas',
          name: `Barre ${index + 1}`,
          date: '2099-12-25',
          recurring: true,
          memberIds: [],
        },
      });
      expect(created.ok()).toBe(true);
      return ((await created.json()) as { slug: string }).slug;
    }),
  );
  const made = await page.request.post('/api/lists', {
    data: { icon: { emoji: '🎄', color: 'pine' }, party: slugs[0] },
  });
  expect(made.ok()).toBe(true);
  const { id } = (await made.json()) as { id: string };
  await page.goto(`/listes/${id}`);
  await hydrated(page);

  const bar = page.getByTestId('share-bar');
  await page.getByTestId('share-open').click();
  const content = page.getByTestId('share-content');
  await expect(content.getByTestId('sharing-panel')).toContainText('Barre 10');
  const top = (await bar.boundingBox())!.y;
  // Taller than the screen: its content scrolls, the page does not.
  const scrolls = await content.evaluate(
    (el) => el.scrollHeight > el.clientHeight,
  );
  expect(scrolls).toBe(true);
  const save = page.getByTestId('sharing-save');
  await save.scrollIntoViewIfNeeded();
  await expect(save).toBeInViewport();
  expect(await content.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  expect((await bar.boundingBox())!.y).toBeCloseTo(top, 0);
  // Ticking the last event and saving folds the bar.
  await page.getByTestId(`sharing-event-${slugs[9]}`).click();
  await save.click();
  await expect(content).toHaveCount(0);
  await expect(page.getByTestId('share-stage')).toContainText('Barre 10');
});
