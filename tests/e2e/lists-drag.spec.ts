import { expect, test, type Locator, type Page } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// Reordering a list by dragging (README 22.20, lot 24 ter): a long press
// lifts a line on a phone, a handle is pulled with a mouse, `Alt` + an
// arrow and the menu do the same without dragging. By the link, nothing
// moves.
test.describe.configure({ mode: 'serial' });

const HOLDER = 'drag-holder@example.com';
const state = { listId: '', token: '' };

test.beforeAll(async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL });
  await apiLogin(api, HOLDER);
  await api.put('/api/auth/profile', {
    data: { firstName: 'Camille', avatarEmoji: '🦌', avatarColor: 'plum' },
  });
  const { id } = await (
    await api.post('/api/lists', {
      data: { icon: { emoji: '❄️', color: 'night' }, title: 'Noël à ranger' },
    })
  ).json();
  const person = async (firstName: string, emoji: string, ideas: string[]) => {
    const place = await (
      await api.post(`/api/lists/${id}/people`, {
        data: { newMember: { firstName, avatar: { emoji, color: 'pine' } } },
      })
    ).json();
    for (const text of ideas) {
      await api.post(`/api/lists/${id}/ideas`, {
        data: { listPersonId: place.id, text },
      });
    }
  };
  await person('Léo', '🚀', ['Circuit', 'Vélo', 'Puzzle']);
  await person('Zoé', '🦄', ['Poupée']);
  const { token } = await (
    await api.post(`/api/lists/${id}/share`, { data: {} })
  ).json();
  Object.assign(state, { listId: id, token });
  await api.dispose();
});

const section = (page: Page, name: string) =>
  page
    .getByTestId('list-person')
    .filter({ has: page.getByRole('heading', { name }) });
const ideasOf = (page: Page, name: string) =>
  section(page, name).getByTestId('idea-text');
const centre = async (locator: Locator) => {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error('not on the screen');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

/** A finger, driven through the browser's own touch events. */
const finger = async (page: Page) => {
  const client = await page.context().newCDPSession(page);
  const send = (type: string, at?: { x: number; y: number }) =>
    client.send('Input.dispatchTouchEvent', {
      type: type as 'touchStart',
      touchPoints: at ? [{ x: at.x, y: at.y }] : [],
    });
  return {
    /** Presses long enough to lift, then slides to a place and lets go. */
    drag: async (
      from: { x: number; y: number },
      to: { x: number; y: number },
    ) => {
      await send('touchStart', from);
      await page.waitForTimeout(450);
      await expect(page.getByTestId('drag-ghost')).toBeVisible();
      for (const step of [1, 2, 3, 4, 5, 6]) {
        await send('touchMove', {
          x: from.x,
          y: from.y + ((to.y - from.y) * step) / 6,
        });
      }
      await expect(page.getByTestId('drop-line')).toBeVisible();
      await send('touchEnd');
      await expect(page.getByTestId('drag-ghost')).toHaveCount(0);
    },
  };
};

test('on a phone, a long press lifts a line and drops it elsewhere', async ({
  page,
}) => {
  await apiLogin(page.request, HOLDER);
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  await expect(ideasOf(page, 'Léo')).toHaveText(['Circuit', 'Vélo', 'Puzzle']);
  const touch = await finger(page);

  // An idea, to the end of its person's, away from the edges of the
  // screen (the head of the list is shorter without a word, ticket 147).
  await ideasOf(page, 'Léo')
    .nth(0)
    .evaluate((el) =>
      window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 250),
    );
  const from = await centre(ideasOf(page, 'Léo').nth(0));
  const below = await centre(ideasOf(page, 'Léo').nth(2));
  const scrolled = await page.evaluate(() => window.scrollY);
  await touch.drag(from, { x: below.x, y: below.y + 14 });
  await expect(ideasOf(page, 'Léo')).toHaveText(['Vélo', 'Puzzle', 'Circuit']);
  // The page did not scroll under the finger, and no line is being
  // written: the keyboard did not open.
  expect(await page.evaluate(() => window.scrollY)).toBe(scrolled);
  expect(
    await page.evaluate(() => document.activeElement?.tagName ?? ''),
  ).not.toBe('TEXTAREA');
  // Said to screen readers, and « Annuler » puts it back.
  await expect(page.getByTestId('list-announce')).toContainText(
    'Circuit, position 3 sur 3',
  );
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(ideasOf(page, 'Léo')).toHaveText(['Circuit', 'Vélo', 'Puzzle']);

  // An idea, to another person: it changes hands. Both are brought away
  // from the edges of the screen first, where the page scrolls by itself
  // under a line lifted (people are further apart since Correction 29).
  await ideasOf(page, 'Léo')
    .nth(2)
    .evaluate((el) =>
      window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 250),
    );
  const puzzle = await centre(ideasOf(page, 'Léo').nth(2));
  const poupee = await centre(ideasOf(page, 'Zoé').nth(0));
  await touch.drag(puzzle, { x: poupee.x, y: poupee.y - 14 });
  await expect(ideasOf(page, 'Zoé')).toHaveText(['Puzzle', 'Poupée']);
  await expect(ideasOf(page, 'Léo')).toHaveText(['Circuit', 'Vélo']);

  // A person, by their header: folded into one line, with their ideas.
  const zoe = await centre(page.getByRole('heading', { name: 'Zoé' }));
  const leo = await centre(page.getByRole('heading', { name: 'Léo' }));
  await touch.drag(zoe, { x: leo.x, y: leo.y - 30 });
  await expect(page.getByTestId('list-person').first()).toContainText('Zoé');
  await expect(ideasOf(page, 'Zoé')).toHaveText(['Puzzle', 'Poupée']);

  // A short tap keeps its part: the text is written in place.
  await ideasOf(page, 'Léo').first().tap();
  await expect(
    section(page, 'Léo').getByTestId('idea-field').first(),
  ).toBeFocused();
  // Saved for good.
  await page.reload();
  await hydrated(page);
  await expect(page.getByTestId('list-person').first()).toContainText('Zoé');
  await expect(ideasOf(page, 'Zoé')).toHaveText(['Puzzle', 'Poupée']);
});

