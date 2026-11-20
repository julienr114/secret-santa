import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// « Une liste sans personne » (lot 27 bis, README 22.20, maquettes
// ListeNouvelle, ListeSansPersonne, ListeSansPersonneVisiteur): for a
// wedding, a housewarming, the ideas one under the other, without a part
// by person. A pill in the empty document makes the list one; the first
// person added later takes the ideas already written; once shared its
// shape no longer changes.
test.describe.configure({ mode: 'serial' });

const CAMILLE = 'single-camille@example.com';
const MAMIE = 'single-mamie@example.com';
const state: {
  camille?: BrowserContext;
  mamie?: BrowserContext;
  listId: string;
  token: string;
} = { listId: '', token: '' };
const api = () => {
  if (!state.camille) throw new Error('Camille is not logged in');
  return state.camille.request;
};
const open = async (who: 'camille' | 'mamie', path: string): Promise<Page> => {
  const context = state[who];
  if (!context) throw new Error(`${who} is not logged in`);
  const page = await context.newPage();
  await page.goto(path);
  await hydrated(page);
  return page;
};
const share = async (ask: 'on' | 'off') =>
  (
    await api().post(`/api/lists/${state.listId}/share`, { data: { ask } })
  ).json();

test.beforeAll(async ({ browser }) => {
  const login = async (email: string, firstName: string) => {
    const context = await browser.newContext();
    await apiLogin(context.request, email);
    await context.request.put('/api/auth/profile', {
      data: { firstName, avatarEmoji: '🦌', avatarColor: 'plum' },
    });
    return context;
  };
  state.camille = await login(CAMILLE, 'Camille');
  state.mamie = await login(MAMIE, 'Mamie');
  const { id } = await (
    await api().post('/api/lists', {
      data: {
        icon: { emoji: '💍', color: 'plum' },
        title: 'Le mariage de Camille et Hugo',
      },
    })
  ).json();
  state.listId = id;
});

test.afterAll(async () => {
  await state.camille?.close();
  await state.mamie?.close();
});

test('a pill of the empty document makes a list without people', async () => {
  const page = await open('camille', `/listes/${state.listId}`);
  const block = page.getByTestId('add-someone');
  await expect(block).toContainText(
    'Pour un mariage ou une crémaillère, « Une liste sans personne » : les idées, l’une sous l’autre.',
  );
  await block.getByTestId('single-pill').click();

  // The ideas one under the other: no person, no first name, no menu.
  const part = page.getByTestId('list-person');
  await expect(part).toHaveCount(1);
  await expect(part.getByRole('heading')).toHaveCount(0);
  await expect(page.getByTestId('person-menu')).toHaveCount(0);
  await part.getByPlaceholder('Une idée…').click();
  await page.keyboard.type('Un week-end à la mer');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Le robot pâtissier');
  await page.keyboard.press('Enter');
  await expect(part.getByTestId('idea-text')).toHaveText([
    'Un week-end à la mer',
    'Le robot pâtissier',
  ]);
  await expect(part.getByPlaceholder('Une autre idée…')).toBeVisible();

  // Under it, one pill and what it would do; the pill to make the list
  // one is gone.
  await expect(block.getByTestId('single-pill')).toHaveCount(0);
  await expect(block.getByTestId('family-pill')).toHaveCount(0);
  await expect(block.getByTestId('single-add-person')).toHaveText(
    'Une personne',
  );
  await expect(block.getByTestId('single-sorted')).toHaveText(
    'La liste sera alors rangée par personne. Les idées déjà écrites iront à la première.',
  );

  // Nobody joined « Mes proches », and the card of the list shows nobody.
  const doc = await (await api().get(`/api/lists/${state.listId}`)).json();
  expect(doc.single).toBe(true);
  expect(doc.family.map((m: { firstName: string }) => m.firstName)).toEqual([
    'Camille',
  ]);
  const family = await (await api().get('/api/family')).json();
  expect(JSON.stringify(family)).not.toContain('"firstName":""');
  const cards = await (await api().get('/api/lists')).json();
  expect(JSON.stringify(cards)).toContain('Le mariage de Camille et Hugo');
  expect(
    cards.coming.find((card: { id: string }) => card.id === state.listId)
      .people,
  ).toEqual([]);
  await page.close();
});

