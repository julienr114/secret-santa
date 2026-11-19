import { expect, test } from '@playwright/test';
import { hydrated, loginAsSuper } from './helpers';

// The style guide shows every interface component (README 23): these
// render, and the person picker searches as it should.
test('the style guide shows the edition components', async ({ page }) => {
  await loginAsSuper(page, 'super-design@example.com');
  await page.goto('/admin/guide-de-style');
  await hydrated(page);
  // The guide shows UiPageTitle too: name the real title.
  await expect(
    page.getByRole('heading', { level: 1, name: 'Guide de style' }),
  ).toBeVisible();

  // « Sorbet » (README 23.5): the rosy page, Outfit for the titles and DM
  // Sans for the text, both loaded, and the eight illustrations.
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(255, 246, 241)',
  );
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    const loaded = [...document.fonts]
      .filter((font) => font.status === 'loaded')
      .map((font) => font.family.replaceAll('"', ''));
    return {
      title: getComputedStyle(document.querySelector('h1')!).fontFamily,
      text: getComputedStyle(document.body).fontFamily,
      loaded,
    };
  });
  expect(fonts.title).toContain('Outfit');
  expect(fonts.text).toContain('DM Sans');
  expect(fonts.loaded).toContain('Outfit');
  expect(fonts.loaded).toContain('DM Sans');
  await expect(page.getByTestId('illustrations').locator('svg')).toHaveCount(8);

  // The icons are gradient stickers (lot 23 bis): a person a round with a
  // white edge and a shadow, a list a square that leans.
  const person = page.getByTestId('avatar-sizes').locator('> span').nth(1);
  await expect(person).toHaveCSS('background-image', /^linear-gradient/);
  await expect(person).toHaveCSS(
    'box-shadow',
    /rgb\(255, 255, 255\) 0px 0px 0px 2px/,
  );
  const tile = page.getByTestId('list-tile').first();
  await expect(tile).toHaveCSS('background-image', /^linear-gradient/);
  await expect(tile).not.toHaveCSS('transform', 'none');

  await expect(
    page.getByRole('list', { name: "Étapes de l'édition" }),
  ).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toHaveText(/Tirer/);
  await expect(page.getByText('pas encore ouvert').first()).toBeVisible();
  await expect(
    page.getByRole('img', { name: '12 participants' }).first(),
  ).toContainText('+8');

  // An avatar's emoji is Apple's image, the same on every device, and it
  // loads (lot 15).
  const emoji = page.locator('img[src^="/emoji/"]').first();
  await expect(emoji).toBeVisible();
  expect(
    await emoji.evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBe(64);

  // Ten people or fewer: no search.
  await page.getByRole('button', { name: 'UiPersonPicker (5)' }).click();
  const list = page.getByRole('listbox', { name: 'Le résultat de qui ?' });
  await expect(list.getByRole('option')).toHaveCount(5);
  await expect(
    page.getByRole('dialog').getByPlaceholder('Chercher un prénom'),
  ).toHaveCount(0);
  await list.getByRole('option', { name: 'Hugo' }).click();
  await expect(list.getByRole('option', { name: 'Hugo' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.keyboard.press('Escape');

  // More than ten: a search that ignores accents and capitals.
  await page.getByRole('button', { name: 'Avec recherche (12)' }).click();
  const search = page
    .getByRole('dialog')
    .getByPlaceholder('Chercher un prénom');
  await search.fill('LO');
  await expect(page.getByText('5 prénoms sur 12')).toBeVisible();
  const big = page.getByRole('listbox', { name: 'Le résultat de qui ?' });
  await expect(big.getByRole('option')).toHaveCount(5);
  await expect(big.locator('mark').first()).toHaveText('Lo');
  await expect(big.getByRole('option', { name: 'Élodie' })).toBeVisible();
  await page.keyboard.press('Escape');

  // A long list folds behind one row, which unfolds it in place.
  await page.getByRole('button', { name: /^Voir les 9 autres/ }).click();
  await expect(page.getByRole('button', { name: /^Voir les/ })).toHaveCount(0);
  await expect(page.getByText('Lou', { exact: true })).toBeVisible();
  // Unfolded, the row stays in place and folds the list again.
  const fold = page.getByRole('button', { name: 'Replier la liste' });
  await expect(fold).toHaveAttribute('aria-expanded', 'true');
  await fold.click();
  await expect(page.getByText('Lou', { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: /^Voir les 9 autres/ }),
  ).toBeVisible();

  // A setting is only kept with "Valider".
  const row = page.getByRole('button', { name: /^Éviter la même personne/ });
  await expect(row).toContainText('Pas la même que l’an dernier');
  await row.click();
  await page.getByRole('radio', { name: 'Non, peu importe' }).check();
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(row).toContainText('Pas la même que l’an dernier');
  await row.click();
  await page.getByRole('radio', { name: 'Non, peu importe' }).check();
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(row).toContainText('Non, peu importe');

  // The pieces added with the redesign: a count, a stack, the super-admin
  // frame, a person field, and the journal with its folded line.
  await expect(
    page.getByRole('img', { name: '3 demandes à traiter' }),
  ).toHaveText('3');
  await expect(page.getByText(/UiStack : une carte posée/)).toBeVisible();
  await expect(
    page.getByRole('group', { name: /Super-admin/ }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /UiPersonField : une personne/ }),
  ).toContainText('Hugo');
  // The home signal of the journal: one alert named, or how many.
  const signals = page.getByTestId('journal-signal');
  await expect(signals.first()).toContainText('Ton lien a été régénéré');
  await expect(signals.nth(1)).toContainText('2 alertes');
  const journal = page.getByTestId('journal');
  await expect(journal).toContainText('2 personnes ont ouvert leur enveloppe');
  await journal.getByRole('button', { name: /^Voir le détail/ }).click();
  // Unfolded, one row per person: their icon and their name.
  await expect(journal).toContainText('Hugo');
});

test('the screens before logging in wear the tree, by the name of the app', async ({
  page,
}) => {
  await page.goto('/login');
  await hydrated(page);
  await expect(page.getByRole('img', { name: 'Under the Tree' })).toBeVisible();
});
