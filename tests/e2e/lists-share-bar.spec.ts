import { expect, test } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// The bar of a list unrolls where it is (ticket 135, docs/spec/v3/
// listes.md, « La barre du haut d'une liste »): on a small screen, with
// ten events, it stays stuck on top and its own content scrolls down to
// the last one, not the page. Unrolled, it floats over the list,
// which does not move; a touch outside folds it (ticket 138). Smaller than
// the rest of the app, what is touched keeps 44 px (ticket 141).
const CAMILLE = 'camille-barre@example.com';
const ZOE = 'zoe-barre@example.com';

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
  const last = page.getByTestId(`sharing-add-${slugs[9]}`);
  // Scrolling its content to the end leaves the list under it in place.
  const scrolled = await page.evaluate(() => window.scrollY);
  const box = (await content.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 2000);
  await expect
    .poll(() =>
      content.evaluate(
        (el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 1,
      ),
    )
    .toBe(true);
  await page.mouse.wheel(0, 2000);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrolled);
  expect(await content.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  expect((await bar.boundingBox())!.y).toBeCloseTo(top, 0);
  await expect(last).toBeInViewport();
  // Adding the last event saves it at once; the bar stays unrolled.
  await last.click();
  await expect(page.getByTestId('share-stage')).toContainText('Barre 10');
  await expect(content.getByTestId(`sharing-event-${slugs[9]}`)).toBeVisible();
});

test('unrolled, the bar floats over the list; a touch outside folds it', async ({
  page,
}) => {
  await apiLogin(page.request, ZOE);
  const created = await page.request.post('/api/parties', {
    data: {
      category: 'christmas',
      name: 'Par-dessus',
      date: '2099-12-25',
      recurring: true,
      memberIds: [],
    },
  });
  expect(created.ok()).toBe(true);
  const { slug } = (await created.json()) as { slug: string };
  const made = await page.request.post('/api/lists', {
    data: { icon: { emoji: '🎄', color: 'pine' }, party: slug },
  });
  expect(made.ok()).toBe(true);
  const { id } = (await made.json()) as { id: string };
  await page.goto(`/listes/${id}`);
  await hydrated(page);

  const bar = page.getByTestId('share-bar');
  const icon = page.getByTestId('list-icon');
  const place = (await bar.boundingBox())!;
  const before = (await icon.boundingBox())!;
  await page.getByTestId('share-open').click();
  const card = page.getByTestId('share-card');
  await expect(page.getByTestId('sharing-panel')).toBeVisible();
  // Nothing in the list moved: the bar keeps the room of its row, the
  // rest of it lies over the page.
  expect((await icon.boundingBox())!.y).toBeCloseTo(before.y, 0);
  expect((await bar.boundingBox())!.height).toBeCloseTo(place.height, 0);
  const over = (await card.boundingBox())!;
  expect(over.y + over.height).toBeGreaterThan(before.y);
  // A touch outside folds it, and does nothing else.
  await page.mouse.click(over.x + over.width / 2, over.y + over.height + 12);
  await expect(page.getByTestId('share-content')).toHaveCount(0);
  await expect(page.getByTestId('share-open')).toHaveText('Partager');
  await expect(page.getByTestId('share-open')).toBeFocused();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByTestId('share-stage')).toContainText('Brouillon');
  expect((await icon.boundingBox())!.y).toBeCloseTo(before.y, 0);
  // Folded, a touch on the list does what it says.
  await icon.click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('in two events, the bar is small and everything in it is touched with a finger', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await apiLogin(page.request, CAMILLE);
  const slugs = await Promise.all(
    ['Petite 1', 'Petite 2'].map(async (name) => {
      const created = await page.request.post('/api/parties', {
        data: {
          category: 'christmas',
          name,
          date: '2099-12-25',
          recurring: true,
          memberIds: [],
        },
      });
      return ((await created.json()) as { slug: string }).slug;
    }),
  );
  const made = await page.request.post('/api/lists', {
    data: { icon: { emoji: '🎄', color: 'pine' }, party: slugs[0] },
  });
  const { id } = (await made.json()) as { id: string };
  const { options } = (await (
    await page.request.get(`/api/lists/${id}/sharing`)
  ).json()) as { options: { id: string; slug: string }[] };
  await page.request.put(`/api/lists/${id}/sharing`, {
    data: {
      isPublic: false,
      parties: options
        .filter((option) => slugs.includes(option.slug))
        .map((option) => option.id),
    },
  });
  await page.goto(`/listes/${id}`);
  await hydrated(page);
  await page.getByTestId('share-open').click();
  await expect(page.getByTestId(`sharing-event-${slugs[1]}`)).toBeVisible();
  expect(
    (await page.getByTestId('share-card').boundingBox())!.height,
  ).toBeLessThan(420);
  await page.getByTestId('sharing-add').click();
  await expect(page.getByTestId('sharing-pills')).toBeVisible();
  // Each thing touched answers 21 px above and below its middle: 44 px,
  // and no other zone over it.
  const short = await page.getByTestId('share-card').evaluate((card) =>
    [...card.querySelectorAll<HTMLElement>('button, label')].flatMap((el) => {
      const box = el.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      return [y - 21, y + 21].every((at) =>
        el.contains(document.elementFromPoint(x, at)),
      )
        ? []
        : [el.textContent?.trim() || el.getAttribute('aria-label')];
    }),
  );
  expect(short).toEqual([]);
});
