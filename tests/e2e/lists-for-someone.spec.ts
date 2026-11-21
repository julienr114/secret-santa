import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// « Cocher pour quelqu'un » (21 November 2026, maquettes ListeCocherPour*):
// those who hold a list say who gives an idea, in their place, in the
// sheet « Qui l'offre ? »: someone the app knows (the tick is theirs), a
// first name written (nobody else reads it), a first name with an address
// (the tick waits for that account, and the answer never says whether it
// has one). Several make a gift given by several, as today, which those
// who hold the list close. An anonymous tick is never named.
test.describe.configure({ mode: 'serial' });

const CAMILLE = 'forsome-camille@example.com';
const HUGO = 'forsome-hugo@example.com';
const MAMIE = 'forsome-mamie@example.com';
const TONTON = 'forsome-tonton@example.com';
const ZOE = 'forsome-zoe@example.com';
const KNOWN = 'forsome-known@example.com';
const PARRAIN = 'forsome-parrain@example.com';
type Idea = 'velo' | 'puzzle' | 'livres' | 'lego' | 'train' | 'dino' | 'jeu';
const state: {
  ctx: Partial<
    Record<'camille' | 'hugo' | 'mamie' | 'tonton' | 'zoe', BrowserContext>
  >;
  listId: string;
  token: string;
  ideas: Record<Idea, string>;
} = {
  ctx: {},
  listId: '',
  token: '',
  ideas: {
    velo: '',
    puzzle: '',
    livres: '',
    lego: '',
    train: '',
    dino: '',
    jeu: '',
  },
};

const ctx = (who: keyof typeof state.ctx): BrowserContext => {
  const context = state.ctx[who];
  if (!context) throw new Error(`${who} is not logged in`);
  return context;
};
/** What an account sees of an idea, by the link. */
const seenBy = async (who: BrowserContext, idea: Idea) => {
  const doc = await (await who.request.get(`/api/l/${state.token}`)).json();
  return doc.people
    .flatMap((person: { ideas: { id: string }[] }) => person.ideas)
    .find((line: { id: string }) => line.id === state.ideas[idea]);
};
/** The document of one who holds the list, as the server sends it. */
const documentOf = async (who: BrowserContext) =>
  (await who.request.get(`/api/lists/${state.listId}`)).json();
const ideaOf = async (who: BrowserContext, idea: Idea) =>
  (await documentOf(who)).people
    .flatMap((person: { ideas: { id: string }[] }) => person.ideas)
    .find((line: { id: string }) => line.id === state.ideas[idea]);
const openDocument = async (who: BrowserContext): Promise<Page> => {
  const page = await who.newPage();
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  return page;
};
const line = (page: Page, text: string) =>
  page.locator('[data-drag="idea"]').filter({ hasText: text });
const sheet = (page: Page) => page.getByTestId('who-sheet');

