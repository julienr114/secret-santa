import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// « Devine qui » (README 22.17): after the draw, each one may guess who
// gives to whom; nobody sees anyone else's guess before the party; at
// the reveal, the palmarès in images.
test.describe.configure({ mode: 'serial' });

const SUPER = 'super-guess@example.com';
const SLUG = 'famille-devine';
const ADMIN = `/api/admin/${SLUG}`;
const NAMES = ['Anna', 'Basile', 'Chloé', 'David', 'Emma'];

const state: {
  admin?: APIRequestContext;
  editionId: string;
  tokens: Record<string, string>;
  ids: Record<string, string>;
  /** Who each one gives to. */
  receiverOf: Record<string, string>;
} = { editionId: '', tokens: {}, ids: {}, receiverOf: {} };

const admin = () => {
  if (!state.admin) throw new Error('admin context missing');
  return state.admin;
};
const ok = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  expect(response.ok(), `${response.url()}: ${response.status()}`).toBe(true);
  return response.json();
};
const open = async (page: Page, path: string) => {
  await page.goto(path);
  await hydrated(page);
};
const edition = () => `${ADMIN}/editions/${state.editionId}`;
/** `guesser` thinks `giver` gives to `recipient`. */
const guess = (
  api: APIRequestContext,
  guesser: string,
  recipient: string,
  giver: string | null,
) =>
  api.put(`/api/p/${state.tokens[guesser]}/guess`, {
    data: {
      recipientId: state.ids[recipient],
      giverId: giver ? state.ids[giver] : null,
    },
  });
const santaOf = (name: string) =>
  Object.keys(state.receiverOf).find((g) => state.receiverOf[g] === name)!;

test.beforeAll(async ({ playwright, baseURL }) => {
  state.admin = await playwright.request.newContext({ baseURL });
  await apiLogin(admin(), SUPER);
  await ok(
    await admin().post('/api/admin/groups', {
      data: { name: 'Famille Devine' },
    }),
  );
  for (const firstName of NAMES) {
    const { person } = await ok(
      await admin().post(`${ADMIN}/persons`, { data: { firstName } }),
    );
    state.ids[firstName] = person.id;
  }
  const created = await ok(
    await admin().post(`${ADMIN}/editions`, {
      data: { label: 'Noël devine', year: 2026, eventDate: '2099-12-24' },
    }),
  );
  state.editionId = created.edition.id;
  const { participants } = await ok(await admin().get(edition()));
  const { messages } = await ok(
    await admin().get(`${edition()}/messages?type=invitation`),
  );
  for (const p of participants) {
    state.tokens[p.firstName] = new URL(
      messages[p.participationId].link,
    ).pathname.split('/p/')[1]!;
  }
  await ok(await admin().post(`${edition()}/draw`));
});

test.afterAll(async () => {
  await state.admin?.dispose();
});

test('the organiser turns « Devine qui » on in the edition settings', async ({
  page,
}) => {
  await apiLogin(page.request, SUPER);
  await open(page, `/admin/${SLUG}/editions/${state.editionId}/reglages`);
  await page.getByTestId('setting-guess').click();
  await page.getByText('Toutes les paires').click();
  await page.getByTestId('guess-end').fill('18:30');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByTestId('setting-guess')).toContainText(
    'Toutes les paires',
  );
  await open(page, `/admin/${SLUG}/editions/${state.editionId}`);
  const card = page.getByTestId('game-card');
  await expect(card).toContainText('0 sur 5 ont fait un pronostic.');
  await expect(card).toContainText('à 18 h 30');
  await expect(page.getByTestId('settings-row')).toContainText('jeu');
  // A tap on the card opens the game's setting at once.
  await page.getByTestId('game-settings').click();
  await expect(
    page.getByRole('radio', { name: /Toutes les paires/ }),
  ).toBeChecked();
  await page.getByRole('button', { name: 'Annuler' }).click();
  const { entries } = await ok(await admin().get(`${ADMIN}/journal`));
  expect(entries.map((e: { text: string }) => e.text)).toContain(
    'Devine qui : le jeu de pronostics est ouvert',
  );
});

