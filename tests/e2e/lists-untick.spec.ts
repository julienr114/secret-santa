import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// Those who hold a list untick for someone (Corrections 25 and 30, README
// 22.19, maquettes ListeDecocherCase, ListeDecocheFait): the grey box of
// a ticked idea unticks at once, with « Annuler »; the first names are
// pills to read only; an anonymous tick goes without saying whose it was;
// a gift given by several goes whole, and « Annuler » puts it back as it
// was.
test.describe.configure({ mode: 'serial' });

const CAMILLE = 'untick-camille@example.com';
const MAMIE = 'untick-mamie@example.com';
const HUGO = 'untick-hugo@example.com';
const state: {
  camille?: BrowserContext;
  mamie?: BrowserContext;
  hugo?: BrowserContext;
  listId: string;
  token: string;
  ideas: Record<'billes' | 'pompier' | 'velo', string>;
} = { listId: '', token: '', ideas: { billes: '', pompier: '', velo: '' } };

/** What an account sees of an idea, by the link. */
const seenBy = async (who: BrowserContext, ideaId: string) => {
  const doc = await (await who.request.get(`/api/l/${state.token}`)).json();
  return doc.people
    .flatMap((person: { ideas: { id: string }[] }) => person.ideas)
    .find((idea: { id: string }) => idea.id === ideaId).view;
};
const document = async (): Promise<Page> => {
  if (!state.camille) throw new Error('Camille is not logged in');
  const page = await state.camille.newPage();
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  return page;
};
const line = (page: Page, text: string) =>
  page.locator('[data-drag="idea"]').filter({ hasText: text });

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
  state.hugo = await login(HUGO, 'Hugo');
  const api = state.camille.request;
  const { id } = await (
    await api.post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, title: 'Noël à décocher' },
    })
  ).json();
  const leo = await (
    await api.post(`/api/lists/${id}/people`, {
      data: {
        newMember: { firstName: 'Léo', avatar: { emoji: '🚀', color: 'pine' } },
      },
    })
  ).json();
  const idea = async (text: string) =>
    (
      await (
        await api.post(`/api/lists/${id}/ideas`, {
          data: { listPersonId: leo.id, text },
        })
      ).json()
    ).id;
  const ideas = {
    billes: await idea('Circuit de billes'),
    pompier: await idea('Déguisement de pompier'),
    velo: await idea('Vélo 16 pouces'),
  };
  const { token } = await (
    await api.post(`/api/lists/${id}/share`, { data: {} })
  ).json();
  // Mamie gives one under her name and one anonymously; the bike is
  // given by Mamie and Hugo together.
  const tick = (who: BrowserContext, data: Record<string, unknown>) =>
    who.request.post(`/api/l/${token}/claims`, { data });
  await tick(state.mamie, { ideaId: ideas.billes });
  await tick(state.mamie, { ideaId: ideas.pompier, anonymous: true });
  await tick(state.mamie, { ideaId: ideas.velo, mode: 'group' });
  await tick(state.hugo, { ideaId: ideas.velo, mode: 'group' });
  // « On est au complet »: nobody may join, the box is grey.
  await state.mamie.request.patch(`/api/l/${token}/claims/${ideas.velo}`, {
    data: { closed: true },
  });
  Object.assign(state, { listId: id, token, ideas });
});

test.afterAll(async () => {
  await state.camille?.close();
  await state.mamie?.close();
  await state.hugo?.close();
});

