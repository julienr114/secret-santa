import AxeBuilder from '@axe-core/playwright';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// The last touches of a list before it goes live (Correction 30, README
// 22.19, 22.20, 23, maquettes ListeGroupeFil, ListeGroupeFilDeplie,
// ListeReserverSimple, ListeReserverAnonyme, ListeJOffreAgir,
// ListeCocheGuide): two columns and a thread per person, the paragraph of
// their tastes, the note after the first tick, « Tu l'offres › », the
// sheet of three choices, and what the anonymous mode closes.
test.describe.configure({ mode: 'serial' });

const CAMILLE = 'touches-camille@example.com';
const MAMIE = 'touches-mamie@example.com';
const state: {
  camille?: BrowserContext;
  mamie?: BrowserContext;
  listId: string;
  token: string;
  ideas: Record<'billes' | 'velo' | 'livres', string>;
} = { listId: '', token: '', ideas: { billes: '', velo: '', livres: '' } };

const LATELY =
  'Les dinosaures et les billes, les châteaux forts, les cabanes dans les arbres et tout ce qui roule';

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
  const api = state.camille.request;
  const { id } = await (
    await api.post('/api/lists', {
      data: {
        icon: { emoji: '🎄', color: 'pine' },
        title: 'Noël des retouches',
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
  await api.patch(`/api/family/${leo.memberId}`, {
    data: {
      clothingSize: '6 ans',
      texts: {
        lately: LATELY,
        wouldHelp: 'un cartable pour le CP',
        avoid: 'les peluches, il en a trop',
      },
      answers: { keepOrConsume: 'first', surprise: 'first' },
    },
  });
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
    velo: await idea('Vélo 16 pouces'),
    livres: await idea('Livres sur les dinosaures'),
  };
  const { token } = await (
    await api.post(`/api/lists/${id}/share`, { data: {} })
  ).json();
  Object.assign(state, { listId: id, token, ideas });
});

test.afterAll(async () => {
  await state.camille?.close();
  await state.mamie?.close();
});

const visit = async (): Promise<Page> => {
  if (!state.mamie) throw new Error('Mamie is not logged in');
  const page = await state.mamie.newPage();
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  return page;
};
const line = (page: Page, text: string) =>
  page.getByTestId('visitor-idea').filter({ hasText: text });

test('each person in two columns, a thread, and their tastes in a paragraph', async () => {
  const page = await visit();
  const section = page.getByTestId('visitor-person');
  // The thread is decoration only.
  const thread = section.getByTestId('person-thread');
  await expect(thread).toHaveAttribute('aria-hidden', 'true');
  // Boxes under the middle of the icon, the text on the edge of the name.
  const name = await section
    .getByRole('heading', { name: 'Léo' })
    .boundingBox();
  const box = await line(page, 'Circuit de billes')
    .getByTestId('idea-box')
    .locator('span')
    .boundingBox();
  const text = await line(page, 'Circuit de billes')
    .locator('p')
    .first()
    .boundingBox();
  const along = await thread.boundingBox();
  expect(Math.abs((text?.x ?? 0) - (name?.x ?? 0))).toBeLessThanOrEqual(1);
  expect(
    Math.abs((box?.x ?? 0) + 11 - ((along?.x ?? 0) + 1)),
  ).toBeLessThanOrEqual(1);
  // No more « ses goûts »: a paragraph, three lines at most.
  await expect(section.getByRole('link', { name: 'ses goûts' })).toHaveCount(0);
  await expect(section.locator('header')).toContainText('taille 6 ans');
  const tastes = section.getByTestId('person-tastes-text');
  await expect(tastes).toContainText(
    'En ce moment, les dinosaures et les billes',
  );
  await expect(tastes.locator('strong')).toHaveText(
    LATELY.replace('Les', 'les'),
  );
  const more = section.getByTestId('person-tastes-more');
  await expect(more).toHaveText('Voir plus');
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  const folded = (await tastes.boundingBox())?.height ?? 0;
  expect(folded).toBeLessThanOrEqual(3 * 15 * 1.5 + 1);
  await more.click();
  await expect(more).toHaveText('Voir moins');
  await expect(more).toHaveAttribute('aria-expanded', 'true');
  await expect(tastes).toContainText(
    'À éviter : les peluches, il en a trop. Côté cadeaux, Léo préfère quelque chose à garder plutôt qu’à consommer. Léo aime la surprise.',
  );
  expect((await tastes.boundingBox())?.height ?? 0).toBeGreaterThan(folded);
  // Not kept from one visit to the next.
  await page.reload();
  await hydrated(page);
  await expect(page.getByTestId('person-tastes-more')).toHaveText('Voir plus');
  await page.close();
});

test('the first tick shows its note once, over a veil, and « Tu l’offres › »', async () => {
  const page = await visit();
  await line(page, 'Circuit de billes').getByTestId('idea-box').click();
  const mine = line(page, 'Circuit de billes').getByTestId('idea-mine');
  await expect(mine).toHaveText('Tu l’offres');
  // The pill says it opens something: a line and an arrow.
  await expect(mine.locator('[class*="chevron-right"]')).toHaveCount(1);
  const note = page.getByTestId('tick-notice');
  await expect(note).toContainText('C’est noté');
  await expect(note).toContainText(
    'Touche « Tu l’offres » pour proposer de l’offrir à plusieurs, ou passer en anonyme.',
  );
  const veil = page.getByTestId('tick-veil');
  await expect(veil).toHaveCSS('position', 'fixed');
  await expect(veil).toHaveCSS('pointer-events', 'none');
  const size = page.viewportSize();
  const covered = await veil.boundingBox();
  expect(covered?.width).toBeGreaterThanOrEqual(size?.width ?? 0);
  expect(covered?.height).toBeGreaterThanOrEqual(size?.height ?? 0);
  await page.getByTestId('tick-understood').click();
  await expect(note).toHaveCount(0);
  await expect(veil).toHaveCount(0);
  // The next ticks: nothing, on this device.
  await line(page, 'Livres sur les dinosaures').getByTestId('idea-box').click();
  await expect(
    line(page, 'Livres sur les dinosaures').getByTestId('idea-mine'),
  ).toHaveText('Tu l’offres');
  await expect(note).toHaveCount(0);
  await page.reload();
  await hydrated(page);
  await line(page, 'Livres sur les dinosaures').getByTestId('idea-box').click();
  await expect(
    line(page, 'Livres sur les dinosaures').getByTestId('idea-box'),
  ).toHaveAttribute('aria-checked', 'false');
  await line(page, 'Livres sur les dinosaures').getByTestId('idea-box').click();
  await expect(
    line(page, 'Livres sur les dinosaures').getByTestId('idea-mine'),
  ).toBeVisible();
  await expect(note).toHaveCount(0);
  await page.close();
});

test('one question, three choices, each saying who knows', async () => {
  const page = await visit();
  await line(page, 'Circuit de billes').getByTestId('idea-open').click();
  const sheet = page.getByTestId('claim-sheet');
  await expect(sheet.getByRole('radio')).toHaveCount(3);
  const alone = sheet.getByRole('radio', { name: /^Je l’offre seul Camille/ });
  await expect(alone).toBeChecked();
  await expect(sheet).toContainText(
    'Camille sait que c’est toi. Les autres voient seulement que c’est pris.',
  );
  await expect(sheet).toContainText(
    'Personne ne sait que c’est toi, pas même Camille.',
  );
  await expect(sheet).toContainText(
    'D’autres pourront se joindre à toi, et verront ton prénom.',
  );
  // No more switch « Dire à Camille que c'est moi ».
  await expect(sheet.getByRole('switch')).toHaveCount(0);
  await sheet.getByText('Je l’offre seul, en anonyme').click();
  await page.getByTestId('claim-done').click();
  await expect(sheet).toHaveCount(0);
  await expect(
    line(page, 'Circuit de billes').getByTestId('idea-mine'),
  ).toHaveText('Tu l’offres en anonyme');
  // And back under my name.
  await line(page, 'Circuit de billes').getByTestId('idea-open').click();
  await expect(sheet.getByRole('radio', { name: /en anonyme/ })).toBeChecked();
  await sheet.getByText('Je l’offre seul', { exact: true }).click();
  await page.getByTestId('claim-done').click();
  await expect(
    line(page, 'Circuit de billes').getByTestId('idea-mine'),
  ).toHaveText('Tu l’offres');
  await page.close();
});

test('in anonymous mode, the other choices are closed, on the server too', async () => {
  if (!state.mamie) throw new Error('Mamie is not logged in');
  const api = state.mamie.request;
  await api.put(`/api/l/${state.token}/mode`, { data: { anonymous: true } });
  const page = await visit();
  await line(page, 'Circuit de billes').getByTestId('idea-open').click();
  const sheet = page.getByTestId('claim-sheet');
  await expect(sheet.getByRole('radio', { name: /en anonyme/ })).toBeChecked();
  await expect(
    sheet.getByRole('radio', { name: /^Je l’offre seul Camille/ }),
  ).toBeDisabled();
  await expect(
    sheet.getByRole('radio', { name: /On l’offre à plusieurs/ }),
  ).toBeDisabled();
  await expect(page.getByTestId('claim-anonymous-mode')).toHaveText(
    'Mode anonyme activé. Pour un autre choix, désactive-le en haut de la liste.',
  );
  await page.getByTestId('claim-done').click();
  await expect(
    line(page, 'Circuit de billes').getByTestId('idea-mine'),
  ).toHaveText('Tu l’offres en anonyme');
  await page.close();

  // The server refuses my first name and giving with others.
  const patch = (data: Record<string, unknown>) =>
    api.patch(`/api/l/${state.token}/claims/${state.ideas.billes}`, { data });
  for (const data of [{ anonymous: false }, { mode: 'group' }]) {
    const refused = await patch(data);
    expect(refused.status()).toBe(409);
    expect((await refused.json()).statusMessage).toBe('anonymous_mode');
  }
  const proposed = await api.post(`/api/l/${state.token}/claims`, {
    data: { ideaId: state.ideas.velo, mode: 'group' },
  });
  expect(proposed.status()).toBe(409);
  const named = await api.post(`/api/l/${state.token}/claims`, {
    data: { ideaId: state.ideas.velo, anonymous: false },
  });
  expect(named.status()).toBe(409);
  // Alone and anonymous passes.
  const ticked = await api.post(`/api/l/${state.token}/claims`, {
    data: { ideaId: state.ideas.velo },
  });
  expect(ticked.status()).toBe(201);
  await api.delete(`/api/l/${state.token}/claims/${state.ideas.velo}`);
  // Joining a gift given by several would show my name: refused too.
  await state.camille?.request.post(`/api/lists/${state.listId}/claims`, {
    data: { ideaId: state.ideas.velo, mode: 'group' },
  });
  const joined = await api.post(`/api/l/${state.token}/claims`, {
    data: { ideaId: state.ideas.velo },
  });
  expect(joined.status()).toBe(409);
  await api.put(`/api/l/${state.token}/mode`, { data: { anonymous: false } });
});

test('the holder: the same columns, the thread, the paragraph', async () => {
  if (!state.camille) throw new Error('Camille is not logged in');
  const page = await state.camille.newPage();
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  const section = page.getByTestId('list-person');
  await expect(section.getByTestId('person-thread')).toHaveCount(1);
  await expect(section.getByTestId('person-tastes-text')).toContainText(
    'En ce moment, les dinosaures',
  );
  const name = await section.getByTestId('person-name').boundingBox();
  const text = await section
    .locator('[data-drag="idea"]')
    .first()
    .getByTestId('idea-text')
    .boundingBox();
  expect(Math.abs((text?.x ?? 0) - (name?.x ?? 0))).toBeLessThanOrEqual(1);
  await page.close();
});

test('at 320 px wide, nothing goes past the edge', async () => {
  for (const [who, path] of [
    [state.mamie, `/l/${state.token}`],
    [state.camille, `/listes/${state.listId}`],
  ] as const) {
    if (!who) throw new Error('not logged in');
    const page = await who.newPage();
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(path);
    await hydrated(page);
    await expect(page.getByText('Circuit de billes')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320);
    await page.close();
  }
});

test('axe finds nothing on a list held and a list visited', async () => {
  for (const [who, path] of [
    [state.mamie, `/l/${state.token}`],
    [state.camille, `/listes/${state.listId}`],
  ] as const) {
    if (!who) throw new Error('not logged in');
    const page = await who.newPage();
    await page.goto(path);
    await hydrated(page);
    await expect(page.getByText('Circuit de billes')).toBeVisible();
    // Contrasts read at rest: a text just changed fades in (ticket 168:
    // a slow machine caught it half way).
    await page.evaluate(() =>
      Promise.all(document.getAnimations().map((a) => a.finished)),
    );
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`,
      ),
    ).toEqual([]);
    await page.close();
  }
});
