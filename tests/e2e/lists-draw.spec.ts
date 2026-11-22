import {
  expect,
  test,
  type APIRequestContext,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { addPeople, apiLogin, hydrated } from './helpers';

// What is tied to a Secret Santa is me, in a list (ticket 136, decision of
// 22 November 2026; maquettes V3ListeSecretNouvelle, V3TirageQuelleListe,
// V3ListeSecret, V3ListeSurligne, V3ListeSurligneTout). A list made from
// my Secret Santa has me on it already, first, and may start from last
// year's (Q-032); a list of this year where I figure is offered instead
// of a new one; the one who drew me reads my part first, and the rest by
// « Toute la liste ».
test.describe.configure({ mode: 'serial' });

const SLUG = 'famille-lilas';
const ADMIN = `/api/admin/${SLUG}`;
const NAMES = ['Inès', 'Hugo', 'Jules'];
const emailOf = (firstName: string) =>
  `${firstName
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()}-lilas@example.com`;

const state: {
  admin?: APIRequestContext;
  tokens: Record<string, string>;
  contexts: Record<string, BrowserContext>;
  inesList: string;
} = { tokens: {}, contexts: {}, inesList: '' };

const ok = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  expect(response.ok(), `${response.url()}: ${response.status()}`).toBe(true);
  return response.json();
};
const as = (firstName: string) => {
  const context = state.contexts[firstName];
  if (!context) throw new Error(`${firstName} is not logged in`);
  return context;
};
const open = async (firstName: string, path: string): Promise<Page> => {
  const page = await as(firstName).newPage();
  await page.goto(path);
  await hydrated(page);
  return page;
};
const login = async (browser: Browser, firstName: string) => {
  const context = await browser.newContext();
  await apiLogin(context.request, emailOf(firstName));
  await ok(
    await context.request.put('/api/auth/profile', {
      data: { firstName, avatarEmoji: '🦌', avatarColor: 'plum' },
    }),
  );
  return context;
};
/**
 * A list of mine with « Moi » and someone else, each with their ideas.
 * @returns Its id.
 */
const listWithMe = async (
  api: APIRequestContext,
  data: { title: string; eventDate: string },
  other: string,
  ideas: { mine: string[]; theirs: string[] },
) => {
  const { id } = await ok(
    await api.post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, ...data },
    }),
  );
  const { members } = await ok(await api.get('/api/family'));
  const self = members.find((m: { isSelf: boolean }) => m.isSelf);
  const me = await ok(
    await api.post(`/api/lists/${id}/people`, { data: { memberId: self.id } }),
  );
  const them = await ok(
    await api.post(`/api/lists/${id}/people`, {
      data: {
        newMember: {
          firstName: other,
          avatar: { emoji: '🚀', color: 'frost' },
        },
      },
    }),
  );
  for (const [person, texts] of [
    [me.id, ideas.mine],
    [them.id, ideas.theirs],
  ] as const) {
    for (const text of texts) {
      await ok(
        await api.post(`/api/lists/${id}/ideas`, {
          data: { listPersonId: person, text },
        }),
      );
    }
  }
  return id as string;
};

test.beforeAll(async ({ playwright, baseURL, browser }) => {
  state.admin = await playwright.request.newContext({ baseURL });
  const admin = state.admin;
  await apiLogin(admin, 'super-draw-lists@example.com');
  await ok(
    await admin.post('/api/admin/groups', { data: { name: 'Famille Lilas' } }),
  );
  const created = await ok(
    await admin.post(`${ADMIN}/editions`, {
      data: { label: 'Noël des lilas', year: 2026, eventDate: '2026-12-24' },
    }),
  );
  const editionId = created.edition.id;
  await addPeople(
    admin,
    ADMIN,
    editionId,
    NAMES.map((firstName) => ({ firstName, email: emailOf(firstName) })),
  );
  const { participants } = await ok(
    await admin.get(`${ADMIN}/editions/${editionId}`),
  );
  const { messages } = await ok(
    await admin.get(`${ADMIN}/editions/${editionId}/messages?type=invitation`),
  );
  state.tokens = Object.fromEntries(
    participants.map((p: { firstName: string; participationId: string }) => [
      p.firstName,
      new URL(messages[p.participationId].link).pathname.split('/').at(-1),
    ]),
  );
  await ok(await admin.post(`${ADMIN}/editions/${editionId}/draw`));
  for (const firstName of NAMES) {
    state.contexts[firstName] = await login(browser, firstName);
  }
});

