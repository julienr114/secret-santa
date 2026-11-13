import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { heading, hydrated, SUPER_PASSWORD } from './helpers';

// The participant's journey through a personal link (README 4.3 and
// section 18): waiting screen, wish list, counted reveal, journal, and the
// links that must stop working. The guardian's side is driven through the
// API; only the participant uses the browser.
test.describe.configure({ mode: 'serial' });

const SLUG = 'famille-lutins';
const ADMIN = `/api/admin/${SLUG}`;
const NAMES = ['Alice', 'Bruno', 'Chloé'];

type Participant = {
  firstName: string;
  participationId: string;
  viewCount: number;
  avatar: { emoji: string; color: string };
  wishesCount: number;
};

const state: {
  admin?: APIRequestContext;
  editionId: string;
  links: Record<string, string>;
} = { editionId: '', links: {} };

const admin = () => {
  if (!state.admin) throw new Error('admin context missing');
  return state.admin;
};
const post = async (path: string, data?: unknown) => {
  const response = await admin().post(path, data ? { data } : {});
  expect(response.ok(), `${path}: ${response.status()}`).toBe(true);
  return response.json();
};
const edition = async () => {
  const response = await admin().get(`${ADMIN}/editions/${state.editionId}`);
  return response;
};
const participantNamed = async (firstName: string): Promise<Participant> => {
  const { participants } = await (await edition()).json();
  return participants.find((p: Participant) => p.firstName === firstName);
};
const tokenOf = (firstName: string) =>
  (state.links[firstName] ?? '').split('/p/')[1] ?? '';
const open = async (page: Page, path: string) => {
  const response = await page.goto(path);
  await hydrated(page);
  return response;
};

test.beforeAll(async ({ playwright, baseURL }) => {
  state.admin = await playwright.request.newContext({ baseURL });
  await post('/api/admin/login', { scope: 'super', password: SUPER_PASSWORD });
  await post('/api/admin/groups', {
    slug: SLUG,
    name: 'Famille Lutins',
    guardianPassword: 'gardien-lutins-1',
  });
  for (const firstName of NAMES) await post(`${ADMIN}/persons`, { firstName });
  const rules = await admin().patch(`${ADMIN}/rules`, {
    data: { budget: '20 € max', eventDate: '24 décembre' },
  });
  expect(rules.ok()).toBe(true);
  const created = await post(`${ADMIN}/editions`, {
    label: 'Noël des lutins',
    year: 2026,
  });
  state.editionId = created.edition.id;
  await post(`${ADMIN}/editions/${state.editionId}/open`);
  const { participants } = await (await edition()).json();
  const { messages } = await (
    await admin().get(
      `${ADMIN}/editions/${state.editionId}/messages?type=invitation`,
    )
  ).json();
  state.links = Object.fromEntries(
    participants.map((p: Participant) => [
      p.firstName,
      new URL(messages[p.participationId].link).pathname,
    ]),
  );
});

test.afterAll(async () => {
  await state.admin?.dispose();
});

