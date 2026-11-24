import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { addPeople, apiLogin, heading, hydrated } from './helpers';

// A revealed draw (README 22.18): visible to the whole group. Before the
// reveal, no participant route gives anyone else's result; after it, each
// one sees who they give to without « Découvrir », who gives to them, and
// every pair.
test.describe.configure({ mode: 'serial' });

const SUPER = 'super-reveal@example.com';
const SLUG = 'famille-devoilee';
const ADMIN = `/api/admin/${SLUG}`;
const HUGO = 'hugo-devoile@example.com';
const state: {
  admin?: APIRequestContext;
  base: string;
  editionId: string;
  tokens: Record<string, string>;
} = { base: '', editionId: '', tokens: {} };
const admin = () => state.admin!;
const ok = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  expect(response.ok(), `${response.url()}: ${response.status()}`).toBe(true);
  return response.json();
};
const open = async (page: Page, path: string) => {
  await page.goto(path);
  await hydrated(page);
};

test.beforeAll(async ({ playwright, baseURL }) => {
  state.admin = await playwright.request.newContext({ baseURL });
  await apiLogin(admin(), SUPER);
  await ok(
    await admin().post('/api/admin/groups', {
      data: { name: 'Famille Dévoilée' },
    }),
  );
  // The organiser is Camille, a person of the group: she reveals.
  const created = await ok(
    await admin().post(`${ADMIN}/editions`, {
      data: { label: 'Noël dévoilé', year: 2026, eventDate: '2099-12-24' },
    }),
  );
  state.editionId = created.edition.id;
  state.base = `${ADMIN}/editions/${created.edition.id}`;
  await addPeople(admin(), ADMIN, state.editionId, [
    { firstName: 'Camille', email: SUPER },
    { firstName: 'Hugo', email: HUGO },
    'Inès',
    'Louis',
  ]);
  const { participants } = await ok(await admin().get(state.base));
  const { messages } = await ok(
    await admin().get(`${state.base}/messages?type=invitation`),
  );
  for (const p of participants) {
    state.tokens[p.firstName] = new URL(
      messages[p.participationId].link,
    ).pathname.split('/p/')[1]!;
  }
  await ok(await admin().post(`${state.base}/draw`));
});

test.afterAll(async () => {
  await state.admin?.dispose();
});

test('before the reveal, the draw stays secret', async ({ request }) => {
  const refused = await request.get(`/api/p/${state.tokens.Hugo}/draw`);
  expect(refused.status()).toBe(409);
  const me = await ok(await request.get(`/api/p/${state.tokens.Hugo}`));
  expect(me.drawRevealed).toBe(false);
  expect(JSON.stringify(me)).not.toMatch(/Camille|Inès|Louis/);
});

test('revealed, everyone sees who they give to, their Santa and every pair', async ({
  request,
}) => {
  await ok(
    await admin().post(`${state.base}/reveal`, { data: { early: true } }),
  );
  const hugo = await ok(await request.get(`/api/p/${state.tokens.Hugo}/draw`));
  expect(hugo.pairs).toHaveLength(4);
  expect(hugo.revealedBy).toEqual({ kind: 'name', name: 'Camille' });
  const mine = hugo.pairs.find(
    (p: { giver: { name: string } }) => p.giver.name === 'Hugo',
  );
  expect(hugo.receiver.name).toBe(mine.receiver.name);
  const santa = hugo.pairs.find(
    (p: { receiver: { name: string } }) => p.receiver.name === 'Hugo',
  );
  expect(hugo.santa.name).toBe(santa.giver.name);
  // Nothing was counted: the result was not « discovered ».
  const me = await ok(await request.get(`/api/p/${state.tokens.Hugo}`));
  expect(me.revealed).toBe(false);
  expect(me.drawRevealed).toBe(true);
  const camille = await ok(
    await request.get(`/api/p/${state.tokens.Camille}/draw`),
  );
  expect(camille.revealedBy).toEqual({ kind: 'me' });
});

test('the page of the draw, open at once', async ({ page }) => {
  const token = state.tokens.Hugo;
  const draw = await ok(await page.request.get(`/api/p/${token}/draw`));
  await open(page, `/p/${token}`);
  await expect(page.getByText('Tirage dévoilé')).toBeVisible();
  await expect(page.getByTestId('revealed-banner')).toContainText(
    'Le tirage n’est plus secret. Camille l’a dévoilé le',
  );
  await expect(page.getByTestId('receiver')).toHaveText(draw.receiver.name);
  await expect(
    page.getByRole('button', { name: /Découvrir|Cacher/ }),
  ).toHaveCount(0);
  // The request for ideas stays anonymous, even revealed (ticket 110).
  if (draw.hints && !draw.hints.requested) {
    await expect(
      page.getByText('Sans dire que ça vient de toi.'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Lui demander des idées' }).click();
    await expect(page.getByText('Ton nom n’apparaît nulle part')).toBeVisible();
    await page.getByRole('button', { name: 'Pas maintenant' }).click();
  }
  // « Qui m'offre mon cadeau ? », folded, then shown.
  const line = page.getByTestId('santa-line');
  await expect(line).toContainText('Appuie pour le voir, ou garde la surprise');
  await expect(page.getByTestId('santa-shown')).toHaveCount(0);
  await line.click();
  await expect(page.getByTestId('santa-shown')).toHaveText(
    `C’est ${draw.santa.name} qui t’offre ton cadeau.`,
  );
  // « Voir tout le tirage »: every pair, my line marked.
  await page.getByRole('link', { name: /Voir tout le tirage/ }).click();
  await expect(heading(page)).toHaveText('Qui offre à qui');
  const rows = page.getByTestId('all-pairs').locator('li');
  await expect(rows).toHaveCount(4);
  await expect(rows.filter({ hasText: '· toi' })).toHaveCount(1);
  await expect(page.locator('[data-me]')).toContainText(
    `offre à ${draw.receiver.name}`,
  );
  // Back on the page, the line is folded again.
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(page.getByTestId('santa-line')).toBeVisible();
  await expect(page.getByTestId('santa-shown')).toHaveCount(0);
});

test('the one who revealed reads « Tu l’as dévoilé »', async ({ page }) => {
  await open(page, `/p/${state.tokens.Camille}`);
  await expect(page.getByTestId('revealed-banner')).toContainText(
    'Tu l’as dévoilé le',
  );
});

test('closed and revealed: the past, no secret', async ({ page }) => {
  await ok(await admin().post(`${state.base}/close`));
  const draw = await ok(
    await page.request.get(`/api/p/${state.tokens.Louis}/draw`),
  );
  await open(page, `/p/${state.tokens.Louis}`);
  const card = page.getByTestId('gave-card');
  await expect(card).toContainText('Tu as offert un cadeau à');
  await expect(card).toContainText(draw.receiver.name);
  await expect(card).toContainText(
    'C’est terminé pour cette année. À l’an prochain ?',
  );
  await expect(page.getByTestId('santa-line')).toContainText(
    'Qui m’a offert mon cadeau ?',
  );
  await expect(page.getByTestId('revealed-banner')).toHaveCount(0);
});
