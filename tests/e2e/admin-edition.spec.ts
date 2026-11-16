import { expect, test } from '@playwright/test';
import {
  apiLogin,
  heading,
  hydrated,
  loginAsOrganizer,
  loginAsSuper,
} from './helpers';

const SUPER = 'super-edition@example.com';

// The guardian's whole season, from an empty app to a closed edition
// (README section 18, "Parcours").
test.describe.configure({ mode: 'serial' });

const GROUP = {
  name: 'Famille E2E',
  slug: 'famille-e2e',
  organizer: 'orga-e2e@example.com',
};

test('super-admin creates a group with its guardian', async ({ page }) => {
  await loginAsSuper(page, SUPER);
  await page.getByRole('link', { name: 'Tous les groupes' }).click();
  await page.getByRole('link', { name: 'Nouveau groupe' }).click();
  await expect(heading(page)).toHaveText('Nouveau groupe');
  await page.getByLabel('Nom du groupe').fill(GROUP.name);
  await page
    .getByLabel('Adresse du premier organisateur')
    .fill(GROUP.organizer);
  await page.getByRole('button', { name: 'Créer le groupe' }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/${GROUP.slug}$`));
  await expect(heading(page)).toHaveText(GROUP.name);
});

test('guardian adds people, an exclusion, and runs an edition to the end', async ({
  page,
}) => {
  await loginAsOrganizer(page, GROUP.slug, GROUP.organizer);

  // People
  await page.getByRole('link', { name: /^Membres/ }).click();
  for (const firstName of ['Léa', 'Tom', 'Zoé', 'Hugo']) {
    await page.getByRole('link', { name: 'Ajouter' }).click();
    await page.getByLabel('Prénom').fill(firstName);
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(heading(page)).toHaveText('Personnes');
  }
  // 4 people, the organiser (a person of the group by default), the
  // invitation link and "Exclusions"
  await expect(page.locator('main').getByRole('listitem')).toHaveCount(7);

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
  await page.getByRole('button', { name: 'Retour' }).click();
  await page.getByRole('button', { name: 'Retour' }).click();
  await page.getByRole('link', { name: "Créer l'édition" }).click();
  // The party date is required: Christmas Day is offered in one tap.
  await page.getByRole('button', { name: "Créer l'édition" }).click();
  await expect(page.getByText('Choisis la date de la fête')).toBeVisible();
  await page.getByRole('button', { name: 'Choisir une date' }).click();
  await page.getByRole('button', { name: /^Proposer le 25 décembre/ }).click();
  await page.getByRole('button', { name: "Créer l'édition" }).click();
  // Ready to prepare at once: links work, the draw can be checked.
  await expect(
    page.getByText('5 participants, toutes les règles sont respectées.'),
  ).toBeVisible();
  const editionUrl = new URL(page.url()).pathname;
  // The party date stays in the header, and changes in a sheet.
  await expect(page.getByTestId('party-date')).toContainText('25 décembre');
  await page.getByTestId('party-date').click();
  await expect(page.getByTestId('date-sheet')).toContainText(
    'Le changement est inscrit au journal du groupe.',
  );
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  await expect(page.getByTestId('date-sheet')).toHaveCount(0);
  // The exclusions of the group apply to the edition.
  await page.getByText('1 exclusion').click();
  await expect(page.getByText('Léa ↔ Tom')).toBeVisible();
  await page.getByRole('button', { name: 'Retour' }).click();

  // A tap on Hugo opens his send sheet: copy his invitation.
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  // Before the draw, a tap on Hugo opens his page in the group.
  await page.getByText('Hugo', { exact: true }).click();
  await expect(page).toHaveURL(/\/personnes\//);
  await page.getByRole('button', { name: 'Retour' }).click();
  await hydrated(page);

  await page.getByRole('button', { name: 'Lancer le tirage' }).click();
  // A slow draw says it is working and keeps the sheet open.
  await page.route('**/draw', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.continue();
  });
  await page.getByRole('button', { name: 'Tirer au sort' }).click();
  await expect(
    page.getByRole('button', { name: 'Tirage en cours…' }),
  ).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Pas encore' })).toBeDisabled();
  await expect(page.getByText('Tirage effectué').first()).toBeVisible();
  await page.unroute('**/draw');
  await expect(
    page.getByText('Préviens chacun que le tirage est fait'),
  ).toBeVisible();
  // The cockpit never shows who drew whom.
  const body = await page.locator('main').innerText();
  expect(body).not.toMatch(/offre|→|receiver/i);
  // Each one is sent their link in a sheet, which then moves on to the
  // next one still to notify. Nobody here has an address: share or copy.
  await page.getByRole('button', { name: 'Envoyer le lien de Léa' }).click();
  await expect(page.getByText('Envoyer à Léa').first()).toBeVisible();
  await expect(page.getByTestId('send-preview')).toContainText('Léa');
  await expect(
    page.getByText('Une fois envoyé, le panneau passe à Orga.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Copier le message' }).click();
  await expect(page.getByText('Envoyer à Orga').first()).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toMatch(/^Léa, le tirage est fait/);
  expect(copied).toMatch(/\/p\/[A-Za-z0-9_-]{43}/);
  await page.keyboard.press('Escape');
  // Sent: her sheet offers to send again, and the repairs, folded.
  await page.getByRole('button', { name: 'Renvoyer le lien de Léa' }).click();
  await expect(page.getByText('Renvoyer à Léa').first()).toBeVisible();
  await page.getByRole('button', { name: 'Dépannage' }).click();
  const repairs = page.getByTestId('troubleshoot');
  await expect(repairs).toContainText('Pas envoyé finalement ?');
  await expect(repairs).toContainText('Régénérer son lien');
  await expect(repairs).not.toContainText('Retirer');
  // Her address is added in place: a wrong one is refused, then the sheet
  // offers email first.
  await page.getByRole('button', { name: "Ajouter l'adresse de Léa" }).click();
  const field = page.getByLabel('Adresse email de Léa');
  await field.fill('lea@');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(
    page.getByTestId('email-inline').getByRole('alert'),
  ).toBeVisible();
  await field.fill('lea-cases@example.com');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(
    page.getByRole('button', { name: /^Renvoyer par email/ }),
  ).toBeVisible();
  await expect(page.getByText('lea-cases@example.com')).toBeVisible();
  await page.keyboard.press('Escape');
  // Once drawn, the exclusions the draw applied are kept.
  await page.goto(`${editionUrl}/exclusions`);
  await hydrated(page);
  await expect(page.getByText('Exclusions appliquées au tirage')).toBeVisible();
  await expect(page.getByText('Léa ↔ Tom')).toBeVisible();
  await page.getByRole('button', { name: 'Retour' }).click();

  // Last-resort access to the draw: guarded, then journaled for everyone.
  await page.getByText('Voir un seul résultat').click();
  await page.getByRole('button', { name: 'Le résultat de qui ?' }).click();
  await page.getByRole('option', { name: 'Hugo' }).click();
  // The group will read this line, with his name.
  await expect(
    page.getByText(
      "L'organisateur a consulté le résultat de Hugo (accès de dernier recours)",
    ),
  ).toBeVisible();
  await page.getByLabel(/Recopie/).fill('je veux voir le tirage');
  await page.getByLabel(/tout le groupe saura/).check();
  await page.getByRole('button', { name: 'Voir le résultat de Hugo' }).click();
  // One person at a time, never the whole draw.
  await expect(page.getByTestId('revealed')).toContainText(
    'Hugo offre un cadeau à',
  );
  await expect(page.getByText(/offre un cadeau à/)).toHaveCount(1);
  await page.getByRole('button', { name: 'Retour' }).click();

  // Cancel with a reason, draw again, close.
  await page.getByText('Annuler et relancer le tirage').click();
  await page.getByLabel('Motif').fill('Test de relance');
  await page.getByLabel(/Je comprends/).check();
  await page.getByRole('button', { name: 'Annuler le tirage' }).click();
  await expect(
    page.getByText('5 participants, toutes les règles sont respectées.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Lancer le tirage' }).click();
  await page.getByRole('button', { name: 'Tirer au sort' }).click();
  // Closing waits for the day after the party: the party is moved to the
  // past, through the same route as the date sheet.
  const editionPath = new URL(page.url()).pathname.replace(
    '/admin/',
    '/api/admin/',
  );
  const moved = await page.request.patch(editionPath, {
    data: { eventDate: '2020-12-25' },
  });
  expect(moved.ok()).toBe(true);
  await page.reload();
  await hydrated(page);
  // The party is over: closing is the action of the moment.
  await expect(
    page.getByText("La fête est passée : clôture l'édition"),
  ).toBeVisible();
  await page.getByRole('button', { name: "Clôturer l'édition" }).click();
  await page.getByRole('button', { name: "Clôturer l'édition" }).click();
  // Closed: every step done, read only, and the way to the next edition.
  await expect(page.getByTestId('closed-notice')).toContainText(
    'Édition clôturée',
  );
  await expect(page.locator('[aria-current="step"]')).toHaveCount(0);
  await expect(page.getByText('Fêté', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Préparer l’édition suivante' }),
  ).toBeVisible();

  // The guardian reads the same journal as the participants, from the
  // admin: what was done, never who gives to whom.
  await page.goto(`/admin/${GROUP.slug}`);
  await hydrated(page);
  await page.getByRole('link', { name: /^Journal/ }).click();
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

test('organisers decide who organises with them', async ({
  page,
  playwright,
  baseURL,
}) => {
  const coOrganizer = 'co-orga-e2e@example.com';
  const other = await playwright.request.newContext({ baseURL });
  // Before being named, the address is a plain member: no admin.
  await apiLogin(other, coOrganizer);
  expect((await other.get(`/api/admin/${GROUP.slug}/persons`)).status()).toBe(
    403,
  );

  await loginAsOrganizer(page, GROUP.slug, GROUP.organizer);
  await page.getByRole('link', { name: /^Réglages/ }).click();
  await page.getByRole('link', { name: /Organisateurs/ }).click();
  await expect(heading(page)).toHaveText('Organisateurs');
  await expect(page.getByText(GROUP.organizer)).toBeVisible();
  await expect(page.getByText('C’est toi')).toBeVisible();
  // Nobody removes themselves by a slip: no cross on one's own row.
  await expect(
    page.getByRole('button', {
      name: `Retirer ${GROUP.organizer} des organisateurs`,
    }),
  ).toHaveCount(0);

  await page.getByText('Ajouter un organisateur').click();
  await page.getByLabel('Adresse email').fill(coOrganizer);
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByText(coOrganizer)).toBeVisible();

  // Named, the same session manages the group, without logging in again.
  const groups = await (await other.get('/api/admin/groups')).json();
  expect(groups.groups.map((g: { slug: string }) => g.slug)).toEqual([
    GROUP.slug,
  ]);
  expect((await other.get(`/api/admin/${GROUP.slug}/persons`)).status()).toBe(
    200,
  );
  const me = await (
    await other.get(`/api/admin/${GROUP.slug}/organizers`)
  ).json();
  const mine = me.organizers.find((o: { me: boolean }) => o.me);
  expect(
    (
      await other.delete(
        `/api/admin/${GROUP.slug}/organizers/${mine.accountId}`,
      )
    ).status(),
  ).toBe(409);

  await page
    .getByRole('button', { name: `Retirer ${coOrganizer} des organisateurs` })
    .click();
  await page.getByRole('button', { name: 'Retirer', exact: true }).click();
  await expect(page.getByText(coOrganizer)).toHaveCount(0);
  // Removed, they keep their account but lose the admin at once.
  expect((await other.get('/api/admin/groups')).status()).toBe(403);
  expect((await other.get(`/api/admin/${GROUP.slug}/persons`)).status()).toBe(
    403,
  );
  await other.dispose();
});

test('a guardian cannot reach another group', async ({ page, request }) => {
  await loginAsSuper(page, SUPER);
  await page.goto('/admin/groupes/nouveau');
  await hydrated(page);
  await page.getByLabel('Nom du groupe').fill('Autre famille');
  await page
    .getByLabel('Adresse du premier organisateur')
    .fill('orga-autre@example.com');
  await page.getByRole('button', { name: 'Créer le groupe' }).click();
  await expect(page).toHaveURL(/\/admin\/autre-famille$/);

  await page.context().clearCookies();
  await loginAsOrganizer(page, GROUP.slug, GROUP.organizer);
  // An organiser only sees their own groups, and the others refuse them.
  await page.goto('/');
  await hydrated(page);
  await expect(page.getByTestId('home-groups')).toContainText(GROUP.name);
  await expect(page.getByText('Autre famille')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Nouveau' })).toHaveCount(0);
  await page.goto('/admin/autre-famille/personnes');
  await hydrated(page);
  await expect(page.getByText("Tu n'as pas accès à ce groupe.")).toBeVisible();
  const api = await page.request.get('/api/admin/autre-famille/persons');
  expect(api.status()).toBe(403);
  const journal = await page.request.get('/api/admin/autre-famille/journal');
  expect(journal.status()).toBe(403);
  expect((await request.get('/api/admin/groups')).status()).toBe(401);
});
