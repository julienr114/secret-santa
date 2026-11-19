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
  await expect(page.getByTestId('line-bar')).toBeVisible();
  await page.getByRole('button', { name: 'Terminé' }).click();
  await expect(page.getByTestId('line-bar')).toHaveCount(0);
  await expect(leo.getByRole('link', { name: 'lien' })).toHaveAttribute(
    'href',
    'https://exemple.fr/billes',
  );
  // Corrected by touching it; emptied, the line goes.
  await leo.getByTestId('idea-text').nth(1).click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('Vélo 18 pouces');
  await page.keyboard.press('Enter');
  await expect(leo.getByTestId('idea-text').nth(1)).toHaveText(
    'Vélo 18 pouces',
  );
  await leo.getByTestId('idea-text').nth(1).click();
  await page.getByRole('button', { name: 'Supprimer la ligne' }).click();
  await expect(leo.getByTestId('idea-text')).toHaveCount(1);

  // The one who holds the list ticks too, even in a draft; touched again,
  // the box unticks.
  const box = leo.getByTestId('holder-box').first();
  await box.click();
  await expect(box).toHaveAttribute('aria-checked', 'true');
  await expect(leo.getByTestId('idea-who')).toHaveText('C’est toi');
  await box.click();
  await expect(box).toHaveAttribute('aria-checked', 'false');
  await expect(leo.getByTestId('idea-who')).toHaveCount(0);

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