test.afterAll(async () => {
  await state.admin?.dispose();
  await Promise.all(
    Object.values(state.contexts).map((context) => context.close()),
  );
});

test('a list made from my Secret Santa has me on it, first, and starts from last year’s', async () => {
  const api = as('Inès').request;
  // Last year's list: Inès and Léo, an idea each.
  await listWithMe(
    api,
    { title: 'Noël 2025', eventDate: '2025-12-25' },
    'Léo',
    { mine: ['Un bon couteau de cuisine'], theirs: ['Circuit de billes'] },
  );
  // No list of this year where she figures: no question, a new list.
  const page = await open('Inès', `/p/${state.tokens['Inès']}/liste`);
  await expect(page).toHaveURL(/\/listes\/[^/?]+$/);
  await hydrated(page);
  state.inesList = page.url().split('/listes/')[1] ?? '';
  await expect(page.getByTestId('share-stage')).toContainText(
    'Seul celui qui t’a tiré la voit',
  );
  // She is on it already, alone, with her Secret Santa under her name.
  const people = page.getByTestId('list-person');
  await expect(people).toHaveCount(1);
  await expect(people.first()).toContainText('Inès');
  await expect(people.first()).toContainText('Moi');
  const santa = people.first().getByTestId('person-santa');
  await expect(santa).toHaveText('Secret Santa · Famille Lilas');
  await expect(santa).toHaveAttribute('href', `/p/${state.tokens['Inès']}`);
  // « Repartir d'une liste », under her, before « Ajouter quelqu'un »:
  // last year's list, where she figures (Q-032).
  const block = page.getByTestId('resume-from');
  const old = block.getByTestId('resume-list').filter({ hasText: 'Noël 2025' });
  await expect(old).toContainText('Léo et moi · 2 idées pas encore offertes');
  await old.click();
  // She is there once, first; Léo comes after; her idea under her name.
  await expect(people).toHaveCount(2);
  await expect(people.nth(0)).toContainText('Inès');
  await expect(people.nth(0).getByTestId('idea-text')).toHaveText([
    'Un bon couteau de cuisine',
  ]);
  await expect(people.nth(1)).toContainText('Léo');
  await expect(people.nth(1).getByTestId('idea-text')).toHaveText([
    'Circuit de billes',
  ]);
  // The list is read already: no mark of the time of a draft.
  await expect(page.getByTestId('idea-carried')).toHaveCount(0);
  await expect(block).toHaveCount(0);
  // Coming back from the Secret Santa gives the same list, no question.
  const again = await ok(await api.get(`/api/p/${state.tokens['Inès']}/list`));
  expect(again).toEqual({ list: state.inesList, choices: [] });
  await page.close();
});