test('a participant guesses, and a person named twice moves', async ({
  page,
  request,
}) => {
  // Who gives to whom, found out the only legitimate way.
  for (const name of NAMES) {
    const { receiver } = await ok(
      await request.post(`/api/p/${state.tokens[name]}/reveal`),
    );
    state.receiverOf[name] = receiver.name;
  }
  await open(page, `/p/${state.tokens.Anna}`);
  await expect(
    page.getByTestId('tile').filter({ hasText: 'Devine qui' }),
  ).toContainText('Fais ton pronostic');
  await open(page, `/p/${state.tokens.Anna}/devine`);
  // Everyone else has a line, including the one Anna gives to.
  await expect(page.getByTestId('guess-rows')).toHaveCount(2);
  await expect(page.getByTestId('guess-rows').locator('li')).toHaveCount(5);
  await page.getByRole('button', { name: '+ Choisir' }).first().click();
  // Her own Santa first: everyone but herself.
  const options = page.getByTestId('guess-options').getByRole('option');
  await expect(options).toHaveCount(4);
  await expect(options.filter({ hasText: 'Moi' })).toHaveCount(0);
  await options.first().click();
  await expect(page.getByTestId('guess-count')).toContainText('1 pronostic');
  // On someone else's line, « Moi » comes first.
  await page.getByRole('button', { name: '+ Choisir' }).first().click();
  await expect(options.first()).toContainText('Moi');
  await expect(options).toHaveCount(4);
  await page.keyboard.press('Escape');

  // Through the route: naming the same person for another line moves it.
  const anna = await ok(await request.get(`/api/p/${state.tokens.Anna}/guess`));
  const first = anna.mine[0];
  // Not the one Anna gives to: that line never counts (the decoy).
  const other = NAMES.find(
    (n) =>
      n !== 'Anna' &&
      n !== state.receiverOf.Anna &&
      state.ids[n] !== first.recipientId &&
      state.ids[n] !== first.giverId,
  )!;
  const moved = await ok(
    await request.put(`/api/p/${state.tokens.Anna}/guess`, {
      data: { recipientId: state.ids[other], giverId: first.giverId },
    }),
  );
  expect(moved.mine).toEqual([
    { recipientId: state.ids[other], giverId: first.giverId },
  ]);
  // One may name oneself (« Moi »), but not on one's own line.
  expect((await guess(request, 'Anna', 'Anna', 'Anna')).status()).toBe(400);
});

test('nobody sees anyone else’s guess before the party', async ({
  request,
}) => {
  // Everyone guesses their own Santa right; Basile also guesses others.
  for (const name of ['Basile', 'Chloé', 'David']) {
    await ok(await guess(request, name, name, santaOf(name)));
  }
  const before = await (await admin().get(edition())).text();
  // Someone Basile neither is nor gives to, so that he cannot name himself.
  const recipient = NAMES.find(
    (n) =>
      n !== 'Basile' &&
      n !== state.receiverOf.Basile &&
      santaOf(n) !== 'Basile',
  )!;
  await ok(await guess(request, 'Basile', recipient, santaOf(recipient)));
  const after = await (await admin().get(edition())).text();
  // The organiser learns who has played, never what.
  expect(after).toBe(before);
  const { guess: summary } = JSON.parse(after);
  expect(summary.players).toBe(4);
  // A participant reads their own guesses only.
  const chloe = await ok(
    await request.get(`/api/p/${state.tokens.Chloé}/guess`),
  );
  expect(chloe.mine).toHaveLength(1);
  expect(chloe.results).toBeNull();
  // The answers come with the reveal: no closing without it meanwhile.
  expect((await admin().post(`${edition()}/close`)).status()).toBe(409);
});

