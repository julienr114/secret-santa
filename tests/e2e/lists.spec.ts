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
  // « Partage par lien », its switch off: nothing to unfold.
  const bar = page.getByTestId('share-bar');
  const toggle = page.getByTestId('share-switch');
  await expect(bar).toContainText('Partage par lien');
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByTestId('share-title')).toHaveCount(0);
  await expect(page.getByTestId('note-default')).toContainText(
    'Quelques idées pour t’éviter de chercher.',
  );

  // An empty list cannot be shared: the switch stays off, and only then
  // does the bar say what is missing.
  await expect(page.getByTestId('share-missing')).toHaveCount(0);
  await toggle.click();
  await expect(page.getByTestId('share-missing')).toContainText(
    'Donne un nom à l’événement.',
  );
  await expect(toggle).toHaveAttribute('aria-checked', 'false');

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

  // A first name and an icon change here, by touching them; not the
  // name of « Moi ».
  await leo.getByTestId('person-name').click();
  await page.getByTestId('person-name-field').fill('Léon');
  await page.getByTestId('person-name-field').press('Enter');
  const leon = page.getByTestId('list-person').filter({ hasText: 'Léon' });
  await expect(leon.getByTestId('person-name')).toHaveText('Léon');
  await leon.getByTestId('person-name').click();
  await page.getByTestId('person-name-field').fill('Léo');
  await page.getByTestId('person-name-field').press('Enter');
  await expect(leo.getByTestId('person-name')).toHaveText('Léo');
  await expect(
    page
      .getByTestId('list-person')
      .filter({ hasText: 'Camille' })
      .getByTestId('person-name'),
  ).toHaveCount(0);
  await leo.getByTestId('person-icon').click();
  await expect(page.getByRole('dialog')).toContainText('L’icône de Léo');
  await page.keyboard.press('Escape');
  // Touching elsewhere leaves the line being written.
  const elsewhere = page.getByText('Touche un texte pour le modifier.');

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
  await elsewhere.click();
  await expect(leo.getByTestId('line-actions')).toHaveCount(0);
  await expect(leo.getByRole('link', { name: 'lien' })).toHaveAttribute(
    'href',
    'https://exemple.fr/billes',
  );
  // The arrows and the tab key go from line to line, saving on the way.
  await leo.getByTestId('idea-text').first().click();
  await page.keyboard.press('ArrowDown');
  await expect(leo.getByTestId('idea-field').first()).toBeFocused();
  await expect(leo.getByTestId('idea-field').first()).toHaveValue(
    'Vélo 16 pouces',
  );
  await page.keyboard.press('Tab');
  await expect(leo.getByTestId('idea-field')).toHaveCount(1);
  await expect(leo.getByTestId('idea-field')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(leo.getByTestId('idea-field').first()).toHaveValue(
    'Vélo 16 pouces',
  );
  await page.keyboard.press('ArrowUp');
  await expect(leo.getByTestId('idea-field').first()).toHaveValue(
    'Circuit de billes',
  );
  await expect(leo.getByTestId('idea-field').first()).toBeFocused();
  await elsewhere.click();
  // The erase key in a line with nothing in it: the empty line at the end
  // only goes up; an idea emptied goes, the caret on the line above.
  await leo.getByPlaceholder('Une autre idée…').click();
  await page.keyboard.press('Backspace');
  await expect(leo.getByTestId('idea-field').first()).toHaveValue(
    'Vélo 16 pouces',
  );
  await page.keyboard.press('Enter');
  await page.keyboard.type('À effacer');
  await page.keyboard.press('Enter');
  await expect(leo.getByTestId('idea-text')).toHaveCount(3);
  await page.keyboard.press('Backspace');
  await expect(leo.getByTestId('idea-field').first()).toHaveValue('À effacer');
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await expect(leo.getByTestId('idea-field').first()).toHaveValue(
    'Vélo 16 pouces',
  );
  await elsewhere.click();
  await expect(leo.getByTestId('idea-text')).toHaveCount(2);
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
  await elsewhere.click();
  await expect(leo.getByRole('link', { name: 'lien' }).nth(1)).toHaveAttribute(
    'href',
    'https://exemple.fr/velo',
  );
  await leo.getByTestId('idea-text').nth(1).click();
  await leo.getByRole('button', { name: 'Retirer le lien' }).click();
  await expect(leo.getByTestId('line-actions')).toContainText(
    'Ajouter un lien',
  );
  await elsewhere.click();
  await expect(leo.getByRole('link', { name: 'lien' })).toHaveCount(1);
  // Corrected by touching it; emptied, the line goes.
  await leo.getByTestId('idea-text').nth(1).click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('Vélo 18 pouces');
  await page.keyboard.press('Enter');
  await expect(leo.getByTestId('idea-text').nth(1)).toHaveText(
    'Vélo 18 pouces',
  );
  await elsewhere.click();
  await leo.getByTestId('idea-text').nth(1).click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Enter');
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
  await elsewhere.click();
  await expect(me.getByTestId('idea-text')).toHaveCount(1);
  const mine = me.getByTestId('holder-box').first();
  await mine.click();
  await expect(mine).toHaveAttribute('aria-checked', 'true');
  await expect(me.getByTestId('idea-mine')).toContainText('Tu l’offres · seul');
  await mine.click();
  await expect(mine).toHaveAttribute('aria-checked', 'false');
  await me.getByTestId('idea-text').click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('Backspace');
  await elsewhere.click();
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

  // « ⋯ » at the end of a first name: taken off the list at once, with
  // « Annuler »; with a gift already planned, a second tap says what
  // would be lost.
  await me.getByTestId('person-menu').click();
  await page.getByRole('menuitem', { name: 'Retirer de cette liste' }).click();
  await expect(
    page.getByText('Camille retiré de la liste', { exact: true }),
  ).toBeVisible();
  await expect(me).toHaveCount(0);
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(me).toBeVisible();
  await box.click();
  await expect(box).toHaveAttribute('aria-checked', 'true');
  await leo.getByTestId('person-menu').click();
  await page.getByRole('menuitem', { name: 'Retirer de cette liste' }).click();
  await expect(page.getByRole('menu')).toContainText(
    '1 cadeau déjà prévu sera perdu.',
  );
  await page.getByRole('menuitem', { name: 'Annuler' }).click();
  await expect(leo).toBeVisible();
  await box.click();
  await expect(box).toHaveAttribute('aria-checked', 'false');

  // Shared by its switch: the link unfolds, with the message all ready.
  await expect(page.getByTestId('share-missing')).toHaveCount(0);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  const link = page.getByTestId('share-link');
  await expect(link).toContainText('/l/');
  // « Copier » answers in place.
  await page.context().grantPermissions(['clipboard-write']);
  await page.getByTestId('copy-link').click();
  await expect(page.getByTestId('copy-link')).toHaveText('Copié');
  await expect(bar.getByRole('link', { name: 'Par email' })).toHaveCount(0);
  const first = (await link.textContent()) ?? '';
  // « Changer de lien », confirmed in place: the old one stops working.
  await bar.getByRole('button', { name: 'Changer de lien' }).click();
  await expect(page.getByTestId('share-renew')).toContainText(
    'L’ancien lien ne marchera plus.',
  );
  await page
    .getByTestId('share-renew')
    .getByRole('button', { name: 'Changer', exact: true })
    .click();
  await expect(page.getByTestId('share-renew')).toHaveCount(0);
  await expect(link).not.toHaveText(first);
  const second = (await link.textContent()) ?? '';
  const tokenOf = (shown: string) => shown.split('/l/')[1];
  expect((await page.request.get(`/api/l/${tokenOf(first)}`)).status()).toBe(
    404,
  );
  // Turned off, sharing stops at once; « Annuler » gives the same link.
  await toggle.click();
  await expect(
    page.getByText('Partage par lien arrêté', { exact: true }),
  ).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  expect((await page.request.get(`/api/l/${tokenOf(second)}`)).status()).toBe(
    410,
  );
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  await expect(link).toHaveText(second);

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
  await leo.getByTestId('person-menu').click();
  await page.getByRole('menuitem', { name: 'Sa fiche et ses goûts' }).click();
  await expect(heading(page)).toHaveText('Léo');
  // No sentence of help on the page (Correction 27): lines, and that is all.
  await expect(page.locator('body')).not.toContainText('Ce qu’on demande');
  await expect(page.getByTestId('member-birth')).toContainText('Aucune');

  // Each line opens a page of its own. The shoe size, or sizes: a grid.
  await page.getByTestId('member-shoe').click();
  await expect(heading(page)).toHaveText('Sa ou ses pointures');
  await expect(page.getByRole('textbox')).toHaveCount(0);
  const size = (n: number) =>
    page.getByRole('checkbox', { name: String(n), exact: true });
  const validate = page.getByTestId('member-field-validate');
  await expect(validate).toBeDisabled();
  await size(31).click();
  await size(30).click();
  await size(32).click();
  // Touched again, a size is unticked.
  await size(32).click();
  await expect(size(32)).not.toBeChecked();
  await expect(size(30)).toBeChecked();
  await validate.click();
  // Back on the person's page, with the new value, in rising order.
  await expect(heading(page)).toHaveText('Léo');
  await expect(page.getByTestId('member-shoe')).toContainText('30 ou 31');

  // Opened again, straight by its address: what is saved is ticked.
  const here = new URL(page.url());
  await page.goto(`${here.pathname}/pointure${here.search}`);
  await hydrated(page);
  await expect(size(30)).toBeChecked();
  await expect(size(31)).toBeChecked();
  await expect(size(32)).not.toBeChecked();
  await expect(validate).toBeEnabled();
  await page.getByRole('button', { name: 'Tout effacer' }).click();
  await expect(page.getByTestId('member-shoe')).toContainText('Aucune');
  await page.getByTestId('member-shoe').click();
  await size(30).click();
  await size(31).click();
  await validate.click();
  await expect(page.getByTestId('member-shoe')).toContainText('30 ou 31');

  // The date of birth: three lists, no calendar; incomplete, no « Valider ».
  await page.getByTestId('member-birth').click();
  await expect(heading(page)).toHaveText('Sa date de naissance');
  await page.getByTestId('birth-month').selectOption({ label: 'février' });
  await page.getByTestId('birth-year').selectOption('2020');
  await expect(validate).toBeDisabled();
  // 2020 is a leap year: February has its 29, not a 30.
  await expect(
    page.getByTestId('birth-day').locator('option[value="29"]'),
  ).toHaveCount(1);
  await expect(
    page.getByTestId('birth-day').locator('option[value="30"]'),
  ).toHaveCount(0);
  await page.getByTestId('birth-day').selectOption('29');
  // The day follows the year: 2021 has no 29 February.
  await page.getByTestId('birth-year').selectOption('2021');
  await expect(page.getByTestId('birth-day')).toHaveValue('');
  await expect(validate).toBeDisabled();
  await page.getByTestId('birth-month').selectOption({ label: 'mars' });
  await page.getByTestId('birth-day').selectOption('14');
  await page.getByTestId('birth-year').selectOption('2020');
  await validate.click();
  await expect(page.getByTestId('member-birth')).toContainText(
    '14 mars 2020 · 6 ans',
  );
  // « Effacer la date » under « Valider ».
  await page.getByTestId('member-birth').click();
  await expect(page.getByTestId('birth-day')).toHaveValue('14');
  await page.getByRole('button', { name: 'Effacer la date' }).click();
  await expect(page.getByTestId('member-birth')).toContainText('Aucune');

  // The clothing size: one line, its example in grey, its count.
  await page.getByTestId('member-clothing').click();
  await expect(heading(page)).toHaveText('Sa taille de vêtements');
  const field = page.getByTestId('member-field');
  await expect(field).toHaveAttribute(
    'placeholder',
    '6 ans, M, 38, plutôt grand…',
  );
  expect(await field.evaluate((el) => el.tagName)).toBe('INPUT');
  await expect(page.getByTestId('field-count')).toHaveText('0 / 40');
  await field.fill('6 ans');
  await expect(page.getByTestId('field-count')).toHaveText('5 / 40');
  await field.press('Enter');
  await expect(page.getByTestId('member-clothing')).toContainText('6 ans');
  // « Retour » gives up what was being written.
  await page.getByTestId('member-clothing').click();
  await field.fill('8 ans');
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(page.getByTestId('member-clothing')).toContainText('6 ans');

  // The first name is written in place, in the title.
  await page.getByTestId('member-name').click();
  await page.getByTestId('member-name-field').fill('Léo ');
  await page.getByTestId('member-name-field').press('Enter');
  await expect(heading(page)).toHaveText('Léo');
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(leo).toContainText('pointure 30 ou 31');

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

test('« Mes proches »: everyone, and someone deleted', async ({ page }) => {
  await page.goto('/listes');
  await hydrated(page);
  await page.getByTestId('family-link').click();
  await expect(heading(page)).toHaveText('Mes proches');
  // Someone added here is on no list yet.
  await page.getByRole('button', { name: 'Ajouter quelqu’un' }).click();
  await page.getByLabel('Prénom').fill('Mamie');
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
  const members = page.getByTestId('family-member');
  await expect(members.filter({ hasText: 'Mamie' })).toContainText(
    'sur aucune liste',
  );
  await expect(members.filter({ hasText: 'Léo' })).toContainText(
    'sur 2 listes',
  );
  await expect(members.filter({ hasText: 'Camille' })).toContainText('Moi');

  // In a list, the pill of someone on no list has its cross: deleted at
  // once, with « Annuler ».
  await page.goto('/listes');
  await hydrated(page);
  await page.getByTestId('list-card').filter({ hasText: 'Noël 2026' }).click();
  const add = page.getByTestId('add-someone');
  const mamie = add.getByTestId('family-pill').filter({ hasText: 'Mamie' });
  await mamie.getByTestId('family-cross').click();
  await expect(
    page.getByText('Mamie supprimé de tes proches', { exact: true }),
  ).toBeVisible();
  await expect(mamie).toHaveCount(0);
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(mamie).toBeVisible();
  await mamie.getByTestId('family-cross').click();
  await expect(mamie).toHaveCount(0);
  // Leaving the list sends it: Mamie is gone from « Mes proches ».
  await add.getByRole('link', { name: 'Mes proches' }).click();
  await expect(heading(page)).toHaveText('Mes proches');
  await expect(members.filter({ hasText: 'Léo' })).toBeVisible();
  await expect(members.filter({ hasText: 'Mamie' })).toHaveCount(0);

  // « Moi » cannot be deleted.
  const family = await (await page.request.get('/api/family')).json();
  const self = family.members.find((m: { isSelf: boolean }) => m.isSelf);
  expect((await page.request.delete(`/api/family/${self.id}`)).status()).toBe(
    409,
  );
  // The icon of « Moi » is the one of the account: changed among my
  // people, it changes on the account; changed there, it changes here.
  await page.request.patch(`/api/family/${self.id}`, {
    data: { avatar: { emoji: '🦊', color: 'brick' } },
  });
  const home = await (await page.request.get('/api/auth/home')).json();
  expect(JSON.stringify(home)).toContain('🦊');
  await page.request.put('/api/auth/profile', {
    data: { avatarEmoji: '🦉', avatarColor: 'pine' },
  });
  const after = await (await page.request.get('/api/family')).json();
  expect(
    after.members.find((m: { isSelf: boolean }) => m.isSelf).avatar,
  ).toEqual({ emoji: '🦉', color: 'pine' });
  await members.filter({ hasText: 'Camille' }).click();
  await expect(heading(page)).toHaveText('Camille');
  await expect(page.getByTestId('member-remove')).toHaveCount(0);

  // Someone on lists, from « ⋯ »: a page says what goes with them.
  await page.goto('/listes');
  await hydrated(page);
  await page.getByTestId('list-card').filter({ hasText: 'Noël 2026' }).click();
  const leo = page.getByTestId('list-person').filter({ hasText: 'Léo' });
  await leo.getByTestId('person-menu').click();
  await page
    .getByRole('menuitem', { name: 'Supprimer de mes proches' })
    .click();
  await expect(heading(page)).toHaveText('Supprimer Léo ?');
  const removal = page.getByTestId('member-removal');
  await expect(removal).toContainText('Léo est sur 2 listes');
  await expect(removal).toContainText('« Noël 2026 »');
  await expect(removal).toContainText('Ses 2 idées en sortent.');
  await expect(removal).toContainText('C’est définitif.');
  await page.getByTestId('member-delete').click();
  await expect(page).toHaveURL(/\/listes\/[^/]+$/);
  await expect(leo).toHaveCount(0);
  await expect(
    add.getByTestId('family-pill').filter({ hasText: 'Léo' }),
  ).toHaveCount(0);
});