test('with a mouse, a handle is pulled; the keyboard and the menu do the same', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    // A computer: the project's phone would have no mouse to hover with.
    viewport: { width: 900, height: 900 },
    isMobile: false,
    hasTouch: false,
    locale: 'fr-FR',
  });
  await apiLogin(context.request, HOLDER);
  const page = await context.newPage();
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  await expect(ideasOf(page, 'Zoé')).toHaveText(['Puzzle', 'Poupée']);

  // The handle shows as the line is hovered.
  const row = section(page, 'Zoé')
    .locator('[data-drag="idea"]')
    .filter({ hasText: 'Puzzle' });
  await row.hover();
  const handle = row.getByTestId('drag-handle');
  await expect(handle).toBeVisible();
  const from = await centre(handle);
  const under = await centre(ideasOf(page, 'Zoé').nth(1));
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x, under.y, { steps: 5 });
  await page.mouse.move(from.x, under.y + 16, { steps: 3 });
  await expect(page.getByTestId('drag-ghost')).toBeVisible();
  // Échap puts everything back.
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('drag-ghost')).toHaveCount(0);
  await page.mouse.up();
  await expect(ideasOf(page, 'Zoé')).toHaveText(['Puzzle', 'Poupée']);
  // Pulled and dropped.
  await row.hover();
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x, under.y, { steps: 5 });
  await page.mouse.move(from.x, under.y + 16, { steps: 3 });
  await page.mouse.up();
  await expect(ideasOf(page, 'Zoé')).toHaveText(['Poupée', 'Puzzle']);

  // `Alt` + an arrow, in the line being written, which stays written.
  await ideasOf(page, 'Zoé').nth(1).click();
  await page.keyboard.press('Alt+ArrowUp');
  await expect(
    section(page, 'Zoé').getByTestId('idea-field').first(),
  ).toHaveValue('Puzzle');
  // Out of the field: what is written is saved.
  await page.evaluate(() =>
    (document.activeElement as HTMLElement | null)?.blur(),
  );
  await expect(ideasOf(page, 'Zoé')).toHaveText(['Puzzle', 'Poupée']);

  // « Descendre », in the menu of a person; the first one has no « Monter ».
  await section(page, 'Zoé').getByTestId('person-menu').click();
  await expect(page.getByRole('menuitem', { name: 'Monter' })).toHaveCount(0);
  await page.getByRole('menuitem', { name: 'Descendre' }).click();
  await expect(page.getByTestId('list-person').first()).toContainText('Léo');
  await context.close();
});

test('by the link, nothing moves', async ({ page }) => {
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await expect(page.getByTestId('visitor-person').first()).toBeVisible();
  await expect(page.locator('[data-drag]')).toHaveCount(0);
  await expect(page.getByTestId('drag-handle')).toHaveCount(0);
  // Nor by its route, for someone who does not hold the list.
  await apiLogin(page.request, 'drag-other@example.com');
  const refused = await page.request.put(`/api/lists/${state.listId}/order`, {
    data: { order: [] },
  });
  expect(refused.status()).toBe(404);
});
