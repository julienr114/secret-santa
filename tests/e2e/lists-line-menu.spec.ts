import { expect, test, type Locator, type Page } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// Ranger une liste (docs/spec/v3/listes.md, ticket 152): the handle of a
// line and its menu, the stars, the titles, « Déplacer vers… ».
test.describe.configure({ mode: 'serial' });

const HOLDER = 'line-menu-holder@example.com';
const VISITOR = 'line-menu-visitor@example.com';
const state = { listId: '', token: '' };

test.beforeAll(async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL });
  await apiLogin(api, HOLDER);
  await api.put('/api/auth/profile', {
    data: { firstName: 'Camille', avatarEmoji: '🦌', avatarColor: 'plum' },
  });
  const { id } = await (
    await api.post('/api/lists', {
      data: { icon: { emoji: '❄️', color: 'night' }, title: 'Noël rangé' },
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
  await person('Léo', '🚀', [
    'Playmobil',
    'Le camion de pompiers',
    'Le bateau pirate',
  ]);
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
    .filter({ has: page.getByRole('heading', { name, level: 2 }) });
const line = (page: Page, person: string, text: string): Locator =>
  section(page, person).locator('[data-drag="idea"]').filter({ hasText: text });
/**
 * Writes a line, unless it is being written, then opens its menu.
 * @param page - The page.
 * @param target - The line.
 */
const openMenu = async (page: Page, target: Locator) => {
  // Being written already (after a star, a title), the handle is there.
  if ((await target.getByTestId('idea-field').count()) === 0) {
    await target.getByTestId('idea-text').click();
  }
  await target.getByTestId('line-handle').click();
  await expect(page.getByTestId('line-menu')).toBeVisible();
};

test('a line becomes a title, gets stars, moves and goes, from its handle', async ({
  page,
}) => {
  await apiLogin(page.request, HOLDER);
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);

  // « En faire un titre »: no box any more, a dot, a heading.
  const playmobil = line(page, 'Léo', 'Playmobil');
  await openMenu(page, playmobil);
  await page.getByTestId('line-title').click();
  await expect(page.getByTestId('line-menu')).toHaveCount(0);
  await expect(playmobil.getByTestId('title-dot')).toBeVisible();
  await expect(playmobil.getByTestId('holder-box')).toHaveCount(0);
  // Still being written, the keyboard back; once left, a heading.
  await expect(playmobil.getByTestId('idea-field')).toBeFocused();
  await page.evaluate(() =>
    (document.activeElement as HTMLElement | null)?.blur(),
  );
  await expect(
    section(page, 'Léo').getByRole('heading', { name: 'Playmobil', level: 3 }),
  ).toBeVisible();

  // Three stars; touching the third again takes them all.
  const camion = line(page, 'Léo', 'Le camion de pompiers');
  await openMenu(page, camion);
  await page.getByTestId('line-star-3').click();
  await expect(camion.getByTestId('idea-stars')).toHaveAttribute(
    'data-stars',
    '3',
  );
  await openMenu(page, camion);
  await expect(page.getByTestId('line-star-3')).toHaveAttribute(
    'aria-checked',
    'true',
  );
  // Échap closes the menu, nothing changed.
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('line-menu')).toHaveCount(0);
  await expect(camion.getByTestId('idea-stars')).toHaveAttribute(
    'data-stars',
    '3',
  );

  // « Monter », one step; the first line has no « Monter ».
  await openMenu(page, camion);
  await page.getByTestId('line-up').click();
  // The line moved goes on being written; left, it reads in its place.
  await page.waitForTimeout(200);
  await page.evaluate(() =>
    (document.activeElement as HTMLElement | null)?.blur(),
  );
  await expect(section(page, 'Léo').getByTestId('idea-text')).toHaveText([
    'Le camion de pompiers',
    'Playmobil',
    'Le bateau pirate',
  ]);
  await openMenu(page, camion);
  await expect(page.getByTestId('line-up')).toHaveCount(0);
  await page.keyboard.press('Escape');

  // « Déplacer vers… »: to the end of Zoé's part, said at the bottom.
  const bateau = line(page, 'Léo', 'Le bateau pirate');
  await openMenu(page, bateau);
  await page.getByTestId('line-move').click();
  await page.getByTestId('move-sheet').getByText('Zoé').click();
  await expect(section(page, 'Zoé').getByTestId('idea-text')).toHaveText([
    'Poupée',
    'Le bateau pirate',
  ]);
  await expect(page.getByText('Déplacée vers Zoé')).toBeVisible();
});

test('everyone reads the stars and the titles; a title is never ticked', async ({
  browser,
}) => {
  const context = await browser.newContext();
  await apiLogin(context.request, VISITOR);
  const page = await context.newPage();
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  const leo = page
    .getByTestId('visitor-person')
    .filter({ has: page.getByRole('heading', { name: 'Léo', level: 2 }) });
  await expect(
    leo.getByRole('heading', { name: 'Playmobil', level: 3 }),
  ).toBeVisible();
  const title = leo
    .getByTestId('visitor-idea')
    .filter({ hasText: 'Playmobil' });
  await expect(title.getByTestId('idea-box')).toHaveCount(0);
  await expect(leo.getByRole('img', { name: 'Envie : 3 sur 3' })).toBeVisible();

  // Neither ticked by its link, nor made a title once someone gives it.
  const doc = await (await context.request.get(`/api/l/${state.token}`)).json();
  const ideas = doc.people.flatMap(
    (person: { ideas: { id: string; text: string }[] }) => person.ideas,
  );
  const idOf = (text: string) =>
    ideas.find((idea: { text: string }) => idea.text === text).id;
  const refused = await context.request.post(`/api/l/${state.token}/claims`, {
    data: { ideaId: idOf('Playmobil') },
  });
  expect(refused.status()).toBe(404);
  expect(
    (
      await context.request.post(`/api/l/${state.token}/claims`, {
        data: { ideaId: idOf('Poupée') },
      })
    ).ok(),
  ).toBe(true);
  await context.close();

  const holder = await browser.newContext();
  await apiLogin(holder.request, HOLDER);
  const titled = await holder.request.patch(
    `/api/lists/${state.listId}/ideas/${idOf('Poupée')}`,
    { data: { title: true } },
  );
  expect(titled.status()).toBe(409);
  expect((await titled.json()).statusMessage).toBe('idea_claimed');
  await holder.close();
});

test('« Supprimer la ligne » takes a title away, and no idea with it', async ({
  page,
}) => {
  await apiLogin(page.request, HOLDER);
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  await openMenu(page, line(page, 'Léo', 'Playmobil'));
  await page.getByTestId('line-remove').click();
  await expect(section(page, 'Léo').getByTestId('idea-text')).toHaveText([
    'Le camion de pompiers',
  ]);
});
