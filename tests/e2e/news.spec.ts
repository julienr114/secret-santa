import { expect, test, type APIRequestContext } from '@playwright/test';
import { addPeople, apiLogin, heading, hydrated } from './helpers';

// The lines and « Quoi de neuf » (tickets 112 and 120, V3Accueil,
// V3AccueilAvantNoel, V3QuoiDeNeuf, NotifListe): each line says where the
// thing is; an event before Christmas is above « Noël »; the draw makes a
// news, a count on the tab and a red dot; opening « Quoi de neuf » clears
// nothing, opening the thing clears it everywhere. Never who Hugo drew.
test.describe.configure({ mode: 'serial' });

const CAMILLE = 'camille-nouvelles@example.com';
const HUGO = 'hugo-nouvelles@example.com';

/** A day from today, ISO. */
const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
const today = inDays(0);
/** The Christmas the season is for. */
const christmas =
  today <= `${today.slice(0, 4)}-12-25`
    ? Number(today.slice(0, 4))
    : Number(today.slice(0, 4)) + 1;
/** A day before that Christmas, but not today. */
const before =
  inDays(3) < `${christmas}-12-25` ? inDays(3) : `${christmas}-12-24`;

const state: {
  camille?: APIRequestContext;
  slug: string;
  base: string;
  token: string;
  shareToken: string;
  listId: string;
  personId: string;
} = {
  slug: '',
  base: '',
  token: '',
  shareToken: '',
  listId: '',
  personId: '',
};
const camille = () => state.camille!;
const ok = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  expect(response.ok(), `${response.url()}: ${response.status()}`).toBe(true);
  return response.json();
};

test.beforeAll(async ({ playwright, baseURL }) => {
  // Hugo has an account before anything happens: news are for accounts.
  const hugoApi = await playwright.request.newContext({ baseURL });
  await apiLogin(hugoApi, HUGO);
  await ok(
    await hugoApi.put('/api/auth/profile', { data: { firstName: 'Hugo' } }),
  );
  await hugoApi.dispose();
  state.camille = await playwright.request.newContext({ baseURL });
  await apiLogin(camille(), CAMILLE);
  await ok(
    await camille().put('/api/auth/profile', {
      data: { firstName: 'Camille' },
    }),
  );
  const { slug } = await ok(
    await camille().post('/api/parties', {
      data: {
        category: 'christmas',
        name: 'Famille Nouvelles',
        date: `${christmas}-12-25`,
        recurring: true,
        memberIds: [],
      },
    }),
  );
  state.slug = slug;
  const at = `/api/admin/${slug}`;
  const { edition } = await ok(
    await camille().post(`${at}/editions`, {
      data: {
        label: `Noël ${christmas}`,
        year: christmas,
        eventDate: `${christmas}-12-25`,
      },
    }),
  );
  state.base = `${at}/editions/${edition.id}`;
  // Hugo comes in by the Secret Santa: « Camille t'ajoute au Secret
  // Santa » (ticket 117).
  await addPeople(camille(), at, edition.id, [
    { firstName: 'Hugo', email: HUGO },
    'Inès',
    'Louis',
  ]);
  const { participants } = await ok(await camille().get(state.base));
  const { messages } = await ok(
    await camille().get(`${state.base}/messages?type=invitation`),
  );
  const hugo = participants.find(
    (p: { firstName: string }) => p.firstName === 'Hugo',
  );
  state.token = new URL(messages[hugo.participationId].link).pathname.split(
    '/p/',
  )[1]!;
  // Camille's list for Léo, shared with the event, with one idea.
  const { id: listId } = await ok(
    await camille().post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, party: slug },
    }),
  );
  const { options } = await ok(
    await camille().get(`/api/lists/${listId}/sharing`),
  );
  await ok(
    await camille().put(`/api/lists/${listId}/sharing`, {
      data: {
        isPublic: false,
        parties: options
          .filter((option: { slug: string }) => option.slug === slug)
          .map((option: { id: string }) => option.id),
      },
    }),
  );
  const list = await ok(await camille().get(`/api/lists/${listId}`));
  state.shareToken = list.list.shareToken;
  state.listId = listId;
  const { id: person } = await ok(
    await camille().post(`/api/lists/${listId}/people`, {
      data: {
        newMember: { firstName: 'Léo', avatar: { emoji: '🚀', color: 'pine' } },
      },
    }),
  );
  state.personId = person;
  await ok(
    await camille().post(`/api/lists/${listId}/ideas`, {
      data: { listPersonId: person, text: 'Un télescope' },
    }),
  );
});

test.afterAll(async () => {
  await state.camille?.dispose();
});

