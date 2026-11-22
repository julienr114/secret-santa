import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { addPeople, apiLogin, heading, hydrated, seedSql } from './helpers';

// The participant's journey through a personal link (README 4.3 and
// section 18): waiting screen, gift hints, counted reveal, journal, and the
// links that must stop working. The guardian's side is driven through the
// API; only the participant uses the browser.
test.describe.configure({ mode: 'serial' });

const SLUG = 'famille-lutins';
const ADMIN = `/api/admin/${SLUG}`;
const NAMES = ['Alice', 'Bruno', 'Chloé'];

type Participant = {
  id: string;
  firstName: string;
  participationId: string;
  viewCount: number;
  avatar: { emoji: string; color: string };
  hasHints: boolean;
};

const state: {
  admin?: APIRequestContext;
  editionId: string;
  links: Record<string, string>;
} = { editionId: '', links: {} };

const admin = () => {
  if (!state.admin) throw new Error('admin context missing');
  return state.admin;
};
const post = async (path: string, data?: unknown) => {
  const response = await admin().post(path, data ? { data } : {});
  expect(response.ok(), `${path}: ${response.status()}`).toBe(true);
  return response.json();
};
const ok = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  expect(response.ok(), `${response.url()}: ${response.status()}`).toBe(true);
  return response.json();
};
const edition = async () => {
  const response = await admin().get(`${ADMIN}/editions/${state.editionId}`);
  return response;
};
const participantNamed = async (firstName: string): Promise<Participant> => {
  const { participants } = await (await edition()).json();
  return participants.find((p: Participant) => p.firstName === firstName);
};
const tokenOf = (firstName: string) =>
  (state.links[firstName] ?? '').split('/p/')[1] ?? '';
const open = async (page: Page, path: string) => {
  const response = await page.goto(path);
  await hydrated(page);
  return response;
};

test.beforeAll(async ({ playwright, baseURL }) => {
  state.admin = await playwright.request.newContext({ baseURL });
  await apiLogin(admin(), 'super-participant@example.com');
  await post('/api/admin/groups', {
    slug: SLUG,
    name: 'Famille Lutins',
  });
  const rules = await admin().patch(`${ADMIN}/rules`, {
    data: { budget: '20 € max', eventDate: '24 décembre' },
  });
  expect(rules.ok()).toBe(true);
  const created = await post(`${ADMIN}/editions`, {
    label: 'Noël des lutins',
    year: 2026,
    eventDate: '2026-12-24',
  });
  state.editionId = created.edition.id;
  await addPeople(admin(), ADMIN, state.editionId, NAMES);
  const { participants } = await (await edition()).json();
  const { messages } = await (
    await admin().get(
      `${ADMIN}/editions/${state.editionId}/messages?type=invitation`,
    )
  ).json();
  state.links = Object.fromEntries(
    participants.map((p: Participant) => [
      p.firstName,
      new URL(messages[p.participationId].link).pathname,
    ]),
  );
});

test.afterAll(async () => {
  await state.admin?.dispose();
});

