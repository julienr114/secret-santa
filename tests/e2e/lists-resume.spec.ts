import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// Taking a list up again (lot 27, README 22.20, maquettes
// ListeNouvelleReprendre, ListeReprise): a new list starts from an old
// one with its icon, its word, its people and the ideas nobody ticked;
// each idea taken carries a small mark, for those who hold the list,
// which goes when the idea is changed, and for all at the first share.
test.describe.configure({ mode: 'serial' });

const CAMILLE = 'resume-camille@example.com';
const MAMIE = 'resume-mamie@example.com';
const VOISIN = 'resume-voisin@example.com';
const state: {
  camille?: BrowserContext;
  voisin?: BrowserContext;
  oldId: string;
  newId: string;
} = { oldId: '', newId: '' };
const api = () => {
  if (!state.camille) throw new Error('Camille is not logged in');
  return state.camille.request;
};
const open = async (path: string): Promise<Page> => {
  if (!state.camille) throw new Error('Camille is not logged in');
  const page = await state.camille.newPage();
  await page.goto(path);
  await hydrated(page);
  return page;
};
const person = (page: Page, name: string) =>
  page
    .getByTestId('list-person')
    .filter({ has: page.getByRole('heading', { name }) });

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
  state.voisin = await login(VOISIN, 'Voisin');
  const mamie = await login(MAMIE, 'Mamie');
  const { id } = await (
    await api().post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'night' }, title: 'Noël 2025' },
    })
  ).json();
  await api().patch(`/api/lists/${id}`, {
    data: { note: 'Pas de peluches cette année.' },
  });
  const add = async (firstName: string, emoji: string) =>
    (
      await api().post(`/api/lists/${id}/people`, {
        data: { newMember: { firstName, avatar: { emoji, color: 'pine' } } },
      })
    ).json();
  const idea = async (listPersonId: string, text: string) =>
    (
      await (
        await api().post(`/api/lists/${id}/ideas`, {
          data: { listPersonId, text },
        })
      ).json()
    ).id;
  const leo = await add('Léo', '🚀');
  const zoe = await add('Zoé', '🦄');
  await idea(leo.id, 'Livres sur les dinosaures');
  const circuit = await idea(leo.id, 'Circuit de billes');
  await idea(leo.id, 'Un télescope pour enfant');
  await idea(zoe.id, 'Poupée en tissu');
  const { token } = await (
    await api().post(`/api/lists/${id}/share`, { data: {} })
  ).json();
  // Mamie gives the marble run, and a gift off the list.
  await mamie.request.post(`/api/l/${token}/claims`, {
    data: { ideaId: circuit },
  });
  await mamie.request.post(`/api/l/${token}/off-list`, {
    data: { listPersonId: zoe.id, text: 'Une surprise' },
  });
  await mamie.close();
  state.oldId = id;
});

test.afterAll(async () => {
  await state.camille?.close();
  await state.voisin?.close();
});

