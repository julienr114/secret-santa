import { expect, test, type APIRequestContext } from '@playwright/test';
import { addPeople, apiLogin, heading, hydrated } from './helpers';

// The home of the V3 (ticket 103, V3Accueil and V3AccueilVide): a new
// account sees two cards; an account with three Christmas parties and a
// birthday sees the season of Christmas and its countdown, « Bientôt »
// for the birthday of one of its people, « Plus tard » for the rest.

const NEW = 'nouveau-accueil@example.com';
const HUGO = 'hugo-accueil@example.com';
const CAMILLE = 'camille-accueil@example.com';

/** A day from today, ISO. */
const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
const today = inDays(0);
/** The Christmas the countdown is for. */
const christmas =
  today <= `${today.slice(0, 4)}-12-25`
    ? Number(today.slice(0, 4))
    : Number(today.slice(0, 4)) + 1;

const createParty = async (
  api: APIRequestContext,
  data: { category: string; name: string; date: string },
) => {
  const created = await api.post('/api/parties', {
    data: { ...data, recurring: true, memberIds: [] },
  });
  expect(created.ok(), data.name).toBe(true);
  return ((await created.json()) as { slug: string }).slug;
};

test('a new account is asked where to start', async ({ page }) => {
  await apiLogin(page.request, NEW);
  await page.goto('/');
  await hydrated(page);
  await expect(page.getByText('Par quoi on commence ?')).toBeVisible();
  await expect(page.getByTestId('home-empty-secretSanta')).toContainText(
    'Chacun tire au sort la personne à qui il offre un cadeau.',
  );
  await expect(page.getByTestId('home-empty-list')).toContainText(
    'Écrire ma liste',
  );
  await expect(page.getByTestId('home-season')).toHaveCount(0);
  await page.getByRole('link', { name: 'Créer un Secret Santa' }).click();
  await expect(heading(page)).toHaveText('Pour quelle occasion ?');
});

test('the parties of the season of Christmas, a birthday soon, the rest later', async ({
  page,
  playwright,
  baseURL,
}) => {
  // Camille's party, where Hugo is a member.
  const camille = await playwright.request.newContext({ baseURL });
  await apiLogin(camille, CAMILLE);
  const famille = await createParty(camille, {
    category: 'christmas',
    name: 'Famille Camille',
    date: `${christmas}-12-25`,
  });
  // Hugo comes in by its Secret Santa (ticket 117).
  const santa = await camille.post(`/api/admin/${famille}/editions`, {
    data: {
      label: `Noël ${christmas}`,
      year: christmas,
      eventDate: `${christmas}-12-25`,
    },
  });
  expect(santa.status()).toBe(201);
  await addPeople(
    camille,
    `/api/admin/${famille}`,
    (await santa.json()).edition.id,
    [{ firstName: 'Hugo', email: HUGO }],
  );

  // Hugo's own parties, and Zoé, one of his people, soon a year older.
  await apiLogin(page.request, HUGO);
  await page.request.put('/api/auth/profile', {
    data: { firstName: 'Hugo' },
  });
  await createParty(page.request, {
    category: 'christmas',
    name: 'Chez Mamie',
    date: `${christmas}-12-24`,
  });
  await createParty(page.request, {
    category: 'christmas',
    name: 'Bureau, 3e étage',
    date: `${christmas}-12-19`,
  });
  await createParty(page.request, {
    category: 'birthday',
    name: 'Les 40 ans de Tonton',
    date: inDays(80),
  });
  const zoe = await page.request.post('/api/family', {
    data: { firstName: 'Zoé', avatar: { emoji: '🦄', color: 'pine' } },
  });
  const birth = inDays(24);
  await page.request.patch(`/api/family/${(await zoe.json()).id}`, {
    data: { birthDate: `${Number(birth.slice(0, 4)) - 4}${birth.slice(4)}` },
  });

  await page.goto('/');
  await hydrated(page);
  await expect(heading(page)).toHaveText('Bonjour Hugo');
  const season = page.getByTestId('home-season');
  await expect(season.getByRole('heading', { level: 2 })).toHaveText(
    `Noël ${christmas}`,
  );
  // Three Christmas parties, the nearest first, whatever their names.
  await expect(season.getByRole('heading', { level: 3 })).toHaveText([
    'Bureau, 3e étage',
    'Chez Mamie',
    'Famille Camille',
  ]);
  // Hugo has no list in Camille's party yet.
  await expect(
    season.getByTestId('home-party').nth(2).getByRole('link', {
      name: 'Créer une liste de cadeaux',
    }),
  ).toBeVisible();
  // He does not organise it: no « Créer un Secret Santa » there (ticket
  // 151). In Chez Mamie, his, without one: the Secret Santa first, it is
  // Christmas, then the list.
  await expect(
    season.getByTestId('home-party').nth(2).getByTestId('home-create-santa'),
  ).toHaveCount(0);
  await expect(
    season
      .getByTestId('home-party')
      .nth(1)
      .locator('[data-testid^="home-create-"]'),
  ).toHaveText(['Créer un Secret Santa', 'Créer une liste de cadeaux']);

  const soon = page.getByTestId('home-soon');
  await expect(soon).toContainText('L’anniversaire de Zoé');
  await expect(soon).toContainText('dans 24 jours · ses 4 ans');
  await expect(page.getByTestId('home-later')).toContainText(
    'Les 40 ans de Tonton',
  );
  // « Les événements passés » waits for an event over (ticket 108).
  await expect(page.getByTestId('home-past')).toHaveCount(0);
  // « Ce que j'offre ailleurs » waits for a public list where I offer
  // something (ticket 106).
  await expect(page.getByTestId('home-elsewhere')).toHaveCount(0);

  // « Préparer » opens « Pour quelle occasion ? » already filled.
  await soon.getByRole('link', { name: 'Préparer' }).click();
  await expect(heading(page)).toHaveText('Pour quelle occasion ?');
  await expect(page.getByTestId('party-name')).toHaveValue(
    'L’anniversaire de Zoé',
  );

  // The header of a card opens its party.
  await page.goto('/');
  await hydrated(page);
  await page.getByRole('link', { name: /^Famille Camille/ }).click();
  await expect(page).toHaveURL(new RegExp(`/e/${famille}$`));
  await camille.dispose();
});