test('before the draw: waiting screen and gift hints', async ({ page }) => {
  const response = await open(page, state.links.Alice ?? '');
  expect(response?.headers()['cache-control']).toContain('no-store');
  expect(response?.headers()['referrer-policy']).toBe('no-referrer');
  expect(response?.headers()['x-robots-tag']).toContain('noindex');
  // Link previews must not show a name.
  await expect(page).toHaveTitle('Under the Tree');
  await expect(heading(page)).toHaveText('Salut Alice !');
  await expect(page.getByText('Encore un peu de patience')).toBeVisible();
  // Where the draw stands: invited, the draw soon, then the party.
  const steps = page.getByRole('list', { name: 'Étapes du Secret Santa' });
  await expect(steps).toContainText('Invitation');
  await expect(steps.locator('[aria-current="step"]')).toHaveText(
    'Tirage · bientôt',
  );
  await expect(steps).toContainText(/Jour J/);
  await expect(
    page.getByRole('link', { name: 'Écrire ma liste de cadeaux' }),
  ).toBeVisible();
  // The budget and the day of the party under the title, in every state
  // but a closed edition (lot 16 bis).
  const facts = page.getByTestId('draw-facts');
  await expect(facts).toContainText('Jour J');
  await expect(facts).toContainText('Budget : 20 € max');

  // Alice picks her own avatar. Closing the sheet gives the choice up;
  // only "Valider" saves it.
  const before = (await participantNamed('Alice')).avatar;
  await page.getByRole('button', { name: 'Changer mon icône' }).click();
  await page.getByRole('radio', { name: '🦊' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Valider' })).toHaveCount(0);
  expect((await participantNamed('Alice')).avatar).toEqual(before);
  await page.getByRole('button', { name: 'Changer mon icône' }).click();
  // Families beyond Christmas (lot 20), and « Au hasard » draws another
  // symbol and colour.
  const sheet = page.getByTestId('avatar-sheet');
  await expect(sheet.getByText('Enfants et jeux')).toBeVisible();
  const chosen = sheet.getByRole('radio', { checked: true });
  const shown = await chosen.first().getAttribute('aria-label');
  await page.getByRole('button', { name: 'Au hasard' }).click();
  await expect(chosen.first()).not.toHaveAttribute('aria-label', shown!);
  await page.getByRole('radio', { name: '🦊' }).click();
  await page.getByRole('radio', { name: 'Givre' }).click();
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect
    .poll(async () => (await participantNamed('Alice')).avatar)
    .toEqual({ emoji: '🦊', color: 'frost' });

  const afterAvatar = await page.request.get(
    `/api/p/${tokenOf('Alice')}/journal`,
  );
  expect(await afterAvatar.text()).toContain('Alice a changé son icône');

  // The avatar API only trusts the link: the person is never taken from
  // the request, an unknown link gets nothing, and values are checked.
  const fox = { emoji: '🦊', color: 'frost' };
  const stranger = await page.request.put(`/api/p/${'x'.repeat(43)}/avatar`, {
    data: fox,
  });
  expect(stranger.status()).toBe(404);
  const invalid = await page.request.put(`/api/p/${tokenOf('Alice')}/avatar`, {
    data: { emoji: '<script>', color: 'frost', personId: 'someone-else' },
  });
  expect(invalid.status()).toBe(400);
  expect((await participantNamed('Bruno')).avatar).not.toEqual(fox);

  // « Ma liste de cadeaux », a tile waiting for her (ticket 107).
  const tile = page.getByTestId('tile');
  await expect(tile).toHaveAttribute('data-state', 'todo');
  await expect(tile).toContainText('Pas encore écrite');
  // Without a session, her address first, confirmed by its link
  // (V3ListeAdresse).
  await page.getByRole('link', { name: /Ma liste de cadeaux/ }).click();
  await expect(heading(page)).toHaveText(
    'Ton adresse email, pour écrire ta liste',
  );
  await page.getByLabel('Ton adresse email').fill('alice-lutins@example.com');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByTestId('list-address-sent')).toContainText(
    'alice-lutins@example.com',
  );
  // Logged in with it: her list for the event opens at once, kept for
  // the one who drew her (V3ListeQuiSecret), with the event's name.
  await apiLogin(page.request, 'alice-lutins@example.com');
  await open(page, `/p/${tokenOf('Alice')}/liste`);
  await expect(page).toHaveURL(/\/listes\/[^/]+$/);
  await hydrated(page);
  await expect(page.getByTestId('share-stage')).toContainText(
    'Seul celui qui t’a tiré la voit',
  );
  await expect(page.getByTestId('list-title')).toHaveValue('Famille Lutins');
  // « Modifier » unrolls the bar: « Celui qui m’a tiré » is chosen, in the
  // two-choice control; « Fermer » folds it without changing anything.
  await page.getByTestId('share-open').click();
  const sharing = page.getByTestId('sharing-panel');
  await expect(
    sharing.getByRole('radio', { name: 'Celui qui m’a tiré' }),
  ).toBeChecked();
  await sharing.getByText('Tous les membres').click();
  await expect(
    sharing.getByRole('radio', { name: 'Tous les membres' }),
  ).toBeChecked();
  await page.getByRole('button', { name: 'Fermer' }).click();
  await expect(sharing).toHaveCount(0);
  await expect(page.getByTestId('share-stage')).toContainText(
    'Seul celui qui t’a tiré la voit',
  );
  const listId = page.url().split('/listes/')[1] ?? '';
  // Her account keeps the face she had in the Secret Santa: 🦊 on frost.
  const family = await ok(await page.request.get('/api/family'));
  expect(
    family.members.find((m: { isSelf: boolean }) => m.isSelf)?.avatar,
  ).toEqual({ emoji: '🦊', color: 'frost' });
  // Coming back gives the same list.
  const again = await ok(
    await page.request.post(`/api/p/${tokenOf('Alice')}/list`),
  );
  expect(again.id).toBe(listId);
  expect((await participantNamed('Alice')).hasHints).toBe(false);
  const doc = await ok(await page.request.get(`/api/lists/${listId}`));
  const person =
    doc.people[0]?.id ??
    (
      await ok(
        await page.request.post(`/api/lists/${listId}/people`, {
          data: {
            newMember: {
              firstName: 'Alice',
              avatar: { emoji: '🦊', color: 'frost' },
            },
          },
        }),
      )
    ).id;
  await ok(
    await page.request.post(`/api/lists/${listId}/ideas`, {
      data: { listPersonId: person, text: 'Un livre de cuisine' },
    }),
  );
  // The organiser learns that she wrote her list, never what.
  const response2 = await edition();
  expect(await response2.text()).not.toMatch(/livre de cuisine/);
  expect((await participantNamed('Alice')).hasHints).toBe(true);
  await open(page, `/p/${tokenOf('Alice')}`);
  await expect(page.getByTestId('tile')).toContainText(
    'Vue seulement par celui qui m’a tiré',
  );

  // No result before the draw.
  const early = await page.request.post(`/api/p/${tokenOf('Alice')}/reveal`);
  expect(early.status()).toBe(409);
});

test('after the draw: the reveal is explicit, counted and journaled', async ({
  page,
}) => {
  // Ideas left before the V3 by people without an account (ticket 107):
  // no screen writes them any more, the one who drew them reads them.
  for (const firstName of ['Bruno', 'Chloé']) {
    const { participationId } = await participantNamed(firstName);
    await seedSql(
      `INSERT INTO wishes (id, participation_id, position, label, created_at) VALUES ('w-${participationId}', '${participationId}', 0, 'Idée de ${firstName}', '2026-11-21T00:00:00.000Z');`,
    );
  }
  await post(`${ADMIN}/editions/${state.editionId}/draw`);

  // Opening the page is not a consultation.
  await open(page, state.links.Alice ?? '');
  await expect(page.getByText("Ton enveloppe t'attend")).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toHaveText('Tirage fait');
  await expect(page.getByTestId('receiver')).toHaveCount(0);
  expect((await participantNamed('Alice')).viewCount).toBe(0);

  await page
    .getByRole('button', { name: "Découvrir à qui j'offre un cadeau" })
    .click();
  const receiver = (await page.getByTestId('receiver').innerText()).trim();
  expect(['Bruno', 'Chloé']).toContain(receiver);
  const other = receiver === 'Bruno' ? 'Chloé' : 'Bruno';
  await expect(page.getByText('20 € max')).toBeVisible();
  await expect(page.getByText('24 décembre')).toBeVisible();
  // The receiver's hints, and only theirs.
  await expect(page.getByText('Pour t’aider à choisir')).toBeVisible();
  await expect(page.getByText(`Idée de ${receiver}`)).toBeVisible();
  await expect(page.getByText(`Idée de ${other}`)).toHaveCount(0);
  await expect(page.getByText('Un livre de cuisine')).toHaveCount(0);
  expect((await participantNamed('Alice')).viewCount).toBe(1);

  // The result does not survive a reload: the button is back.
  await open(page, state.links.Alice ?? '');
  await expect(page.getByTestId('receiver')).toHaveCount(0);
  // She has already seen it: the page offers to see it again and says
  // hints are waiting, without any name.
  await expect(page.getByText('Un trou de mémoire ?')).toBeVisible();
  await expect(
    page.getByText(
      'Ton enveloppe est toujours là, avec ses idées de cadeaux.',
      {
        exact: false,
      },
    ),
  ).toBeVisible();
  await expect(page.locator('main')).not.toContainText(receiver);
  await page
    .getByRole('button', { name: 'Revoir à qui j’offre, et ses idées' })
    .click();
  await expect(page.getByTestId('receiver')).toHaveText(receiver);
  await page.getByRole('button', { name: 'Refermer mon enveloppe' }).click();
  await expect(page.getByTestId('receiver')).toHaveCount(0);

  // Everyone can read it in the journal, which never says who gives to whom.
  await page.getByRole('link', { name: /Journal de l’événement/ }).click();
  await expect(heading(page)).toHaveText('Journal de l’événement');
  // Only the first of her two consultations is there: later ones would
  // let the group match them with other lines.
  await expect(page.getByText('Alice a ouvert son enveloppe')).toHaveCount(1);
  expect((await participantNamed('Alice')).viewCount).toBe(2);
  // Gift hints are no longer journaled (README 22.11).
  await expect(page.getByText(/liste de souhaits|idées/)).toHaveCount(0);
  const journal = await page.getByTestId('journal').innerText();
  expect(journal).not.toMatch(/offre|livre de cuisine|Idée de/);
  const api = await (
    await page.request.get(`/api/p/${tokenOf('Alice')}/journal`)
  ).text();
  expect(api).not.toMatch(/receiver|meta/i);
  // Each line says whom it is about; « Moi » keeps hers, told to her.
  const payload = JSON.parse(api);
  const alice = payload.people.find(
    (p: { name: string }) => p.name === 'Alice',
  );
  expect(payload.me).toBe(alice.id);
  await page.getByTestId('journal-person').click();
  await page.getByRole('option', { name: 'Moi (Alice)' }).click();
  await expect(
    page.getByText('Tout ce qui touche ton lien et ton enveloppe.', {
      exact: false,
    }),
  ).toBeVisible();
  await expect(page.getByText('Tu as ouvert ton enveloppe')).toHaveCount(1);
  await expect(page.getByText('Alice a ouvert son enveloppe')).toHaveCount(0);

  // The organiser looks at Bruno's result: on her page, Alice is told
  // there is an alert since she last opened the journal, until she does.
  const bruno = await participantNamed('Bruno');
  await post(`${ADMIN}/editions/${state.editionId}/reveal-one`, {
    personId: bruno.id,
    sentence: 'JE VEUX VOIR LE TIRAGE',
  });
  const alerts = async () =>
    (await (await page.request.get(`/api/p/${tokenOf('Alice')}`)).json())
      .journalAlerts;
  expect(await alerts()).toBe(1);
  await open(page, `/p/${tokenOf('Alice')}`);
  await expect(page.getByTestId('journal-row')).toContainText(
    '1 alerte depuis ta dernière visite',
  );
  // In amber, above the tiles (README 22.16).
  const row = await page.getByTestId('journal-row').boundingBox();
  const tiles = await page.getByTestId('tiles').boundingBox();
  expect(row!.y).toBeLessThan(tiles!.y);
  const seen = page.waitForResponse(
    (r) => r.url().endsWith('/journal-seen') && r.ok(),
  );
  await page.getByTestId('journal-row').click();
  await seen;
  expect(await alerts()).toBe(0);
});

test('a cancelled draw keeps the gift hints and resets the counters', async ({
  page,
}) => {
  // The edition says whether it was drawn again: not yet.
  expect((await (await edition()).json()).redrawn).toBe(false);
  await post(`${ADMIN}/editions/${state.editionId}/redraw`, {
    reason: 'Test de relance',
  });
  // Cancelled, not drawn yet: there is no new draw to announce.
  expect((await (await edition()).json()).redrawn).toBe(false);
  const alice = await participantNamed('Alice');
  expect(alice.viewCount).toBe(0);
  expect(alice.hasHints).toBe(true);
  const early = await page.request.post(`/api/p/${tokenOf('Alice')}/reveal`);
  expect(early.status()).toBe(409);
  await post(`${ADMIN}/editions/${state.editionId}/draw`);
  // Drawn again: « Nouveau tirage » is the message to send, chosen alone.
  expect((await (await edition()).json()).redrawn).toBe(true);
  await page.context().addCookies((await admin().storageState()).cookies);
  const { participationId } = await participantNamed('Alice');
  await open(
    page,
    `/admin/${SLUG}/editions/${state.editionId}?envoyer=${participationId}`,
  );
  await expect(page.getByTestId('send-preview')).toContainText(
    'Un nouveau tirage a eu lieu',
  );
});

test('unknown and regenerated links are refused', async ({ page }) => {
  // The refusal comes with the page: no skeleton while the browser asks
  // again, and the page matches what the server sent.
  const mismatches: string[] = [];
  page.on('console', (message) => {
    if (message.text().includes('Hydration')) mismatches.push(message.text());
  });
  await open(page, `/p/${'x'.repeat(43)}`);
  await expect(heading(page)).toHaveText('Oups, ce lien ne marche plus');
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  expect(mismatches).toEqual([]);
  await expect(page.getByText("Ce lien n'est plus valable")).toBeVisible();

  const old = state.links.Bruno ?? '';
  const { participationId } = await participantNamed('Bruno');
  const { link } = await post(
    `${ADMIN}/participations/${participationId}/regenerate`,
  );
  await open(page, old);
  await expect(page.getByText("Ce lien n'est plus valable")).toBeVisible();
  expect(
    (await page.request.post(`/api/p/${old.split('/p/')[1]}/reveal`)).status(),
  ).toBe(404);
  await open(page, new URL(link).pathname);
  await expect(heading(page)).toHaveText('Salut Bruno !');
});

test('a closed edition is read only', async ({ page }) => {
  await post(`${ADMIN}/editions/${state.editionId}/close`);
  const token = tokenOf('Chloé');
  const avatar = await page.request.put(`/api/p/${token}/avatar`, {
    data: { emoji: '🎅', color: 'brick' },
  });
  expect(avatar.status()).toBe(409);

  // The old addresses of the wish list and of the gift hints lead to my
  // list (ticket 107).
  await open(page, `/p/${token}/souhaits`);
  await expect(page).toHaveURL(new RegExp(`/p/${token}/liste$`));
  await open(page, `/p/${token}/pistes/question`);
  await expect(page).toHaveURL(new RegExp(`/p/${token}/liste$`));

  // The page of the draw: the party is over, and Chloé, who never looked,
  // can still find out. Her icon and her list no longer change.
  await open(page, `/p/${token}`);
  await expect(page.getByText('Le jour J est passé')).toBeVisible();
  await expect(page.getByText('Jour J passé')).toBeVisible();
  await expect(page.getByTestId('draw-facts')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: "Découvrir à qui j'offre un cadeau" }),
  ).toBeVisible();
  await expect(page.getByTestId('tile')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Changer mon icône' }),
  ).toHaveCount(0);
});
