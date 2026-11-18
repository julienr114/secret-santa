import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// « Devine qui » : donner envie de jouer, et rappeler (README 22.17,
// Correction 15). Last year's figure to beat, the surprise, « Je passe mon
// tour », the card under the result, the count, the settings and the
// message to the group. The test server sends no email.
test.describe.configure({ mode: 'serial' });

const SUPER = 'super-nudges@example.com';
const SLUG = 'famille-relance';
const ADMIN = `/api/admin/${SLUG}`;
const NAMES = ['Ada', 'Ben', 'Cy', 'Dee', 'Eli'];
const DAY = 86_400_000;
const state: {
  admin?: APIRequestContext;
  base: string;
  editionId: string;
  tokens: Record<string, string>;
  ids: Record<string, string>;
} = { base: '', editionId: '', tokens: {}, ids: {} };
const admin = () => state.admin!;
const ok = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  expect(response.ok(), `${response.url()}: ${response.status()}`).toBe(true);
  return response.json();
};
const open = async (page: Page, path: string) => {
  await page.goto(path);
  await hydrated(page);
};
/** Creates an edition with everyone, and reads their links. */
const newEdition = async (label: string, year: number) => {
  const { edition } = await ok(
    await admin().post(`${ADMIN}/editions`, {
      data: { label, year, eventDate: '2099-12-24' },
    }),
  );
  const base = `${ADMIN}/editions/${edition.id}`;
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
  return { base, id: edition.id as string, tokens };
};
const game = (mode: 'santa' | 'all') => ({
  mode,
  endsAt: new Date(Date.now() + 30 * DAY).toISOString(),
  timeZone: 'Europe/Paris',
});

test.beforeAll(async ({ playwright, baseURL }) => {
  state.admin = await playwright.request.newContext({ baseURL });
  await apiLogin(admin(), SUPER);
  await ok(
    await admin().post('/api/admin/groups', {
      data: { name: 'Famille Relance' },
    }),
  );
  for (const firstName of NAMES) {
    const { person } = await ok(
      await admin().post(`${ADMIN}/persons`, { data: { firstName } }),
    );
    state.ids[firstName] = person.id;
  }
  // Last year: the game, two players, Ada found her Santa.
  const last = await newEdition('Noël 2025', 2025);
  await ok(await admin().post(`${last.base}/draw`));
  await ok(await admin().put(`${last.base}/guess`, { data: game('santa') }));
  // Everyone finds out whom they give to; then each names a Santa.
  const receiverOf: Record<string, string> = {};
  for (const name of NAMES) {
    const { receiver } = await ok(
      await admin().post(`/api/p/${last.tokens[name]}/reveal`),
    );
    receiverOf[name] = receiver.name;
  }
  const santa = (name: string) => NAMES.find((g) => receiverOf[g] === name)!;
  const wrong = (name: string) =>
    NAMES.find((g) => g !== name && g !== santa(name))!;
  await ok(
    await admin().put(`/api/p/${last.tokens.Ada}/guess`, {
      data: { recipientId: state.ids.Ada, giverId: state.ids[santa('Ada')] },
    }),
  );
  await ok(
    await admin().put(`/api/p/${last.tokens.Ben}/guess`, {
      data: { recipientId: state.ids.Ben, giverId: state.ids[wrong('Ben')] },
    }),
  );
  await ok(
    await admin().post(`${last.base}/reveal`, { data: { early: true } }),
  );
  await ok(await admin().post(`${last.base}/close`));

  // This year: the game is carried over.
  const now = await newEdition('Noël 2026', 2026);
  state.base = now.base;
  state.editionId = now.id;
  state.tokens = now.tokens;
  await ok(await admin().post(`${now.base}/draw`));
  await ok(await admin().put(`${now.base}/guess`, { data: game('santa') }));
});

test.afterAll(async () => {
  await state.admin?.dispose();
});