test('the grey box unticks at once, with « Annuler »', async () => {
  const page = await document();
  const billes = line(page, 'Circuit de billes');
  // The first name is a pill to read, not a button.
  await expect(billes.getByTestId('idea-who')).toHaveText('Mamie');
  await expect(billes.getByRole('button', { name: 'Mamie' })).toHaveCount(0);
  const box = billes.getByRole('checkbox', {
    name: 'Décocher : coché par Mamie',
  });
  await box.click();
  // No question: the idea is free again, and the toast is the net.
  await expect(billes.getByTestId('idea-who')).toHaveCount(0);
  await expect(billes.getByTestId('idea-text')).not.toHaveClass(/line-through/);
  await expect(
    page.getByText('Coche de Mamie retirée', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(billes.getByTestId('idea-who')).toHaveText('Mamie');
  // Given up: her tick never left, same way, same date.
  if (!state.mamie) throw new Error('Mamie is not logged in');
  expect(await seenBy(state.mamie, state.ideas.billes)).toMatchObject({
    kind: 'mine',
  });

  // For good this time: once « Annuler » is gone, the server is told.
  await box.click();
  await expect(billes.getByTestId('idea-who')).toHaveCount(0);
  await expect
    .poll(async () => (await seenBy(state.mamie!, state.ideas.billes)).kind, {
      timeout: 12_000,
    })
    .toBe('free');
  await page.close();
});

test('an anonymous tick goes too, and says nothing of whose it was', async () => {
  const page = await document();
  const pompier = line(page, 'Déguisement de pompier');
  await expect(pompier.getByTestId('idea-who')).toHaveText('Anonyme');
  await pompier
    .getByRole('checkbox', { name: 'Décocher : coché en anonyme' })
    .click();
  await expect(
    page.getByText('Coche anonyme retirée', { exact: true }),
  ).toBeVisible();
  await expect(pompier.getByTestId('idea-who')).toHaveCount(0);
  // What the document was sent never named her on that line.
  const doc = await (
    await page.request.get(`/api/lists/${state.listId}`)
  ).json();
  const sent = doc.people[0].ideas.find(
    (idea: { id: string }) => idea.id === state.ideas.pompier,
  );
  expect(JSON.stringify(sent)).not.toContain('Mamie');
  await expect
    .poll(async () => (await seenBy(state.mamie!, state.ideas.pompier)).kind, {
      timeout: 12_000,
    })
    .toBe('free');
  await page.close();
});

test('a gift given by several goes whole, and comes back whole', async () => {
  // Twice the time « Annuler » stays.
  test.setTimeout(60_000);
  const page = await document();
  const velo = line(page, 'Vélo 16 pouces');
  await expect(velo.getByTestId('idea-who')).toHaveText(['Mamie', 'Hugo']);
  await expect(velo.getByTestId('idea-pills')).toContainText(
    'Offert par Mamie et Hugo',
  );
  const box = velo.getByRole('checkbox', {
    name: 'Décocher : coché par Mamie et Hugo',
  });
  await box.click();
  await expect(velo.getByTestId('idea-who')).toHaveCount(0);
  await expect(
    page.getByText('Coche de Mamie et Hugo retirée', { exact: true }),
  ).toBeVisible();
  // « Annuler »: the same people, as they were.
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(velo.getByTestId('idea-who')).toHaveText(['Mamie', 'Hugo']);
  expect(await seenBy(state.hugo!, state.ideas.velo)).toMatchObject({
    kind: 'group',
    closed: true,
  });
  // For good: all of them.
  await box.click();
  await expect(velo.getByTestId('idea-who')).toHaveCount(0);
  await expect
    .poll(async () => (await seenBy(state.hugo!, state.ideas.velo)).kind, {
      timeout: 15_000,
    })
    .toBe('free');
  await page.close();
});

test('a visitor still takes off their own tick only', async () => {
  if (!state.mamie || !state.hugo || !state.camille) {
    throw new Error('not logged in');
  }
  await state.mamie.request.post(`/api/l/${state.token}/claims`, {
    data: { ideaId: state.ideas.billes },
  });
  const doc = await (
    await state.camille.request.get(`/api/lists/${state.listId}`)
  ).json();
  const [claim] = doc.people[0].ideas.find(
    (idea: { id: string }) => idea.id === state.ideas.billes,
  ).claims;
  expect(claim.by).toBe('Mamie');
  // By the link, nobody is offered the tick of another…
  const visitor = await (
    await state.hugo.request.get(`/api/l/${state.token}`)
  ).json();
  expect(
    visitor.people[0].ideas.every(
      (idea: { claims: unknown[] }) => idea.claims.length === 0,
    ),
  ).toBe(true);
  // … and naming it changes nothing: Hugo does not hold the list.
  const held = await state.hugo.request.delete(
    `/api/lists/${state.listId}/claims/${state.ideas.billes}?claim=${claim.id}`,
  );
  expect(held.status()).toBe(404);
  await state.hugo.request.delete(
    `/api/l/${state.token}/claims/${state.ideas.billes}?claim=${claim.id}`,
  );
  expect(await seenBy(state.mamie, state.ideas.billes)).toMatchObject({
    kind: 'mine',
  });
  // A tick that is not on that idea is not found.
  const wrong = await state.camille.request.delete(
    `/api/lists/${state.listId}/claims/${state.ideas.velo}?claim=${claim.id}`,
  );
  expect(wrong.status()).toBe(404);
  // Those who hold the list take it off, named.
  const done = await state.camille.request.delete(
    `/api/lists/${state.listId}/claims/${state.ideas.billes}?claim=${claim.id}`,
  );
  expect(done.status()).toBe(200);
  expect((await seenBy(state.mamie, state.ideas.billes)).kind).toBe('free');
});
