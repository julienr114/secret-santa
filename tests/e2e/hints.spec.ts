import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { apiLogin, heading, hydrated } from './helpers';

// « Lui demander des pistes » (README 22.11): once per draw, and
// anonymous. No route, no journal line, no screen of the organiser says
// who asked, nor that anyone did. Then the setting with three values.
test.describe.configure({ mode: 'serial' });

const SLUG = 'famille-trefle';
const ADMIN = `/api/admin/${SLUG}`;
const NAMES = ['Agathe', 'Basile', 'Céleste'];

const state: {
  admin?: APIRequestContext;
  editionId: string;
  tokens: Record<string, string>;
  receiverOf: Record<string, string>;
} = { editionId: '', tokens: {}, receiverOf: {} };

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

/**
 * Everything the organiser can read about the group, as text: the group,
 * the edition with its participants, the journal, the home page, the
 * lists of the super-admin.
 */
const organiserView = async () => {
  const paths = [
    ADMIN,
    `${ADMIN}/editions`,
    `${ADMIN}/editions/${state.editionId}`,
    `${ADMIN}/journal`,
    `${ADMIN}/persons`,
    '/api/auth/home',
    '/api/admin/groups',
    '/api/admin/accounts',
  ];
  return Promise.all(
    paths.map(async (path) => (await admin().get(path)).text()),
  );
};

test.beforeAll(async ({ playwright, baseURL }) => {
  state.admin = await playwright.request.newContext({ baseURL });
  await apiLogin(admin(), 'super-hints@example.com');
  await ok(
    await admin().post('/api/admin/groups', {
      data: { name: 'Famille Trèfle' },
    }),
  );
  for (const firstName of NAMES) {
    await ok(
      await admin().post(`${ADMIN}/persons`, {
        data: {
          firstName,
          email: `${firstName.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()}-trefle@example.com`,
        },
      }),
    );
  }
  const created = await ok(
    await admin().post(`${ADMIN}/editions`, {
      data: { label: 'Noël du trèfle', year: 2026, eventDate: '2026-12-24' },
    }),
  );
  state.editionId = created.edition.id;
  const { participants } = await ok(
    await admin().get(`${ADMIN}/editions/${state.editionId}`),
  );
  const { messages } = await ok(
    await admin().get(
      `${ADMIN}/editions/${state.editionId}/messages?type=invitation`,
    ),
  );
  state.tokens = Object.fromEntries(
    participants.map((p: { firstName: string; participationId: string }) => [
      p.firstName,
      new URL(messages[p.participationId].link).pathname.split('/').at(-1),
    ]),
  );
  await ok(await admin().post(`${ADMIN}/editions/${state.editionId}/draw`));
  // Everyone discovers their result first: the reveals are journaled, the
  // request that follows must add nothing anywhere.
  for (const firstName of NAMES) {
    const reveal = await ok(
      await admin().post(`/api/p/${state.tokens[firstName]}/reveal`),
    );
    state.receiverOf[firstName] = reveal.receiver.name;
  }
});

test.afterAll(async () => {
  await state.admin?.dispose();
});

