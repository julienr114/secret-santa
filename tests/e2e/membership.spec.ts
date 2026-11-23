import { expect, test, type APIRequestContext } from '@playwright/test';
import { apiLogin, heading, hydrated, seedMembers, seedSql } from './helpers';

// One comes into an event by a Secret Santa or by a list, never by the
// event itself (ticket 117, docs/decisions/2026-11-21-on-entre-par-un-
// secret-santa-ou-par-une-liste.md): « Inviter quelqu'un » on a list
// shared with all the members of its event, by an address or by its link;
// a draft, a list kept for the one who drew, an event at 30 let nobody in;
// a list in two events lets in only its own; « Membres » says by where.
test.describe.configure({ mode: 'serial' });

const CAMILLE = 'camille-entree@example.com';
const LOUIS = 'louis-entree@example.com';
const INES = 'ines-entree@example.com';
const ZOE = 'zoe-entree@example.com';
const year = new Date().getFullYear() + 1;

const state: {
  camille?: APIRequestContext;
  slug: string;
  other: string;
  listId: string;
  token: string;
} = { slug: '', other: '', listId: '', token: '' };
const camille = () => state.camille!;

const ok = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  expect(response.ok(), `${response.url()}: ${response.status()}`).toBe(true);
  return response.json();
};

/** An event of Camille's, by its name. */
const newEvent = async (name: string) =>
  (
    await ok(
      await camille().post('/api/parties', {
        data: {
          category: 'christmas',
          name,
          date: `${year}-12-25`,
          recurring: true,
        },
      }),
    )
  ).slug as string;

/** A list of Camille's for an event, with Léo and one idea. */
const newList = async (slug: string) => {
  const { id } = await ok(
    await camille().post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, party: slug },
    }),
  );
  const { id: person } = await ok(
    await camille().post(`/api/lists/${id}/people`, {
      data: {
        newMember: { firstName: 'Léo', avatar: { emoji: '🚀', color: 'pine' } },
      },
    }),
  );
  await ok(
    await camille().post(`/api/lists/${id}/ideas`, {
      data: { listPersonId: person, text: 'Un télescope' },
    }),
  );
  const doc = await ok(await camille().get(`/api/lists/${id}`));
  return { id: id as string, token: doc.list.shareToken as string };
};

/** Shares a list with all the members of some events, or with the one who drew. */
const share = async (
  listId: string,
  slugs: string[],
  givers: string[] = [],
) => {
  const { options } = await ok(
    await camille().get(`/api/lists/${listId}/sharing`),
  );
  const idsOf = (wanted: string[]) =>
    options
      .filter((option: { slug: string }) => wanted.includes(option.slug))
      .map((option: { id: string }) => option.id);
  await ok(
    await camille().put(`/api/lists/${listId}/sharing`, {
      data: { isPublic: false, parties: idsOf(slugs), givers: idsOf(givers) },
    }),
  );
};

/** The members of an event, as its organiser reads them. */
const membersOf = async (slug: string) =>
  (await ok(await camille().get(`/api/admin/${slug}/persons`))) as {
    persons: { id: string; firstName: string; email: string | null }[];
    entries: Record<string, { kind: string; holder?: string }[]>;
  };

test.beforeAll(async ({ playwright, baseURL }) => {
  // Louis has an account: he reads the news of the list.
  const louis = await playwright.request.newContext({ baseURL });
  await apiLogin(louis, LOUIS);
  await louis.dispose();
  state.camille = await playwright.request.newContext({ baseURL });
  await apiLogin(camille(), CAMILLE);
  await ok(
    await camille().put('/api/auth/profile', {
      data: { firstName: 'Camille' },
    }),
  );
  state.slug = await newEvent('Famille Entrée');
  state.other = await newEvent('Chez Mamie Entrée');
  const list = await newList(state.slug);
  state.listId = list.id;
  state.token = list.token;
});

test.afterAll(async () => {
  await state.camille?.dispose();
});

test('no route adds someone to an event by itself', async () => {
  const response = await camille().post(`/api/admin/${state.slug}/persons`, {
    data: { firstName: 'Personne' },
  });
  expect([404, 405]).toContain(response.status());
});

test('a draft lets nobody in, and offers no « Inviter quelqu’un »', async ({
  page,
}) => {
  const { invite } = await ok(
    await camille().get(`/api/lists/${state.listId}/sharing`),
  );
  expect(invite).toBe(false);
  await apiLogin(page.request, ZOE);
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await expect(page.getByTestId('list-closed')).toBeVisible();
  const { persons } = await membersOf(state.slug);
  expect(persons.map((person) => person.email)).not.toContain(ZOE);
});