test('the reveal brings the palmarès, in images then corrected', async ({
  page,
  request,
}) => {
  await ok(
    await admin().post(`${edition()}/reveal`, { data: { early: true } }),
  );
  // Closed and announced, in the journal, never a guess.
  const { entries } = await ok(await admin().get(`${ADMIN}/journal`));
  const texts = entries.map((e: { text: string }) => e.text);
  expect(texts).toContain('Devine qui : les pronostics sont fermés');
  expect(texts).toContain('Devine qui : le palmarès est arrivé');
  // No more guesses.
  expect((await guess(request, 'Emma', 'Emma', 'Anna')).status()).toBe(409);

  // Revealed before the party (README 22.18, TirageDevoileAvant): the
  // result is open, and the palmarès waits in the game's tile.
  await open(page, `/p/${state.tokens.Chloé}`);
  await expect(page.getByTestId('revealed-banner')).toBeVisible();
  await expect(page.getByTestId('palmares-card')).toHaveCount(0);
  const tile = page.getByTestId('tile').filter({ hasText: 'Devine qui' });
  await expect(tile).toContainText('Le palmarès t’attend');
  await tile.click();
  await page.getByRole('link', { name: /Découvrir le palmarès/ }).click();
  const stories = page.getByTestId('stories');
  await expect(stories).toHaveAttribute('data-screen', 'opening');
  await expect(stories).toContainText('4 joueurs');
  const stage = page.getByTestId('stories-stage');
  await stage.click({ position: { x: 300, y: 200 } });
  await expect(stories).toHaveAttribute('data-screen', 'suspense');
  await stage.click({ position: { x: 300, y: 200 } });
  await expect(stories).toHaveAttribute('data-screen', 'santa');
  await expect(stories).toContainText(`bien ${santaOf('Chloé')}`);
  // A tap on the left goes back.
  await stage.click({ position: { x: 20, y: 200 } });
  await expect(stories).toHaveAttribute('data-screen', 'suspense');
  // On to the end. The award screens turn mustard, plum, pine, brick,
  // whatever awards were shown (README 22.17).
  await stage.click({ position: { x: 300, y: 200 } });
  const looks: string[] = [];
  for (const _ of Array.from({ length: 16 })) {
    const shown = await stories.getAttribute('data-screen');
    if (shown === 'end') break;
    if (shown !== 'santa' && shown !== 'closeCall') {
      looks.push((await stories.getAttribute('data-look')) ?? '');
    }
    await stage.click({ position: { x: 300, y: 200 } });
  }
  const turn = ['mustard', 'plum', 'pine', 'brick'];
  expect(looks).toEqual(looks.map((_, i) => turn[i % 4]));
  await expect(stories).toContainText('Joyeux Noël,');
  await page.getByTestId('stories-all').click();
  // Watched: the guesses are corrected, and the button says « Revoir ».
  await expect(page.getByTestId('palmares-link')).toContainText(
    'Revoir le palmarès',
  );
  await expect(page.getByTestId('my-guesses')).toContainText('1 bon sur 1');

  // The organiser: once revealed, the whole game card opens the palmarès,
  // which starts by itself.
  await apiLogin(page.request, SUPER);
  await open(page, `/admin/${SLUG}/editions/${state.editionId}`);
  await page.getByTestId('game-card').click({ position: { x: 150, y: 30 } });
  await expect(page.getByTestId('stories')).toHaveAttribute(
    'data-screen',
    'opening',
  );
  await expect(page.getByTestId('stories')).not.toHaveAttribute(
    'data-screen',
    'opening',
    { timeout: 10_000 },
  );
});

/**
 * A group of its own with these people in one edition, and their links.
 * @param slug - The group's identifier.
 * @param names - The first names.
 * @returns The edition's admin path and each one's token.
 */
const smallGroup = async (slug: string, names: string[]) => {
  const group = `/api/admin/${slug}`;
  const { group: made } = await ok(
    await admin().post('/api/admin/groups', { data: { name: slug } }),
  );
  expect(made.slug).toBe(slug);
  for (const firstName of names) {
    await ok(await admin().post(`${group}/persons`, { data: { firstName } }));
  }
  const created = await ok(
    await admin().post(`${group}/editions`, {
      data: { label: 'Noël', year: 2026, eventDate: '2099-12-24' },
    }),
  );
  const base = `${group}/editions/${created.edition.id}`;
  const { participants } = await ok(await admin().get(base));
  const { messages } = await ok(
    await admin().get(`${base}/messages?type=invitation`),
  );
  const tokens: Record<string, string> = Object.fromEntries(
    participants.map((p: { firstName: string; participationId: string }) => [
      p.firstName,
      new URL(messages[p.participationId].link).pathname.split('/p/')[1]!,
    ]),
  );
  const ids: Record<string, string> = Object.fromEntries(
    participants.map((p: { firstName: string; id: string }) => [
      p.firstName,
      p.id,
    ]),
  );
  return { group, base, tokens, ids, editionId: created.edition.id };
};
const game = (endsAt: string) => ({
  mode: 'santa',
  endsAt,
  timeZone: 'Europe/Paris',
});
const DAY = 86_400_000;

