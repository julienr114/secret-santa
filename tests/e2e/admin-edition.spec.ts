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
  await page
    .getByTestId('tab-bar')
    .getByRole('link', { name: 'Admin' })
    .click();
  await page.getByRole('link', { name: /^Événements \d/ }).click();
  await page
    .getByRole('link', { name: /^Créer un événement pour quelqu’un/ })
    .click();
  await expect(heading(page)).toHaveText('Nouvel événement');
  await page.getByLabel('Nom de l’événement').fill(GROUP.name);
  await page
    .getByLabel('Adresse du premier organisateur')
    .fill(GROUP.organizer);
  await page.getByRole('button', { name: 'Créer l’événement' }).click();
  await expect(page).toHaveURL(new RegExp(`/e/${GROUP.slug}$`));
  await expect(heading(page)).toHaveText(GROUP.name);
});

test('guardian adds people, an exclusion, and runs an edition to the end', async ({
  page,
}) => {
  await loginAsOrganizer(page, GROUP.slug, GROUP.organizer);

  // People
  await page.getByTestId('party-members').click();
  for (const firstName of ['Léa', 'Tom', 'Zoé', 'Hugo']) {
    await page.getByRole('link', { name: /^Ajouter une personne/ }).click();
    await page.getByLabel('Prénom').fill(firstName);
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
    await expect(heading(page)).toHaveText('Membres');
  }
  // 4 people, the organiser (a person of the group by default), « Ajouter
  // une personne » and the invitation link
  await expect(page.locator('main').getByRole('listitem')).toHaveCount(7);

  // Léa and Tom must not draw each other (both ways by default), each
  // picked in a sheet over « Nouvelle exclusion ». The exclusions stay
  // with the party (docs/spec/v3/modele.md).
  await page.goto(`/e/${GROUP.slug}/exclusions`);
  await hydrated(page);
  await page.getByRole('button', { name: 'Ajouter une exclusion' }).click();
  await page.getByRole('button', { name: /^Qui/ }).click();
  await page.getByRole('option', { name: 'Léa' }).click();
  await page.getByRole('button', { name: /^Ne tire pas/ }).click();
  await page.getByRole('option', { name: 'Tom' }).click();
  await expect(page.getByTestId('exclusion-sheet')).toContainText(
    'Léa et Tom ne se tireront jamais l’un l’autre.',
  );
  await page.getByRole('button', { name: "Ajouter l'exclusion" }).click();
  await expect(page.getByText('Léa et Tom')).toBeVisible();

  // Edition, from the party
  await page.goto(`/e/${GROUP.slug}`);
  await hydrated(page);
  await page.getByRole('link', { name: 'Organiser un Secret Santa' }).click();
  // Six rows, each opening its page (V3TirageNouveau); the day of the
  // party is already there, and the five members of the party are taken,
  // as this is its first Secret Santa.
  await expect(heading(page)).toHaveText(/^Le Secret Santa \d{4}$/);
  await expect(
    page.getByTestId('new-secret-santa').getByRole('link'),
  ).toHaveCount(6);
  await expect(page.getByTestId('new-secret-santa-date')).toContainText(
    '25 décembre',
  );
  await expect(page.getByTestId('taken-over')).toContainText(
    '5 membres de l’événement.',
  );
  // A budget of its own, shown in the edition's header.
  const budget = page.getByTestId('new-secret-santa-budget');
  await expect(budget).toContainText('Aucun');
  await budget.click();
  await expect(page).toHaveURL(/\/editions\/nouvelle\/budget$/);
  await page.getByLabel(/^Budget/).fill('20 €');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(budget).toContainText('20 €');
  // The word, on its own page too; the form is kept (README 23.3).
  const word = page.getByTestId('new-secret-santa-mot');
  await expect(word).toContainText('Aucun');
  await word.click();
  await expect(page).toHaveURL(/\/editions\/nouvelle\/mot$/);
  await page.getByLabel(/^Petit mot/).fill('Après le dessert !');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(word).toContainText('Après le dessert !');
  await expect(budget).toContainText('20 €');
  await page.getByRole('button', { name: 'Créer le Secret Santa' }).click();
  await expect(page.getByText('Famille E2E · Budget 20 €')).toBeVisible();
  await expect(page.getByTestId('settings-row')).toContainText('Budget 20 €');
  // Ready to prepare at once: links work, the draw can be checked.
  await expect(
    page.getByText('5 participants, toutes les règles sont respectées.'),
  ).toBeVisible();
  const editionUrl = new URL(page.url()).pathname;
  // The party date stays in the header, and changes in a sheet.
  await expect(page.getByTestId('party-date')).toContainText('25 décembre');
  await page.getByTestId('party-date').click();
  await expect(page.getByTestId('date-sheet')).toContainText(
    'Le changement est inscrit au journal de l’événement.',
  );
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  await expect(page.getByTestId('date-sheet')).toHaveCount(0);
  // The exclusions of the group apply to the edition.
  await page.getByText('1 exclusion').click();
  await expect(page.getByText('Léa et Tom')).toBeVisible();
  await page.getByRole('button', { name: 'Retour' }).click();

  // A tap on Hugo opens his send sheet: copy his invitation.
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  // Before the draw, a tap on Hugo opens his page in the group.
  await page.getByText('Hugo', { exact: true }).click();
  await expect(page).toHaveURL(/\/membres\//);
  // « Retour » goes up the tree: to the members, not to the edition.
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(page).toHaveURL(/\/membres$/);
  await page.goBack();
  await page.goBack();
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
  await expect(page.getByText('Les jeux sont faits').first()).toBeVisible();
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
  // Only what it takes to send; « Personnaliser le message » is a screen
  // of its own, which brings the sheet back with the message chosen.
  await expect(page.getByRole('radio', { name: 'Relance' })).toHaveCount(0);
  await page.getByRole('button', { name: /^Personnaliser le message/ }).click();
  await expect(heading(page)).toHaveText('Personnaliser le message');
  await expect(page.getByRole('radio', { name: 'Tirage fait' })).toBeChecked();
  await page.getByLabel(/^Un mot en plus/).fill('À bientôt !');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByText('Envoyer à Léa').first()).toBeVisible();
  await expect(page.getByTestId('send-preview')).toContainText('À bientôt !');
  await expect(
    page.getByRole('button', { name: /^Modifier le message/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Copier le message' }).click();
  // Once sent, the sheet closes, and the address forgets Léa: coming back
  // to it from the email screen must not open her sheet again.
  await expect(page.getByTestId('send-sheet')).toHaveCount(0);
  await expect(page).not.toHaveURL(/envoyer=/);
  await page
    .getByRole('link', { name: /par email$/ })
    .first()
    .click();
  await expect(heading(page)).toHaveText('Envoyer par email');
  await page.goBack();
  await expect(page.getByText('Préviens chacun').first()).toBeVisible();
  await expect(page.getByTestId('send-sheet')).toHaveCount(0);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toMatch(/^Léa, les jeux sont faits/);
  expect(copied).toMatch(/\/p\/[A-Za-z0-9_-]{43}/);
  expect(copied).toMatch(/À bientôt !$/);
  // Sent: her sheet offers the reminder, and the other ways and repairs
  // behind « Autre moyen, ou un souci ? ».
  await page.getByRole('button', { name: 'Renvoyer le lien de Léa' }).click();
  await expect(page.getByText('Renvoyer à Léa').first()).toBeVisible();
  // The header says when the link went, not how.
  await expect(
    page.getByText(/Envoyé le \d{1,2} \S+, pas encore ouvert/),
  ).toBeVisible();
  await page.getByRole('button', { name: /^Autre moyen, ou un souci/ }).click();
  const repairs = page.getByTestId('troubleshoot');
  await expect(repairs).toContainText('Pas envoyé finalement ?');
  await expect(repairs).toContainText('Régénérer son lien');
  await expect(page.getByTestId('send-other')).not.toContainText('Retirer');
  await page
    .getByRole('button', { name: 'Retour', exact: true })
    .last()
    .click();
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
  await expect(page.getByText('Léa et Tom')).toBeVisible();
  await page.getByRole('button', { name: 'Retour' }).click();

  // Last-resort access to the draw, in « Un souci ? »: guarded, then
  // journaled for everyone.
  await page.getByTestId('trouble-row').click();
  await expect(page.getByTestId('trouble-sheet')).toContainText(
    'Dévoiler avant le jour J',
  );
  await page.getByText('Voir un seul résultat').click();
  await page.getByRole('button', { name: 'Le résultat de qui ?' }).click();
  await page.getByRole('option', { name: 'Hugo' }).click();
  // The group will read this line, with his name.
  await expect(
    page.getByText(
      "L'organisateur a consulté le résultat d'Hugo (accès de dernier recours)",
    ),
  ).toBeVisible();
  await page.getByLabel(/Recopie/).fill('je veux voir le tirage');
  await page.getByLabel(/tous les membres sauront/).check();
  await page.getByRole('button', { name: "Voir le résultat d'Hugo" }).click();
  // One person at a time, never the whole draw.
  await expect(page.getByTestId('revealed')).toContainText(
    'Hugo offre un cadeau à',
  );
  await expect(page.getByText(/offre un cadeau à/)).toHaveCount(1);
  await page.getByRole('button', { name: 'Retour' }).click();

  // Cancel with a reason, draw again, close.
  await page.getByTestId('trouble-row').click();
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
  // The party is over: revealing the results is the action of the
  // moment; closing without revealing stays at hand, with a second tap.
  await expect(page.getByTestId('action-card')).toContainText(
    'Le jour J est passé : dévoile les résultats',
  );
  await page.getByRole('button', { name: 'Clôturer sans dévoiler' }).click();
  await page.getByRole('button', { name: 'Clôturer le Secret Santa' }).click();
  // Closed: every step done, read only, and the way to the next edition.
  await expect(page.getByTestId('closed-notice')).toContainText(
    'Secret Santa clôturé',
  );
  await expect(page.locator('[aria-current="step"]')).toHaveCount(0);
  await expect(page.getByText('Fêté', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Préparer le Secret Santa suivant' }),
  ).toBeVisible();

  // The guardian reads the same journal as the participants, from the
  // admin: what was done, never who gives to whom.
  await page.goto(`/e/${GROUP.slug}/journal`);
  await hydrated(page);
  await expect(heading(page)).toHaveText('Journal de l’événement');
  await expect(
    page.getByText('Le tirage a été annulé. Motif : Test de relance'),
  ).toBeVisible();
  await expect(
    page.getByText(
      "L'organisateur a consulté le résultat d'Hugo (accès de dernier recours)",
    ),
  ).toBeVisible();
  await expect(
    page.getByText('Le Secret Santa Noël 2026 est clôturé'),
  ).toBeVisible();
  expect(await page.getByTestId('journal').innerText()).not.toMatch(/offre/);
  // An alert says what it means; the journal says what it is for.
  await page
    .getByRole('button', { name: 'Qu’est-ce que ça veut dire ?' })
    .first()
    .click();
  await expect(page.getByText('Pourquoi c’est permis.')).toBeVisible();
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  // On an iPhone 16 the whole help sheet fits, nothing scrolls, even in
  // what Safari leaves visible of its 393 × 852 screen (393 × 659).
  await page.setViewportSize({ width: 393, height: 659 });
  await page.getByRole('button', { name: 'À quoi sert-il ?' }).click();
  const help = page.getByTestId('journal-help');
  await expect(help).toContainText('Il ne dit jamais');
  await expect(help).toContainText(
    'Qui offre à qui, ni les idées de cadeaux de chacun.',
  );
  const scrolls = await help.evaluate((element) => {
    const body = element.parentElement!;
    return body.scrollHeight > body.clientHeight;
  });
  expect(scrolls).toBe(false);
  await expect(
    page.getByRole('button', { name: 'J’ai compris' }),
  ).toBeInViewport();
  await page.getByRole('button', { name: 'J’ai compris' }).click();
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
  await page.getByRole('link', { name: 'Réglages de l’événement' }).click();
  await expect(heading(page)).toHaveText('Réglages de l’événement');
  const section = page.getByTestId('organizers');
  await expect(section.getByText(GROUP.organizer)).toBeVisible();
  await expect(page.getByText('C’est toi')).toBeVisible();
  // Nobody removes themselves by a slip: no cross on one's own row.
  await expect(
    page.getByRole('button', {
      name: `Retirer ${GROUP.organizer} des organisateurs`,
    }),
  ).toHaveCount(0);

  await page.getByRole('button', { name: /^Ajouter un organisateur/ }).click();
  await page.getByLabel('Son adresse email').fill(coOrganizer);
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
  await expect(section.getByText(coOrganizer)).toBeVisible();

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
  await page.getByLabel('Nom de l’événement').fill('Autre famille');
  await page
    .getByLabel('Adresse du premier organisateur')
    .fill('orga-autre@example.com');
  await page.getByRole('button', { name: 'Créer l’événement' }).click();
  await expect(page).toHaveURL(/\/e\/autre-famille$/);

  await page.context().clearCookies();
  await loginAsOrganizer(page, GROUP.slug, GROUP.organizer);
  // An organiser only sees their own groups, and the others refuse them.
  await page.goto('/');
  await hydrated(page);
  await expect(page.getByTestId('home-party')).toContainText(GROUP.name);
  await expect(page.getByText('Autre famille')).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Nouveau', exact: true }),
  ).toHaveCount(0);
  await page.goto('/admin/autre-famille/personnes');
  await hydrated(page);
  await expect(
    page.getByText('Tu n’as pas accès à cet événement.'),
  ).toBeVisible();
  const api = await page.request.get('/api/admin/autre-famille/persons');
  expect(api.status()).toBe(403);
  const journal = await page.request.get('/api/admin/autre-famille/journal');
  expect(journal.status()).toBe(403);
  expect((await request.get('/api/admin/groups')).status()).toBe(401);
});