test('shared with all its members, the list invites by an address', async ({
  page,
}) => {
  // Shared in its own event and in another one.
  await share(state.listId, [state.slug, state.other]);
  await apiLogin(page.request, CAMILLE);
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  await page.getByTestId('share-open').click();
  await page.getByTestId('sharing-add').click();
  await page.getByTestId('sharing-someone-else').click();
  // One level further in the bar, without leaving the list.
  const invite = page.getByTestId('share-invite');
  await expect(invite.getByRole('heading')).toHaveText('Quelqu’un d’autre');
  await expect(invite).toContainText(
    'Cette personne reçoit un email à ton nom, et devient membre de « Famille Entrée ».',
  );
  await expect(page.getByTestId('share-link')).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`/listes/${state.listId}\\?`));
  await page.getByTestId('invite-first-name').fill('Louis');
  await page.getByTestId('invite-address').fill(LOUIS);
  await page.getByTestId('invite-submit').click();
  // Back to the first level, which says so.
  await expect(
    page.getByText('Invitation envoyée', { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId('share-link')).toContainText(
    `/l/${state.token}`,
  );
  await expect(page.getByTestId('share-invite')).toHaveCount(0);

  // Louis is a member of the list's event, by the list; not of the other.
  const { persons, entries } = await membersOf(state.slug);
  const louis = persons.find((person) => person.email === LOUIS);
  expect(louis).toBeTruthy();
  expect(entries[louis!.id]).toEqual([{ kind: 'list', holder: 'Camille' }]);
  const other = await membersOf(state.other);
  expect(other.persons.map((person) => person.email)).not.toContain(LOUIS);
  // « Membres » says so.
  await page.goto(`/e/${state.slug}/membres`);
  await hydrated(page);
  await expect(
    page.getByTestId('members').getByRole('link', { name: /Louis/ }),
  ).toContainText('La liste de Camille');
  await expect(page.getByTestId('members-add-list')).toContainText('Pour Léo');

  // He reads it in « Quoi de neuf », and the list opens for him.
  await apiLogin(page.request, LOUIS);
  await page.goto('/quoi-de-neuf');
  await hydrated(page);
  await expect(
    page
      .getByTestId('news-line')
      .filter({ hasText: 'Camille a partagé sa liste avec toi' }),
  ).toHaveCount(1);
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('its link lets a logged-in account into its own event only', async ({
  page,
}) => {
  await apiLogin(page.request, INES);
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const { persons, entries } = await membersOf(state.slug);
  const ines = persons.find((person) => person.email === INES);
  expect(ines).toBeTruthy();
  expect(entries[ines!.id]).toEqual([{ kind: 'list', holder: 'Camille' }]);
  // Shared in « Chez Mamie » too: she is not a member there.
  const other = await membersOf(state.other);
  expect(other.persons.map((person) => person.email)).not.toContain(INES);
  // Her home has the event now.
  await page.goto('/');
  await hydrated(page);
  await expect(
    page.getByTestId('home-party').filter({ hasText: 'Famille Entrée' }),
  ).toHaveCount(1);
});

test('a link of a list shared only in another event lets nobody in', async ({
  page,
}) => {
  // Shared with all of « Chez Mamie », not with its own event.
  await share(state.listId, [state.other]);
  const { invite } = await ok(
    await camille().get(`/api/lists/${state.listId}/sharing`),
  );
  expect(invite).toBe(false);
  await apiLogin(page.request, ZOE);
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await expect(page.getByTestId('list-closed')).toBeVisible();
  for (const slug of [state.slug, state.other]) {
    const { persons } = await membersOf(slug);
    expect(persons.map((person) => person.email)).not.toContain(ZOE);
  }
});

test('a list kept for the one who drew lets nobody in', async ({ page }) => {
  // Camille takes part in a Secret Santa of her event.
  await ok(
    await camille().post(`/api/admin/${state.slug}/editions`, {
      data: { label: `Noël ${year}`, year, eventDate: `${year}-12-25` },
    }),
  );
  await share(state.listId, [], [state.slug]);
  await apiLogin(page.request, ZOE);
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await expect(page.getByTestId('list-closed')).toBeVisible();
  const { persons } = await membersOf(state.slug);
  expect(persons.map((person) => person.email)).not.toContain(ZOE);
});

test('at 30 members, its link lets nobody else in', async ({ page }) => {
  await share(state.listId, [state.slug]);
  const { persons } = await membersOf(state.slug);
  await seedMembers(
    state.slug,
    Array.from(
      { length: 30 - persons.length },
      (_, index) => `Plein${String(index).padStart(2, '0')}`,
    ),
  );
  expect((await membersOf(state.slug)).persons).toHaveLength(30);
  await apiLogin(page.request, ZOE);
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await expect(page.getByTestId('list-closed')).toBeVisible();
  expect((await membersOf(state.slug)).persons).toHaveLength(30);
  // « Inviter quelqu'un » says the event is full.
  await apiLogin(page.request, CAMILLE);
  await page.goto(`/listes/${state.listId}?partage=inviter`);
  await hydrated(page);
  await expect(page.getByTestId('invite-full')).toContainText(
    'L’événement est complet',
  );
  await seedSql(
    `DELETE FROM persons WHERE id LIKE 'seed-${state.slug}-Plein%';`,
  );
});

test('in the bar, « Reprendre ceux de » is one level further; the back goes one level', async ({
  page,
}) => {
  const from = await newEvent('Bureau Entrée');
  await seedMembers(from, [
    ['Nadia', 'nadia-entree@example.com'],
    ['Karim', 'karim-entree@example.com'],
    'Tom',
  ]);
  await share(state.listId, [state.slug]);
  await apiLogin(page.request, CAMILLE);
  await page.goto(`/listes/${state.listId}`);
  await hydrated(page);
  await page.getByTestId('share-open').click();
  await page.getByTestId('sharing-add').click();
  await page.getByTestId('sharing-someone-else').click();
  await page.getByTestId('invite-first-name').fill('Inès');
  await page.getByTestId('invite-take').click();
  const take = page.getByTestId('share-take');
  await expect(take.getByRole('heading')).toHaveText('Reprendre ceux de');
  // The back of the phone goes back one level, what was written kept;
  // the focus goes back to what was touched.
  await page.goBack();
  await expect(page.getByTestId('share-invite')).toBeVisible();
  await expect(page.getByTestId('invite-first-name')).toHaveValue('Inès');
  await expect(page.getByTestId('invite-take')).toBeFocused();
  await page.goForward();
  await expect(take).toBeVisible();
  // One event among mine, its members ticked; without an address, the box
  // stays empty.
  await take.getByRole('button', { name: /Bureau Entrée/ }).click();
  await expect(
    take.getByRole('checkbox', { name: 'Reprendre Nadia' }),
  ).toBeChecked();
  await expect(
    take.getByRole('checkbox', { name: 'Reprendre Tom' }),
  ).toBeDisabled();
  await expect(take.getByTestId('take-submit')).toHaveText(
    'Inviter · 2 personnes',
  );
  await take.getByRole('checkbox', { name: 'Reprendre Karim' }).uncheck();
  await take.getByTestId('take-submit').click();
  // Back to the first level, on the same list.
  await expect(
    page.getByText('1 invitation envoyée', { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId('share-link')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/listes/${state.listId}$`));
  const { persons } = await membersOf(state.slug);
  const emails = persons.map((person) => person.email);
  expect(emails).toContain('nadia-entree@example.com');
  expect(emails).not.toContain('karim-entree@example.com');
  // « Fermer » folds it from any level; unrolled again, the first level,
  // what was written forgotten.
  await page.getByTestId('sharing-add').click();
  await page.getByTestId('sharing-someone-else').click();
  await page.getByTestId('invite-first-name').fill('Léa');
  await page.getByRole('button', { name: 'Fermer' }).click();
  await expect(page.getByTestId('share-content')).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`/listes/${state.listId}$`));
  await page.getByTestId('share-open').click();
  await expect(page.getByTestId('share-link')).toBeVisible();
  await page.getByTestId('sharing-add').click();
  await page.getByTestId('sharing-someone-else').click();
  await expect(page.getByTestId('invite-first-name')).toHaveValue('');
  // « ‹ » goes back to the first level, on what was touched.
  await page.getByTestId('share-back').click();
  await expect(page.getByTestId('share-link')).toBeVisible();
  await expect(page.getByTestId('sharing-someone-else')).toBeFocused();
});

test('« Qui reprendre ? » makes those of another event participants', async ({
  page,
}) => {
  const slug = await newEvent('Les cousins Entrée');
  const { edition } = await ok(
    await camille().post(`/api/admin/${slug}/editions`, {
      data: { label: `Noël ${year}`, year, eventDate: `${year}-12-25` },
    }),
  );
  await apiLogin(page.request, CAMILLE);
  await page.goto(`/admin/${slug}/editions/${edition.id}/ajouter`);
  await hydrated(page);
  await page.getByTestId('take-row').click();
  await expect(heading(page)).toHaveText('Qui reprendre ?');
  // Its own event is never offered.
  await expect(page.getByRole('button', { name: /Les cousins/ })).toHaveCount(
    0,
  );
  await page.getByRole('button', { name: /Famille Entrée/ }).click();
  const people = page.getByTestId('take-people');
  await expect(people).toContainText('Louis');
  await expect(people).toContainText('Ines');
  await page.getByRole('checkbox', { name: 'Reprendre Louis' }).uncheck();
  await page.getByTestId('take-submit').click();
  await expect(heading(page)).toHaveText('Choisir les participants');
  const { participants } = await ok(
    await camille().get(`/api/admin/${slug}/editions/${edition.id}`),
  );
  const names = participants.map((p: { firstName: string }) => p.firstName);
  expect(names).toContain('Ines');
  expect(names).not.toContain('Louis');
  const { persons, entries } = await membersOf(slug);
  const ines = persons.find((person) => person.email === INES);
  expect(entries[ines!.id]).toEqual([{ kind: 'santa', name: null }]);
});
