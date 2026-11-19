import { expect, test } from '@playwright/test';
import { apiLogin, heading, hydrated } from './helpers';

// Gift lists, for the one who holds them (README 22.19, lot 21): the tab,
// a document written in place, the people of my family, sharing. Any
// account may hold lists.
test.describe.configure({ mode: 'serial' });

const HOLDER = 'list-holder@example.com';

test.beforeEach(async ({ page }) => {
  await apiLogin(page.request, HOLDER);
  await page.request.put('/api/auth/profile', {
    data: { firstName: 'Camille', avatarEmoji: '🦌', avatarColor: 'plum' },
  });
});

test('a list is written in its document, and shared', async ({ page }) => {
  await page.goto('/listes');
  await hydrated(page);
  // The bar of the two homes; no list yet.
  await expect(page.getByTestId('tab-bar')).toContainText('Tirages');
  await expect(page.getByTestId('lists-empty')).toContainText(
    'Fini, les cadeaux en double',
  );
  await page.getByRole('link', { name: 'Créer ma première liste' }).click();
  await expect(page).toHaveURL(/\/listes\/[^/]+\?nouvelle=1$/);
  const listUrl = new URL(page.url()).pathname;
  await expect(page.getByTestId('list-state')).toContainText(
    'Brouillon · toi seul la vois',
  );
  await expect(page.getByTestId('note-default')).toContainText(
    'Quelques idées pour t’éviter de chercher.',
  );

  // Sharing an empty draft says what is missing.
  await page.getByTestId('list-state').click();
  await expect(page.getByTestId('share-missing')).toContainText(
    'Donne un nom à l’événement.',
  );
  await page.getByRole('link', { name: 'Revenir à la liste' }).click();

  // The name, written in place; then someone new, and myself.
  await page.getByTestId('list-title').fill('Noël 2026');
  await page.getByTestId('list-title').press('Enter');
  await page.getByRole('button', { name: 'Quelqu’un d’autre' }).click();
  await page.getByLabel('Prénom').fill('Léo');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  const leo = page.getByTestId('list-person').filter({ hasText: 'Léo' });
  await expect(leo).toBeVisible();
  await page
    .getByTestId('add-someone')
    .getByRole('button', { name: 'Camille' })
    .click();
  await expect(
    page.getByTestId('list-person').filter({ hasText: 'Camille' }),
  ).toContainText('Moi');

  // Ideas: the return key goes on to the next line; an address pasted
  // becomes « lien ».
  await leo.getByPlaceholder('Une idée pour Léo…').click();
  await page.keyboard.type('Circuit de billes : https://exemple.fr/billes');
  await page.keyboard.press('Enter');
  await expect(leo.getByTestId('idea-text')).toHaveCount(1);
  await page.keyboard.type('Vélo 16 pouces');
  await page.keyboard.press('Enter');
  await expect(leo.getByTestId('idea-text')).toHaveCount(2);
  // Nothing above the keyboard (README 22.20): what the line can do is
  // under it, while one is in it; touching elsewhere leaves the line.
  await expect(leo.getByTestId('line-actions')).toContainText(
    'Ajouter un lien',
  );
  await leo.getByRole('heading', { name: 'Léo' }).click();
  await expect(leo.getByTestId('line-actions')).toHaveCount(0);
  await expect(leo.getByRole('link', { name: 'lien' })).toHaveAttribute(
    'href',
    'https://exemple.fr/billes',
  );
  // A link written in the line: « : », the address, then the word « lien »
  // with what it can do; taken off again.
  await leo.getByTestId('idea-text').nth(1).click();
  await leo.getByRole('button', { name: 'Ajouter un lien' }).click();
  const address = leo.getByTestId('idea-link-field');
  await expect(address).toBeFocused();
  await expect(leo.getByTestId('line-actions')).toHaveText('Annuler');
  await address.fill('exemple.fr/velo');
  await address.press('Enter');
  await expect(leo.getByTestId('line-actions')).toContainText(
    'Changer le lien',
  );
  await expect(leo.getByTestId('idea-field').first()).toBeFocused();
  await leo.getByRole('heading', { name: 'Léo' }).click();
  await expect(leo.getByRole('link', { name: 'lien' }).nth(1)).toHaveAttribute(
    'href',
    'https://exemple.fr/velo',
  );
  await leo.getByTestId('idea-text').nth(1).click();
  await leo.getByRole('button', { name: 'Retirer le lien' }).click();
  await expect(leo.getByTestId('line-actions')).toContainText(
    'Ajouter un lien',
  );
  await leo.getByRole('heading', { name: 'Léo' }).click();
  await expect(leo.getByRole('link', { name: 'lien' })).toHaveCount(1);
  // Corrected by touching it; emptied, the line goes.
  await leo.getByTestId('idea-text').nth(1).click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('Vélo 18 pouces');
  await page.keyboard.press('Enter');
  await expect(leo.getByTestId('idea-text').nth(1)).toHaveText(
    'Vélo 18 pouces',
  );
  await leo.getByRole('heading', { name: 'Léo' }).click();
  await leo.getByTestId('idea-text').nth(1).click();
  await leo.getByRole('button', { name: 'Supprimer', exact: true }).click();
  await expect(leo.getByTestId('idea-text')).toHaveCount(1);

  // The one who holds the list ticks too, even in a draft: what they give
  // says so under it, as by the link; touched again, the box unticks.
  const box = leo.getByTestId('holder-box').first();
  await box.click();
  await expect(box).toHaveAttribute('aria-checked', 'true');
  await expect(leo.getByTestId('idea-mine')).toContainText(
    'Tu l’offres · seul · Changer',
  );
  await expect(leo.getByTestId('idea-who')).toHaveCount(0);
  // « Changer »: with others, without the choice of staying anonymous.
  await leo.getByRole('button', { name: 'Changer' }).click();
  const sheet = page.getByTestId('claim-sheet');
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('switch')).toHaveCount(0);
  await sheet.getByText('On l’offre à plusieurs').click();
  await page.getByTestId('claim-done').click();
  await expect(leo.getByTestId('idea-mine')).toContainText(
    'Tu l’offres · à plusieurs · Changer',
  );
  await expect(leo.getByTestId('idea-joined')).toHaveText('Tu participes');
  // The box of a gift given by several opens its sheet; « Finalement… ».
  await box.click();
  await page.getByTestId('claim-give-up').click();
  await expect(box).toHaveAttribute('aria-checked', 'false');
  await expect(leo.getByTestId('idea-mine')).toHaveCount(0);

  // Nobody is kept from their own ideas: one of « Moi » ticks and unticks
  // like the others (then goes, for what follows).
  const me = page.getByTestId('list-person').filter({ hasText: 'Camille' });
  await me.getByPlaceholder('Une idée pour Camille…').click();
  await page.keyboard.type('Un bon couteau');
  await page.keyboard.press('Enter');
  await me.getByRole('heading', { name: 'Camille' }).click();
  await expect(me.getByTestId('idea-text')).toHaveCount(1);
  const mine = me.getByTestId('holder-box').first();
  await mine.click();
  await expect(mine).toHaveAttribute('aria-checked', 'true');
  await expect(me.getByTestId('idea-mine')).toContainText('Tu l’offres · seul');
  await mine.click();
  await expect(mine).toHaveAttribute('aria-checked', 'false');
  await me.getByTestId('idea-text').click();
  await me.getByRole('button', { name: 'Supprimer', exact: true }).click();
  await expect(me.getByTestId('idea-text')).toHaveCount(0);

  // The bar is on every screen of someone logged in (README 22.21), the
  // tab of where they are in colour.
  await expect(
    page.getByTestId('tab-bar').getByRole('link', { name: 'Listes' }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    page.getByTestId('tab-bar').getByRole('link', { name: 'Tirages' }),
  ).not.toHaveAttribute('aria-current', 'page');

  // The word: touched, it is mine; erased, there is none.
  await page.getByTestId('note-default').click();
  await page.getByTestId('note-field').fill('');
  await page.getByTestId('list-title').click();
  await expect(page.getByTestId('note-add')).toBeVisible();

  // Shared: the link and the message.
  await page.getByTestId('list-state').click();
  await expect(heading(page)).toHaveText('Partager la liste');
  await expect(page.getByTestId('share-message')).toContainText(
    'Notre liste de cadeaux pour Noël 2026 est prête : Léo et moi.',
  );
  await expect(page.getByTestId('share-message')).toContainText('/l/');
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(page).toHaveURL(new RegExp(`${listUrl}$`));
  await expect(page.getByTestId('list-state')).toContainText(
    'Partagée avec la famille',
  );

  // In the tab.
  await page.goto('/listes');
  await hydrated(page);
  const card = page.getByTestId('list-card').filter({ hasText: 'Noël 2026' });
  await expect(card).toContainText('Tu tiens cette liste');
  await expect(card).toContainText('Camille n’a pas encore d’idées.');
});

