import {
  expect,
  test,
  type APIRequestContext,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { apiLogin, hydrated, seedMembers, seedSql } from './helpers';

// A list of a year over (ticket 119, V3ListeAnneePassee): its link still
// opens it, with a band that says its year, for everyone; the band leads
// to the list of this year taken from it once I may open it. And
// « Repartir d'une liste » (ListeNouvelleReprendre) offers only the lists
// that look like the new one, with the first names of their people.
test.describe.configure({ mode: 'serial' });

const HUGO = 'past-list-hugo@example.com';
const CAMILLE = 'past-list-camille@example.com';

/** A day from today, ISO. */
const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
const date = inDays(30);
const year = Number(date.slice(0, 4));
const lastYear = `${year - 1}${date.slice(4)}`;

const state: {
  hugo?: BrowserContext;
  camille?: BrowserContext;
  slug: string;
  partyId: string;
  oldId: string;
  oldToken: string;
  newId: string;
  newToken: string;
} = {
  slug: '',
  partyId: '',
  oldId: '',
  oldToken: '',
  newId: '',
  newToken: '',
};
const hugo = (): APIRequestContext => {
  if (!state.hugo) throw new Error('Hugo is not logged in');
  return state.hugo.request;
};
const ok = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  expect(response.ok(), `${response.url()}: ${response.status()}`).toBe(true);
  return response.json();
};
const open = async (
  context: BrowserContext | undefined,
  path: string,
): Promise<Page> => {
  if (!context) throw new Error('not logged in');
  const page = await context.newPage();
  await page.goto(path);
  await hydrated(page);
  return page;
};
const shareWithEvent = async (listId: string) =>
  ok(
    await hugo().put(`/api/lists/${listId}/sharing`, {
      data: { parties: [state.partyId], givers: [], isPublic: false },
    }),
  );

test.beforeAll(async ({ browser }) => {
  const login = async (email: string, firstName: string) => {
    const context = await browser.newContext();
    await apiLogin(context.request, email);
    await context.request.put('/api/auth/profile', { data: { firstName } });
    return context;
  };
  state.hugo = await login(HUGO, 'Hugo');
  state.camille = await login(CAMILLE, 'Camille');
  const { slug } = await ok(
    await hugo().post('/api/parties', {
      data: {
        category: 'christmas',
        name: 'Famille Passee',
        date,
        recurring: true,
        memberIds: [],
      },
    }),
  );
  state.slug = slug;
  await seedMembers(slug, [['Camille', CAMILLE]]);
  // Hugo's list, shared with the members, with Léo and an idea.
  const { id } = await ok(
    await hugo().post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, party: slug },
    }),
  );
  state.oldId = id;
  const leo = await ok(
    await hugo().post(`/api/lists/${id}/people`, {
      data: {
        newMember: { firstName: 'Léo', avatar: { emoji: '🚀', color: 'pine' } },
      },
    }),
  );
  await ok(
    await hugo().post(`/api/lists/${id}/ideas`, {
      data: { listPersonId: leo.id, text: 'Circuit de billes' },
    }),
  );
  const { options } = await ok(await hugo().get(`/api/lists/${id}/sharing`));
  state.partyId = options.find((o: { slug: string }) => o.slug === slug).id;
  await shareWithEvent(id);
  state.oldToken = (
    await ok(await hugo().get(`/api/lists/${id}`))
  ).list.shareToken;
  // Everything moves one year back: that year is over.
  await seedSql(`
UPDATE party_years SET year = ${year - 1}, date = '${lastYear}'
  WHERE party_id = (SELECT id FROM parties WHERE slug = '${slug}');
UPDATE gift_lists SET event_date = '${lastYear}' WHERE id = '${id}';
`);
  // « Reprendre ma liste de l'an dernier »: the list of this year, a draft.
  const made = await ok(
    await hugo().post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, party: slug, from: id },
    }),
  );
  state.newId = made.id;
  state.newToken = (
    await ok(await hugo().get(`/api/lists/${made.id}`))
  ).list.shareToken;
});

test.afterAll(async () => {
  await state.hugo?.close();
  await state.camille?.close();
});

test('the link of last year’s list says its year, and leads to this year’s once shared', async () => {
  const page = await open(state.camille, `/l/${state.oldToken}`);
  const band = page.getByTestId('list-past-band');
  await expect(band).toContainText(`Liste de Noël ${year - 1}`);
  await expect(band).toContainText('Une année passée');
  // The list of this year is a draft: Camille may not open it.
  await expect(band.getByTestId('list-past-next')).toHaveCount(0);
  // The list stays open: its boxes are still there.
  await expect(page.getByText('Circuit de billes')).toBeVisible();

  await shareWithEvent(state.newId);
  await page.reload();
  await hydrated(page);
  const next = page.getByTestId('list-past-next');
  await expect(next).toHaveText(`Noël ${year}`);
  await next.click();
  await expect(page).toHaveURL(new RegExp(`/l/${state.newToken}$`));
  await expect(page.getByText('Circuit de billes')).toBeVisible();
  // A list of this year has no band.
  await expect(page.getByTestId('list-past-band')).toHaveCount(0);
  await page.close();
});

test('the one who holds it sees the band too, leading to their document', async () => {
  const page = await open(state.hugo, `/listes/${state.oldId}`);
  await expect(page.getByTestId('list-past-title')).toHaveText(
    `Liste de Noël ${year - 1}`,
  );
  await page.getByTestId('list-past-next').click();
  await expect(page).toHaveURL(new RegExp(`/listes/${state.newId}$`));
  await expect(page.getByTestId('list-title')).toBeVisible();
  await expect(page.getByTestId('list-past-band')).toHaveCount(0);
  await page.close();
});

test('« Repartir d’une liste » offers only the lists that look like the new one', async () => {
  // Léo's birthday, with a list for him.
  const { slug: birthday } = await ok(
    await hugo().post('/api/parties', {
      data: {
        category: 'birthday',
        name: 'Les 7 ans de Léo',
        date,
        recurring: true,
        forMemberId: null,
      },
    }),
  );
  const { id } = await ok(
    await hugo().post('/api/lists', {
      data: { icon: { emoji: '🎂', color: 'plum' }, party: birthday },
    }),
  );
  await ok(
    await hugo().post(`/api/lists/${id}/people`, {
      data: {
        newMember: { firstName: 'Zoé', avatar: { emoji: '🦄', color: 'plum' } },
      },
    }),
  );
  // A new Christmas event, and its new list, still empty.
  const { slug: friends } = await ok(
    await hugo().post('/api/parties', {
      data: {
        category: 'christmas',
        name: 'Noël des amis',
        date,
        recurring: true,
        memberIds: [],
      },
    }),
  );
  const { id: fresh } = await ok(
    await hugo().post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, party: friends },
    }),
  );
  const page = await open(state.hugo, `/listes/${fresh}`);
  const block = page.getByTestId('resume-from');
  await expect(block.getByRole('heading')).toHaveText('Repartir d’une liste');
  // The two Christmas lists, the latest first, never the birthday.
  await expect(block.getByTestId('resume-list')).toHaveCount(2);
  await expect(block).not.toContainText('Les 7 ans de Léo');
  await expect(block.getByTestId('resume-list').first()).toContainText(
    'Léo · 1 idée pas encore offerte',
  );
  await page.close();
});
