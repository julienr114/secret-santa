import { expect, test } from '@playwright/test';
import { addPeople, apiLogin, heading, hydrated } from './helpers';

// The party (V3, ticket 104): « Pour quelle occasion ? » filled from a
// birthday, the page of the party for its organiser and for a member, its
// settings, and leaving it.
test.describe.configure({ mode: 'serial' });

const ORGANISER = 'orga-fete@example.com';
const MEMBER = 'membre-fete@example.com';
const state = { slug: '' };

test('a birthday party comes filled, and is created with me alone', async ({
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

  await page.goto(`/e/nouvelle?categorie=birthday&proche=${id}`);
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
  // Nobody else is asked for (ticket 117): « Continuer » creates it.
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page).toHaveURL(/\/e\/l-anniversaire-de-zoe$/);
  state.slug = 'l-anniversaire-de-zoe';

  // The page: its category, every year, the date of its year, one member.
  await expect(heading(page)).toHaveText('L’anniversaire de Zoé');
  await expect(page.getByTestId('party-category')).toHaveText(
    /Anniversaire · tous les ans/,
  );
  await expect(page.getByTestId('party-members')).toContainText('1 membre');
  // The event has no link: the line opens « Membres » (ticket 116).
  await expect(page.getByTestId('party-members')).not.toContainText('Inviter');
  // A party « pour quelqu'un »: its list first, then a Secret Santa.
  await expect(page.getByTestId('party-lists')).toContainText('Sa liste');
  await expect(page.getByTestId('party-lists')).toContainText(
    'Personne n’a encore mis de liste dans cet événement.',
  );
  await expect(
    page.getByRole('link', { name: 'Organiser un Secret Santa' }),
  ).toBeVisible();
  // The organiser does not leave.
  await expect(page.getByText('Quitter cet événement')).toHaveCount(0);
});

test('its settings are only its own', async ({ page }) => {
  await apiLogin(page.request, ORGANISER);
  await page.goto(`/e/${state.slug}`);
  await hydrated(page);
  await page.getByRole('link', { name: 'Réglages de l’événement' }).click();
  await expect(heading(page)).toHaveText('Réglages de l’événement');
  const settings = page.getByTestId('party-settings');
  await expect(settings).toContainText('Anniversaire');
  await expect(settings).toContainText(
    'Le 14 décembre · proposée chaque année',
  );
  // No Secret Santa yet: nothing of its own to set (ticket 105).
  await expect(
    page.getByRole('link', { name: /^Réglages du Secret Santa/ }),
  ).toHaveCount(0);
  // « Quelqu'un s'inscrit par le lien » is a setting of a Secret Santa.
  await expect(page.getByTestId('notifications')).toHaveCount(0);
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
  // The organiser adds a member by their address, to a Secret Santa:
  // nobody comes into an event by itself (ticket 117).
  const organiser = await playwright.request.newContext({ baseURL });
  await apiLogin(organiser, ORGANISER);
  const at = `/api/admin/${state.slug}`;
  const created = await organiser.post(`${at}/editions`, {
    data: { label: 'Les 4 ans', year: 2026, eventDate: '2026-12-14' },
  });
  expect(created.status()).toBe(201);
  await addPeople(organiser, at, (await created.json()).edition.id, [
    { firstName: 'Hugo', email: MEMBER },
  ]);

  await apiLogin(page.request, MEMBER);
  await page.goto(`/e/${state.slug}`);
  await hydrated(page);
  await expect(heading(page)).toHaveText('L’anniversaire de Zoé');
  await expect(page.getByTestId('party-members')).toContainText('2 membres');
  await expect(page.getByTestId('party-members')).not.toContainText('Inviter');
  await expect(
    page.getByRole('link', { name: 'Réglages de l’événement' }),
  ).toHaveCount(0);

  await page.getByRole('button', { name: /^Quitter cet événement/ }).click();
  const sheet = page.getByRole('dialog', {
    name: 'Quitter « L’anniversaire de Zoé » ?',
  });
  await expect(sheet).toContainText(
    'Les cadeaux que tu as cochés restent prévus.',
  );
  await sheet.getByRole('button', { name: 'Quitter l’événement' }).click();
  await expect(page).toHaveURL(/\/$/);

  // Gone: the party no longer opens for them.
  const after = await page.request.get(`/api/parties/${state.slug}`);
  expect(after.status()).toBe(403);
});

test('the old addresses of a group lead to its party', async ({ page }) => {
  await apiLogin(page.request, ORGANISER);
  await page.goto(`/admin/${state.slug}/personnes`);
  await hydrated(page);
  await expect(page).toHaveURL(new RegExp(`/e/${state.slug}/membres$`));
  await expect(heading(page)).toHaveText('Membres');
});
