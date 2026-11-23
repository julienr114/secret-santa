import { expect, test } from '@playwright/test';
import { apiLogin, heading, hydrated, openList } from './helpers';

// Gift lists, for the one who holds them (README 22.19, lot 21): a
// document written in place, the people of my family, sharing. Any
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
  await page.goto('/listes/nouvelle');
  await expect(page).toHaveURL(/\/listes\/[^/]+\?nouvelle=1(&visite=creer)?$/);
  await hydrated(page);
  // The bar at the bottom.
  await expect(page.getByTestId('tab-bar')).toContainText('Accueil');
  // A new list is a draft: the bar says so in one row, and has its link
  // already, written only once unrolled (docs/spec/v3/listes.md, tickets
  // 106 and 135).
  const bar = page.getByTestId('share-bar');
  await expect(page.getByTestId('share-stage')).toContainText('Brouillon');
  await expect(page.getByTestId('share-stage')).toContainText(
    'Toi seul la vois',
  );
  const toggle = page.getByTestId('share-open');
  await expect(toggle).toHaveText('Partager');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByTestId('share-link')).toHaveCount(0);
  await toggle.click();
  await expect(toggle).toHaveText('Fermer');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByTestId('share-link')).toContainText('/l/');
  // The focus went in; Échap folds it, and gives the focus back.
  await expect(page.getByTestId('copy-link')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('share-link')).toHaveCount(0);
  await expect(toggle).toBeFocused();
  // No word at first: a discreet line offers one (ticket 147).
  await expect(page.getByTestId('note-add')).toHaveText(
    'Ajouter un mot d’accueil',
  );

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
    page
      .getByTestId('list-person')
      .filter({ hasText: 'Camille' })
      .getByTestId('me-tag'),
  ).toHaveText('(moi)');

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
  const elsewhere = page.getByRole('heading', { name: 'Ajouter quelqu’un' });

  // Ideas: the return key goes on to the next line; an address pasted
  // becomes « lien ».
  await leo.getByPlaceholder('Une idée pour Léo…').click();
  await page.keyboard.type('Circuit de billes : https://exemple.fr/billes');
  await page.keyboard.press('Enter');
  await expect(leo.getByTestId('idea-text')).toHaveCount(1);
  await page.keyboard.type('Vélo 16 pouces');
  await page.keyboard.press('Enter');
  await expect(leo.getByTestId('idea-text')).toHaveCount(2);
  // Nothing above the keyboard (README 22.20). While one is in a line,
  // the field of its link is under the text (Correction 29): « Ajouter un
  // lien » while empty. Touching elsewhere leaves the line.
  await expect(leo.getByTestId('idea-link-field')).toHaveAttribute(
    'placeholder',
    'Ajouter un lien',
  );
  await expect(
    leo.getByRole('button', { name: 'Ajouter un lien' }),
  ).toHaveCount(0);
  await elsewhere.click();
  await expect(leo.getByTestId('idea-link-row')).toHaveCount(0);
  // Read, the link has a line of its own under the text, with the name
  // of its site in italics (Correction 29): neither « : lien » nor a pill.
  const pill = leo.getByTestId('idea-link');
  await expect(pill).toHaveText('exemple.fr');
  await expect(pill).toHaveAccessibleName('Lien vers exemple.fr');
  await expect(pill).toHaveAttribute('href', 'https://exemple.fr/billes');
  await expect(pill).toHaveAttribute('target', '_blank');
  await expect(pill).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(pill).toHaveCSS('font-style', 'italic');
  await expect(pill).toHaveCSS('font-size', '16px');
  await expect(pill).toHaveCSS('text-decoration-line', 'none');
  await expect(leo.getByTestId('idea-text').first()).not.toContainText(':');
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
  // A link written in its field (maquettes ListeIdee, ListeIdeeLien,
  // ListeIdeeLienFait): touched, it asks for the address; what is not an
  // address keeps the field open, marked, and saves nothing.
  await leo.getByTestId('idea-text').nth(1).click();
  const address = leo.getByTestId('idea-link-field');
  await address.click();
  await expect(address).toHaveAttribute(
    'placeholder',
    'Colle ou écris l’adresse',
  );
  await expect(address).toHaveAttribute('inputmode', 'url');
  await expect(address).toHaveAttribute('autocapitalize', 'none');
  await address.fill('pas une adresse');
  await address.press('Enter');
  await expect(address).toBeFocused();
  await expect(address).toHaveAttribute('aria-invalid', 'true');
  // The return key saves it and goes back to the text; the line stays.
  await address.fill('exemple.fr/velo');
  await expect(address).not.toHaveAttribute('aria-invalid', 'true');
  await address.press('Enter');
  await expect(leo.getByTestId('idea-field').first()).toBeFocused();
  await expect(address).toHaveValue('exemple.fr/velo');
  await elsewhere.click();
  await expect(leo.getByRole('link', { name: 'lien' }).nth(1)).toHaveAttribute(
    'href',
    'https://exemple.fr/velo',
  );
  // Changed in place: the whole address shows, and is saved with the
  // line when it is left; going from the link to the text keeps it open.
  await leo.getByTestId('idea-text').nth(1).click();
  await expect(address).toHaveValue('exemple.fr/velo');
  await address.fill('exemple.fr/velo-rouge');
  await leo.getByTestId('idea-field').first().click();
  await expect(leo.getByTestId('idea-link-row')).toBeVisible();
  await elsewhere.click();
  await expect(leo.getByRole('link', { name: 'lien' }).nth(1)).toHaveAttribute(
    'href',
    'https://exemple.fr/velo-rouge',
  );
  // The cross takes it off.
  await leo.getByTestId('idea-text').nth(1).click();
  await leo.getByRole('button', { name: 'Retirer le lien' }).click();
  await expect(address).toHaveValue('');
  await elsewhere.click();
  await expect(leo.getByRole('link', { name: 'lien' })).toHaveCount(1);
  // An address pasted in the text goes at once to the field of the link,
  // the text keeps the rest.
  await leo.getByTestId('idea-text').nth(1).click();
  await leo
    .getByTestId('idea-field')
    .first()
    .evaluate((el: HTMLTextAreaElement) => {
      el.setSelectionRange(el.value.length, el.value.length);
      const data = new DataTransfer();
      data.setData('text/plain', ' : https://exemple.fr/velo-bleu');
      el.dispatchEvent(
        new ClipboardEvent('paste', {
          clipboardData: data,
          bubbles: true,
          cancelable: true,
        }),
      );
    });
  await expect(address).toHaveValue('exemple.fr/velo-bleu');
  await expect(leo.getByTestId('idea-field').first()).toHaveValue(
    'Vélo 16 pouces',
  );
  // Taken off again, for what follows.
  await leo.getByRole('button', { name: 'Retirer le lien' }).click();
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
  // says so in one pill under it, as by the link (Correction 29).
  const box = leo.getByTestId('holder-box').first();
  await box.click();
  await expect(box).toHaveAttribute('aria-checked', 'true');
  await expect(leo.getByTestId('idea-mine')).toHaveText('Tu l’offres');
  await expect(leo.getByTestId('idea-who')).toHaveCount(0);
  await expect(leo.getByText('Changer', { exact: true })).toHaveCount(0);
  // No « Changer »: the pill of my state opens « Qui l'offre ? », in
  // place of the sheet of what I give (21 November 2026): « Plusieurs »,
  // me alone, proposes a gift given by several.
  await leo.getByTestId('idea-mine').click();
  const sheet = page.getByTestId('who-sheet');
  await expect(sheet).toBeVisible();
  await expect(page.getByTestId('claim-sheet')).toHaveCount(0);
  await page.getByTestId('who-mode').getByText('Plusieurs').click();
  await expect(sheet.getByRole('checkbox', { name: 'Moi' })).toBeChecked();
  await page.getByTestId('who-save').click();
  await expect(leo.getByTestId('idea-mine')).toHaveCount(0);
  await expect(leo.getByTestId('idea-joined')).toHaveText('Tu participes');
  // The green box unticks at once, without the sheet, even in a gift
  // given by several (Julien, 20 November 2026).
  await box.click();
  await expect(page.getByTestId('who-sheet')).toHaveCount(0);
  await expect(box).toHaveAttribute('aria-checked', 'false');
  await expect(leo.getByTestId('idea-mine')).toHaveCount(0);

  // Nobody is kept from their own ideas: one of « Moi » ticks and unticks
  // like the others (then goes, for what follows).
  const me = page.getByTestId('list-person').filter({ hasText: 'Camille' });
  await me.getByPlaceholder('Une idée pour toi…').click();
  await page.keyboard.type('Un bon couteau');
  await page.keyboard.press('Enter');
  await elsewhere.click();
  await expect(me.getByTestId('idea-text')).toHaveCount(1);
  const mine = me.getByTestId('holder-box').first();
  await mine.click();
  await expect(mine).toHaveAttribute('aria-checked', 'true');
  await expect(me.getByTestId('idea-mine')).toHaveText('Tu l’offres');
  await mine.click();
  await expect(mine).toHaveAttribute('aria-checked', 'false');
  await me.getByTestId('idea-text').click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('Backspace');
  await elsewhere.click();
  await expect(me.getByTestId('idea-text')).toHaveCount(0);

  // The bar is on every screen of someone logged in, a list under
  // « Accueil » (V3, ticket 103).
  await expect(
    page.getByTestId('tab-bar').getByRole('link', { name: 'Accueil' }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    page.getByTestId('tab-bar').getByRole('link', { name: 'Quoi de neuf' }),
  ).not.toHaveAttribute('aria-current', 'page');

  // The word: offered with the starting one, the cursor at its end;
  // kept, it is the list's; erased, there is none.
  await page.getByTestId('note-add').click();
  await expect(page.getByTestId('note-field')).toHaveValue(
    /^Quelques idées pour t’éviter de chercher\./,
  );
  await page.getByTestId('list-title').click();
  await expect(page.getByTestId('note-text')).toContainText(
    'Quelques idées pour t’éviter de chercher.',
  );
  await page.getByTestId('note-text').click();
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

  // « Partager »: « Qui voit ta liste ? », and « Tout le monde » asks
  // first, one level further in the bar, where the back cancels; then it
  // is public at once, without « Enregistrer ».
  await page.getByTestId('share-open').click();
  const sharing = page.getByTestId('sharing-panel');
  await sharing.getByText('Tout le monde', { exact: true }).click();
  const opening = page.getByTestId('share-confirm');
  await expect(opening.getByRole('heading')).toHaveText(
    'Ouvrir à tout le monde ?',
  );
  await expect(opening).toContainText('sans compte');
  await expect(opening.getByRole('button', { name: 'Annuler' })).toHaveCount(0);
  await page.getByTestId('share-back').click();
  await expect(page.getByTestId('share-stage')).toContainText('Brouillon');
  await expect(
    sharing.getByRole('radio', { name: 'Qui je veux' }),
  ).toBeChecked();
  await sharing.getByText('Tout le monde', { exact: true }).click();
  await opening.getByRole('button', { name: 'Ouvrir', exact: true }).click();
  await expect(page.getByTestId('share-stage')).toContainText('Publique');
  await expect(page.getByRole('button', { name: 'Enregistrer' })).toHaveCount(
    0,
  );
  // Public, nobody left to choose: « Changer de lien » alone.
  await expect(sharing.getByTestId('sharing-add')).toHaveCount(0);
  await page.getByTestId('share-open').click();
  await expect(sharing).toBeHidden();
  await expect(page.getByTestId('share-open')).toHaveText('Modifier');
  // Unrolled, the address first, then « Qui voit ta liste ? », in one
  // place: no sheet.
  await page.getByTestId('share-open').click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const link = page.getByTestId('share-link');
  await expect(link).toContainText('/l/');
  // « Copier le lien » answers in place.
  await page.context().grantPermissions(['clipboard-write']);
  await page.getByTestId('copy-link').click();
  await expect(page.getByTestId('copy-link')).toHaveText('Copié');
  await expect(bar.getByRole('link', { name: 'Par email' })).toHaveCount(0);
  const first = (await link.textContent()) ?? '';
  // « Changer de lien », confirmed first, in the place of the button: the
  // old one stops working.
  await sharing.getByTestId('sharing-renew').click();
  const renew = page.getByTestId('share-confirm');
  await expect(renew.getByRole('heading')).toHaveText('Changer de lien ?');
  await expect(renew).toContainText('L’ancien lien ne marchera plus');
  await renew.getByRole('button', { name: 'Changer', exact: true }).click();
  await expect(renew).toBeHidden();
  await expect(
    page.getByText('Nouveau lien créé', { exact: true }),
  ).toBeVisible();
  await expect(link).not.toHaveText(first);
  await page.getByTestId('share-open').click();
  await expect(sharing).toBeHidden();
  await page.getByTestId('share-open').click();
  await expect(link).not.toHaveText(first);
  const second = (await link.textContent()) ?? '';
  const tokenOf = (shown: string) => shown.split('/l/')[1];
  expect((await page.request.get(`/api/l/${tokenOf(first)}`)).status()).toBe(
    403,
  );
  expect((await page.request.get(`/api/l/${tokenOf(second)}`)).status()).toBe(
    200,
  );
});

test('a person of my family keeps their details from list to list', async ({
  page,
}) => {
  await openList(page, 'Noël 2026');
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
  await page.goto('/listes/nouvelle');
  await expect(page).toHaveURL(/nouvelle=1/);
  await hydrated(page);
  const draft = new URL(page.url()).pathname.split('/').at(-1);
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect
    .poll(async () => (await page.request.get(`/api/lists/${draft}`)).status())
    .toBe(404);
  // Another account sees nothing of my lists.
  const { coming } = await (await page.request.get('/api/lists')).json();
  await apiLogin(page.request, 'list-other@example.com');
  const refused = await page.request.get(`/api/lists/${coming[0].id}`);
  expect(refused.status()).toBe(404);
});

test('« Mes proches »: everyone, and someone deleted', async ({ page }) => {
  await page.goto('/famille');
  await hydrated(page);
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
  await openList(page, 'Noël 2026');
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
  const account = await (await page.request.get('/api/auth/sessions')).json();
  expect(account.avatar.emoji).toBe('🦊');
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
  await openList(page, 'Noël 2026');
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
