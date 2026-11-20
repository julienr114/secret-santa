import { expect, test } from '@playwright/test';
import { apiLogin, heading, hydrated, loginAsSuper } from './helpers';

// The bar at the bottom of the V3 (ticket 103): « Accueil », « Créer »,
// « Quoi de neuf », and « Admin » for the super-admin; « Créer » opens
// its sheet; the account's menu opens on its icon.
const MEMBER = 'membre-onglets@example.com';
const SUPER = 'super-tabs@example.com';

test('the bar, « Créer » and the menu of the account', async ({ page }) => {
  await apiLogin(page.request, MEMBER);
  await page.goto('/');
  await hydrated(page);
  const bar = page.getByTestId('tab-bar');
  await expect(bar.getByRole('link', { name: 'Accueil' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(bar.getByRole('link', { name: 'Admin' })).toHaveCount(0);
  await expect(bar.getByRole('link', { name: 'Tirages' })).toHaveCount(0);
  await expect(bar.getByRole('link', { name: 'Listes' })).toHaveCount(0);

  // « Créer »: two lines, nothing else, each to « Pour quelle occasion ? ».
  await bar.getByRole('button', { name: 'Créer' }).click();
  const sheet = page.getByRole('dialog', { name: 'Créer' });
  await expect(sheet.getByRole('link')).toHaveText([
    'Un Secret Santa',
    'Une liste',
  ]);
  await sheet.getByRole('link', { name: 'Un Secret Santa' }).click();
  await expect(page).toHaveURL(/\/f\/nouvelle\?pour=secret-santa$/);
  await expect(heading(page)).toHaveText('Pour quelle occasion ?');
  await expect(sheet).toHaveCount(0);

  // « Quoi de neuf »: its tab in colour, nothing yet.
  await bar.getByRole('link', { name: 'Quoi de neuf' }).click();
  await expect(heading(page)).toHaveText('Quoi de neuf');
  await expect(bar.getByRole('link', { name: 'Quoi de neuf' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  // The menu, on one's icon: the account first, the language, log out.
  await page.getByRole('button', { name: 'Mon compte', exact: true }).click();
  await expect(page.getByRole('menuitem')).toHaveText([
    new RegExp(`^Mon compte.*${MEMBER}`),
    /^Langue/,
    'Se déconnecter',
  ]);
});

test('the super-admin has « Admin » in the bar', async ({ page }) => {
  await loginAsSuper(page, SUPER);
  const bar = page.getByTestId('tab-bar');
  await bar.getByRole('link', { name: 'Admin' }).click();
  await expect(heading(page)).toHaveText('Administration');
  await expect(bar.getByRole('link', { name: 'Admin' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  // The list of the groups belongs to the administration too.
  await page.goto('/admin/groupes');
  await hydrated(page);
  await expect(bar.getByRole('link', { name: 'Admin' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});
