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
  await expect(page.locator('[aria-current="step"]')).toHaveText(/Tirage fait/);
  await expect(page.getByText('pas encore ouvert').first()).toBeVisible();
  await expect(
    page.getByRole('img', { name: '12 participants' }).first(),
  ).toContainText('+8');

  // Ten people or fewer: no search.
  await page.getByRole('button', { name: 'UiPersonPicker (5)' }).click();
  const list = page.getByRole('listbox', { name: 'Le résultat de qui ?' });
  await expect(list.getByRole('option')).toHaveCount(5);
  await expect(page.getByPlaceholder('Chercher un prénom')).toHaveCount(0);
  await list.getByRole('option', { name: 'Hugo' }).click();
  await expect(list.getByRole('option', { name: 'Hugo' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.keyboard.press('Escape');

  // More than ten: a search that ignores accents and capitals.
  await page.getByRole('button', { name: 'Avec recherche (12)' }).click();
  const search = page.getByPlaceholder('Chercher un prénom');
  await search.fill('LO');
  await expect(page.getByText('5 prénoms sur 12')).toBeVisible();
  const big = page.getByRole('listbox', { name: 'Le résultat de qui ?' });
  await expect(big.getByRole('option')).toHaveCount(5);
  await expect(big.locator('mark').first()).toHaveText('Lo');
  await expect(big.getByRole('option', { name: 'Élodie' })).toBeVisible();
});