test('an event before Christmas is above it; each line says where things are', async ({
  page,
}) => {
  await apiLogin(page.request, HUGO);
  await ok(
    await page.request.post('/api/parties', {
      data: {
        category: 'housewarming',
        name: 'La crémaillère d’Inès',
        date: before,
        recurring: false,
        memberIds: [],
      },
    }),
  );
  await page.goto('/');
  await hydrated(page);
  await expect(heading(page)).toHaveText('Bonjour Hugo');
  // The housewarming comes first, without a title, then « Noël ».
  const first = page.getByTestId('home-before');
  await expect(first.getByRole('heading', { level: 3 })).toHaveText(
    'La crémaillère d’Inès',
  );
  const order = await page
    .locator('[data-testid="home-before"], [data-testid="home-season"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-testid')),
    );
  expect(order).toEqual(['home-before', 'home-season']);

  const card = page
    .getByTestId('home-party')
    .filter({ hasText: 'Famille Nouvelles' });
  await expect(card.getByTestId('home-santa')).toContainText('Le Secret Santa');
  await expect(card.getByTestId('home-santa')).toContainText('Pas encore tiré');
  // Camille's list for Léo, never opened: its idea is new to Hugo.
  await expect(card.getByTestId('home-list')).toContainText('La liste de Léo');
  await expect(card.getByTestId('home-list')).toContainText('1 nouvelle idée');
  await expect(
    card.getByTestId('home-list').getByTestId('new-dot'),
  ).toHaveCount(1);
  await expect(page.getByTestId('news-count')).toHaveCount(1);
});

test('the draw: a news, a count, a dot; « Quoi de neuf » clears nothing, the envelope does', async ({
  page,
}) => {
  await ok(await camille().post(`${state.base}/draw`));
  await apiLogin(page.request, HUGO);
  await page.goto('/');
  await hydrated(page);
  const santa = page
    .getByTestId('home-party')
    .filter({ hasText: 'Famille Nouvelles' })
    .getByTestId('home-santa');
  await expect(santa).toContainText('Ton enveloppe t’attend');
  await expect(santa.getByTestId('new-dot')).toHaveCount(1);
  // Being added to the Secret Santa, the draw and Camille's idea.
  await expect(page.getByTestId('news-count')).toHaveText('3');

  await page.getByRole('link', { name: /Quoi de neuf/ }).click();
  await expect(heading(page)).toHaveText('Quoi de neuf');
  const section = page
    .getByTestId('news-section')
    .filter({ hasText: 'Famille Nouvelles' });
  const envelope = section
    .getByTestId('news-line')
    .filter({ hasText: 'Le tirage est fait : ton enveloppe t’attend' });
  await expect(envelope).toHaveCount(1);
  await expect(envelope.getByTestId('new-dot')).toHaveCount(1);
  await expect(
    section
      .getByTestId('news-line')
      .filter({ hasText: 'Camille a ajouté des idées à sa liste' }),
  ).toHaveCount(1);
  await expect(
    section
      .getByTestId('news-line')
      .filter({ hasText: 'Camille t’ajoute au Secret Santa' }),
  ).toHaveCount(1);
  await expect(
    page.getByText('Tout s’efface au bout de trente jours'),
  ).toBeVisible();
  // Reading the page marks nothing.
  await page.reload();
  await hydrated(page);
  await expect(page.getByTestId('news-count')).toHaveText('3');

  // Hugo opens his envelope: its news goes, here and on the home.
  await ok(await page.request.post(`/api/p/${state.token}/reveal`));
  await page.goto('/quoi-de-neuf');
  await hydrated(page);
  await expect(
    page
      .getByTestId('news-line')
      .filter({ hasText: 'ton enveloppe t’attend' })
      .getByTestId('new-dot'),
  ).toHaveCount(0);
  await expect(page.getByTestId('news-count')).toHaveText('2');
  await page.goto('/');
  await hydrated(page);
  await expect(santa).toContainText('Tu sais à qui tu offres');
  await expect(santa.getByTestId('new-dot')).toHaveCount(0);
  // Never who Hugo drew, on the line of the Secret Santa.
  await expect(santa).not.toContainText(/Camille|Inès|Louis/);
});

test('opening the list clears its news and its dot, and marks its new idea in the margin', async ({
  page,
}) => {
  await apiLogin(page.request, HUGO);
  // A first visit, then a new idea from Camille.
  await ok(await page.request.get(`/api/l/${state.shareToken}`));
  await ok(
    await camille().post(`/api/lists/${state.listId}/ideas`, {
      data: { listPersonId: state.personId, text: 'Une écharpe' },
    }),
  );
  await page.goto('/');
  await hydrated(page);
  const line = page
    .getByTestId('home-party')
    .filter({ hasText: 'Famille Nouvelles' })
    .getByTestId('home-list');
  await expect(line).toContainText('1 nouvelle idée');
  const seen = page.waitForResponse('**/api/news/seen');
  await line.click();
  await expect(page).toHaveURL(new RegExp(`/l/${state.shareToken}`));
  await hydrated(page);
  await seen;
  const fresh = page
    .getByTestId('visitor-idea')
    .filter({ hasText: 'Une écharpe' });
  await expect(fresh.getByTestId('idea-new')).toHaveCount(1);
  await expect(
    page
      .getByTestId('visitor-idea')
      .filter({ hasText: 'Un télescope' })
      .getByTestId('idea-new'),
  ).toHaveCount(0);
  await page.goto('/');
  await hydrated(page);
  await expect(line).toContainText('2 idées');
  await expect(line.getByTestId('new-dot')).toHaveCount(0);
  // Had Hugo drawn Camille, her new idea is told on his own Secret Santa
  // (« De nouvelles idées t'attendent »), seen by opening his page.
  await ok(
    await page.request.post(`/api/p/${state.token}/seen`, {
      data: { target: 'santa' },
    }),
  );
  await page.reload();
  await hydrated(page);
  await expect(page.getByTestId('news-count')).toHaveCount(0);
});
