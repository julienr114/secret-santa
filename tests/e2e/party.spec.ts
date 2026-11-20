import { expect, test } from '@playwright/test';
import { apiLogin, heading, hydrated } from './helpers';

// The party (V3, ticket 104): « Pour quelle occasion ? » filled from a
// birthday, the page of the party for its organiser and for a member, its
// settings, and leaving it.
test.describe.configure({ mode: 'serial' });

const ORGANISER = 'orga-fete@example.com';
const MEMBER = 'membre-fete@example.com';
const state = { slug: '' };

test('a birthday party comes filled, and is created with its people', async ({
  page,
}) => {
  await apiLogin(page.request, ORGANISER);
  // Zoé, one of my people, born on 14 December.
  const created = await page.request.post('/api/family', {
    data: { firstName: 'Zoé', avatar: { emoji: '🦄', color: 'pine' } },
  });
  const { id } = await created.json();
  await page.request.patch(`/api/family/${id}`, {
    data: { birthDate: '2022-12-14' },
  });

  await page.goto(`/f/nouvelle?categorie=birthday&proche=${id}`);
  await hydrated(page);
  await expect(heading(page)).toHaveText('Pour quelle occasion ?');
  await expect(page.getByTestId('category-birthday')).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(page.getByTestId('party-name')).toHaveValue(
    'L’anniversaire de Zoé',
  );
  await expect(page.getByTestId('party-date-day')).toHaveValue('14');
  await expect(page.getByTestId('party-date-month')).toHaveValue('12');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(heading(page)).toHaveText('Qui est de la fête ?');
  await page.getByTestId('party-create').click();
  await expect(page).toHaveURL(/\/f\/l-anniversaire-de-zoe$/);
  state.slug = 'l-anniversaire-de-zoe';

  // The page: its category, every year, the date of its year, one member.
  await expect(heading(page)).toHaveText('L’anniversaire de Zoé');
  await expect(page.getByTestId('party-category')).toHaveText(
    /Anniversaire · tous les ans/,
  );
  await expect(page.getByTestId('party-members')).toContainText('1 membre');
  await expect(page.getByTestId('party-members')).toContainText('Inviter');
  // A party « pour quelqu'un »: its list first, then a Secret Santa.
  await expect(page.getByTestId('party-lists')).toContainText('Sa liste');
  await expect(page.getByTestId('party-lists')).toContainText(
    'Personne n’a encore mis de liste dans cette fête.',
  );
  await expect(
    page.getByRole('link', { name: 'Organiser un Secret Santa' }),
  ).toBeVisible();
  // The organiser does not leave.
  await expect(page.getByText('Quitter cette fête')).toHaveCount(0);
});

test('its settings are only its own', async ({ page }) => {
  await apiLogin(page.request, ORGANISER);
  await page.goto(`/f/${state.slug}`);
  await hydrated(page);
  await page.getByRole('link', { name: 'Réglages de la fête' }).click();
  await expect(heading(page)).toHaveText('Réglages de la fête');
  const settings = page.getByTestId('party-settings');
  await expect(settings).toContainText('Anniversaire');
  await expect(settings).toContainText(
    'Le 14 décembre · proposée chaque année',
  );
  await expect(
    page.getByRole('link', { name: /^Réglages du Secret Santa/ }),
  ).toBeVisible();
  await expect(page.getByTestId('notifications')).toContainText(
    'Quelqu’un rejoint la fête par le lien',
  );
  // Once a year no more: the date says so.
  await settings.getByRole('switch').click();
  await expect(settings).toContainText('Le 14 décembre');
  await expect(settings).not.toContainText('proposée chaque année');
});

test('a member sees the party, and leaves it', async ({
  page,
  playwright,
  baseURL,
}) => {
  // The organiser adds a member by their address.
  const organiser = await playwright.request.newContext({ baseURL });
  await apiLogin(organiser, ORGANISER);
  await organiser.post(`/api/admin/${state.slug}/persons`, {
    data: { firstName: 'Hugo', email: MEMBER },
  });

  await apiLogin(page.request, MEMBER);
  await page.goto(`/f/${state.slug}`);
  await hydrated(page);
  await expect(heading(page)).toHaveText('L’anniversaire de Zoé');
  await expect(page.getByTestId('party-members')).toContainText('2 membres');
  await expect(page.getByTestId('party-members')).not.toContainText('Inviter');
  await expect(
    page.getByRole('link', { name: 'Réglages de la fête' }),
  ).toHaveCount(0);

  await page.getByRole('button', { name: /^Quitter cette fête/ }).click();
  const sheet = page.getByRole('dialog', {
    name: 'Quitter « L’anniversaire de Zoé » ?',
  });
  await expect(sheet).toContainText(
    'Les cadeaux que tu as cochés restent prévus.',
  );
  await sheet.getByRole('button', { name: 'Quitter la fête' }).click();
  await expect(page).toHaveURL(/\/$/);

  // Gone: the party no longer opens for them.
  const after = await page.request.get(`/api/parties/${state.slug}`);
  expect(after.status()).toBe(403);
});

test('the old addresses of a group lead to its party', async ({ page }) => {
  await apiLogin(page.request, ORGANISER);
  await page.goto(`/admin/${state.slug}/personnes`);
  await hydrated(page);
  await expect(page).toHaveURL(new RegExp(`/f/${state.slug}/membres$`));
  await expect(heading(page)).toHaveText('Membres');
});
