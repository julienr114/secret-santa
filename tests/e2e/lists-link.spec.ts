import { expect, test, type APIRequestContext } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// Gift lists, for those who open the link (README 22.19, lot 22): read
// without an account, tick at once, give with others, something else.
test.describe.configure({ mode: 'serial' });

const HOLDER = 'link-holder@example.com';
const MAMIE = 'link-mamie@example.com';
const TONTON = 'link-tonton@example.com';
const state: { token: string; listId: string; ideas: Record<string, string> } =
  { token: '', listId: '', ideas: {} };

const ok = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  expect(response.ok(), `${response.url()}: ${response.status()}`).toBe(true);
  return response.json();
};

test.beforeAll(async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL });
  await apiLogin(api, HOLDER);
  await ok(
    await api.put('/api/auth/profile', {
      data: { firstName: 'Camille', avatarEmoji: '🦌', avatarColor: 'plum' },
    }),
  );
  const { id } = await ok(
    await api.post('/api/lists', {
      data: { icon: { emoji: '❄️', color: 'night' }, title: 'Noël 2026' },
    }),
  );
  const leo = await ok(
    await api.post(`/api/lists/${id}/people`, {
      data: {
        newMember: {
          firstName: 'Léo',
          avatar: { emoji: '🚀', color: 'frost' },
        },
      },
    }),
  );
  for (const text of ['Circuit de billes', 'Vélo 16 pouces', 'Puzzle']) {
    const { id: ideaId } = await ok(
      await api.post(`/api/lists/${id}/ideas`, {
        data: { listPersonId: leo.id, text },
      }),
    );
    state.ideas[text] = ideaId;
  }
  const { token } = await ok(
    await api.post(`/api/lists/${id}/share`, { data: {} }),
  );
  state.token = token;
  state.listId = id;
  for (const [email, firstName] of [
    [MAMIE, 'Mamie'],
    [TONTON, 'Tonton'],
  ] as const) {
    const other = await playwright.request.newContext({ baseURL });
    await apiLogin(other, email);
    await other.put('/api/auth/profile', {
      data: { firstName, avatarEmoji: '🦊', avatarColor: 'brick' },
    });
    await other.dispose();
  }
  await api.dispose();
});

