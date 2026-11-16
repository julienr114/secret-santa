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

  await expect(
    page.getByRole('list', { name: "Étapes de l'édition" }),
  ).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toHaveText(/Tirer/);
  await expect(page.getByText('pas encore ouvert').first()).toBeVisible();
  await expect(
    page.getByRole('img', { name: '12 participants' }).first(),
  ).toContainText('+8');

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
});