test('a draw of three turns the game off, and it stays off', async ({
  page,
}) => {
  const { base, editionId } = await smallGroup('famille-trois', [
    'Gil',
    'Hana',
    'Ivo',
  ]);
  // Before the draw, the setting is free.
  await ok(
    await admin().put(`${base}/guess`, {
      data: game(new Date(Date.now() + DAY).toISOString()),
    }),
  );
  await apiLogin(page.request, SUPER);
  await open(page, `/admin/famille-trois/editions/${editionId}`);
  await page.getByRole('button', { name: 'Lancer le tirage' }).click();
  // The confirmation says it in one sentence.
  await expect(page.getByTestId('draw-game-off')).toContainText(
    'à trois, chacun sait déjà qui lui offre',
  );
  await page.getByRole('button', { name: 'Tirer au sort' }).click();
  await expect(page.getByTestId('draw-sheet')).toHaveCount(0);
  const { guess } = await ok(await admin().get(base));
  expect(guess).toMatchObject({ mode: 'none', possible: false });
  const refused = await admin().put(`${base}/guess`, {
    data: game(new Date(Date.now() + DAY).toISOString()),
  });
  expect(refused.status()).toBe(409);
  // The setting is greyed, and says why (DevineReglageTrois).
  await open(page, `/admin/famille-trois/editions/${editionId}/reglages`);
  await page.getByTestId('setting-guess').click();
  await expect(page.getByTestId('guess-needs-four')).toHaveText(
    'À partir de quatre participants. À trois, chacun sait déjà qui lui offre : il n’y a rien à deviner.',
  );
  await expect(page.getByRole('radio', { name: /Qui m’offre/ })).toBeDisabled();
  await expect(
    page.getByRole('radio', { name: /Aucun pronostic/ }),
  ).toBeChecked();
});

test('nobody played: nothing of the game after the reveal', async ({
  request,
}) => {
  const { group, base, tokens } = await smallGroup('famille-personne', [
    'Jo',
    'Kim',
    'Lou',
    'Max',
  ]);
  await ok(await admin().post(`${base}/draw`));
  // The end of the guesses two days ago: the scheduled task (every 15
  // minutes) closes them and reveals the draw.
  await ok(
    await admin().put(`${base}/guess`, {
      data: game(new Date(Date.now() - 2 * DAY).toISOString()),
    }),
  );
  const run = await request.get('/__scheduled?cron=*/15+*+*+*+*');
  expect(run.ok()).toBe(true);
  const { edition: done } = await ok(await admin().get(base));
  expect(done.revealedAt).toBeTruthy();
  const { entries } = await ok(await admin().get(`${group}/journal`));
  const texts = entries.map((e: { text: string }) => e.text);
  expect(texts).toContain('Devine qui : les pronostics sont fermés');
  expect(texts).not.toContain('Devine qui : le palmarès est arrivé');
  // No tile, no palmarès on the participant's page.
  const me = await ok(await request.get(`/api/p/${tokens.Jo}`));
  expect(me.guess.palmares).toBe(false);
});

test('one player: the small palmarès, four screens', async ({ page }) => {
  const { group, base, tokens, ids } = await smallGroup('famille-petit', [
    'Noé',
    'Oda',
    'Pia',
    'Rob',
  ]);
  await ok(await admin().post(`${base}/draw`));
  await ok(
    await admin().put(`${base}/guess`, {
      data: game(new Date(Date.now() + DAY).toISOString()),
    }),
  );
  // Everyone finds out who they give to; Noé alone plays, and names his
  // own Santa right.
  const receiverOf: Record<string, string> = {};
  for (const [name, token] of Object.entries(tokens)) {
    const { receiver } = await ok(
      await page.request.post(`/api/p/${token}/reveal`),
    );
    receiverOf[name] = receiver.name;
  }
  const santa = Object.keys(receiverOf).find((g) => receiverOf[g] === 'Noé')!;
  await ok(
    await page.request.put(`/api/p/${tokens.Noé}/guess`, {
      data: { recipientId: ids.Noé, giverId: ids[santa] },
    }),
  );
  await ok(await admin().post(`${base}/reveal`, { data: { early: true } }));
  const { entries } = await ok(await admin().get(`${group}/journal`));
  expect(entries.map((e: { text: string }) => e.text)).toContain(
    'Devine qui : le palmarès est arrivé',
  );
  await open(page, `/p/${tokens.Noé}/devine/palmares`);
  const stories = page.getByTestId('stories');
  await expect(stories.getByRole('img', { name: /sur 4$/ })).toBeVisible();
  // The right side goes on: the suspense, then his Santa.
  await stories.click({ position: { x: 350, y: 400 } });
  await stories.click({ position: { x: 350, y: 400 } });
  await expect(stories).toHaveAttribute('data-screen', 'santa');
  await expect(stories).toContainText(
    'Personne d’autre n’a joué, et tu as vu juste.',
  );
  await stories.click({ position: { x: 350, y: 400 } });
  await expect(stories).toHaveAttribute('data-screen', 'end');
});