test('without an account, the list reads, and a box asks for an address', async ({
  page,
}) => {
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Noël 2026');
  await expect(page.getByTestId('visitor-sentence')).toContainText(
    'La liste de Camille.',
  );
  // Without a session (README 22.21): the language button, no menu, no bar.
  await expect(
    page.getByRole('button', { name: 'Changer de langue' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Menu' })).toHaveCount(0);
  await expect(page.getByTestId('tab-bar')).toHaveCount(0);
  await page.getByRole('checkbox', { name: /Circuit de billes/ }).click();
  await expect(page).toHaveURL(/\/connexion\?cocher=/);
  await expect(page.getByText('« Circuit de billes » t’attend')).toBeVisible();
  // Back from the magic link, the gift is ticked.
  await apiLogin(page.request, MAMIE);
  await page.goto(
    `/l/${state.token}?cocher=${state.ideas['Circuit de billes']}`,
  );
  await hydrated(page);
  // One pill says it (Correction 29): no sentence, no « Changer ».
  await expect(page.getByTestId('idea-mine')).toHaveText('Tu l’offres');
  await expect(page.getByText('Changer', { exact: true })).toHaveCount(0);
  // Logged in, by the same link: the menu in place of the language, and
  // the bar, on « Listes ».
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Changer de langue' }),
  ).toHaveCount(0);
  await expect(
    page.getByTestId('tab-bar').getByRole('link', { name: 'Listes' }),
  ).toHaveAttribute('aria-current', 'page');
});

test('one ticks at once, the other hears it is taken', async ({ page }) => {
  await apiLogin(page.request, TONTON);
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  // Taken by Mamie: crossed, no name.
  const taken = page.getByRole('checkbox', { name: /Circuit de billes/ });
  await expect(taken).toBeDisabled();
  await expect(page.locator('body')).not.toContainText('Mamie');
  // Both try the bike: only one has it.
  await page.getByRole('checkbox', { name: /Vélo 16 pouces/ }).click();
  await expect(page.getByTestId('idea-mine')).toHaveCount(1);
  const refused = await page.request.fetch(`/api/l/${state.token}/claims`, {
    method: 'POST',
    data: { ideaId: state.ideas['Circuit de billes'] },
  });
  expect(refused.status()).toBe(409);
  // The whole line of what I give is the button of its sheet (maquettes
  // ListeVisiteurToucher, ListeReserver)...
  await page
    .getByRole('button', {
      name: 'Vélo 16 pouces, tu l’offres : modifier ou ne plus l’offrir',
    })
    .click();
  await expect(page.getByTestId('claim-sheet')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('claim-sheet')).toHaveCount(0);
  // ...and its green box unticks at once, without the sheet (Julien, 20
  // November 2026).
  await page
    .getByRole('checkbox', { name: 'Je ne l’offre plus : Vélo 16 pouces' })
    .click();
  await expect(page.getByTestId('claim-sheet')).toHaveCount(0);
  await expect(page.getByTestId('idea-mine')).toHaveCount(0);
});

test('a gift given by several: proposed, joined, closed', async ({ page }) => {
  // Mamie proposes the puzzle to share.
  await apiLogin(page.request, MAMIE);
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await page.getByRole('checkbox', { name: /Puzzle/ }).click();
  const puzzle = page.getByTestId('visitor-idea').filter({ hasText: 'Puzzle' });
  await puzzle.getByTestId('idea-open').click();
  const sheet = page.getByTestId('claim-sheet');
  await sheet.getByText('On l’offre à plusieurs').click();
  await expect(sheet).toContainText('Ton prénom sera visible');
  await page.getByLabel(/Un mot pour eux/).fill('Je l’achète, on partage ?');
  await page.getByTestId('claim-done').click();
  await expect(puzzle.getByTestId('idea-joined')).toHaveText('Tu participes');

  // Tonton joins, through the sheet: Mamie by her first name in a pill,
  // and « Se joindre », the only pill with a line around it.
  await apiLogin(page.request, TONTON);
  await page.reload();
  await hydrated(page);
  await expect(puzzle.getByTestId('idea-who')).toHaveText(['Mamie']);
  await expect(puzzle.locator('img, [data-testid="avatar-stack"]')).toHaveCount(
    0,
  );
  await puzzle
    .getByRole('button', { name: 'Se joindre à Mamie pour Puzzle' })
    .last()
    .click();
  await expect(page.getByTestId('join-sheet')).toContainText(
    '« Je l’achète, on partage ? »',
  );
  await page.getByTestId('join-confirm').click();
  // « et toi » is no longer written: « Tu participes » says it.
  await expect(puzzle.getByTestId('idea-who')).toHaveText(['Mamie']);
  await expect(puzzle.getByTestId('idea-joined')).toHaveText('Tu participes');
  await expect(puzzle).not.toContainText('toi');
  // Only Mamie may close it.
  const refused = await page.request.patch(
    `/api/l/${state.token}/claims/${state.ideas.Puzzle}`,
    { data: { closed: true } },
  );
  expect(refused.status()).toBe(403);
  await apiLogin(page.request, MAMIE);
  await page.reload();
  await hydrated(page);
  await puzzle.getByTestId('idea-open').click();
  await expect(page.getByTestId('claim-sheet')).toContainText('Tonton');
  await page.getByRole('switch', { name: 'On est au complet' }).click();
  await page.getByTestId('claim-done').click();
  await expect(puzzle.getByTestId('idea-closed')).toHaveText('Au complet');
});

test('something else, and what the holder sees', async ({ page }) => {
  await apiLogin(page.request, TONTON);
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  // Written in place (README 22.20): a line already ticked, who will read
  // it, « Supprimer »; no sheet, no page.
  const other = page.getByRole('button', { name: 'J’offre autre chose à Léo' });
  await other.click();
  const line = page.getByTestId('off-list-line');
  await expect(line).toContainText(
    'Camille lira ces mots. Les autres verront seulement « Un cadeau surprise, hors liste ».',
  );
  await line.getByRole('button', { name: 'Supprimer' }).click();
  await expect(line).toHaveCount(0);
  await other.click();
  await page.getByTestId('off-list-field').fill('un jeu de société');
  await page.getByTestId('off-list-field').press('Enter');
  await expect(page).toHaveURL(new RegExp(`/l/${state.token}$`));
  await expect(page.getByTestId('off-list')).toContainText(
    'Tu offres hors liste : un jeu de société',
  );
  // The list is in Tonton's tab.
  await page.goto('/listes');
  await hydrated(page);
  const card = page.getByTestId('list-card').filter({ hasText: 'Noël 2026' });
  await expect(card).toContainText('Liste de Camille');
  await expect(card).toContainText('Tu offres 2 cadeaux.');

  // The holder sees who gives what.
  await apiLogin(page.request, HOLDER);
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  await expect(page.getByTestId('idea-who')).toContainText(['Mamie']);
  await expect(page.locator('body')).toContainText(
    '3 cadeaux déjà prévus. Toi seul vois les prénoms.',
  );
  await expect(page.getByTestId('holder-off-list')).toContainText(
    'Hors liste : un jeu de société',
  );
  await expect(page.getByTestId('holder-off-list')).toContainText('Tonton');
  // It cannot be unticked from here: touching it says why.
  await expect(page.getByTestId('off-list-notice')).toHaveCount(0);
  await page.getByTestId('holder-off-list').getByRole('button').click();
  await expect(page.getByTestId('off-list-notice')).toContainText(
    'Tonton l’a ajouté de son côté, et lui seul peut le retirer.',
  );
});

test('sharing stopped: the link says so, the list leaves the tab, the ticks stay', async ({
  page,
  playwright,
  baseURL,
}) => {
  // One login each: an address may only ask for so many links.
  const holder = await playwright.request.newContext({ baseURL });
  await apiLogin(holder, HOLDER);
  await ok(
    await holder.post(`/api/lists/${state.listId}/share`, {
      data: { ask: 'off' },
    }),
  );
  await apiLogin(page.request, TONTON);
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await expect(page.getByTestId('list-gone')).toContainText(
    'Cette liste n’est plus partagée.',
  );
  await page.goto('/listes');
  await hydrated(page);
  await expect(
    page.getByTestId('list-card').filter({ hasText: 'Noël 2026' }),
  ).toHaveCount(0);

  // Shared again: the same link, and what was ticked is still there.
  const again = await ok(
    await holder.post(`/api/lists/${state.listId}/share`, { data: {} }),
  );
  expect(again.token).toBe(state.token);
  await holder.dispose();
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await expect(page.getByTestId('off-list')).toContainText(
    'Tu offres hors liste : un jeu de société',
  );
});
