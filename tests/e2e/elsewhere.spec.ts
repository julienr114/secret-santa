import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// A draw already made elsewhere (README 22.12): each participant says on
// their page who they give to; the organiser sees who answered and who
// clashes, never what anyone answered; once it fits, they validate and it
// is an ordinary draw.
test.describe.configure({ mode: 'serial' });

const SLUG = 'famille-papier';
const ADMIN = `/api/admin/${SLUG}`;
const NAMES = ['Agnès', 'Bruno', 'Clara', 'Diane'];

const state: {
  admin?: APIRequestContext;
  editionId: string;
  ids: Record<string, string>;
  tokens: Record<string, string>;
} = { editionId: '', ids: {}, tokens: {} };

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
/** Says, through a participant's link, who they give to. */
const answer = (api: APIRequestContext, giver: string, receiver: string) =>
  api.put(`/api/p/${state.tokens[giver]}/answer`, {
    data: { personId: state.ids[receiver] },
  });

test.beforeAll(async ({ playwright, baseURL }) => {
  state.admin = await playwright.request.newContext({ baseURL });
  await apiLogin(admin(), 'super-elsewhere@example.com');
  await ok(
    await admin().post('/api/admin/groups', {
      data: { name: 'Famille Papier' },
    }),
  );
  for (const firstName of NAMES) {
    const { person } = await ok(
      await admin().post(`${ADMIN}/persons`, { data: { firstName } }),
    );
    state.ids[firstName] = person.id;
  }
  // Agnès never gives to Bruno: the draw elsewhere does not care.
  await ok(
    await admin().post(`${ADMIN}/exclusions`, {
      data: {
        giverId: state.ids.Agnès,
        receiverId: state.ids.Bruno,
        reciprocal: false,
      },
    }),
  );
  const created = await ok(
    await admin().post(`${ADMIN}/editions`, {
      data: { label: 'Noël sur papier', year: 2026, eventDate: '2026-12-24' },
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
});

test.afterAll(async () => {
  await state.admin?.dispose();
});

test('the organiser says the draw was made elsewhere', async ({ page }) => {
  await apiLogin(page.request, 'super-elsewhere@example.com');
  await open(page, `/admin/${SLUG}/editions/${state.editionId}`);
  await page.getByTestId('elsewhere-link').click();
  const sheet = page.getByTestId('start-answers-sheet');
  await expect(sheet).toContainText('Chacun répond sur sa page');
  // Said once: the exclusion is not checked.
  await expect(sheet).toContainText(
    'L’exclusion du groupe (Agnès et Bruno) n’est pas vérifiée',
  );
  await page.getByRole('button', { name: 'Demander les réponses' }).click();
  await expect(page.getByTestId('action-card')).toContainText(
    'Demande à chacun à qui il offre',
  );
  await expect(page.getByText('Réponses', { exact: true })).toBeVisible();
  // The app's draw waits: the answers are being collected.
  const draw = await admin().post(`${edition()}/draw`);
  expect(draw.status()).toBe(409);
});

test('a participant answers on their page, secretly', async ({
  page,
  request,
}) => {
  await open(page, `/p/${state.tokens.Agnès}`);
  await expect(page.getByTestId('draw-card')).toContainText(
    'À qui offres-tu un cadeau ?',
  );
  await page.getByTestId('answer-open').click();
  // Everyone but herself.
  const options = page.getByRole('option');
  await expect(options).toHaveCount(3);
  await expect(page.getByRole('option', { name: 'Agnès' })).toHaveCount(0);
  await page.getByRole('option', { name: 'Bruno' }).click();
  await expect(
    page.getByRole('heading', { name: 'Tu offres un cadeau à Bruno ?' }),
  ).toBeVisible();
  await page.getByTestId('answer-confirm').click();
  await expect(page.getByTestId('draw-card')).toContainText(
    'Réponse enregistrée',
  );
  await expect(page.getByTestId('draw-card')).toContainText(
    '1 réponse sur 4 pour l’instant',
  );
  // Nobody can answer for themselves, nor name someone out of the edition.
  expect((await answer(request, 'Bruno', 'Bruno')).status()).toBe(400);
  const stranger = await request.put(`/api/p/${state.tokens.Bruno}/answer`, {
    data: { personId: 'not-a-person' },
  });
  expect(stranger.status()).toBe(400);
});

test('the organiser never learns what anyone answered', async ({ request }) => {
  // Clara names Diane, then changes to Agnès: nothing clashes either way,
  // and what the organiser reads of the edition does not change.
  await ok(await answer(request, 'Clara', 'Diane'));
  const before = await (await admin().get(edition())).text();
  await ok(await answer(request, 'Clara', 'Agnès'));
  expect(await (await admin().get(edition())).text()).toBe(before);
  expect(before).not.toMatch(/receiver/i);
  // The change is in the journal, without its content.
  const { entries } = await ok(await admin().get(`${ADMIN}/journal`));
  const texts = entries.map((e: { text: string }) => e.text);
  expect(texts).toContain('Clara a changé sa réponse');
  expect(texts).toContain('Clara a donné sa réponse');
  expect(texts).toContain('Agnès a donné sa réponse');
});

test('two answers that clash name both, with no error for them', async ({
  page,
  request,
}) => {
  // Bruno names Agnès too: Clara and Bruno clash.
  const clash = await answer(request, 'Bruno', 'Agnès');
  expect(clash.status()).toBe(200);
  await apiLogin(page.request, 'super-elsewhere@example.com');
  await open(page, `/admin/${SLUG}/editions/${state.editionId}`);
  const card = page.getByTestId('action-card');
  await expect(card).toContainText('Deux réponses ne vont pas ensemble');
  await expect(page.getByTestId('answers-conflict')).toContainText(
    'Bruno et Clara',
  );
  await expect(page.getByTestId('answer-status').first()).toHaveText(
    'Réponse à vérifier',
  );
  expect((await admin().post(`${edition()}/answers/validate`)).status()).toBe(
    409,
  );
  // Bruno's page says nothing of it.
  await open(page, `/p/${state.tokens.Bruno}`);
  await expect(page.getByTestId('draw-card')).toContainText(
    'Réponse enregistrée',
  );
});

test('the last answer follows from the others, and validates', async ({
  page,
  request,
}) => {
  // Bruno corrects to Diane: Agnès → Bruno → Diane, Clara → Agnès. Only
  // Clara is named by nobody, and Diane has not answered: hers follows.
  await ok(await answer(request, 'Bruno', 'Diane'));
  await apiLogin(page.request, 'super-elsewhere@example.com');
  await open(page, `/admin/${SLUG}/editions/${state.editionId}`);
  await expect(page.getByTestId('action-card')).toContainText(
    'Il ne manque que Diane',
  );
  await page.getByTestId('validate-without').click();
  await expect(page.getByTestId('validate-sheet')).toBeVisible();
  await page
    .getByRole('button', { name: 'Valider le tirage', exact: true })
    .click();
  await expect(page.getByText('Le tirage est validé').first()).toBeVisible();
  const { edition: done } = await ok(await admin().get(edition()));
  expect(done.status).toBe('drawn');

  // An ordinary draw: each discovers their person, Diane the one left.
  const receiverOf = async (name: string) =>
    (await ok(await request.post(`/api/p/${state.tokens[name]}/reveal`)))
      .receiver.name;
  expect(await receiverOf('Agnès')).toBe('Bruno');
  expect(await receiverOf('Bruno')).toBe('Diane');
  expect(await receiverOf('Clara')).toBe('Agnès');
  expect(await receiverOf('Diane')).toBe('Clara');
  // No answer is left to read.
  expect(
    (await request.get(`/api/p/${state.tokens.Agnès}/answer`)).status(),
  ).toBe(409);
  const { entries } = await ok(await admin().get(`${ADMIN}/journal`));
  expect(entries.map((e: { text: string }) => e.text)).toContain(
    "L'organisateur a validé les réponses : le tirage compte pour 4 participants",
  );
});

test('giving up the answers deletes them', async ({ request }) => {
  // A group of its own: the first one's edition is going on.
  const GROUP = '/api/admin/famille-brouillon';
  await ok(
    await admin().post('/api/admin/groups', {
      data: { name: 'Famille Brouillon' },
    }),
  );
  const ids: Record<string, string> = {};
  for (const firstName of ['Elsa', 'Fanny', 'Gaston']) {
    const { person } = await ok(
      await admin().post(`${GROUP}/persons`, { data: { firstName } }),
    );
    ids[firstName] = person.id;
  }
  const created = await ok(
    await admin().post(`${GROUP}/editions`, {
      data: { label: 'Noël abandonné', year: 2026, eventDate: '2026-12-24' },
    }),
  );
  const base = `${GROUP}/editions/${created.edition.id}`;
  await ok(await admin().post(`${base}/answers/start`));
  const { participants } = await ok(await admin().get(base));
  const { messages } = await ok(
    await admin().get(`${base}/messages?type=answerRequest`),
  );
  const elsa = participants.find(
    (p: { firstName: string }) => p.firstName === 'Elsa',
  );
  const token = new URL(messages[elsa.participationId].link).pathname.split(
    '/p/',
  )[1];
  await ok(
    await request.put(`/api/p/${token}/answer`, {
      data: { personId: ids.Fanny },
    }),
  );
  await ok(await admin().post(`${base}/answers/abandon`));
  const page = await ok(await request.get(`/api/p/${token}`));
  expect(page.drawMode).toBe('app');
  expect(page.answer).toBeNull();
  // Started again: Elsa's answer is gone.
  await ok(await admin().post(`${base}/answers/start`));
  const again = await ok(await request.get(`/api/p/${token}`));
  expect(again.answer).toMatchObject({ given: false, answered: 0 });
  const { entries } = await ok(
    await admin().get('/api/admin/famille-brouillon/journal'),
  );
  expect(entries.map((e: { text: string }) => e.text)).toContain(
    "L'organisateur a abandonné les réponses pour tirer avec l'application",
  );
});