test('the game page: the surprise, and last year’s figure to beat', async ({
  page,
}) => {
  await open(page, `/p/${state.tokens.Cy}/devine`);
  await expect(page.getByTestId('game-surprise')).toContainText(
    'Une surprise attend le groupe à la fête.',
  );
  await expect(page.getByTestId('game-challenge')).toHaveText(
    'L’an dernier, 1 personne sur 2 avait deviné son Père Noël. À battre.',
  );
  // Nothing names a prize before the party.
  await expect(page.locator('body')).not.toContainText(/détective|caché/i);
});

test('the card under the result, then « Je passe mon tour »', async ({
  page,
}) => {
  // Two have played: the count shows.
  for (const name of ['Ada', 'Ben']) {
    await page.request.put(`/api/p/${state.tokens[name]}/guess`, {
      data: {
        recipientId: state.ids[name],
        giverId: state.ids[name === 'Ada' ? 'Ben' : 'Ada'],
      },
    });
  }
  await open(page, `/p/${state.tokens.Dee}`);
  await page.getByRole('button', { name: /Découvrir/ }).click();
  const invite = page.getByTestId('game-invite');
  await expect(invite).toContainText('Et toi, qui t’offre ton cadeau ?');
  await expect(invite).toContainText(
    '2 sur 5 ont déjà fait leur pronostic. Réponse à la fête.',
  );
  await invite.getByTestId('game-skip').click();
  await expect(invite).toHaveCount(0);
  // Out of the counts and of those to remind.
  const { guess, participants } = await ok(await admin().get(state.base));
  expect(guess).toMatchObject({ players: 2, total: 4, left: 2 });
  expect(
    participants.find((p: { firstName: string }) => p.firstName === 'Dee')
      .skipped,
  ).toBe(true);
  // The tile says it; the game page offers to come back.
  await open(page, `/p/${state.tokens.Dee}`);
  await expect(
    page.getByTestId('tile').filter({ hasText: 'Devine qui' }),
  ).toContainText('Tu passes ton tour');
  await open(page, `/p/${state.tokens.Dee}/devine`);
  await expect(page.getByTestId('game-skipped')).toContainText(
    'Tu passes ton tour',
  );
  await page.getByTestId('game-unskip').click();
  await expect(page.getByTestId('santa-guess')).toBeVisible();
});

test('from the reminder, « Je passe mon tour » is confirmed', async ({
  page,
}) => {
  await open(page, `/p/${state.tokens.Eli}/devine?passer=1`);
  await page.getByTestId('game-skip-confirm').click();
  await expect(page.getByTestId('game-skipped')).toBeVisible();
  // One who played cannot pass their turn.
  const refused = await page.request.post(
    `/api/p/${state.tokens.Ada}/guess/skip`,
    { data: { skip: true } },
  );
  expect(refused.status()).toBe(409);
});

test('the organiser: the settings, and the message to the group', async ({
  page,
}) => {
  await apiLogin(page.request, SUPER);
  await open(page, `/admin/${SLUG}/editions/${state.editionId}/reglages`);
  await page.getByTestId('setting-guess').click();
  const switches = page.getByTestId('guess-switches');
  await expect(switches.getByRole('switch')).toHaveCount(1);
  await switches.getByRole('switch', { name: 'Rappel automatique' }).click();
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByTestId('guess-switches')).toHaveCount(0);
  const { guess } = await ok(await admin().get(state.base));
  expect(guess.autoReminder).toBe(false);

  await open(page, `/admin/${SLUG}/editions/${state.editionId}`);
  await page.getByTestId('game-remind').click();
  await page.getByTestId('game-write-group').click();
  const message = page.getByTestId('game-group-message');
  await expect(message).toContainText('2 sur 4 ont déjà fait leur pronostic.');
  await expect(message).toContainText(
    'Chacun retrouve le jeu avec son lien personnel.',
  );
  // No personal link, no name.
  await expect(message).not.toContainText('/p/');
  await expect(message).not.toContainText(/Ada|Ben|Cy|Dee|Eli/);
});
