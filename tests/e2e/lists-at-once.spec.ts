import { expect, test, type Page, type Route } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// A list takes everything at once (ticket 166): what is written shows
// before the server answers; a failure puts the list back and says so.
test.describe.configure({ mode: 'serial' });

const HOLDER = 'at-once-holder@example.com';
const state = { listId: '' };

test.beforeAll(async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL });
  await apiLogin(api, HOLDER);
  const { id } = await (
    await api.post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, title: 'Tout de suite' },
    })
  ).json();
  const place = await (
    await api.post(`/api/lists/${id}/people`, {
      data: {
        newMember: { firstName: 'Léo', avatar: { emoji: '🚀', color: 'pine' } },
      },
    })
  ).json();
  await api.post(`/api/lists/${id}/ideas`, {
    data: { listPersonId: place.id, text: 'Vélo' },
  });
  state.listId = id;
  await api.dispose();
});

/**
 * Holds the requests of a kind until released.
 * @param page - The page.
 * @param method - The method held.
 * @returns What releases them.
 */
const hold = async (page: Page, method: string) => {
  const held: Route[] = [];
  await page.route('**/api/lists/*/ideas**', async (route) => {
    if (route.request().method() === method) held.push(route);
    else await route.continue();
  });
  return {
    count: () => held.length,
    release: async () => {
      await Promise.all(held.map((route) => route.continue()));
      await page.unroute('**/api/lists/*/ideas**');
    },
  };
};
const texts = (page: Page) =>
  page.getByTestId('list-person').getByTestId('idea-text');

test('a line corrected shows before the server answers', async ({ page }) => {
  await apiLogin(page.request, HOLDER);
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  const held = await hold(page, 'PATCH');
  await texts(page).filter({ hasText: 'Vélo' }).click();
  const field = page.getByTestId('idea-field').and(page.locator(':focus'));
  await field.fill('Vélo rouge');
  await page.evaluate(() =>
    (document.activeElement as HTMLElement | null)?.blur(),
  );
  // The request is on its way, not answered: the line says it already.
  await expect.poll(held.count).toBe(1);
  await expect(texts(page)).toHaveText(['Vélo rouge']);
  await held.release();
  await expect(texts(page)).toHaveText(['Vélo rouge']);
});

test('a line written shows at its place before the server answers', async ({
  page,
}) => {
  await apiLogin(page.request, HOLDER);
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  const held = await hold(page, 'POST');
  await page.getByPlaceholder('Une autre idée…').click();
  await page.keyboard.type('Un livre');
  await page.keyboard.press('Enter');
  await expect.poll(held.count).toBe(1);
  await expect(texts(page)).toHaveText(['Vélo rouge', 'Un livre']);
  await held.release();
  // Read again, once: no line twice.
  await expect(texts(page)).toHaveText(['Vélo rouge', 'Un livre']);
});

test('a line just written moves before the server named it', async ({
  page,
}) => {
  await apiLogin(page.request, HOLDER);
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  const held = await hold(page, 'POST');
  await page.getByPlaceholder('Une autre idée…').click();
  await page.keyboard.type('Des crayons');
  await page.keyboard.press('Enter');
  await expect.poll(held.count).toBe(1);
  // Up one step from its menu, its creation still on its way.
  await texts(page).filter({ hasText: 'Des crayons' }).click();
  await page
    .getByTestId('list-person')
    .locator('[data-drag="idea"]')
    .filter({ has: page.getByTestId('idea-field').and(page.locator(':focus')) })
    .getByTestId('line-handle')
    .click();
  await page.getByTestId('line-up').click();
  // The line moved goes on being written; left, it reads in its place.
  await page.waitForTimeout(200);
  await page.evaluate(() =>
    (document.activeElement as HTMLElement | null)?.blur(),
  );
  await expect(texts(page)).toHaveText([
    'Vélo rouge',
    'Des crayons',
    'Un livre',
  ]);
  await held.release();
  // The order waited for its name: no « la liste a changé », kept.
  await page.waitForTimeout(500);
  await expect(
    page.getByText('La liste a changé', { exact: false }),
  ).toHaveCount(0);
  await page.reload();
  await hydrated(page);
  await expect(texts(page)).toHaveText([
    'Vélo rouge',
    'Des crayons',
    'Un livre',
  ]);
});

test('a failure puts the list back, and says so', async ({ page }) => {
  await apiLogin(page.request, HOLDER);
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  await page.route('**/api/lists/*/ideas/*', (route) =>
    route.request().method() === 'PATCH'
      ? route.fulfill({ status: 500, json: { statusMessage: 'boom' } })
      : route.continue(),
  );
  await texts(page).filter({ hasText: 'Un livre' }).click();
  await page
    .getByTestId('idea-field')
    .and(page.locator(':focus'))
    .fill('Un livre perdu');
  await page.evaluate(() =>
    (document.activeElement as HTMLElement | null)?.blur(),
  );
  await expect(
    page.getByText('Quelque chose a coincé', { exact: false }).first(),
  ).toBeVisible();
  await expect(texts(page)).toHaveText([
    'Vélo rouge',
    'Des crayons',
    'Un livre',
  ]);
});