test('shared, it shows no person by its link, and keeps its shape', async () => {
  state.token = (await share('on')).token;
  // No more « Ajouter quelqu'un » in the document, and none by the route.
  const doc = await open('camille', `/listes/${state.listId}`);
  await expect(doc.getByTestId('list-person')).toHaveCount(1);
  await expect(doc.getByTestId('add-someone')).toHaveCount(0);
  const refused = await api().post(`/api/lists/${state.listId}/people`, {
    data: {
      newMember: { firstName: 'Hugo', avatar: { emoji: '🐧', color: 'frost' } },
    },
  });
  expect(refused.status()).toBe(409);
  expect((await refused.json()).statusMessage).toBe('list_shared');
  await doc.close();

  // By the link: the ideas, without a header of person nor their tastes;
  // « J'offre autre chose » once, at the bottom, without a name.
  const page = await open('mamie', `/l/${state.token}`);
  const part = page.getByTestId('visitor-person');
  await expect(part).toHaveCount(1);
  await expect(part.getByRole('heading')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Ses goûts' })).toHaveCount(0);
  await expect(part.getByTestId('visitor-idea')).toHaveCount(2);
  const other = page.getByTestId('off-list-action');
  await expect(other).toHaveCount(1);
  await expect(other).toHaveText('J’offre autre chose');

  // Ticking works as on any list; its sheet names nobody.
  const idea = part
    .getByTestId('visitor-idea')
    .filter({ hasText: 'Un week-end à la mer' });
  await idea.getByTestId('idea-box').click();
  await expect(idea.getByTestId('idea-mine')).toContainText('Tu l’offres');
  await idea.getByTestId('idea-open').click();
  const sheet = page.getByRole('dialog');
  await expect(sheet).toContainText('Tu l’offres');
  await expect(sheet).not.toContainText('Pour ');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('claim-sheet')).toHaveCount(0);

  // A gift not on the list, said in place.
  await other.click();
  await page.getByTestId('off-list-field').fill('Une lampe');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('off-list')).toContainText(
    'Tu offres hors liste : Une lampe',
  );
  await page.close();
});

test('the first person added takes the ideas already written', async () => {
  await share('off');
  const page = await open('camille', `/listes/${state.listId}`);
  const block = page.getByTestId('add-someone');
  // « Une personne » opens the usual choice.
  await block.getByTestId('single-add-person').click();
  await expect(block.getByTestId('single-sorted')).toBeVisible();
  await block
    .getByTestId('family-pill')
    .filter({ hasText: 'Camille' })
    .getByRole('button')
    .first()
    .click();
  const camille = page
    .getByTestId('list-person')
    .filter({ has: page.getByRole('heading', { name: 'Camille' }) });
  await expect(camille.getByTestId('idea-text')).toHaveText([
    'Un week-end à la mer',
    'Le robot pâtissier',
  ]);
  // What was ticked stays ticked, and the list is by person again.
  const doc = await (await api().get(`/api/lists/${state.listId}`)).json();
  expect(doc.single).toBe(false);
  expect(doc.planned).toBe(2);
  await expect(block.getByTestId('single-add-person')).toHaveCount(0);
  await page.close();

  // One person only: the list can be without people again; not with two.
  expect((await api().post(`/api/lists/${state.listId}/single`)).status()).toBe(
    200,
  );
  const again = await (await api().get(`/api/lists/${state.listId}`)).json();
  expect(again.single).toBe(true);
  expect(again.people[0].ideas).toHaveLength(2);
  const other = await (
    await api().post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, title: 'Noël' },
    })
  ).json();
  for (const firstName of ['Léo', 'Zoé']) {
    await api().post(`/api/lists/${other.id}/people`, {
      data: {
        newMember: { firstName, avatar: { emoji: '🚀', color: 'pine' } },
      },
    });
  }
  const several = await api().post(`/api/lists/${other.id}/single`);
  expect(several.status()).toBe(409);
  expect((await several.json()).statusMessage).toBe('several_people');
});

test('taken up again, a list without people stays one', async () => {
  const fresh = await (
    await api().post('/api/lists', {
      data: { icon: { emoji: '🎁', color: 'pine' }, title: '' },
    })
  ).json();
  const page = await open('camille', `/listes/${fresh.id}`);
  const from = page
    .getByTestId('resume-list')
    .filter({ hasText: 'Le mariage de Camille et Hugo' });
  // One idea is ticked by Mamie: the other is to take.
  await expect(from).toContainText('Sans personne · 1 idée pas encore offerte');
  await from.click();
  const part = page.getByTestId('list-person');
  await expect(part).toHaveCount(1);
  await expect(part.getByRole('heading')).toHaveCount(0);
  await expect(part.getByTestId('idea-text')).toHaveText([
    'Le robot pâtissier',
  ]);
  await page.close();
});