test('an empty new list starts from an old one', async () => {
  // A new Christmas list: the old one, a Christmas too, looks like it
  // (ticket 119).
  const { id } = await (
    await api().post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, title: '' },
    })
  ).json();
  state.newId = id;
  const page = await open(`/listes/${id}?nouvelle=1`);
  // « Repartir d'une liste »: my lists that look like it, with the first
  // names of their people and what each would bring.
  const block = page.getByTestId('resume-from');
  await expect(block.getByRole('heading')).toHaveText('Repartir d’une liste');
  const old = block.getByTestId('resume-list').filter({ hasText: 'Noël 2025' });
  await expect(old).toContainText('Léo et Zoé · 3 idées pas encore offertes');
  await old.click();

  // The people, in their order, with the ideas nobody ticked.
  await expect(page.getByTestId('list-person')).toHaveCount(2);
  await expect(person(page, 'Léo').getByTestId('idea-text')).toHaveText([
    'Livres sur les dinosaures',
    'Un télescope pour enfant',
  ]);
  await expect(person(page, 'Zoé').getByTestId('idea-text')).toHaveText([
    'Poupée en tissu',
  ]);
  // Neither the gift ticked, nor the one off the list, nor who gave.
  await expect(page.locator('body')).not.toContainText('Circuit de billes');
  await expect(page.getByTestId('holder-off-list')).toHaveCount(0);
  await expect(page.getByTestId('idea-who')).toHaveCount(0);
  // The block is gone: the list is no longer empty.
  await expect(block).toHaveCount(0);
  // Where it comes from, and the mark on each idea taken.
  await expect(page.getByTestId('resumed-from')).toContainText(
    'Reprise de Noël 2025. Les idées marquées',
  );
  await expect(page.getByTestId('resumed-from')).toContainText(
    'Toi seul vois cette marque.',
  );
  await expect(page.getByTestId('idea-carried')).toHaveCount(3);

  // The icon and the word came; the name and the day are to be filled in.
  const doc = await (await api().get(`/api/lists/${state.newId}`)).json();
  expect(doc.list.icon).toEqual({ emoji: '🎄', color: 'night' });
  expect(doc.list.note).toEqual({
    kind: 'text',
    text: 'Pas de peluches cette année.',
  });
  expect(doc.list.title).toBe('');
  expect(doc.list.eventDate).toBeNull();
  expect(doc.list.status).toBe('draft');
  // The old list did not change.
  const before = await (await api().get(`/api/lists/${state.oldId}`)).json();
  expect(before.people[0].ideas).toHaveLength(3);
  expect(before.planned).toBe(2);
  expect(before.resumedFrom).toBeNull();

  // An idea changed is no longer the one taken: its mark goes.
  const telescope = person(page, 'Léo')
    .getByTestId('idea-text')
    .filter({ hasText: 'Un télescope pour enfant' });
  await telescope.click();
  await page.keyboard.type(' (petit)');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('idea-carried')).toHaveCount(2);

  // Shared for the first time: every mark goes, and the sentence with it.
  await page.getByTestId('list-title').fill('Noël 2026');
  await page.getByTestId('list-title').press('Enter');
  // The name is saved as it is typed: sharing waits for it.
  await expect
    .poll(
      async () =>
        (await (await api().get(`/api/lists/${state.newId}`)).json()).list
          .title,
    )
    .toBe('Noël 2026');
  await page.getByTestId('share-open').click();
  const sheet = page.getByTestId('sharing-panel');
  await sheet.getByTestId('sharing-everyone').getByRole('switch').click();
  await sheet.getByTestId('sharing-save').click();
  await expect(page.getByTestId('share-stage')).toContainText('Publique');
  await expect(page.getByTestId('idea-carried')).toHaveCount(0);
  await expect(page.getByTestId('resumed-from')).toHaveCount(0);
  await page.close();
});

test('a past list is taken up again from its document', async () => {
  // Not past yet: no button.
  const early = await open(`/listes/${state.oldId}`);
  await expect(early.getByTestId('resume-again')).toHaveCount(0);
  await early.close();
  await api().patch(`/api/lists/${state.oldId}`, {
    data: { eventDate: '2025-12-25' },
  });
  const page = await open(`/listes/${state.oldId}`);
  await page.getByTestId('resume-again').click();
  await expect(page).toHaveURL(/nouvelle=1/);
  const created = new URL(page.url()).pathname.split('/').at(-1);
  expect(created).not.toBe(state.oldId);
  await expect(page.getByTestId('list-person')).toHaveCount(2);
  await expect(page.getByTestId('idea-carried')).toHaveCount(3);
  await expect(page.getByTestId('resumed-from')).toContainText(
    'Reprise de Noël 2025.',
  );
  // The old one is as it was, still shared.
  const old = await (await api().get(`/api/lists/${state.oldId}`)).json();
  expect(old.list.title).toBe('Noël 2025');
  expect(old.list.status).toBe('past');
  expect(old.planned).toBe(2);
  await page.close();
});

test('only an empty draft starts from a list, and only from one I hold', async () => {
  // The new list has people now: nothing is mixed into it.
  const full = await api().post(`/api/lists/${state.newId}/resume`, {
    data: { from: state.oldId },
  });
  expect(full.status()).toBe(409);
  expect((await full.json()).statusMessage).toBe('list_not_empty');
  // Someone else cannot start from my list, by either way.
  if (!state.voisin) throw new Error('Voisin is not logged in');
  const theirs = await (
    await state.voisin.request.post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' } },
    })
  ).json();
  const stolen = await state.voisin.request.post(
    `/api/lists/${theirs.id}/resume`,
    { data: { from: state.oldId } },
  );
  expect(stolen.status()).toBe(404);
  const created = await state.voisin.request.post('/api/lists', {
    data: { icon: { emoji: '🎄', color: 'pine' }, from: state.oldId },
  });
  expect(created.status()).toBe(404);
  // And what they may start from says nothing of mine.
  const offered = await (
    await state.voisin.request.get(`/api/lists/${theirs.id}/resumable`)
  ).text();
  expect(offered).not.toContain('Noël 2025');
  // By its link, a visitor is told nothing of the marks.
  const mine = await (await api().get(`/api/lists/${state.newId}`)).json();
  const seen = await (
    await state.voisin.request.get(`/api/l/${mine.list.shareToken}`)
  ).json();
  expect(
    seen.people.flatMap((p: { ideas: { carried: boolean }[] }) =>
      p.ideas.map((idea) => idea.carried),
    ),
  ).not.toContain(true);
});
