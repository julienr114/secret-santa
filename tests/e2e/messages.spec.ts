import { expect, test } from '@playwright/test';
import { hydrated, loginAsSuper } from './helpers';

// The messages after an action (README 23.3, Correction 26, maquette
// StyleMessages), fired from the style guide: one dark plum bar at the
// bottom, one at a time; « Annuler » takes back; what did not work stays
// until closed.
test('a message is a dark bar, one at a time; « Annuler » undoes, an error stays', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await loginAsSuper(page, 'super-design@example.com');
  await page.goto('/admin/guide-de-style');
  await hydrated(page);
  const guide = page.getByTestId('guide-messages');
  // Done, and it can be taken back: the text, and « Annuler » on its right.
  await guide.getByRole('button', { name: 'Fait, et ça se rattrape' }).click();
  const undo = page.getByText('Coche de Mamie retirée', { exact: true });
  await expect(undo).toBeVisible();
  // Dark plum, white text, at the bottom of the screen.
  const bar = page.locator('li').filter({ has: undo });
  await expect(bar).toHaveCSS('background-color', 'rgb(43, 27, 61)');
  await expect(undo).toHaveCSS('color', 'rgb(255, 255, 255)');
  const box = await bar.boundingBox();
  const height = page.viewportSize()?.height ?? 0;
  expect((box?.y ?? 0) > height / 2).toBe(true);
  await bar.getByRole('button', { name: 'Annuler' }).click();
  await expect(page.getByTestId('guide-undone')).toContainText('touché 1 fois');
  await expect(undo).toHaveCount(0);

  // One at a time: a new one replaces the old.
  await guide.getByRole('button', { name: 'Fait, et ça se rattrape' }).click();
  await expect(undo).toBeVisible();
  await guide.getByRole('button', { name: 'Fait', exact: true }).click();
  await expect(
    page.getByText('3 emails envoyés', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Inès, Louis et Mamie')).toBeVisible();
  await expect(undo).toHaveCount(0);
  // It goes by itself after 4 seconds.
  await expect(page.getByText('3 emails envoyés', { exact: true })).toHaveCount(
    0,
    { timeout: 7000 },
  );

  // What did not work says what to do, and stays until it is closed.
  await guide.getByRole('button', { name: "Ça n'a pas marché" }).click();
  const failed = page.getByText('L’envoi n’est pas parti', { exact: true });
  await expect(failed).toBeVisible();
  await expect(
    page.locator('[data-slot="description"]', {
      hasText: 'Vérifie ta connexion, puis réessaie.',
    }),
  ).toBeVisible();
  // Read out at once, as an alert.
  await expect(
    page.locator('[role="alert"][aria-live="assertive"]'),
  ).toContainText('n’est pas parti');
  await page.waitForTimeout(7000);
  await expect(failed).toBeVisible();
  await page.getByRole('button', { name: 'Fermer' }).click();
  await expect(failed).toHaveCount(0);
});