test('asking for hints is anonymous, and possible once per draw', async ({
  page,
}) => {
  const giver = 'Agathe';
  const receiver = state.receiverOf[giver] ?? '';

  await open(page, `/p/${state.tokens[giver]}`);
  await page
    .getByRole('button', { name: "Revoir à qui j'offre un cadeau" })
    .click();
  // What the organiser reads once the result is on screen (seeing it again
  // is counted, as always), before the request.
  const before = await organiserView();
  await expect(
    page.getByText(`${receiver} n’a pas encore laissé de pistes.`),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Lui demander des pistes' }).click();
  await expect(
    page.getByRole('heading', { name: `Demander des pistes à ${receiver} ?` }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Envoyer la demande' }).click();
  // The test server has no email key: no email leaves, the page says so.
  await expect(page.getByTestId('hints-request-sent')).toContainText(
    `${receiver} le verra sur sa page de pistes`,
  );

  // Nothing the organiser reads has changed: not a word, not a line.
  expect(await organiserView()).toEqual(before);
  for (const firstName of NAMES) {
    const journal = await (
      await page.request.get(`/api/p/${state.tokens[firstName]}/journal`)
    ).text();
    expect(journal).not.toMatch(/pistes|hint|request|demande/i);
  }
  // Nor what the receiver reads: that someone asks, never who.
  const hints = await (
    await page.request.get(`/api/p/${state.tokens[receiver]}/hints`)
  ).text();
  expect(JSON.parse(hints).requested).toBe(true);
  expect(hints).not.toContain(giver);
  const receiverState = await (
    await page.request.get(`/api/p/${state.tokens[receiver]}`)
  ).text();
  expect(receiverState).not.toContain(giver);

  // Once per draw: the button is gone, and the route refuses a second one.
  await open(page, `/p/${state.tokens[giver]}`);
  await page
    .getByRole('button', { name: "Revoir à qui j'offre un cadeau" })
    .click();
  await expect(page.getByTestId('hints-request-sent')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Lui demander des pistes' }),
  ).toHaveCount(0);
  const again = await page.request.post(
    `/api/p/${state.tokens[giver]}/hints/request`,
  );
  expect(again.status()).toBe(409);

  // The receiver sees the banner, answers one question, and the giver
  // then reads it.
  await open(page, `/p/${state.tokens[receiver]}/pistes`);
  await expect(page.getByTestId('hints-requested')).toContainText(
    'La personne qui t’offre un cadeau cherche l’inspiration.',
  );
  await page.getByRole('link', { name: 'Commencer' }).click();
  await page.getByTestId('hint-second').click();
  await expect(heading(page)).toHaveText('Un objet, ou un moment ?');
  // New hints are put forward to the giver (lot 16 bis): on their home,
  // once logged in with their address…
  const home = await page
    .context()
    .browser()!
    .newContext({
      baseURL: page.url().split('/p/')[0],
    });
  const giverPage = await home.newPage();
  await apiLogin(
    giverPage.request,
    `${giver.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()}-trefle@example.com`,
  );
  await open(giverPage, '/');
  await expect(giverPage.getByTestId('draw-card')).toContainText(
    'De nouvelles pistes pour ton cadeau',
  );
  await home.close();
  // …and on the page of the draw, until the result is opened again.
  await open(page, `/p/${state.tokens[giver]}`);
  await expect(page.getByText('De nouvelles pistes t’attendent')).toBeVisible();
  await page
    .getByRole('button', { name: 'Revoir mon résultat et ses pistes' })
    .click();
  await expect(page.getByTestId('hints-new')).toHaveText('Nouveau');
  // The giver reads it in sentences.
  await expect(page.getByTestId('giver-portrait')).toContainText(
    `${receiver} préfère :`,
  );
  await expect(page.getByTestId('giver-portrait')).toContainText(
    'un cadeau surprenant plutôt qu’utile',
  );
  // Opened once, they are no longer new.
  await open(page, `/p/${state.tokens[giver]}`);
  await expect(page.getByText('Tu sais déjà à qui tu offres')).toBeVisible();
  await expect(
    page.getByText('Ses pistes de cadeaux t’attendent à l’intérieur.', {
      exact: false,
    }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Revoir mon résultat et ses pistes' })
    .click();
  await expect(page.getByTestId('hints-new')).toHaveCount(0);
  // The request is answered: the banner is gone.
  const answered = await ok(
    await page.request.get(`/api/p/${state.tokens[receiver]}/hints`),
  );
  expect(answered.requested).toBe(false);
  // The organiser only learns that hints were left.
  const edition = await ok(
    await admin().get(`${ADMIN}/editions/${state.editionId}`),
  );
  expect(
    edition.participants.map((p: { firstName: string; hasHints: boolean }) => [
      p.firstName,
      p.hasHints,
    ]),
  ).toContainEqual([receiver, true]);
  expect(JSON.stringify(edition)).not.toMatch(/surprenant|second/);
  // On the follow-up, a count, never which ones are new nor for whom.
  await page.context().addCookies((await admin().storageState()).cookies);
  await open(page, `/admin/${SLUG}/editions/${state.editionId}`);
  await expect(page.getByTestId('hints-count')).toHaveText(
    '1 sur 3 a laissé des pistes',
  );
});

test('a cancelled draw takes its requests away', async ({ page }) => {
  const hasHints = async (firstName: string) =>
    (
      await ok(await admin().get(`${ADMIN}/editions/${state.editionId}`))
    ).participants.find((p: { firstName: string }) => p.firstName === firstName)
      .hasHints;
  // A giver whose receiver left nothing asks.
  const candidates: string[] = [];
  for (const name of NAMES) {
    if (!(await hasHints(state.receiverOf[name] ?? ''))) candidates.push(name);
  }
  const asker = candidates[0] ?? '';
  const receiver = state.receiverOf[asker] ?? '';
  await ok(
    await page.request.post(`/api/p/${state.tokens[asker]}/hints/request`),
  );
  const requested = async () =>
    (await ok(await page.request.get(`/api/p/${state.tokens[receiver]}/hints`)))
      .requested;
  expect(await requested()).toBe(true);
  await ok(
    await admin().post(`${ADMIN}/editions/${state.editionId}/redraw`, {
      data: { reason: 'Test des pistes' },
    }),
  );
  expect(await requested()).toBe(false);
  // Drawn again: the new giver may ask once more.
  await ok(await admin().post(`${ADMIN}/editions/${state.editionId}/draw`));
  for (const firstName of NAMES) {
    const reveal = await ok(
      await page.request.post(`/api/p/${state.tokens[firstName]}/reveal`),
    );
    state.receiverOf[firstName] = reveal.receiver.name;
  }
  const newGiver =
    NAMES.find((name) => state.receiverOf[name] === receiver) ?? '';
  const again = await page.request.post(
    `/api/p/${state.tokens[newGiver]}/hints/request`,
  );
  expect(again.status()).toBe(200);
});

test('the setting: portrait only, then no hint at all', async ({ page }) => {
  const token = state.tokens.Basile ?? '';
  await ok(
    await admin().patch(`${ADMIN}/rules`, { data: { giftHints: 'portrait' } }),
  );
  const portrait = await ok(await page.request.get(`/api/p/${token}/hints`));
  expect(portrait.mode).toBe('portrait');
  const idea = await page.request.put(`/api/p/${token}/wishes`, {
    data: { wishes: [{ label: 'Un livre' }] },
  });
  expect(idea.status()).toBe(403);
  await open(page, `/p/${token}/pistes`);
  await expect(page.getByText('Une idée précise, si tu sèches')).toHaveCount(0);
  // Five questions without the precise ideas: « Neuf, ou d'occasion ? »
  // is the last.
  await open(page, `/p/${token}/pistes/question?n=5`);
  await expect(heading(page)).toHaveText('Neuf, ou d’occasion ?');
  await expect(page.getByText('question 5 sur 5')).toBeVisible();
  await expect(page.getByTestId('hint-both')).toBeVisible();

  await ok(
    await admin().patch(`${ADMIN}/rules`, { data: { giftHints: 'none' } }),
  );
  expect((await page.request.get(`/api/p/${token}/hints`)).status()).toBe(403);
  await open(page, `/p/${token}`);
  await expect(page.getByText('Mes pistes de cadeaux')).toHaveCount(0);

  // On the settings screen, the row says the value and opens three choices.
  await page.context().addCookies((await admin().storageState()).cookies);
  await open(page, `/admin/${SLUG}/reglages`);
  const row = page.getByTestId('gift-hints-setting');
  await expect(row).toContainText('Aucune piste');
  await row.click();
  await page.getByText('Portrait et idées précises').click();
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(row).toContainText('Portrait et idées précises');
  await expect
    .poll(
      async () =>
        (await ok(await admin().get(`${ADMIN}/rules`))).rules?.giftHints,
    )
    .toBe('full');
});
