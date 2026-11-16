import { expect, test, type APIRequestContext } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// The edition screen in its edge cases (docs/refonte, lot 1): no
// participant yet, a draw that cannot be made, and a large group whose
// lists fold.
test.describe.configure({ mode: 'serial' });

const SUPER = 'super-cases@example.com';
const state: { api?: APIRequestContext } = {};

/**
 * Creates a group, its people and an edition, through the API.
 * @param slug - The group's identifier.
 * @param names - The first names of its people.
 * @returns The admin path of the group and the edition's id.
 */
const setUp = async (slug: string, names: string[]) => {
  const api = state.api!;
  await api.post('/api/admin/groups', { data: { slug, name: slug } });
  const at = `/api/admin/${slug}`;
  for (const firstName of names) {
    await api.post(`${at}/persons`, { data: { firstName } });
  }
  const created = await api.post(`${at}/editions`, {
    data: { label: 'Noël cas', year: 2026, eventDate: '2026-12-24' },
  });
  return { at, id: (await created.json()).edition.id as string };
};

test.beforeAll(async ({ playwright, baseURL }) => {
  state.api = await playwright.request.newContext({ baseURL });
  await apiLogin(state.api, SUPER);
});
test.afterAll(async () => {
  await state.api?.dispose();
});

test('an edition without participants says to add them', async ({ page }) => {
  const { id } = await setUp('cas-vide', []);
  await apiLogin(page.request, SUPER);
  await page.goto(`/admin/cas-vide/editions/${id}`);
  await hydrated(page);
  const card = page.getByTestId('action-card');
  await expect(card).toContainText('Ajoute les participants');
  await expect(
    card.getByRole('link', { name: 'Ajouter des participants' }),
  ).toBeVisible();
  await expect(
    card.getByRole('link', { name: 'Inviter par lien' }),
  ).toBeVisible();
  await expect(page.getByText('Personne pour l’instant.')).toBeVisible();
});

test('an impossible draw names who blocks it, and how to fix it', async ({
  page,
}) => {
  const { at, id } = await setUp('cas-bloque', ['Lou', 'Sacha']);
  const { persons } = await (await state.api!.get(`${at}/persons`)).json();
  const idOf = (name: string) =>
    persons.find((p: { firstName: string }) => p.firstName === name).id;
  await state.api!.post(`${at}/exclusions`, {
    data: { giverId: idOf('Lou'), receiverId: idOf('Sacha'), reciprocal: true },
  });
  await apiLogin(page.request, SUPER);
  await page.goto(`/admin/cas-bloque/editions/${id}`);
  await hydrated(page);
  const card = page.getByTestId('action-card');
  await expect(card).toContainText('À corriger avant le tirage');
  await expect(card).toContainText('Le tirage est impossible pour l’instant');
  await expect(card).toContainText('personne à qui offrir.');
  await expect(
    card.getByRole('link', { name: 'Voir les exclusions' }),
  ).toBeVisible();
  await expect(
    card.getByRole('button', { name: 'Lancer le tirage' }),
  ).toHaveCount(0);
});

test('a large group folds its lists, before and after the draw', async ({
  page,
}) => {
  const names = Array.from(
    { length: 60 },
    (_, i) => `Grand${String(i).padStart(2, '0')}`,
  );
  const { at, id } = await setUp('cas-grand', names);
  const total = (await (await state.api!.get(`${at}/editions/${id}`)).json())
    .participants.length as number;
  await apiLogin(page.request, SUPER);
  await page.goto(`/admin/cas-grand/editions/${id}`);
  await hydrated(page);

  // Six rows, then the rest behind one row that unfolds in place.
  const list = page.getByTestId('participants');
  await expect(list.getByPlaceholder('Chercher un prénom')).toBeVisible();
  // Unfolded all at once, then folded again from the last row.
  await list
    .getByRole('button', { name: `Voir les ${total - 6} autres` })
    .click();
  await expect(list.getByText('Grand59', { exact: true })).toBeVisible();
  await expect(list.getByRole('button', { name: /^Voir les/ })).toHaveCount(0);
  await list.getByRole('button', { name: 'Replier la liste' }).click();
  await expect(list.getByText('Grand59', { exact: true })).toHaveCount(0);
  await expect(
    list.getByRole('button', { name: `Voir les ${total - 6} autres` }),
  ).toBeVisible();
  // The search shows every match, and says when there is none.
  await list.getByPlaceholder('Chercher un prénom').fill('zz');
  await expect(list.getByText('Aucun prénom ne correspond.')).toBeVisible();

  // Drawn: everyone is still to notify; the series shows three rows.
  await state.api!.post(`${at}/editions/${id}/draw`);
  await page.reload();
  await hydrated(page);
  await expect(
    page.getByRole('link', { name: `Prévenir les ${total} par email` }),
  ).toBeVisible();
  const fold = page.getByRole('button', {
    name: `Voir les ${total - 3} autres`,
  });
  await expect(fold).toContainText('Pas encore envoyé');
  // Unfolded, the series ends with "Replier la liste", which keeps its state.
  await fold.click();
  const back = page.getByRole('button', { name: /^Replier la liste/ });
  await expect(back).toContainText('Pas encore envoyé');
  await back.click();
  await expect(fold).toBeVisible();

  // The former page of a participant opens their send sheet instead.
  const { participants } = await (
    await state.api!.get(`${at}/editions/${id}`)
  ).json();
  await page.goto(
    `/admin/cas-grand/editions/${id}/participants/${participants[0].participationId}`,
  );
  await hydrated(page);
  await expect(page).toHaveURL(/\/editions\/[^/]+\?envoyer=/);
  await expect(page.getByTestId('send-sheet')).toBeVisible();
});
