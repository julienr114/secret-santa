import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// « Lui demander des idées » (README 22.11, ticket 107): once per draw,
// and anonymous. No route, no journal line, no screen of the organiser
// says who asked, nor that anyone did. And no setting any more.
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
    '/api/past',
    '/api/home',
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
      data: {
        label: 'Noël du trèfle',
        year: 2026,
        eventDate: '2026-12-24',
        guardianMessage: 'Rendez-vous chez Mamie. '.repeat(12),
      },
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
  // Every opening of the result moves its date, not only the first: it is
  // what makes hints new or not (lot 16 bis).
  const lastViewedAt = async () =>
    (
      await ok(await admin().get(`${ADMIN}/editions/${state.editionId}`))
    ).participants.find((p: { firstName: string }) => p.firstName === giver)
      .lastViewedAt;
  const opened = await lastViewedAt();
  await ok(await page.request.post(`/api/p/${state.tokens[giver]}/reveal`));
  expect(await lastViewedAt()).not.toBe(opened);
  // What the organiser reads once the result is on screen (seeing it again
  // is counted, as always), before the request.
  const before = await organiserView();
  await expect(
    page.getByText(`${receiver} n’a encore rien écrit.`),
  ).toBeVisible();
  // The organiser's words are out of the result card, cut at three lines.
  const note = page.getByTestId('organizer-note');
  await expect(note).toContainText('Rendez-vous chez Mamie.');
  await note.getByRole('button', { name: 'Lire la suite' }).click();
  await expect(note.getByRole('button', { name: 'Lire la suite' })).toHaveCount(
    0,
  );
  await page.getByRole('button', { name: 'Lui demander des idées' }).click();
  await expect(
    page.getByRole('heading', { name: `Demander des idées à ${receiver} ?` }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Envoyer la demande' }).click();
  // The test server has no email key: no email leaves, the page says so.
  await expect(page.getByTestId('hints-request-sent')).toContainText(
    `${receiver} le verra en ouvrant son lien`,
  );

  // Nothing the organiser reads has changed: not a word, not a line.
  expect(await organiserView()).toEqual(before);
  for (const firstName of NAMES) {
    const journal = await (
      await page.request.get(`/api/p/${state.tokens[firstName]}/journal`)
    ).text();
    expect(journal).not.toMatch(/pistes|hint|request|demande/i);
  }
  // Nor what the receiver reads: never who asks.
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
    page.getByRole('button', { name: 'Lui demander des idées' }),
  ).toHaveCount(0);
  const again = await page.request.post(
    `/api/p/${state.tokens[giver]}/hints/request`,
  );
  expect(again.status()).toBe(409);
});

test('a cancelled draw takes its requests away', async ({ page }) => {
  // A giver who has not asked yet (Agathe asked above).
  const asker = NAMES.find((name) => name !== 'Agathe') ?? '';
  const receiver = state.receiverOf[asker] ?? '';
  await ok(
    await page.request.post(`/api/p/${state.tokens[asker]}/hints/request`),
  );
  const requested = async () =>
    (await ok(await page.request.post(`/api/p/${state.tokens[asker]}/reveal`)))
      .hints.requested;
  expect(await requested()).toBe(true);
  await ok(
    await admin().post(`${ADMIN}/editions/${state.editionId}/redraw`, {
      data: { reason: 'Test des pistes' },
    }),
  );
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

test('no setting any more: an old « no hints » hides nothing', async ({
  page,
}) => {
  const token = state.tokens.Basile ?? '';
  // A Secret Santa that had « Aucune idée » before the V3 (ticket 107).
  await ok(
    await admin().patch(`${ADMIN}/rules`, { data: { giftHints: 'none' } }),
  );
  await open(page, `/p/${token}`);
  await expect(page.getByText('Ma liste de cadeaux')).toBeVisible();
  // The settings screen has no row for it.
  await page.context().addCookies((await admin().storageState()).cookies);
  await open(page, `/admin/${SLUG}/editions/${state.editionId}/reglages`);
  await expect(page.getByTestId('setting-previous-years')).toBeVisible();
  await expect(page.getByTestId('gift-hints-setting')).toHaveCount(0);
});