test('a list of this year where I figure is offered, chosen beforehand', async () => {
  const api = as('Hugo').request;
  const mine = await listWithMe(
    api,
    { title: 'Noël 2026', eventDate: '2026-12-25' },
    'Zoé',
    { mine: [], theirs: ['Poupée en tissu'] },
  );
  // A list he holds without being on it is not offered.
  await ok(
    await api.post('/api/lists', {
      data: {
        icon: { emoji: '🎂', color: 'pine' },
        title: 'Pour Zoé seule',
        eventDate: '2026-12-25',
      },
    }),
  );
  const count = async () => {
    const { coming, past } = await ok(await api.get('/api/lists'));
    return coming.length + past.length;
  };
  const before = await count();
  const page = await open('Hugo', `/p/${state.tokens['Hugo']}/liste`);
  const sheet = page.getByRole('dialog', {
    name: 'Quelle liste pour ton Secret Santa ?',
  });
  await expect(sheet).toBeVisible();
  const radios = sheet.getByRole('radio');
  await expect(radios).toHaveCount(2);
  await expect(sheet.getByRole('radio', { name: /Noël 2026/ })).toBeChecked();
  await expect(sheet).toContainText('Pour Zoé et moi');
  await expect(sheet).not.toContainText('Pour Zoé seule');
  await expect(
    sheet.getByRole('radio', { name: 'Une nouvelle liste' }),
  ).not.toBeChecked();
  await sheet.getByRole('button', { name: 'Continuer' }).click();
  // The list chosen opens; nothing is made; the one who drew him sees
  // it on top of what it was.
  await expect(page).toHaveURL(new RegExp(`/listes/${mine}$`));
  await hydrated(page);
  expect(await count()).toBe(before);
  await expect(page.getByTestId('share-stage')).toContainText(
    'Seul celui qui t’a tiré la voit',
  );
  await expect(page.getByTestId('person-santa')).toHaveText(
    'Secret Santa · Famille Lilas',
  );
  // From now on, his list for the event: no question.
  expect(
    await ok(await api.get(`/api/p/${state.tokens['Hugo']}/list`)),
  ).toEqual({ list: mine, choices: [] });
  // Nobody may give a list that is not theirs.
  const theirs = await as('Jules').request.post(
    `/api/p/${state.tokens['Jules']}/list`,
    { data: { list: mine } },
  );
  expect(theirs.status()).toBe(404);
  await page.close();
});

test('the one who drew me reads my part first, and the rest by « Toute la liste »', async () => {
  if (!state.admin) throw new Error('admin context missing');
  // Who gives to Inès.
  const reveals = await Promise.all(
    NAMES.map(async (firstName) => ({
      firstName,
      reveal: await ok(
        await state.admin!.post(`/api/p/${state.tokens[firstName]}/reveal`),
      ),
    })),
  );
  const giver = reveals.find((one) => one.reveal.receiver.name === 'Inès');
  if (!giver) throw new Error('nobody gives to Inès');
  expect(giver.reveal.list.path).toMatch(/[?&]personne=/);
  const page = await open(giver.firstName, giver.reveal.list.path);
  await expect(page.getByTestId('mode-bar')).toHaveAttribute(
    'data-mode',
    'anonymous',
  );
  // Her part alone, under the two choices; her name chosen.
  const filter = page.getByTestId('list-filter');
  await expect(filter.getByRole('radio', { name: 'Inès' })).toBeChecked();
  const people = page.getByTestId('visitor-person');
  await expect(people).toHaveCount(1);
  await expect(people.first()).toContainText('Un bon couteau de cuisine');
  await expect(page.locator('body')).not.toContainText('Circuit de billes');
  await expect(page.locator('body')).not.toContainText(/tu as tiré/i);
  // « Toute la liste »: everyone, her first, kept in the address.
  await filter.getByText('Toute la liste').click();
  await expect(page).toHaveURL(/[?&]tout=1/);
  await expect(people).toHaveCount(2);
  await expect(people.nth(0)).toContainText('Inès');
  await expect(people.nth(1)).toContainText('Circuit de billes');
  // « Retour » then « Suivant » find it again.
  await page.goto('/');
  await hydrated(page);
  await page.goBack();
  await hydrated(page);
  await expect(page).toHaveURL(/[?&]tout=1/);
  await expect(people).toHaveCount(2);
  await expect(
    page
      .getByTestId('list-filter')
      .getByRole('radio', { name: 'Toute la liste' }),
  ).toBeChecked();
  // Arrived by another way, the whole list, without the two choices.
  const token = giver.reveal.list.path.split('?')[0];
  await page.goto(token);
  await hydrated(page);
  await expect(page.getByTestId('list-filter')).toHaveCount(0);
  await expect(people).toHaveCount(2);
  await page.close();
});