test('a person of my family keeps their details from list to list', async ({
  page,
}) => {
  await page.goto('/listes');
  await hydrated(page);
  await page.getByTestId('list-card').first().click();
  const leo = page.getByTestId('list-person').filter({ hasText: 'Léo' });
  await leo.getByRole('link', { name: 'ses goûts' }).click();
  await expect(heading(page)).toHaveText('Léo');
  await page.getByTestId('member-shoe').click();
  await page.getByRole('textbox').fill('30');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByTestId('member-shoe')).toContainText('30');
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(leo).toContainText('pointure 30');

  // A new list: Léo comes back with his idea nobody gave.
  await page.goto('/listes/nouvelle');
  await expect(page).toHaveURL(/nouvelle=1/);
  await page.getByTestId('list-title').fill('Les 7 ans de Léo');
  await page.getByTestId('list-title').press('Enter');
  await page
    .getByTestId('add-someone')
    .getByRole('button', { name: 'Léo' })
    .click();
  await expect(
    page.getByTestId('list-person').filter({ hasText: 'Léo' }),
  ).toContainText('Circuit de billes');
});

test('a document left empty is not kept', async ({ page }) => {
  await page.goto('/listes');
  await hydrated(page);
  const before = await page.getByTestId('list-card').count();
  await page.getByRole('link', { name: 'Nouvelle liste' }).click();
  await expect(page).toHaveURL(/nouvelle=1/);
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(page).toHaveURL(/\/listes$/);
  await expect(page.getByTestId('list-card')).toHaveCount(before);
  // Another account sees nothing of my lists.
  const { coming } = await (await page.request.get('/api/lists')).json();
  await apiLogin(page.request, 'list-other@example.com');
  const refused = await page.request.get(`/api/lists/${coming[0].id}`);
  expect(refused.status()).toBe(404);
});
