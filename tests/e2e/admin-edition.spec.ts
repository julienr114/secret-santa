import { expect, test } from '@playwright/test';
import { heading, hydrated, loginAsGuardian, loginAsSuper } from './helpers';

// The guardian's whole season, from an empty app to a closed edition
// (README section 18, "Parcours").
test.describe.configure({ mode: 'serial' });

const GROUP = {
  name: 'Famille E2E',
  slug: 'famille-e2e',
  password: 'gardien-e2e-1234',
};

test('super-admin creates a group with its guardian', async ({ page }) => {
  await loginAsSuper(page);
  await page.getByRole('link', { name: 'Nouveau' }).click();
  await expect(heading(page)).toHaveText('Nouveau groupe');
  await page.getByLabel('Nom du groupe').fill(GROUP.name);
  await expect(page.getByLabel('Identifiant')).toHaveValue(GROUP.slug);
  await page.getByLabel("Mot de passe de l'organisateur").fill(GROUP.password);
  await page.getByRole('button', { name: 'Créer le groupe' }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/${GROUP.slug}$`));
  await expect(heading(page)).toHaveText(GROUP.name);
});

test('guardian adds people, an exclusion, and runs an edition to the end', async ({
  page,
}) => {
  await loginAsGuardian(page, GROUP.slug, GROUP.password);

  // People
  await page.getByText('Personnes', { exact: true }).click();
  for (const firstName of ['Léa', 'Tom', 'Zoé', 'Hugo']) {
    await page.getByRole('link', { name: 'Ajouter' }).click();
    await page.getByLabel('Prénom').fill(firstName);
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(heading(page)).toHaveText('Personnes');
  }
  await expect(page.locator('main').getByRole('listitem')).toHaveCount(5); // 4 people + "Exclusions"

  // Léa and Tom must not draw each other (both ways by default).
  await page.getByText('Exclusions').click();
  await page.getByText('Ajouter une exclusion').click();
  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: 'Léa' }).click();
  await page.getByRole('combobox').nth(1).click();
  await page.getByRole('option', { name: 'Tom' }).click();
  await page.getByRole('button', { name: "Ajouter l'exclusion" }).click();
  await expect(page.getByText('Léa ↔ Tom')).toBeVisible();

  // Edition
  await page.getByRole('link', { name: 'Retour' }).click();
  await page.getByRole('link', { name: 'Retour' }).click();
  await page.getByText('Nouvelle édition').click();
  await page.getByRole('button', { name: "Créer l'édition" }).click();
  await expect(page.getByText('Brouillon')).toBeVisible();
  await expect(page.getByText('4 participants')).toBeVisible();

  await page.getByRole('button', { name: 'Ouvrir les invitations' }).click();
  await expect(page.getByText('Le tirage est possible')).toBeVisible();

  // Share Hugo's invitation by copying it: he gets the "envoyé" badge.
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByText('Hugo', { exact: true }).click();
  await page.getByText('Copier le message').click();
  await expect(page.getByText('Message copié').first()).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toMatch(/^Salut Hugo !/);
  expect(copied).toMatch(/\/p\/[A-Za-z0-9_-]{43}$/);
  await expect(page.getByText('envoyé', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Retour' }).click();

  await page.getByRole('button', { name: 'Lancer le tirage' }).click();
  await page.getByRole('button', { name: 'Tirer au sort' }).click();
  await expect(page.getByText('Tirage effectué').first()).toBeVisible();
  // Once drawn, the screen shows the exclusions the draw applied.
  await expect(page.getByText('Exclusions appliquées au tirage')).toBeVisible();
  await expect(page.getByText('Léa ↔ Tom')).toBeVisible();

  // The cockpit never shows who drew whom.
  const body = await page.locator('main').innerText();
  expect(body).not.toMatch(/offre|→|receiver/i);

  // Last-resort access to the draw: guarded, then journaled for everyone.
  await page.getByText('Voir un résultat').click();
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Hugo' }).click();
  await page.getByLabel('Ton mot de passe').fill(GROUP.password);
  await page.getByLabel(/Recopie/).fill('je veux voir le tirage');
  await page.getByLabel(/tout le groupe saura/).check();
  await page.getByRole('button', { name: 'Voir ce résultat' }).click();
  // One person at a time, never the whole draw.
  await expect(page.getByText(/^offre à /)).toHaveCount(1);
  await page.getByRole('link', { name: 'Retour' }).click();

  // Cancel with a reason, draw again, close.
  await page.getByText('Annuler et relancer le tirage').click();
  await page.getByLabel('Motif').fill('Test de relance');
  await page.getByLabel(/Je comprends/).check();
  await page.getByRole('button', { name: 'Annuler le tirage' }).click();
  await expect(page.getByText('Le tirage est possible')).toBeVisible();
  await page.getByRole('button', { name: 'Lancer le tirage' }).click();
  await page.getByRole('button', { name: 'Tirer au sort' }).click();
  await page.getByRole('button', { name: 'Clôturer après la fête' }).click();
  await page.getByRole('button', { name: 'Clôturer', exact: true }).click();
  await expect(
    page.getByText('Édition clôturée, en lecture seule.'),
  ).toBeVisible();

  // The guardian reads the same journal as the participants, from the
  // admin: what was done, never who gives to whom.
  await page.getByRole('link', { name: 'Retour' }).click();
  await page.getByRole('link', { name: /Journal du groupe/ }).click();
  await expect(heading(page)).toHaveText('Journal du groupe');
  await expect(
    page.getByText('Le tirage a été annulé. Motif : Test de relance'),
  ).toBeVisible();
  await expect(
    page.getByText(
      "L'organisateur a consulté le résultat de Hugo (accès de dernier recours)",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("L'édition Noël 2026 est clôturée"),
  ).toBeVisible();
  expect(await page.getByTestId('journal').innerText()).not.toMatch(/offre/);
});

test('a guardian cannot reach another group', async ({ page, request }) => {
  await loginAsSuper(page);
  await page.goto('/admin/groupes/nouveau');
  await hydrated(page);
  await page.getByLabel('Nom du groupe').fill('Autre famille');
  await page
    .getByLabel("Mot de passe de l'organisateur")
    .fill('autre-gardien-123');
  await page.getByRole('button', { name: 'Créer le groupe' }).click();
  await expect(page).toHaveURL(/\/admin\/autre-famille$/);

  await page.context().clearCookies();
  await loginAsGuardian(page, GROUP.slug, GROUP.password);
  await page.goto('/admin/autre-famille/personnes');
  await expect(page).toHaveURL(new RegExp(`/admin/${GROUP.slug}$`));
  const api = await page.request.get('/api/admin/autre-famille/persons');
  expect(api.status()).toBe(403);
  const journal = await page.request.get('/api/admin/autre-famille/journal');
  expect(journal.status()).toBe(403);
  expect((await request.get('/api/admin/groups')).status()).toBe(401);
});