test('before the draw: waiting screen and wish list', async ({ page }) => {
  const response = await open(page, state.links.Alice ?? '');
  expect(response?.headers()['cache-control']).toContain('no-store');
  expect(response?.headers()['referrer-policy']).toBe('no-referrer');
  expect(response?.headers()['x-robots-tag']).toContain('noindex');
  // Link previews must not show a name.
  await expect(page).toHaveTitle('Under the Tree');
  await expect(heading(page)).toHaveText('Salut Alice !');
  await expect(
    page.getByText("Le tirage n'a pas encore eu lieu"),
  ).toBeVisible();

  // Alice picks her own avatar. Closing the sheet gives the choice up;
  // only "Valider" saves it.
  const before = (await participantNamed('Alice')).avatar;
  await page.getByRole('button', { name: 'Changer mon icône' }).click();
  await page.getByRole('radio', { name: '🦊' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Valider' })).toHaveCount(0);
  expect((await participantNamed('Alice')).avatar).toEqual(before);
  await page.getByRole('button', { name: 'Changer mon icône' }).click();
  await page.getByRole('radio', { name: '🦊' }).click();
  await page.getByRole('radio', { name: 'Givre' }).click();
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect
    .poll(async () => (await participantNamed('Alice')).avatar)
    .toEqual({ emoji: '🦊', color: 'frost' });

  // The avatar API only trusts the link: the person is never taken from
  // the request, an unknown link gets nothing, and values are checked.
  const fox = { emoji: '🦊', color: 'frost' };
  const stranger = await page.request.put(`/api/p/${'x'.repeat(43)}/avatar`, {
    data: fox,
  });
  expect(stranger.status()).toBe(404);
  const invalid = await page.request.put(`/api/p/${tokenOf('Alice')}/avatar`, {
    data: { emoji: '<script>', color: 'frost', personId: 'someone-else' },
  });
  expect(invalid.status()).toBe(400);
  expect((await participantNamed('Bruno')).avatar).not.toEqual(fox);

  await page.getByRole('link', { name: /Ma liste de souhaits/ }).click();
  await expect(heading(page)).toHaveText('Ma liste de souhaits');
  // Ideas are added from a bottom sheet and saved with "Valider"; closing
  // the sheet any other way gives the idea up.
  const idea = page.getByLabel('Idée', { exact: true });
  const link = page.getByLabel('Lien (facultatif)');
  const validate = page.getByRole('button', { name: 'Valider' });
  await page.getByText('Ajouter une idée').click();
  await idea.fill('Abandonnée');
  await page.keyboard.press('Escape');
  await expect(validate).toHaveCount(0);
  await expect(page.getByText('Abandonnée')).toHaveCount(0);
  await page.getByText('Ajouter une idée').click();
  await idea.fill('Un livre de cuisine');
  await link.fill('https://example.com/livre');
  await validate.click();
  await expect(page.getByText('https://example.com/livre')).toBeVisible();
  await page.getByText('Ajouter une idée').click();
  await idea.fill('Des chaussette');
  await validate.click();
  await expect(page.getByText('2 idées')).toBeVisible();

  // Tapping an idea opens it again, to change or delete it.
  await page.getByText('Des chaussette').click();
  await idea.fill('Des chaussettes');
  await validate.click();
  await expect(page.getByText('Des chaussettes')).toBeVisible();
  await page.getByText('Ajouter une idée').click();
  await idea.fill('À supprimer');
  await validate.click();
  await page.getByText('À supprimer').click();
  await page.getByRole('button', { name: 'Supprimer l’idée' }).click();
  await expect(page.getByText('À supprimer')).toHaveCount(0);
  await expect
    .poll(async () => (await participantNamed('Alice')).wishesCount)
    .toBe(2);

  await page.getByRole('link', { name: 'Retour' }).click();
  await expect(page.getByText('2 idées')).toBeVisible();
  await page.getByRole('link', { name: /Ma liste de souhaits/ }).click();
  await expect(page.getByText('Des chaussettes')).toBeVisible();

  // The guardian sees how many ideas, never which ones.
  const response2 = await edition();
  expect(await response2.text()).not.toContain('livre de cuisine');
  expect((await participantNamed('Alice')).wishesCount).toBe(2);

  // An invalid link in a wish is refused, and the list is left untouched.
  const bad = await page.request.put(`/api/p/${tokenOf('Alice')}/wishes`, {
    data: { wishes: [{ label: 'Piège', url: 'javascript:alert(1)' }] },
  });
  expect(bad.status()).toBe(400);
  expect((await participantNamed('Alice')).wishesCount).toBe(2);

  // No result before the draw.
  const early = await page.request.post(`/api/p/${tokenOf('Alice')}/reveal`);
  expect(early.status()).toBe(409);
});

test('after the draw: the reveal is explicit, counted and journaled', async ({
  page,
}) => {
  for (const firstName of ['Bruno', 'Chloé']) {
    const saved = await page.request.put(
      `/api/p/${tokenOf(firstName)}/wishes`,
      {
        data: { wishes: [{ label: `Idée de ${firstName}`, url: '' }] },
      },
    );
    expect(saved.ok()).toBe(true);
  }
  await post(`${ADMIN}/editions/${state.editionId}/draw`);

  // Opening the page is not a consultation.
  await open(page, state.links.Alice ?? '');
  await expect(page.getByText('Le tirage est fait !')).toBeVisible();
  await expect(page.getByTestId('receiver')).toHaveCount(0);
  expect((await participantNamed('Alice')).viewCount).toBe(0);

  await page
    .getByRole('button', { name: "Découvrir à qui j'offre un cadeau" })
    .click();
  const receiver = (await page.getByTestId('receiver').innerText()).trim();
  expect(['Bruno', 'Chloé']).toContain(receiver);
  const other = receiver === 'Bruno' ? 'Chloé' : 'Bruno';
  await expect(page.getByText('20 € max')).toBeVisible();
  await expect(page.getByText('24 décembre')).toBeVisible();
  // The receiver's ideas, and only theirs.
  await expect(page.getByText(`Idée de ${receiver}`)).toBeVisible();
  await expect(page.getByText(`Idée de ${other}`)).toHaveCount(0);
  await expect(page.getByText('Un livre de cuisine')).toHaveCount(0);
  expect((await participantNamed('Alice')).viewCount).toBe(1);

  // The result does not survive a reload: the button is back.
  await open(page, state.links.Alice ?? '');
  await expect(page.getByTestId('receiver')).toHaveCount(0);
  await page
    .getByRole('button', { name: "Découvrir à qui j'offre un cadeau" })
    .click();
  await expect(page.getByTestId('receiver')).toHaveText(receiver);
  await page.getByRole('button', { name: 'Cacher mon résultat' }).click();
  await expect(page.getByTestId('receiver')).toHaveCount(0);

  // Everyone can read it in the journal, which never says who gives to whom.
  await page.getByRole('link', { name: /Journal du groupe/ }).click();
  await expect(heading(page)).toHaveText('Journal du groupe');
  await expect(
    page.getByText('Alice a consulté son résultat (2ᵉ fois)'),
  ).toBeVisible();
  await expect(
    page.getByText('Alice a mis à jour sa liste de souhaits (2 idées)').first(),
  ).toBeVisible();
  const journal = await page.getByTestId('journal').innerText();
  expect(journal).not.toMatch(/offre|livre de cuisine|Idée de/);
  const api = await (
    await page.request.get(`/api/p/${tokenOf('Alice')}/journal`)
  ).text();
  expect(api).not.toMatch(/receiver|meta/i);
});

test('a cancelled draw keeps the wish lists and resets the counters', async ({
  page,
}) => {
  await post(`${ADMIN}/editions/${state.editionId}/redraw`, {
    reason: 'Test de relance',
  });
  const alice = await participantNamed('Alice');
  expect(alice.viewCount).toBe(0);
  expect(alice.wishesCount).toBe(2);
  const early = await page.request.post(`/api/p/${tokenOf('Alice')}/reveal`);
  expect(early.status()).toBe(409);
  await post(`${ADMIN}/editions/${state.editionId}/draw`);
});

test('unknown and regenerated links are refused', async ({ page }) => {
  await open(page, `/p/${'x'.repeat(43)}`);
  await expect(page.getByText("Ce lien n'est plus valable")).toBeVisible();

  const old = state.links.Bruno ?? '';
  const { participationId } = await participantNamed('Bruno');
  const { link } = await post(
    `${ADMIN}/participations/${participationId}/regenerate`,
  );
  await open(page, old);
  await expect(page.getByText("Ce lien n'est plus valable")).toBeVisible();
  expect(
    (await page.request.post(`/api/p/${old.split('/p/')[1]}/reveal`)).status(),
  ).toBe(404);
  await open(page, new URL(link).pathname);
  await expect(heading(page)).toHaveText('Salut Bruno !');
});

test('a closed edition is read only', async ({ page }) => {
  await post(`${ADMIN}/editions/${state.editionId}/close`);
  const token = tokenOf('Chloé');
  const refused = await page.request.put(`/api/p/${token}/wishes`, {
    data: { wishes: [{ label: 'Trop tard' }] },
  });
  expect(refused.status()).toBe(409);
  const avatar = await page.request.put(`/api/p/${token}/avatar`, {
    data: { emoji: '🎅', color: 'brick' },
  });
  expect(avatar.status()).toBe(409);

  await open(page, `/p/${token}/souhaits`);
  await expect(
    page.getByText("La liste n'est plus modifiable pour cette édition."),
  ).toBeVisible();
  await expect(page.getByText('Idée de Chloé')).toBeVisible();
  await expect(page.getByText('Ajouter une idée')).toHaveCount(0);
});
