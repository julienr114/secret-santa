import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { apiLogin, heading, hydrated } from './helpers';

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
  for (const firstName of NAMES) await post(`${ADMIN}/persons`, { firstName });
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
  await expect(
    page.getByText("Le tirage n'a pas encore eu lieu"),
  ).toBeVisible();
  // Where the draw stands: invited, the draw soon, then the party.
  const steps = page.getByRole('list', { name: 'Étapes du tirage' });
  await expect(steps).toContainText('Invitation');
  await expect(steps.locator('[aria-current="step"]')).toHaveText(
    'Tirage · bientôt',
  );
  await expect(steps).toContainText(/Fête/);
  await expect(
    page.getByRole('link', { name: 'Laisser mes pistes de cadeaux' }),
  ).toBeVisible();

  // Alice picks her own avatar. Closing the sheet gives the choice up;
  // only "Valider" saves it.
  const before = (await participantNamed('Alice')).avatar;
  await page.getByRole('button', { name: 'Changer mon icône' }).click();
  await page.getByRole('radio', { name: '🦊' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Valider' })).toHaveCount(0);
  expect((await participantNamed('Alice')).avatar).toEqual(before);
  await page.getByRole('button', { name: 'Changer mon icône' }).click();
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

  await page.getByRole('link', { name: /Mes pistes de cadeaux/ }).click();
  await expect(heading(page)).toHaveText('Mes pistes de cadeaux');
  // Six questions, one tap each, then back to the page; « Plus tard »
  // leaves the rest unanswered.
  await page.getByRole('link', { name: 'Commencer' }).click();
  await expect(heading(page)).toHaveText('Utile, ou surprenant ?');
  await page.getByTestId('hint-first').click();
  await expect(heading(page)).toHaveText('Un objet, ou un moment ?');
  await page.getByTestId('hint-both').click();
  await expect(heading(page)).toHaveText('À garder, ou à consommer ?');
  await page.getByRole('button', { name: 'Plus tard' }).click();
  await expect(heading(page)).toHaveText('Mes pistes de cadeaux');
  const tags = page.getByTestId('hints-tags');
  await expect(tags).toContainText('Plutôt utile');
  await expect(tags).toContainText('Un objet ou un moment');
  // A question without an answer is a dashed tag that opens it.
  await tags.getByRole('link', { name: 'À garder, ou à consommer ?' }).click();
  await expect(heading(page)).toHaveText('À garder, ou à consommer ?');
  await page.getByTestId('hint-first').click();
  await expect(heading(page)).toHaveText('Mes pistes de cadeaux');
  await expect(tags).toContainText('À garder');
  // A tag opens its own question, its answer checked; one tap changes it
  // and comes back, « Effacer ma réponse » takes it back.
  await tags.getByRole('link', { name: 'Plutôt utile' }).click();
  await expect(page.getByTestId('hint-first')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByTestId('hint-second').click();
  await expect(tags).toContainText('Plutôt surprenant');
  await tags.getByRole('link', { name: 'Plutôt surprenant' }).click();
  await page.getByTestId('hint-clear').click();
  await expect(
    tags.getByRole('link', { name: 'Utile, ou surprenant ?' }),
  ).toBeVisible();
  // A text, in its sheet, kept with « Valider ».
  await page.getByText('Dire ce qui m’occupe').click();
  await page
    .getByRole('textbox', { name: 'En ce moment' })
    .fill('La course à pied');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page.getByText('La course à pied')).toBeVisible();
  // An answer is a fixed value, never text.
  const free = await page.request.patch(`/api/p/${tokenOf('Alice')}/hints`, {
    data: { answers: { surprise: 'Surprends-moi' } },
  });
  expect(free.status()).toBe(400);

  // Ideas are added from a bottom sheet and saved with "Valider"; closing
  // the sheet any other way gives the idea up.
  const idea = page.getByLabel('Idée', { exact: true });
  const link = page.getByLabel('Lien (facultatif)');
  const validate = page.getByRole('button', { name: 'Valider' });
  await page.getByText('Ajouter une idée').click();
  await idea.fill('Abandonnée');
  await page.keyboard.press('Escape');
  await expect(validate).toHaveCount(0);
  await expect(page.getByText('Abandonnée')).toHaveCount(0);
  await page.getByText('Ajouter une idée').click();
  await idea.fill('Un livre de cuisine');
  await link.fill('https://example.com/livre');
  await validate.click();
  await expect(page.getByText('example.com', { exact: true })).toBeVisible();
  await page.getByText('Ajouter une idée').click();
  await idea.fill('Des chaussette');
  await validate.click();
  await expect(page.getByText('Encore 8 possibles')).toBeVisible();

  // Tapping an idea opens it again, to change or delete it.
  await page.getByText('Des chaussette').click();
  await idea.fill('Des chaussettes');
  await validate.click();
  await expect(page.getByText('Des chaussettes')).toBeVisible();
  await page.getByText('Ajouter une idée').click();
  await idea.fill('À supprimer');
  await validate.click();
  await page.getByText('À supprimer').click();
  await page.getByRole('button', { name: 'Supprimer l’idée' }).click();
  await expect(page.getByText('À supprimer')).toHaveCount(0);
  await expect(page.getByText('Encore 8 possibles')).toBeVisible();

  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(
    page.getByText('Remplies · modifiables jusqu’à la fête'),
  ).toBeVisible();
  await page.getByRole('link', { name: /Mes pistes de cadeaux/ }).click();
  await expect(page.getByText('Des chaussettes')).toBeVisible();

  // The guardian sees that she left hints, never which ones.
  const response2 = await edition();
  expect(await response2.text()).not.toMatch(/livre de cuisine|course à pied/);
  expect((await participantNamed('Alice')).hasHints).toBe(true);

  // An invalid link in a wish is refused, and the list is left untouched.
  const bad = await page.request.put(`/api/p/${tokenOf('Alice')}/wishes`, {
    data: { wishes: [{ label: 'Piège', url: 'javascript:alert(1)' }] },
  });
  expect(bad.status()).toBe(400);

  // No result before the draw.
  const early = await page.request.post(`/api/p/${tokenOf('Alice')}/reveal`);
  expect(early.status()).toBe(409);
});

