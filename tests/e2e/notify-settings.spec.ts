import { expect, test } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// « Me prévenir » (ticket 121, NotifReglage): reached from the foot of
// « Quoi de neuf » and from « Mon compte », « Un résumé le matin » by
// default, a choice saved as soon as it is made.
const ME = 'notify-settings@example.com';

test('the email choice, from « Quoi de neuf » to « Mon compte »', async ({
  page,
}) => {
  await apiLogin(page.request, ME);
  await page.goto('/quoi-de-neuf');
  await hydrated(page);
  await page.getByTestId('news-settings').click();
  await expect(page).toHaveURL(/\/compte\/me-prevenir$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Me prévenir',
  );
  const choices = page.getByTestId('notify-email');
  await expect(
    choices.getByRole('radio', { name: /Un résumé le matin/ }),
  ).toBeChecked();
  // With the summary, what presses goes at once anyway: said below.
  await expect(page.getByText('Ce qui presse')).toBeVisible();
  const saved = page.waitForResponse(
    (r) => r.url().endsWith('/api/auth/profile') && r.ok(),
  );
  await choices.getByText('Aucun email').click();
  await saved;
  await expect(page.getByText('Ce qui presse')).toHaveCount(0);
  await page.reload();
  await hydrated(page);
  await expect(
    page
      .getByTestId('notify-email')
      .getByRole('radio', { name: /Aucun email/ }),
  ).toBeChecked();
  // « Retour » goes to « Mon compte », which says the choice.
  await page.getByRole('link', { name: 'Mon compte' }).first().click();
  await expect(page).toHaveURL(/\/compte$/);
  await expect(page.getByTestId('account-notify')).toContainText('Aucun email');
});
