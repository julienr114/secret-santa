import {
  expect,
  test,
  type APIRequestContext,
  type Browser,
  type Page,
} from '@playwright/test';
import { addPeople, apiLogin, hydrated } from './helpers';

// The visit of a new list (docs/spec/v3/listes.md, « La visite d'une
// liste neuve », ticket 149): from a Secret Santa, from « Créer », then
// the note of the first line; once per account, seen or skipped.
test.describe.configure({ mode: 'serial' });

const SLUG = 'famille-visite';
const ADMIN = `/api/admin/${SLUG}`;
const state: { admin?: APIRequestContext; token: string } = { token: '' };

const login = async (browser: Browser, email: string) => {
  const context = await browser.newContext();
  await apiLogin(context.request, email);
  await context.request.put('/api/auth/profile', {
    data: { firstName: 'Camille', avatarEmoji: '🦌', avatarColor: 'plum' },
  });
  return context;
};
const note = (page: Page) => page.getByTestId('tour-note');
/**
 * Goes through the steps, checking each title and its count.
 * @param page - The page.
 * @param titles - The titles, in order.
 */
const walk = async (page: Page, titles: string[]) => {
  for (const [at, title] of titles.entries()) {
    await expect(note(page)).toHaveAccessibleName(title);
    await expect(page.getByTestId('tour-count')).toHaveText(
      `${at + 1} sur ${titles.length}`,
    );
    await expect(note(page)).toBeFocused();
    await page
      .getByTestId(at + 1 === titles.length ? 'tour-understood' : 'tour-next')
      .click();
  }
  await expect(note(page)).toHaveCount(0);
  await expect(page.getByTestId('tour-veil')).toHaveCount(0);
};

test.beforeAll(async ({ playwright, baseURL }) => {
  state.admin = await playwright.request.newContext({ baseURL });
  const admin = state.admin;
  await apiLogin(admin, 'super-visite@example.com');
  await admin.post('/api/admin/groups', { data: { name: 'Famille Visite' } });
  const created = await (
    await admin.post(`${ADMIN}/editions`, {
      data: { label: 'Noël', year: 2026, eventDate: '2026-12-24' },
    })
  ).json();
  const editionId = created.edition.id;
  await addPeople(admin, ADMIN, editionId, [
    { firstName: 'Camille', email: 'visite-secret@example.com' },
    { firstName: 'Hugo', email: 'visite-hugo@example.com' },
    { firstName: 'Jules', email: 'visite-jules@example.com' },
  ]);
  const { participants } = await (
    await admin.get(`${ADMIN}/editions/${editionId}`)
  ).json();
  const { messages } = await (
    await admin.get(`${ADMIN}/editions/${editionId}/messages?type=invitation`)
  ).json();
  const camille = participants.find(
    (p: { firstName: string }) => p.firstName === 'Camille',
  );
  state.token =
    new URL(messages[camille.participationId].link).pathname
      .split('/')
      .at(-1) ?? '';
  await admin.post(`${ADMIN}/editions/${editionId}/draw`);
});

test.afterAll(async () => {
  await state.admin?.dispose();
});

test('from a Secret Santa: five steps, once, and no note of the first line', async ({
  browser,
}) => {
  const context = await login(browser, 'visite-secret@example.com');
  const page = await context.newPage();
  await page.goto(`/p/${state.token}/liste`);
  await expect(page).toHaveURL(/\/listes\/[^/?]+\?visite=secret$/);
  await hydrated(page);
  const listUrl = page.url().split('?')[0];
  // No list before: no « Repartir d'une liste », five steps.
  await walk(page, [
    'Ta partie',
    'Une idée par ligne',
    'Qui la voit',
    'Le nom et la date',
    'Une liste pour plusieurs',
  ]);
  // « Touche un texte pour le modifier. » is gone.
  await expect(page.locator('body')).not.toContainText(
    'Touche un texte pour le modifier.',
  );
  // Never again, here nor on a list made from « Créer », on another device.
  const other = await context.browser()!.newContext();
  await apiLogin(other.request, 'visite-secret@example.com');
  const again = await other.newPage();
  await again.goto(`${listUrl}?visite=secret`);
  await hydrated(again);
  await expect(note(again)).toHaveCount(0);
  await again.goto('/listes/nouvelle');
  await expect(again).toHaveURL(/\/listes\/[^/?]+/);
  await hydrated(again);
  await again
    .getByTestId('add-someone')
    .getByRole('button', { name: 'Camille' })
    .click();
  await expect(again.getByTestId('list-person')).toHaveCount(1);
  await expect(note(again)).toHaveCount(0);
  await expect(again.getByTestId('tour-first-line')).toHaveCount(0);
  await other.close();
  await context.close();
});

test('from « Créer »: three steps, then the note of the first line, once', async ({
  browser,
}) => {
  const context = await login(browser, 'visite-creer@example.com');
  const page = await context.newPage();
  await page.goto('/listes/nouvelle');
  await expect(page).toHaveURL(/\/listes\/[^/?]+/);
  await hydrated(page);
  await walk(page, [
    'Le nom et la date',
    'Pour qui ?',
    'Personne ne la voit encore',
  ]);
  // The first person added: a note alone on their first line.
  await page
    .getByTestId('add-someone')
    .getByRole('button', { name: 'Camille' })
    .click();
  const first = page.getByTestId('tour-first-line');
  await expect(first).toContainText('Une idée par ligne');
  await expect(first).toContainText('Ajoute un lien si tu as trouvé l’objet.');
  await expect(page.getByTestId('tour-count')).toHaveCount(0);
  await page.getByTestId('tour-understood').click();
  await expect(first).toHaveCount(0);
  // A list made again: no visit, no note.
  await page.goto('/listes/nouvelle');
  await expect(page).toHaveURL(/\/listes\/[^/?]+/);
  await hydrated(page);
  await expect(note(page)).toHaveCount(0);
  await page
    .getByTestId('add-someone')
    .getByRole('button', { name: 'Camille' })
    .click();
  await expect(page.getByTestId('list-person')).toHaveCount(1);
  await expect(page.getByTestId('tour-first-line')).toHaveCount(0);
  await context.close();
});

test('« Passer », or Échap, stops the visit for good', async ({ browser }) => {
  const context = await login(browser, 'visite-passer@example.com');
  const page = await context.newPage();
  await page.goto('/listes/nouvelle');
  await expect(page).toHaveURL(/\/listes\/[^/?]+/);
  await hydrated(page);
  await expect(note(page)).toHaveAccessibleName('Le nom et la date');
  await page.keyboard.press('Escape');
  await expect(note(page)).toHaveCount(0);
  // Nothing more: neither the note of the first line nor another visit.
  await page
    .getByTestId('add-someone')
    .getByRole('button', { name: 'Camille' })
    .click();
  await expect(page.getByTestId('list-person')).toHaveCount(1);
  await expect(page.getByTestId('tour-first-line')).toHaveCount(0);
  await page.goto('/listes/nouvelle');
  await expect(page).toHaveURL(/\/listes\/[^/?]+/);
  await hydrated(page);
  await expect(note(page)).toHaveCount(0);
  await context.close();
});
