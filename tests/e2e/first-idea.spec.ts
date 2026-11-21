import { expect, test, type APIRequestContext } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// The first idea written from a personal link (ticket 107, Q-018,
// V3ListeCompteCree): it makes the account with the address the organiser
// gave, opens its session and the list, kept for the one who drew; found
// again by logging in. An address that already has an account is never
// opened by the link.
test.describe.configure({ mode: 'serial' });

const SUPER = 'super-first-idea@example.com';
const SLUG = 'famille-premiere-idee';
const ADMIN = `/api/admin/${SLUG}`;
const NEW = 'romane-premiere-idee@example.com';
const KNOWN = 'olga-premiere-idee@example.com';
const TASTE = 'sacha-premiere-idee@example.com';

const state: { admin?: APIRequestContext; links: Record<string, string> } = {
  links: {},
};
const admin = () => state.admin!;
const ok = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  expect(response.ok(), `${response.url()}: ${response.status()}`).toBe(true);
  return response.json();
};

test.beforeAll(async ({ playwright, baseURL }) => {
  state.admin = await playwright.request.newContext({ baseURL });
  await apiLogin(admin(), SUPER);
  await ok(
    await admin().post('/api/admin/groups', {
      data: { slug: SLUG, name: 'Famille Première Idée' },
    }),
  );
  for (const [firstName, email] of [
    ['Romane', NEW],
    ['Olga', KNOWN],
    ['Paul', null],
    ['Sacha', TASTE],
  ] as const) {
    await ok(
      await admin().post(`${ADMIN}/persons`, {
        data: email ? { firstName, email } : { firstName },
      }),
    );
  }
  const { edition } = await ok(
    await admin().post(`${ADMIN}/editions`, {
      data: { label: 'Noël 2026', year: 2026, eventDate: '2099-12-24' },
    }),
  );
  const { participants } = await ok(
    await admin().get(`${ADMIN}/editions/${edition.id}`),
  );
  const { messages } = await ok(
    await admin().get(
      `${ADMIN}/editions/${edition.id}/messages?type=invitation`,
    ),
  );
  state.links = Object.fromEntries(
    participants.map((p: { firstName: string; participationId: string }) => [
      p.firstName,
      new URL(messages[p.participationId].link).pathname,
    ]),
  );
  // Olga already has an account.
  const olga = await playwright.request.newContext({ baseURL });
  await apiLogin(olga, KNOWN);
  await olga.dispose();
});

test.afterAll(async () => {
  await state.admin?.dispose();
});

test('the first idea makes the account and the list, said once', async ({
  page,
  playwright,
  baseURL,
}) => {
  await page.goto(`${state.links.Romane}/liste`);
  await hydrated(page);
  const form = page.getByTestId('list-first-idea');
  await expect(form).toContainText(
    `Un compte sera créé avec ton adresse ${NEW}`,
  );
  await page.getByLabel('Une idée de cadeau').fill('Un livre de cuisine');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await expect(page).toHaveURL(/\/listes\/[^/?]+\?compte=1$/);
  const made = page.getByRole('dialog', { name: 'C’est enregistré' });
  await expect(made).toContainText(
    'Un compte a été créé avec ton adresse, pour retrouver ta liste.',
  );
  await made.getByRole('button', { name: 'Compris' }).click();
  await expect(made).toBeHidden();
  await expect(page).toHaveURL(/\/listes\/[^/?]+$/);
  await expect(page.getByTestId('share-stage')).toContainText(
    'Seul celui qui t’a tiré la voit',
  );
  await expect(page.getByText('Un livre de cuisine')).toBeVisible();
  const listId = page.url().split('/listes/')[1] ?? '';

  // Found again by logging in, elsewhere.
  const later = await playwright.request.newContext({ baseURL });
  await apiLogin(later, NEW);
  const doc = await ok(await later.get(`/api/lists/${listId}`));
  expect(JSON.stringify(doc)).toContain('Un livre de cuisine');
  await later.dispose();

  // Once made, the link does not make another one.
  const again = await playwright.request.newContext({ baseURL });
  const twice = await again.post(
    `/api/p/${state.links.Romane?.split('/p/')[1]}/first-idea`,
    {
      data: { text: 'Encore' },
    },
  );
  expect(twice.status()).toBe(409);
  await again.dispose();
});

test('an address with an account is never opened by the link', async ({
  page,
}) => {
  await page.goto(`${state.links.Olga}/liste`);
  await hydrated(page);
  await expect(page.getByTestId('list-first-idea')).toHaveCount(0);
  await expect(page.getByTestId('list-address')).toBeVisible();
  const forced = await page.request.post(
    `/api/p/${state.links.Olga?.split('/p/')[1]}/first-idea`,
    { data: { text: 'Une écharpe' } },
  );
  expect(forced.status()).toBe(409);
  expect((await forced.json()).statusMessage).toBe('account_exists');
  // And without an address, no list: the address first.
  await page.goto(`${state.links.Paul}/liste`);
  await hydrated(page);
  await expect(page.getByTestId('list-address')).toBeVisible();
});

test('a taste is a first thing written too: it goes on the « Moi » card', async ({
  page,
}) => {
  await page.goto(`${state.links.Sacha}/liste`);
  await hydrated(page);
  await page.getByLabel('En ce moment').fill('Je me mets à la poterie');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await expect(page).toHaveURL(/\/listes\/[^/?]+\?compte=1$/);
  await expect(
    page.getByRole('dialog', { name: 'C’est enregistré' }),
  ).toBeVisible();
  // The same tastes on every list: those of the « Moi » card.
  const family = await ok(await page.request.get('/api/family'));
  const self = family.members.find((m: { isSelf: boolean }) => m.isSelf);
  expect(self.texts.lately).toBe('Je me mets à la poterie');
});
