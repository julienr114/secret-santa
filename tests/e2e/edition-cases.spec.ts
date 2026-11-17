import {
  devices,
  expect,
  test,
  type APIRequestContext,
} from '@playwright/test';
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

test('an edition is created with its own budget and word, in one go', async () => {
  const api = state.api!;
  await api.post('/api/admin/groups', {
    data: { slug: 'cas-budget', name: 'cas-budget' },
  });
  const at = '/api/admin/cas-budget';
  const created = await api.post(`${at}/editions`, {
    data: {
      label: 'Noël budget',
      year: 2026,
      eventDate: '2026-12-24',
      budget: '30 €',
      guardianMessage: 'Rien de fait main cette année.',
    },
  });
  expect(created.status()).toBe(201);
  const { edition } = await created.json();
  const { rules } = await (
    await api.get(`${at}/editions/${edition.id}`)
  ).json();
  expect(rules).toMatchObject({
    eventDate: '2026-12-24',
    budget: '30 €',
    guardianMessage: 'Rien de fait main cette année.',
  });
  // Nothing in the journal says the rules changed after the creation.
  const { entries } = await (await api.get(`${at}/journal?locale=fr`)).json();
  expect(
    entries.some((e: { text: string }) => /modifié les règles/.test(e.text)),
  ).toBe(false);
  // Too long a budget is refused, like everywhere else.
  const tooLong = await api.post(`${at}/editions`, {
    data: {
      label: 'Noël trop',
      year: 2027,
      eventDate: '2027-12-24',
      budget: 'x'.repeat(201),
    },
  });
  expect(tooLong.status()).toBe(400);
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

test('choosing the participants adds and removes them at once', async ({
  page,
}) => {
  const { id } = await setUp('cas-choix', ['Ada', 'Bob', 'Cléo']);
  await apiLogin(page.request, SUPER);
  await page.goto(`/admin/cas-choix/editions/${id}`);
  await hydrated(page);
  await page.getByRole('link', { name: 'Choisir les participants' }).click();
  await expect(page.getByText('3 membres du groupe')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Faire participer Bob' }).uncheck();
  // Someone new joins the group and comes back ticked, Bob still unticked.
  await page.getByRole('link', { name: /^Créer une personne/ }).click();
  await page.getByLabel('Prénom').fill('Dan');
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
  await expect(
    page.getByRole('checkbox', { name: 'Faire participer Dan' }),
  ).toBeChecked();
  await expect(
    page.getByRole('checkbox', { name: 'Faire participer Bob' }),
  ).not.toBeChecked();
  await page
    .getByRole('button', { name: 'Enregistrer · 3 participants' })
    .click();
  const list = page.getByTestId('participants');
  await expect(list).toContainText('3 participants');
  await expect(list.getByText('Dan', { exact: true })).toBeVisible();
  await expect(list.getByText('Bob', { exact: true })).toHaveCount(0);
});

test('an impossible draw names who blocks it, and how to fix it', async ({
  page,
}) => {
  const { at, id } = await setUp('cas-bloque', ['Lou', 'Sacha', 'Noé']);
  const { persons } = await (await state.api!.get(`${at}/persons`)).json();
  const idOf = (name: string) =>
    persons.find((p: { firstName: string }) => p.firstName === name).id;
  for (const other of ['Sacha', 'Noé']) {
    await state.api!.post(`${at}/exclusions`, {
      data: { giverId: idOf('Lou'), receiverId: idOf(other), reciprocal: true },
    });
  }
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

  // Nobody has an address, so nobody is ticked: the preview still shows
  // a message, the first participant's, instead of waiting.
  await page.goto(`/admin/cas-grand/editions/${id}/emails?type=drawn`);
  await hydrated(page);
  await expect(page.getByTestId('email-preview')).toContainText('Grand00');

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

test('the budget and the word change on the edition, until it is closed', async ({
  page,
}) => {
  const { at, id } = await setUp('cas-regles', ['Ada', 'Bob', 'Cléo']);
  await page.context().addCookies((await state.api!.storageState()).cookies);
  const edition = `/admin/cas-regles/editions/${id}`;
  await page.goto(edition);
  await hydrated(page);
  // Before the draw, in « Si tu veux ».
  const budget = page.getByTestId('rule-budget');
  await expect(budget).toContainText('Aucun pour l’instant');
  await budget.click();
  await page.getByRole('textbox').fill('25 €');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(budget).toContainText('25 €');
  await expect(page.getByText('cas-regles · Budget 25 €')).toBeVisible();
  const word = page.getByTestId('rule-word');
  await word.click();
  await page.getByRole('textbox').fill('Après le dessert !');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(word).toContainText('Après le dessert !');

  // After the draw, on « Réglages de l'édition » (README 22.16), which
  // the follow-up sums up; the page of the draw shows the new budget.
  await state.api!.post(`${at}/editions/${id}/draw`);
  await page.reload();
  await hydrated(page);
  await expect(page.getByTestId('settings-row')).toContainText(
    'Budget 25 € · petit mot',
  );
  await page.getByTestId('settings-row').click();
  await expect(page.getByTestId('edition-settings')).toContainText(
    'Date de la fête',
  );
  await budget.click();
  await page.getByRole('textbox').fill('30 €');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(budget).toContainText('30 €');
  const { messages } = await (
    await state.api!.get(`${at}/editions/${id}/messages?type=drawn`)
  ).json();
  const link = (Object.values(messages)[0] as { link: string }).link;
  await page.goto(new URL(link).pathname);
  await hydrated(page);
  await page
    .getByRole('button', { name: "Découvrir à qui j'offre un cadeau" })
    .click();
  // Out of the result card since lot 16 bis: under the title, and in the
  // organiser's block.
  await expect(page.getByTestId('draw-facts')).toContainText('Budget : 30 €');
  await expect(page.getByTestId('organizer-note')).toContainText(
    'Après le dessert !',
  );
  await expect(page.locator('.reveal-card')).not.toContainText('30 €');

  // Closed: read only.
  await state.api!.post(`${at}/editions/${id}/close`);
  await page.goto(edition);
  await hydrated(page);
  await expect(budget).toContainText('30 €');
  await budget.click();
  await expect(page.getByRole('textbox')).toHaveCount(0);
});

test('a screen reached by its address says where it belongs, and leads back', async ({
  page,
}) => {
  const { id } = await setUp('cas-contexte', ['Ada', 'Bob', 'Cléo']);
  // The session opened above: a sixth login link would hit the limit.
  await page.context().addCookies((await state.api!.storageState()).cookies);
  // The email screen, straight from its address: its bar names the group
  // and the edition, and « Annuler » leads to the edition.
  await page.goto(`/admin/cas-contexte/editions/${id}/emails`);
  await hydrated(page);
  await expect(page.locator('header')).toContainText('cas-contexte · Noël cas');
  await expect(page).toHaveTitle('Envoyer par email — cas-contexte · Noël cas');
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(page).toHaveURL(new RegExp(`/editions/${id}$`));
  // Another screen of the edition: its context line leads to the edition
  // and to the group.
  await page.goto(`/admin/cas-contexte/editions/${id}/ajouter`);
  await hydrated(page);
  const context = page.getByRole('navigation', { name: 'Tu es ici' });
  await expect(context).toHaveText(/cas-contexte\s*·\s*Noël cas/);
  await context.getByRole('link', { name: 'Noël cas' }).click();
  await expect(page).toHaveURL(new RegExp(`/editions/${id}$`));
  await page.goto(`/admin/cas-contexte/editions/${id}/ajouter`);
  await hydrated(page);
  await page
    .getByRole('navigation', { name: 'Tu es ici' })
    .getByRole('link', { name: 'cas-contexte' })
    .click();
  await expect(page).toHaveURL(/\/admin\/cas-contexte$/);
});

test.describe('on an iPhone', () => {
  // A recent iPhone, in the browser of the tests, held low as when the
  // keyboard or the toolbar takes room.
  const { defaultBrowserType: _browser, ...iphone } = devices['iPhone 15'];
  test.use({ ...iphone, viewport: { width: 393, height: 440 } });

  test('the last button of a sheet stays in sight and works', async ({
    page,
  }) => {
    const { id } = await setUp('cas-iphone', ['Ada', 'Bob', 'Cléo', 'Dan']);
    await page.context().addCookies((await state.api!.storageState()).cookies);
    await page.goto(`/admin/cas-iphone/editions/${id}`);
    await hydrated(page);
    await page.getByRole('button', { name: 'Lancer le tirage' }).click();
    const last = page.getByRole('button', { name: 'Pas encore' });
    await expect(last).toBeInViewport({ ratio: 1 });
    await expect(
      page.getByRole('button', { name: 'Tirer au sort' }),
    ).toBeInViewport({ ratio: 1 });
    await last.click();
    await expect(page.getByTestId('draw-sheet')).toHaveCount(0);
  });
});

test('from the day of the party, the organiser reveals who gave to whom', async ({
  page,
}) => {
  const { at, id } = await setUp('cas-devoiler', ['Ada', 'Bob', 'Cyd']);
  const api = state.api!;
  await api.post(`${at}/editions/${id}/draw`);
  // Still secret: no pairs before revealing.
  expect((await api.get(`${at}/editions/${id}/results`)).status()).toBe(403);
  // The party is today.
  const today = new Date().toISOString().slice(0, 10);
  await api.patch(`${at}/editions/${id}`, { data: { eventDate: today } });

  await page.context().addCookies((await api.storageState()).cookies);
  await page.goto(`/admin/cas-devoiler/editions/${id}`);
  await hydrated(page);
  const card = page.getByTestId('action-card');
  await expect(card).toContainText('dévoile les résultats');
  await card.getByRole('button', { name: 'Dévoiler les résultats' }).click();
  const sheet = page.getByRole('dialog');
  await expect(sheet.getByTestId('reveal-confirm')).toContainText(
    '3 personnes n’ont pas consulté leur résultat',
  );
  await sheet.getByRole('button', { name: 'Dévoiler les résultats' }).click();
  await expect(page.getByTestId('revealed-notice')).toContainText(
    'Résultats dévoilés',
  );
  await expect(page.getByText('Le tirage · 3 participants')).toBeVisible();
  await expect(page.getByText(/^a offert à /)).toHaveCount(3);
  await expect(page.locator('[aria-current="step"]')).toHaveCount(0);

  // For good: once only, and the draw can no longer be cancelled.
  const pairs = await (await api.get(`${at}/editions/${id}/results`)).json();
  expect(pairs.pairs).toHaveLength(3);
  const again = await api.post(`${at}/editions/${id}/reveal`, { data: {} });
  expect(again.status()).toBe(409);
  const redraw = await api.post(`${at}/editions/${id}/redraw`, {
    data: { reason: 'Trop tard' },
  });
  expect(redraw.status()).toBe(409);
  // Everyone reads it in the journal, never who gave to whom.
  const { entries } = await (await api.get(`${at}/journal`)).json();
  expect(entries[0].text).toBe(
    "L'organisateur a dévoilé les résultats du tirage",
  );
});

test('before the party, revealing asks for a phrase', async ({ page }) => {
  const { at, id } = await setUp('cas-devoiler-tot', ['Ada', 'Bob', 'Cyd']);
  const api = state.api!;
  await api.post(`${at}/editions/${id}/draw`);
  await api.patch(`${at}/editions/${id}`, {
    data: { eventDate: '2099-12-24' },
  });
  // Not on the quiet: the route wants the organiser's say-so.
  const quiet = await api.post(`${at}/editions/${id}/reveal`, { data: {} });
  expect(quiet.status()).toBe(409);

  await page.context().addCookies((await api.storageState()).cookies);
  await page.goto(`/admin/cas-devoiler-tot/editions/${id}`);
  await hydrated(page);
  // Before the party, revealing is in « Un souci ? ».
  await page.getByTestId('trouble-row').click();
  await page.getByText('Dévoiler avant la fête').click();
  const sheet = page.getByRole('dialog');
  await expect(sheet.getByTestId('reveal-early')).toContainText(
    'Le secret s’arrête ici, pour de bon',
  );
  const anyway = sheet.getByRole('button', { name: 'Dévoiler quand même' });
  await expect(anyway).toBeDisabled();
  await sheet.getByRole('textbox').fill('Dévoiler avant la fête');
  await anyway.click();
  await expect(page.getByTestId('revealed-notice')).toBeVisible();
  const { entries } = await (await api.get(`${at}/journal`)).json();
  expect(entries[0].text).toBe(
    "L'organisateur a dévoilé les résultats avant la fête",
  );
});