test('after the draw: the reveal is explicit, counted and journaled', async ({
  page,
}) => {
  for (const firstName of ['Bruno', 'Chloé']) {
    const saved = await page.request.put(
      `/api/p/${tokenOf(firstName)}/wishes`,
      {
        data: { wishes: [{ label: `Idée de ${firstName}`, url: '' }] },
      },
    );
    expect(saved.ok()).toBe(true);
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
  await expect(page.getByText('Tu sais déjà à qui tu offres')).toBeVisible();
  await expect(
    page.getByText('Des pistes de cadeaux t’attendent.'),
  ).toBeVisible();
  await expect(page.locator('main')).not.toContainText(receiver);
  await page
    .getByRole('button', { name: "Revoir à qui j'offre un cadeau" })
    .click();
  await expect(page.getByTestId('receiver')).toHaveText(receiver);
  await page.getByRole('button', { name: 'Cacher mon résultat' }).click();
  await expect(page.getByTestId('receiver')).toHaveCount(0);

  // Everyone can read it in the journal, which never says who gives to whom.
  await page.getByRole('link', { name: /Journal du groupe/ }).click();
  await expect(heading(page)).toHaveText('Journal du groupe');
  // Only the first of her two consultations is there: later ones would
  // let the group match them with other lines.
  await expect(page.getByText('Alice a découvert son résultat')).toHaveCount(1);
  expect((await participantNamed('Alice')).viewCount).toBe(2);
  // Gift hints are no longer journaled (README 22.11).
  await expect(page.getByText(/liste de souhaits|pistes/)).toHaveCount(0);
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
    page.getByText('Tout ce qui touche ton lien et ton résultat.', {
      exact: false,
    }),
  ).toBeVisible();
  await expect(page.getByText('Tu as découvert ton résultat')).toHaveCount(1);
  await expect(page.getByText('Alice a découvert son résultat')).toHaveCount(0);

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
    'un nouveau tirage a eu lieu',
  );
});

test('unknown and regenerated links are refused', async ({ page }) => {
  await open(page, `/p/${'x'.repeat(43)}`);
  await expect(heading(page)).toHaveText('Oups, ce lien ne marche plus');
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
  const refused = await page.request.put(`/api/p/${token}/wishes`, {
    data: { wishes: [{ label: 'Trop tard' }] },
  });
  expect(refused.status()).toBe(409);
  const avatar = await page.request.put(`/api/p/${token}/avatar`, {
    data: { emoji: '🎅', color: 'brick' },
  });
  expect(avatar.status()).toBe(409);

  // The old address of the wish list leads to the gift hints.
  await open(page, `/p/${token}/souhaits`);
  await expect(page).toHaveURL(new RegExp(`/p/${token}/pistes$`));
  await expect(
    page.getByText('Tes pistes ne sont plus modifiables pour cette édition.'),
  ).toBeVisible();
  await expect(page.getByText('Idée de Chloé')).toBeVisible();
  await expect(page.getByText('Ajouter une idée')).toHaveCount(0);

  // The page of the draw: the party is over, and Chloé, who never looked,
  // can still find out. Her icon and her list no longer change.
  await open(page, `/p/${token}`);
  await expect(page.getByText('La fête est passée')).toBeVisible();
  await expect(page.getByText('Fête passée')).toBeVisible();
  await expect(
    page.getByRole('button', { name: "Découvrir à qui j'offre un cadeau" }),
  ).toBeVisible();
  await expect(page.getByText('Remplies · plus modifiables')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Changer mon icône' }),
  ).toHaveCount(0);
});
