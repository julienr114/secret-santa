import { expect, test } from '@playwright/test';
import { addPeople, apiLogin, heading, hydrated } from './helpers';

// « Membres », two touches (ticket 137): an organiser added from the
// settings is a member, and their line begins with « Organise » (Q-031);
// for a member who does not organise, the line of the members on the page
// of the event says how many they are and leads nowhere (Q-029).
test.describe.configure({ mode: 'serial' });

const CAMILLE = 'camille-organise@example.com';
const INES = 'ines-organise@example.com';
const HUGO = 'hugo-organise@example.com';
const year = new Date().getFullYear() + 1;
const state = { slug: '' };

type Members = {
  persons: { id: string; email: string | null }[];
  organising: string[];
};

test('an organiser added from the settings reads « Organise »', async ({
  page,
}) => {
  await apiLogin(page.request, CAMILLE);
  const created = await page.request.post('/api/parties', {
    data: {
      category: 'christmas',
      name: 'Noël Organise',
      date: `${year}-12-25`,
      recurring: true,
    },
  });
  expect(created.ok()).toBe(true);
  state.slug = (await created.json()).slug;
  // Hugo comes in by a Secret Santa: a member who does not organise.
  const at = `/api/admin/${state.slug}`;
  const santa = await page.request.post(`${at}/editions`, {
    data: { label: 'Noël', year, eventDate: `${year}-12-25` },
  });
  expect(santa.status()).toBe(201);
  await addPeople(page.request, at, (await santa.json()).edition.id, [
    { firstName: 'Hugo', email: HUGO },
  ]);

  // Inès is added as an organiser, from the settings of the event.
  await page.goto(`/e/${state.slug}`);
  await hydrated(page);
  await page.getByRole('link', { name: 'Réglages de l’événement' }).click();
  await expect(heading(page)).toHaveText('Réglages de l’événement');
  await page.getByRole('button', { name: /^Ajouter un organisateur/ }).click();
  await page.getByLabel('Son adresse email').fill(INES);
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
  await expect(page.getByTestId('organizers').getByText(INES)).toBeVisible();

  const { persons, organising } = (await (
    await page.request.get(`${at}/persons`)
  ).json()) as Members;
  const idOf = (email: string) =>
    persons.find((person) => person.email === email)!.id;
  // She is a member, and so is the one who made the event.
  expect(organising.toSorted()).toEqual([idOf(CAMILLE), idOf(INES)].toSorted());

  await page.goto(`/e/${state.slug}/membres`);
  await hydrated(page);
  const row = (email: string) =>
    page.getByTestId('members').locator(`a[href$="/membres/${idOf(email)}"]`);
  // Only what sets someone apart (ticket 158): she organises and is not
  // in the Secret Santa; Hugo, in it, has nothing under his name.
  await expect(row(INES)).toContainText(/Organise · hors du Secret Santa$/);
  await expect(row(CAMILLE)).toContainText('Organise');
  await expect(row(HUGO)).not.toContainText('Organise');
  await expect(row(HUGO)).not.toContainText('Secret Santa');
});

test('a member cannot touch the line of the members', async ({ page }) => {
  await apiLogin(page.request, HUGO);
  await page.goto(`/e/${state.slug}`);
  await hydrated(page);
  await expect(heading(page)).toHaveText('Noël Organise');
  const line = page.getByTestId('party-members');
  // It says how many they are: Camille, Hugo and Inès.
  await expect(line).toContainText('3 membres');
  // Not a link, no chevron.
  expect(await line.evaluate((node) => node.tagName)).toBe('DIV');
  await expect(line.locator('a, [href]')).toHaveCount(0);
  await expect(line.locator('[class*="chevron-right"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /3 membres/ })).toHaveCount(0);
  await line.click();
  await expect(page).toHaveURL(new RegExp(`/e/${state.slug}$`));
  // « Membres » stays the page of the organisers.
  expect(
    (await page.request.get(`/api/admin/${state.slug}/persons`)).status(),
  ).toBe(403);
});

test('for an organiser, the line opens « Membres »', async ({ page }) => {
  await apiLogin(page.request, INES);
  await page.goto(`/e/${state.slug}`);
  await hydrated(page);
  const line = page.getByTestId('party-members');
  await expect(line.locator('[class*="chevron-right"]')).toHaveCount(1);
  await line.click();
  await expect(heading(page)).toHaveText('Membres');
});