test.beforeAll(async ({ browser }) => {
  const login = async (email: string, firstName: string) => {
    const context = await browser.newContext();
    await apiLogin(context.request, email);
    await context.request.put('/api/auth/profile', {
      data: { firstName, avatarEmoji: '🦌', avatarColor: 'plum' },
    });
    return context;
  };
  state.ctx.camille = await login(CAMILLE, 'Camille');
  state.ctx.hugo = await login(HUGO, 'Hugo');
  state.ctx.mamie = await login(MAMIE, 'Mamie');
  state.ctx.tonton = await login(TONTON, 'Tonton');
  state.ctx.zoe = await login(ZOE, 'Zoé');
  // An address that has an account, never named here otherwise.
  await (await login(KNOWN, 'Connu')).close();
  const api = ctx('camille').request;
  const { id } = await (
    await api.post('/api/lists', {
      data: {
        icon: { emoji: '🎄', color: 'pine' },
        title: 'Noël pour quelqu’un',
      },
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
    velo: await idea('Vélo 16 pouces'),
    puzzle: await idea('Puzzle de la jungle'),
    livres: await idea('Livres sur les dinosaures'),
    lego: await idea('Boîte de Lego'),
    train: await idea('Petit train en bois'),
    dino: await idea('Dinosaure en peluche'),
    jeu: await idea('Jeu de cartes'),
  };
  const { token } = await (
    await api.post(`/api/lists/${id}/share`, { data: {} })
  ).json();
  // Hugo holds the list with Camille: invited, and coming.
  await api.post(`/api/lists/${id}/holders`, { data: { email: HUGO } });
  await ctx('hugo').request.get('/api/lists');
  // Mamie and Tonton ticked on the list under their name; Tonton also
  // gives one anonymously.
  const tick = (who: BrowserContext, data: Record<string, unknown>) =>
    who.request.post(`/api/l/${token}/claims`, { data });
  await tick(ctx('mamie'), { ideaId: ideas.livres });
  await tick(ctx('tonton'), { ideaId: ideas.jeu });
  await tick(ctx('tonton'), { ideaId: ideas.dino, anonymous: true });
  Object.assign(state, { listId: id, token, ideas });
});

test.afterAll(async () => {
  await Promise.all(Object.values(state.ctx).map((context) => context.close()));
});

test('ticking stays one gesture, then Mamie takes my place', async () => {
  const page = await openDocument(ctx('camille'));
  const velo = line(page, 'Vélo 16 pouces');
  await velo
    .getByRole('checkbox', { name: 'Je l’offre : Vélo 16 pouces' })
    .click();
  // As before: mine, at once, with « Tu l'offres ».
  await expect(velo.getByTestId('idea-mine')).toBeVisible();
  // The note of a first tick on this device steps aside.
  const understood = page.getByRole('button', { name: 'Compris' });
  if (await understood.isVisible()) await understood.click();
  await velo.getByTestId('idea-mine').click();
  await expect(sheet(page)).toBeVisible();
  await expect(page.getByTestId('who-trace')).toHaveText(
    'Coché par toi, aujourd’hui',
  );
  await expect(page.getByText('Vélo 16 pouces · pour Léo')).toBeVisible();
  // « Moi » first, those who hold the list with me, those who ticked.
  await expect(sheet(page).getByTestId('who-person')).toHaveText([
    /Moi/,
    /Hugo\s*Tient la liste avec toi/,
    /Mamie/,
    /Tonton/,
  ]);
  const me = sheet(page).getByRole('radio', { name: 'Moi' });
  await expect(me).toBeChecked();
  // No « On est au complet » for one person.
  await expect(page.getByTestId('who-full')).toHaveCount(0);
  await sheet(page).getByRole('radio', { name: 'Mamie' }).click();
  await expect(me).not.toBeChecked();
  await page.getByTestId('who-save').click();
  await expect(sheet(page)).toBeHidden();
  // The line says « Mamie », as if she had ticked herself, and is touched.
  await expect(velo.getByTestId('idea-who')).toHaveText('Mamie');
  await expect(velo.getByTestId('idea-mine')).toHaveCount(0);
  await expect(
    velo.getByRole('button', {
      name: 'Offert par Mamie Vélo 16 pouces : changer qui l’offre',
    }),
  ).toBeVisible();
  // Touched again: noted by me, today.
  await velo.getByTestId('idea-givers').click();
  await expect(page.getByTestId('who-trace')).toHaveText(
    'Noté par toi, aujourd’hui',
  );
  await page.close();
});

test('Mamie sees it is hers, and may untick it', async () => {
  expect((await seenBy(ctx('mamie'), 'velo')).view).toMatchObject({
    kind: 'mine',
  });
  // A visitor reads « C'est pris », nothing more.
  expect((await seenBy(ctx('zoe'), 'velo')).view).toEqual({
    kind: 'taken',
    by: null,
  });
  const left = await ctx('mamie').request.delete(
    `/api/l/${state.token}/claims/${state.ideas.velo}`,
  );
  expect(left.status()).toBe(200);
  expect((await seenBy(ctx('mamie'), 'velo')).view.kind).toBe('free');
});

test('a first name written: those who hold the list read it, nobody else', async () => {
  const page = await openDocument(ctx('camille'));
  const puzzle = line(page, 'Puzzle de la jungle');
  await puzzle
    .getByRole('checkbox', { name: 'Je l’offre : Puzzle de la jungle' })
    .click();
  await puzzle.getByTestId('idea-mine').click();
  await page.getByTestId('who-someone-else').click();
  const other = page.getByTestId('who-other');
  await other.getByLabel('Son prénom').fill('Tata');
  await expect(
    other.getByText(
      'Avec son adresse, il retrouvera ce cadeau en se connectant. Aucun email ne lui est envoyé.',
    ),
  ).toBeVisible();
  await other.getByRole('button', { name: 'Ajouter' }).click();
  // Added last, chosen in my place, without an address.
  const tata = sheet(page).getByTestId('who-person').last();
  await expect(tata).toContainText('Pas d’adresse email');
  await expect(sheet(page).getByRole('radio', { name: 'Tata' })).toBeChecked();
  await expect(
    sheet(page).getByRole('radio', { name: 'Moi' }),
  ).not.toBeChecked();
  await page.getByTestId('who-save').click();
  await expect(puzzle.getByTestId('idea-who')).toHaveText('Tata');
  await page.close();

  // A visitor: « C'est pris », and not a word of Tata.
  const visitor = await seenBy(ctx('zoe'), 'puzzle');
  expect(visitor.view).toEqual({ kind: 'taken', by: null });
  expect(
    JSON.stringify(
      await (await ctx('zoe').request.get(`/api/l/${state.token}`)).json(),
    ),
  ).not.toContain('Tata');
  // Hugo, who holds the list with Camille, reads « Tata »; and the planned
  // gifts count her tick like the others.
  const hugo = await openDocument(ctx('hugo'));
  await expect(
    line(hugo, 'Puzzle de la jungle').getByTestId('idea-who'),
  ).toHaveText('Tata');
  const doc = await documentOf(ctx('hugo'));
  expect(doc.planned).toBe(4);
  // Offered again on this list, for not writing it again.
  expect(
    doc.candidates.find((c: { name: string }) => c.name === 'Tata'),
  ).toMatchObject({ kind: 'written', email: null });
  await hugo.close();
});

test('a first name with an address: the same answer, account or not, and it becomes theirs', async ({
  browser,
}) => {
  const api = ctx('camille').request;
  const put = (idea: Idea, email: string) =>
    api.put(`/api/lists/${state.listId}/claims/${state.ideas[idea]}/givers`, {
      data: {
        from: [],
        givers: [{ name: 'Parrain', email }],
        mode: 'alone',
        closed: false,
      },
    });
  const known = await put('train', KNOWN);
  const unknown = await put('velo', PARRAIN);
  expect(known.status()).toBe(unknown.status());
  expect(await known.json()).toEqual(await unknown.json());
  expect(await unknown.json()).toEqual({ ok: true });
  // What the document says of both is the name written, and nothing of an
  // account behind the first one.
  const doc = await documentOf(ctx('camille'));
  const parrains = doc.candidates.filter(
    (c: { name: string }) => c.name === 'Parrain',
  );
  expect(parrains.map((c: { email: string }) => c.email).toSorted()).toEqual(
    [KNOWN, PARRAIN].toSorted(),
  );
  expect(new Set(parrains.map((c: { kind: string }) => c.kind))).toEqual(
    new Set(['written']),
  );

  // Parrain logs in later with that address, and finds the bike his.
  const context = await browser.newContext();
  await apiLogin(context.request, PARRAIN);
  expect((await seenBy(context, 'velo')).view).toMatchObject({ kind: 'mine' });
  await context.close();
  // Those who hold the list still read the name written.
  const page = await openDocument(ctx('camille'));
  await expect(line(page, 'Vélo 16 pouces').getByTestId('idea-who')).toHaveText(
    'Parrain',
  );
  await page.close();
});

test('several: a visitor joins until « On est au complet »', async () => {
  const page = await openDocument(ctx('camille'));
  const lego = line(page, 'Boîte de Lego');
  await lego
    .getByRole('checkbox', { name: 'Je l’offre : Boîte de Lego' })
    .click();
  await lego.getByTestId('idea-mine').click();
  await page.getByTestId('who-mode').getByText('Plusieurs').click();
  // Boxes now, and « On est au complet », off.
  await expect(page.getByTestId('who-full')).toContainText(
    'D’autres peuvent encore se joindre',
  );
  await sheet(page).getByRole('checkbox', { name: 'Moi' }).click();
  await sheet(page).getByRole('checkbox', { name: 'Mamie' }).click();
  await sheet(page).getByRole('checkbox', { name: 'Tonton' }).click();
  await page.getByTestId('who-save').click();
  await expect(lego.getByTestId('idea-who')).toHaveText(['Mamie', 'Tonton']);
  // A visitor may join: Mamie and Tonton show, the group is open.
  expect((await seenBy(ctx('zoe'), 'lego')).view).toMatchObject({
    kind: 'group',
    closed: false,
    people: [{ name: 'Mamie' }, { name: 'Tonton' }],
  });
  // Closed from the first names.
  await lego.getByTestId('idea-givers').click();
  await expect(page.getByTestId('who-trace')).toHaveText(
    'Noté par toi, aujourd’hui',
  );
  await page.getByTestId('who-full').getByRole('switch').click();
  await expect(page.getByTestId('who-full')).toContainText(
    'Plus personne ne peut se joindre',
  );
  await page.getByTestId('who-save').click();
  await expect(lego.getByTestId('idea-closed')).toBeVisible();
  await page.close();
  expect((await seenBy(ctx('zoe'), 'lego')).view).toMatchObject({
    kind: 'group',
    closed: true,
  });
  const join = await ctx('zoe').request.post(`/api/l/${state.token}/claims`, {
    data: { ideaId: state.ideas.lego },
  });
  expect(join.status()).toBe(409);
});

test('those who hold the list close a gift Mamie proposed herself', async () => {
  // The train was Parrain's (the address with an account): freed, then
  // Mamie proposes it to several.
  await ctx('camille').request.delete(
    `/api/lists/${state.listId}/claims/${state.ideas.train}?claim=${
      (await ideaOf(ctx('camille'), 'train')).claims[0].id
    }`,
  );
  await ctx('mamie').request.post(`/api/l/${state.token}/claims`, {
    data: { ideaId: state.ideas.train, mode: 'group' },
  });
  const train = await ideaOf(ctx('camille'), 'train');
  expect(train.who).toMatchObject({
    mode: 'group',
    closed: false,
    trace: { kind: 'proposed', by: 'Mamie' },
  });
  const closed = await ctx('camille').request.put(
    `/api/lists/${state.listId}/claims/${state.ideas.train}/givers`,
    {
      data: {
        from: train.who.keys,
        givers: train.who.keys.map((key: string) => ({ key })),
        mode: 'group',
        closed: true,
      },
    },
  );
  expect(closed.status()).toBe(200);
  expect((await seenBy(ctx('zoe'), 'train')).view).toMatchObject({
    kind: 'group',
    closed: true,
  });
  // Still Mamie's, who leads it.
  expect((await seenBy(ctx('mamie'), 'train')).view).toMatchObject({
    kind: 'group',
    leads: true,
  });
});

test('an anonymous tick opens nothing, and no answer says whose it is', async () => {
  const page = await openDocument(ctx('camille'));
  const dino = line(page, 'Dinosaure en peluche');
  await expect(dino.getByTestId('idea-who')).toHaveText('Anonyme');
  await expect(dino.getByTestId('idea-givers')).toHaveCount(0);
  await page.close();
  const idea = await ideaOf(ctx('camille'), 'dino');
  expect(idea.who).toBeNull();
  expect(JSON.stringify(idea)).not.toContain('Tonton');
  const refused = await ctx('camille').request.put(
    `/api/lists/${state.listId}/claims/${state.ideas.dino}/givers`,
    {
      data: {
        from: [],
        givers: [{ name: 'Tata', email: null }],
        mode: 'alone',
        closed: false,
      },
    },
  );
  expect(refused.status()).toBe(409);
  const body = await refused.text();
  expect(body).not.toContain('Tonton');
  expect(body).not.toContain(TONTON);
  // A visitor, and even Hugo, are not let in.
  const visitor = await ctx('zoe').request.put(
    `/api/lists/${state.listId}/claims/${state.ideas.jeu}/givers`,
    {
      data: {
        from: [],
        givers: [{ name: 'Tata', email: null }],
        mode: 'alone',
        closed: false,
      },
    },
  );
  expect(visitor.status()).toBe(404);
});

test('nobody chosen unticks, with « Annuler »', async () => {
  const page = await openDocument(ctx('camille'));
  const jeu = line(page, 'Jeu de cartes');
  await jeu.getByTestId('idea-givers').click();
  await page.getByTestId('who-mode').getByText('Plusieurs').click();
  await sheet(page).getByRole('checkbox', { name: 'Tonton' }).click();
  await page.getByTestId('who-save').click();
  await expect(
    page.getByText('Coche de Tonton retirée', { exact: true }),
  ).toBeVisible();
  await expect(jeu.getByTestId('idea-who')).toHaveCount(0);
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(jeu.getByTestId('idea-who')).toHaveText('Tonton');
  expect((await seenBy(ctx('tonton'), 'jeu')).view.kind).toBe('mine');
  await page.close();
});
