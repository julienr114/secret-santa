import { expect, test, type APIRequestContext } from '@playwright/test';
import { apiLogin, heading, hydrated } from './helpers';

// The sharing of a list by stages (ticket 106, docs/spec/v3/listes.md):
// a list made for an event opens as a draft, read by nobody but its
// holder; shared with the members of two events, they get in, nobody
// else, and the ticks are the same everywhere; narrowing says first how
// many who ticked will lose it, and their ticks stay; public, an outsider
// who ticked finds it in « Ce que j'offre ailleurs ».
test.describe.configure({ mode: 'serial' });

const CAMILLE = 'camille-partage@example.com';
const HUGO = 'hugo-partage@example.com';
const LEA = 'lea-partage@example.com';
const TOM = 'tom-partage@example.com';
const OUTSIDER = 'inconnu-partage@example.com';
const FAMILY = 'Famille Partage';
const GRANNY = 'Chez Mamie Partage';

const state: {
  camille?: APIRequestContext;
  family: string;
  granny: string;
  listId: string;
  token: string;
  idea: string;
} = { family: '', granny: '', listId: '', token: '', idea: '' };
const camille = () => state.camille!;

/**
 * Logs someone in, in a context of their own.
 * @param playwright - Playwright.
 * @param baseURL - The server.
 * @param email - Who.
 * @returns Their requests.
 */
const as = async (
  playwright: {
    request: { newContext: (o: object) => Promise<APIRequestContext> };
  },
  baseURL: string | undefined,
  email: string,
) => {
  const api = await playwright.request.newContext({ baseURL });
  await apiLogin(api, email);
  return api;
};

test.beforeAll(async ({ playwright, baseURL }) => {
  state.camille = await as(playwright, baseURL, CAMILLE);
  const party = async (name: string, members: [string, string][]) => {
    const created = await camille().post('/api/parties', {
      data: {
        category: 'christmas',
        name,
        date: '2099-12-25',
        recurring: true,
        memberIds: [],
      },
    });
    expect(created.ok(), name).toBe(true);
    const { slug } = (await created.json()) as { slug: string };
    for (const [firstName, email] of members) {
      const added = await camille().post(`/api/admin/${slug}/persons`, {
        data: { firstName, email },
      });
      expect(added.ok(), firstName).toBe(true);
    }
    return slug;
  };
  state.family = await party(FAMILY, [['Hugo', HUGO]]);
  state.granny = await party(GRANNY, [
    ['Léa', LEA],
    ['Tom', TOM],
  ]);
});

test.afterAll(async () => {
  await state.camille?.dispose();
});

test('a list made for an event opens as a draft, with the event’s name', async ({
  page,
}) => {
  await apiLogin(page.request, CAMILLE);
  await page.goto('/');
  await hydrated(page);
  await page
    .getByTestId('tab-bar')
    .getByRole('button', { name: 'Créer' })
    .click();
  await page.getByTestId('create-list').click();
  const occasion = page.getByTestId('list-occasion');
  await expect(occasion).toContainText(FAMILY);
  await expect(occasion).toContainText('Noël · 25 décembre');
  await occasion.getByRole('radio', { name: new RegExp(FAMILY) }).check();
  await occasion.getByRole('button', { name: 'Continuer' }).click();
  await expect(page).toHaveURL(/\/listes\/[^/?]+$/);
  await hydrated(page);
  await expect(page.getByTestId('list-title')).toHaveValue(FAMILY);
  await expect(page.getByTestId('share-stage')).toContainText('Brouillon');
  state.listId = page.url().split('/listes/')[1]!;
  const doc = await (await camille().get(`/api/lists/${state.listId}`)).json();
  state.token = doc.list.shareToken;
  const { id: person } = await (
    await camille().post(`/api/lists/${state.listId}/people`, {
      data: {
        newMember: { firstName: 'Léo', avatar: { emoji: '🚀', color: 'pine' } },
      },
    })
  ).json();
  const { id: idea } = await (
    await camille().post(`/api/lists/${state.listId}/ideas`, {
      data: { listPersonId: person, text: 'Circuit de billes' },
    })
  ).json();
  state.idea = idea;
  // In the card of its event, for its holder alone.
  await page.goto(`/e/${state.family}`);
  await hydrated(page);
  await expect(page.getByTestId('party-lists')).toContainText('Ma liste');
});

test('a draft is read by nobody but its holder, by any route', async ({
  playwright,
  baseURL,
}) => {
  const hugo = await as(playwright, baseURL, HUGO);
  const outsider = await as(playwright, baseURL, OUTSIDER);
  const nobody = await playwright.request.newContext({ baseURL });
  for (const who of [hugo, outsider]) {
    expect((await who.get(`/api/l/${state.token}`)).status()).toBe(403);
    expect((await who.get(`/api/lists/${state.listId}`)).status()).toBe(404);
    expect(
      (
        await who.post(`/api/l/${state.token}/claims`, {
          data: { ideaId: state.idea },
        })
      ).status(),
    ).toBe(403);
  }
  expect((await nobody.get(`/api/l/${state.token}`)).status()).toBe(401);
  // Nor in the event's card for its members.
  const page = await (await hugo.get(`/api/parties/${state.family}`)).json();
  expect(page.lists).toEqual([]);
  await hugo.dispose();
  await outsider.dispose();
  await nobody.dispose();
});

