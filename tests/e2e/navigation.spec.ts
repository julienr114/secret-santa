import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { apiLogin, heading, hydrated } from './helpers';

// « Retour » leads back where one comes from (ticket 114,
// docs/spec/v3/navigation.md): a list opened from the home, an event or
// « Quoi de neuf » goes back there, even after a detour through one of its
// own pages; opened from a link, it goes home; without a session, my page
// of a Secret Santa has no « Retour »; `/listes` typed leads home.
test.describe.configure({ mode: 'serial' });

const CAMILLE = 'camille-retour@example.com';
const HUGO = 'hugo-retour@example.com';

const state: {
  slug: string;
  token: string;
  shareToken: string;
  listId: string;
} = { slug: '', token: '', shareToken: '', listId: '' };

const ok = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  expect(response.ok(), `${response.url()}: ${response.status()}`).toBe(true);
  return response.json();
};

test.beforeAll(async ({ playwright, baseURL }) => {
  const hugo = await playwright.request.newContext({ baseURL });
  await apiLogin(hugo, HUGO);
  await ok(
    await hugo.put('/api/auth/profile', { data: { firstName: 'Hugo' } }),
  );
  await hugo.dispose();
  const camille = await playwright.request.newContext({ baseURL });
  await apiLogin(camille, CAMILLE);
  await ok(
    await camille.put('/api/auth/profile', { data: { firstName: 'Camille' } }),
  );
  const year = new Date().getFullYear() + 1;
  const { slug } = await ok(
    await camille.post('/api/parties', {
      data: {
        category: 'christmas',
        name: 'Famille Retour',
        date: `${year}-12-25`,
        recurring: true,
        memberIds: [],
      },
    }),
  );
  state.slug = slug;
  const at = `/api/admin/${slug}`;
  for (const [firstName, email] of [
    ['Hugo', HUGO],
    ['Inès', null],
    ['Louis', null],
  ] as const) {
    await ok(
      await camille.post(`${at}/persons`, {
        data: { firstName, ...(email ? { email } : {}) },
      }),
    );
  }
  const { edition } = await ok(
    await camille.post(`${at}/editions`, {
      data: { label: `Noël ${year}`, year, eventDate: `${year}-12-25` },
    }),
  );
  const base = `${at}/editions/${edition.id}`;
  const { participants } = await ok(await camille.get(base));
  const { messages } = await ok(
    await camille.get(`${base}/messages?type=invitation`),
  );
  const hugoThere = participants.find(
    (p: { firstName: string }) => p.firstName === 'Hugo',
  );
  state.token = new URL(
    messages[hugoThere.participationId].link,
  ).pathname.split('/p/')[1]!;
  // Camille's list for Léo, shared with the event, with an idea: a line
  // of « Quoi de neuf » for Hugo.
  const { id: listId } = await ok(
    await camille.post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, party: slug },
    }),
  );
  const { options } = await ok(
    await camille.get(`/api/lists/${listId}/sharing`),
  );
  await ok(
    await camille.put(`/api/lists/${listId}/sharing`, {
      data: {
        isPublic: false,
        parties: options
          .filter((option: { slug: string }) => option.slug === slug)
          .map((option: { id: string }) => option.id),
      },
    }),
  );
  const list = await ok(await camille.get(`/api/lists/${listId}`));
  state.shareToken = list.list.shareToken;
  state.listId = listId;
  const { id: person } = await ok(
    await camille.post(`/api/lists/${listId}/people`, {
      data: {
        newMember: { firstName: 'Léo', avatar: { emoji: '🚀', color: 'pine' } },
      },
    }),
  );
  await ok(
    await camille.post(`/api/lists/${listId}/ideas`, {
      data: { listPersonId: person, text: 'Un télescope' },
    }),
  );
  await camille.dispose();
});

/** « Retour », in the bar at the top. */
const back = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: 'Retour' });

test('home → a list → « Retour »: the home', async ({ page }) => {
  await apiLogin(page.request, HUGO);
  await page.goto('/');
  await hydrated(page);
  await page
    .getByTestId('home-party')
    .filter({ hasText: 'Famille Retour' })
    .getByTestId('home-list')
    .click();
  await expect(page).toHaveURL(new RegExp(`/l/${state.shareToken}`));
  await back(page).click();
  await expect(heading(page)).toHaveText('Bonjour Hugo');
});

test('an event → a list → a page of the list → the list → « Retour »: the event', async ({
  page,
}) => {
  await apiLogin(page.request, CAMILLE);
  await page.goto(`/e/${state.slug}`);
  await hydrated(page);
  await page.getByTestId('party-list').first().click();
  await expect(page).toHaveURL(new RegExp(`/listes/${state.listId}$`));
  // A detour through the page of Léo, written from the list.
  const leo = page.getByTestId('list-person').filter({ hasText: 'Léo' });
  await leo.getByTestId('person-menu').click();
  await page.getByRole('menuitem', { name: 'Sa fiche et ses goûts' }).click();
  await expect(heading(page)).toHaveText('Léo');
  await back(page).click();
  await expect(page).toHaveURL(new RegExp(`/listes/${state.listId}$`));
  await back(page).click();
  await expect(page).toHaveURL(new RegExp(`/e/${state.slug}$`));
  await expect(heading(page)).toHaveText('Famille Retour');
});

test('« Quoi de neuf » → a list → « Retour »: « Quoi de neuf »', async ({
  page,
}) => {
  await apiLogin(page.request, HUGO);
  await page.goto('/quoi-de-neuf');
  await hydrated(page);
  await page
    .getByTestId('news-line')
    .filter({ hasText: 'Camille a ajouté des idées à sa liste' })
    .click();
  await expect(page).toHaveURL(new RegExp(`/l/${state.shareToken}`));
  await back(page).click();
  await expect(page).toHaveURL(/\/quoi-de-neuf$/);
  await expect(heading(page)).toHaveText('Quoi de neuf');
});

test('the link of an email → a list → « Retour »: the home', async ({
  page,
}) => {
  await apiLogin(page.request, HUGO);
  await page.goto(`/l/${state.shareToken}`);
  await hydrated(page);
  await back(page).click();
  await expect(heading(page)).toHaveText('Bonjour Hugo');
  // The same for the one who holds it.
  await apiLogin(page.request, CAMILLE);
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  await back(page).click();
  await expect(heading(page)).toHaveText('Bonjour Camille');
});

test('without a session, my page of a Secret Santa has no « Retour »', async ({
  page,
}) => {
  await page.goto(`/p/${state.token}`);
  await hydrated(page);
  await expect(page.getByTestId('tab-bar')).toHaveCount(0);
  await expect(page.getByText('Hugo').first()).toBeVisible();
  await expect(back(page)).toHaveCount(0);
});

test('`/listes` typed by hand: the home', async ({ page }) => {
  await apiLogin(page.request, HUGO);
  await page.goto('/listes');
  await hydrated(page);
  await expect(page).toHaveURL(/\/$/);
  await expect(heading(page)).toHaveText('Bonjour Hugo');
});