test('shared in two events: their members get in, nobody else, the same ticks', async ({
  page,
  playwright,
  baseURL,
}) => {
  await apiLogin(page.request, CAMILLE);
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  await page.getByTestId('share-open').click();
  const sharing = page.getByRole('dialog', { name: 'Qui verra ta liste ?' });
  await expect(sharing).toContainText('Noël · 2 membres');
  await sharing.getByTestId(`sharing-event-${state.family}`).check();
  await sharing.getByTestId(`sharing-event-${state.granny}`).check();
  await sharing.getByTestId('sharing-save').click();
  await expect(sharing).toBeHidden();
  await expect(page.getByTestId('share-stage')).toContainText(
    `${GRANNY}, ${FAMILY}`,
  );
  await expect(page.getByTestId('share-stage')).toContainText(
    '3 membres la voient',
  );

  const hugo = await as(playwright, baseURL, HUGO);
  const lea = await as(playwright, baseURL, LEA);
  const tom = await as(playwright, baseURL, TOM);
  const outsider = await as(playwright, baseURL, OUTSIDER);
  expect((await outsider.get(`/api/l/${state.token}`)).status()).toBe(403);
  // Hugo ticks from « Famille Partage »; Léa sees it from « Chez Mamie ».
  expect(
    (
      await hugo.post(`/api/l/${state.token}/claims`, {
        data: { ideaId: state.idea, mode: 'group' },
      })
    ).ok(),
  ).toBe(true);
  expect(
    (
      await tom.post(`/api/l/${state.token}/claims`, {
        data: { ideaId: state.idea, mode: 'group' },
      })
    ).ok(),
  ).toBe(true);
  const seen = await (await lea.get(`/api/l/${state.token}`)).json();
  expect(JSON.stringify(seen)).toContain('hugo-partage');
  // A member opens it from the event, without a link, and the pill leads
  // back there (V3ListeMembre).
  await apiLogin(page.request, LEA);
  await page.goto(`/e/${state.granny}`);
  await hydrated(page);
  await page.getByTestId('party-lists').getByRole('link').first().click();
  await hydrated(page);
  await expect(page.getByTestId('list-from-party')).toHaveText(GRANNY);
  await page.getByTestId('list-from-party').click();
  await expect(heading(page)).toHaveText(GRANNY);
  for (const who of [hugo, lea, tom, outsider]) await who.dispose();
});

test('narrowing says first how many who ticked lose it; their ticks stay', async ({
  page,
  playwright,
  baseURL,
}) => {
  await apiLogin(page.request, CAMILLE);
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  await page.getByTestId('share-open').click();
  const sharing = page.getByRole('dialog', { name: 'Qui verra ta liste ?' });
  await sharing.getByTestId(`sharing-event-${state.family}`).click();
  // Hugo ticked in « Famille Partage »… and so did Tom, who stays in
  // through « Chez Mamie »: only Hugo would lose it. Taking « Chez Mamie »
  // too, both would.
  const narrow = page.getByRole('dialog', {
    name: `Retirer ta liste de « ${FAMILY} » ?`,
  });
  await expect(narrow).toContainText('Son membre ne la verra plus.');
  await expect(narrow).toContainText(
    '1 d’entre eux a coché un cadeau et ne pourra plus ouvrir la liste.',
  );
  await narrow.getByRole('button', { name: 'Retirer' }).click();
  await sharing.getByTestId(`sharing-event-${state.granny}`).click();
  const narrowGranny = page.getByRole('dialog', {
    name: `Retirer ta liste de « ${GRANNY} » ?`,
  });
  await expect(narrowGranny).toContainText('Ses 2 membres ne la verront plus.');
  await expect(narrowGranny).toContainText(
    '2 d’entre eux ont coché un cadeau et ne pourront plus ouvrir la liste. Leurs cadeaux restent prévus.',
  );
  await narrowGranny.getByRole('button', { name: 'Retirer' }).click();
  await sharing.getByTestId('sharing-save').click();
  await expect(page.getByTestId('share-stage')).toContainText('Brouillon');
  // Gone for them, without a trace; their ticks are still on the list.
  const hugo = await as(playwright, baseURL, HUGO);
  expect((await hugo.get(`/api/l/${state.token}`)).status()).toBe(403);
  await hugo.dispose();
  const doc = await (await camille().get(`/api/lists/${state.listId}`)).json();
  expect(doc.planned).toBe(1);
});

test('public: an outsider who ticked finds it in « Ce que j’offre ailleurs »', async ({
  page,
  playwright,
  baseURL,
}) => {
  await camille().put(`/api/lists/${state.listId}/sharing`, {
    data: { parties: [], isPublic: true },
  });
  const outsider = await as(playwright, baseURL, OUTSIDER);
  expect(
    (
      await outsider.post(`/api/l/${state.token}/claims`, {
        data: { ideaId: state.idea, mode: 'group' },
      })
    ).ok(),
  ).toBe(true);
  await outsider.dispose();
  await apiLogin(page.request, OUTSIDER);
  await page.goto('/');
  await hydrated(page);
  await expect(page.getByTestId('home-elsewhere')).toContainText(
    `${FAMILY} · 1 cadeau`,
  );
  await page.getByTestId('home-elsewhere').click();
  await expect(heading(page)).toHaveText('Ce que j’offre ailleurs');
  await expect(page.getByTestId('elsewhere')).toContainText(
    'Le 25 décembre · tu offres : Circuit de billes',
  );
  // No longer public: it leaves, without a trace.
  await camille().put(`/api/lists/${state.listId}/sharing`, {
    data: { parties: [], isPublic: false },
  });
  await page.reload();
  await hydrated(page);
  await expect(page.getByTestId('elsewhere').getByRole('link')).toHaveCount(0);
});
