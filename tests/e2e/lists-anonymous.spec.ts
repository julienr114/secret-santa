import {
  expect,
  test,
  type APIRequestContext,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// A gift list linked to the hints of a draw, and « Mode anonyme » on a
// list opened by its link (lot 27 ter, README 22.20, maquettes
// PistesListe, PistesListeChoisir, PistesResultatListe, ListeVisiteurMes,
// ListeVisiteurAnonyme, ListeVisiteurTirage). The one who gives opens the
// list of the one they give to in anonymous mode, with a note; nothing
// those who hold the list read ever says who.
test.describe.configure({ mode: 'serial' });

const SLUG = 'famille-masque';
const ADMIN = `/api/admin/${SLUG}`;
const NAMES = ['Ariane', 'Bertille', 'Clovis'];
const emailOf = (firstName: string) =>
  `${firstName.toLowerCase()}-masque@example.com`;

const state: {
  admin?: APIRequestContext;
  tokens: Record<string, string>;
  /** Who gives, who receives from them, and who has nothing to do with it. */
  giver: string;
  receiver: string;
  other: string;
  contexts: Record<string, BrowserContext>;
  listId: string;
  token: string;
  second: string;
  ideas: string[];
  path: string;
} = {
  tokens: {},
  giver: '',
  receiver: '',
  other: '',
  contexts: {},
  listId: '',
  token: '',
  second: '',
  ideas: [],
  path: '',
};

const ok = async (response: Awaited<ReturnType<APIRequestContext['get']>>) => {
  expect(response.ok(), `${response.url()}: ${response.status()}`).toBe(true);
  return response.json();
};
const as = (firstName: string) => {
  const context = state.contexts[firstName];
  if (!context) throw new Error(`${firstName} is not logged in`);
  return context;
};
const open = async (firstName: string, path: string): Promise<Page> => {
  const page = await as(firstName).newPage();
  await page.goto(path);
  await hydrated(page);
  return page;
};
const login = async (browser: Browser, email: string, firstName?: string) => {
  const context = await browser.newContext();
  await apiLogin(context.request, email);
  if (firstName) {
    await context.request.put('/api/auth/profile', {
      data: { firstName, avatarEmoji: '🦌', avatarColor: 'plum' },
    });
  }
  return context;
};
/** Everything the one who holds the list can read of it, as text. */
const holderView = async () => {
  const api = as(state.receiver).request;
  return (
    await Promise.all(
      [
        `/api/lists/${state.listId}`,
        `/api/lists/${state.listId}/holders`,
        '/api/lists',
        `/api/l/${state.token}`,
        '/api/auth/home',
      ].map(async (path) => (await api.get(path)).text()),
    )
  ).join('\n');
};

test.beforeAll(async ({ playwright, baseURL, browser }) => {
  state.admin = await playwright.request.newContext({ baseURL });
  const admin = state.admin;
  await apiLogin(admin, 'super-anonymous@example.com');
  await ok(
    await admin.post('/api/admin/groups', { data: { name: 'Famille Masque' } }),
  );
  for (const firstName of NAMES) {
    await ok(
      await admin.post(`${ADMIN}/persons`, {
        data: { firstName, email: emailOf(firstName) },
      }),
    );
  }
  const created = await ok(
    await admin.post(`${ADMIN}/editions`, {
      data: { label: 'Noël masqué', year: 2026, eventDate: '2026-12-24' },
    }),
  );
  const editionId = created.edition.id;
  const { participants } = await ok(
    await admin.get(`${ADMIN}/editions/${editionId}`),
  );
  const { messages } = await ok(
    await admin.get(`${ADMIN}/editions/${editionId}/messages?type=invitation`),
  );
  state.tokens = Object.fromEntries(
    participants.map((p: { firstName: string; participationId: string }) => [
      p.firstName,
      new URL(messages[p.participationId].link).pathname.split('/').at(-1),
    ]),
  );
  await ok(await admin.post(`${ADMIN}/editions/${editionId}/draw`));
  // Three people: a circle. The first gives to someone, the third one
  // neither gives to that person nor receives from the first.
  const reveal = await ok(
    await admin.post(`/api/p/${state.tokens.Ariane}/reveal`),
  );
  state.giver = 'Ariane';
  state.receiver = reveal.receiver.name;
  state.other = NAMES.find(
    (name) => name !== state.giver && name !== state.receiver,
  )!;
  for (const firstName of NAMES) {
    state.contexts[firstName] = await login(
      browser,
      emailOf(firstName),
      firstName,
    );
  }
  // The one who receives holds two gift lists.
  const api = as(state.receiver).request;
  const make = async (title: string) => {
    const { id } = await ok(
      await api.post('/api/lists', {
        data: { icon: { emoji: '🎄', color: 'pine' }, title },
      }),
    );
    const person = await ok(
      await api.post(`/api/lists/${id}/people`, {
        data: {
          newMember: {
            firstName: 'Léo',
            avatar: { emoji: '🚀', color: 'pine' },
          },
        },
      }),
    );
    const ideas = [];
    for (const text of ['Un circuit de billes', 'Un vélo', 'Un puzzle']) {
      const idea = await ok(
        await api.post(`/api/lists/${id}/ideas`, {
          data: { listPersonId: person.id, text },
        }),
      );
      ideas.push(idea.id);
    }
    return { id, ideas };
  };
  const first = await make('Noël chez nous');
  state.listId = first.id;
  state.ideas = first.ideas;
  const second = await make('Anniversaire de Léo');
  state.second = (
    await ok(await api.post(`/api/lists/${second.id}/share`, { data: {} }))
  ).token;
});

test.afterAll(async () => {
  await state.admin?.dispose();
  await Promise.all(Object.values(state.contexts).map((c) => c.close()));
});

test('a gift list is linked to my hints, once it is shared', async ({
  playwright,
  baseURL,
}) => {
  const token = state.tokens[state.receiver];
  const api = as(state.receiver).request;
  // Not without an account, not a draft, not the list of someone else.
  const anonymous = await playwright.request.newContext({ baseURL });
  expect(
    (
      await anonymous.put(`/api/p/${token}/hints/list`, {
        data: { listId: state.listId },
      })
    ).status(),
  ).toBe(401);
  await anonymous.dispose();
  const draft = await api.put(`/api/p/${token}/hints/list`, {
    data: { listId: state.listId },
  });
  expect(draft.status()).toBe(409);
  expect((await draft.json()).statusMessage).toBe('list_not_linkable');
  expect(
    (
      await as(state.other).request.put(
        `/api/p/${state.tokens[state.other]}/hints/list`,
        { data: { listId: state.listId } },
      )
    ).status(),
  ).toBe(409);

  // In the page: the block, its sheet, the draft greyed.
  const page = await open(state.receiver, `/p/${token}/pistes`);
  const block = page.getByTestId('hints-list');
  await expect(block).toContainText('Ma liste de cadeaux');
  await block.getByTestId('hints-list-add').click();
  const sheet = page.getByRole('dialog');
  await expect(sheet).toContainText('Quelle liste ?');
  const draftRow = sheet
    .getByTestId('hints-list-choice')
    .filter({ hasText: 'Noël chez nous' });
  await expect(draftRow).toContainText('Brouillon : publie-la d’abord');
  await expect(draftRow.getByRole('radio')).toBeDisabled();
  await expect(sheet).toContainText('Aucune liste');
  await page.keyboard.press('Escape');

  // Shared, it can be chosen.
  state.token = (
    await ok(await api.post(`/api/lists/${state.listId}/share`, { data: {} }))
  ).token;
  await page.reload();
  await hydrated(page);
  await page.getByTestId('hints-list-add').click();
  const row = page
    .getByTestId('hints-list-choice')
    .filter({ hasText: 'Noël chez nous' });
  await expect(row).toContainText('Ta liste · publiée');
  await row.getByRole('radio').check();
  await page.getByTestId('hints-list-validate').click();
  const linked = page.getByTestId('hints-list-linked');
  await expect(linked).toContainText('Noël chez nous');
  await expect(linked).toContainText('Ta liste, publiée');
  await expect(block).toContainText(
    'Ce qu’elle y coche est anonyme : personne ne saura que c’est elle, pas même toi.',
  );
  await page.close();

  // Without an account, the block says to log in.
  const guest = await playwright.request.newContext({ baseURL });
  const hints = await ok(await guest.get(`/api/p/${token}/hints`));
  expect(hints.list.loggedIn).toBe(false);
  expect(hints.list.linked.title).toBe('Noël chez nous');
  expect(hints.list.linked.holds).toBeNull();
  await guest.dispose();
});

test('the one who gives reads a link to it, and nobody else', async () => {
  if (!state.admin) throw new Error('admin context missing');
  // The one who receives also left a precise idea: with a list linked,
  // « Si tu sèches » no longer shows.
  await ok(
    await state.admin.put(`/api/p/${state.tokens[state.receiver]}/wishes`, {
      data: { wishes: [{ label: 'Une lampe de lecture' }] },
    }),
  );
  const reveal = await ok(
    await state.admin.post(`/api/p/${state.tokens[state.giver]}/reveal`),
  );
  expect(reveal.list.title).toBe('Noël chez nous');
  expect(reveal.list.path).toMatch(
    new RegExp(`^/l/${state.token}\\?anonyme=1&p=`),
  );
  state.path = reveal.list.path;
  // Nothing of the list itself.
  expect(JSON.stringify(reveal.list)).not.toContain('circuit');
  // The others read no link: the one they give to linked none.
  const other = await ok(
    await state.admin.post(`/api/p/${state.tokens[state.other]}/reveal`),
  );
  expect(other.list).toBeNull();

  const page = await open(state.giver, `/p/${state.tokens[state.giver]}`);
  await page
    .getByRole('button', { name: /Découvrir|Revoir/ })
    .first()
    .click();
  const link = page.getByTestId('giver-list');
  await expect(link).toContainText('Sa liste de cadeaux : Noël chez nous');
  await expect(link).toContainText('Le mode anonyme y sera activé pour toi.');
  await expect(page.getByTestId('giver-hints')).not.toContainText(
    'Si tu sèches',
  );
  await expect(page.getByTestId('giver-hints')).not.toContainText(
    'Une lampe de lecture',
  );
  await page.close();
});

test('from the draw, the list opens in anonymous mode, with a note', async () => {
  const page = await open(state.giver, state.path);
  const bar = page.getByTestId('mode-bar');
  await expect(bar).toHaveAttribute('data-mode', 'anonymous');
  await expect(bar).toContainText('Mode anonyme');
  await expect(page.getByTestId('mode-switch')).toBeChecked();
  const note = page.getByTestId('mode-notice');
  await expect(note).toContainText('On a activé le mode anonyme pour toi');
  await expect(note).toContainText(
    'Tu offres un cadeau dans un tirage à quelqu’un de cette liste',
  );
  // It names nobody, and no text of a list says « Père Noël ».
  await expect(note).not.toContainText(state.receiver);
  await expect(page.locator('body')).not.toContainText('Père Noël');
  // The list stays usable under the note; « Compris » takes it away for
  // good.
  // Behind it, a veil over the whole page, the top bar and the tabs
  // included; it lets the touches through, and goes with the note.
  const veil = page.getByTestId('mode-veil');
  await expect(veil).toHaveCSS('position', 'fixed');
  await expect(veil).toHaveCSS('pointer-events', 'none');
  const box = await veil.boundingBox();
  const size = page.viewportSize();
  expect(box?.width).toBe(size?.width);
  expect(box?.height).toBe(size?.height);
  await page.getByTestId('mode-understood').click();
  await expect(note).toHaveCount(0);
  await expect(veil).toHaveCount(0);
  await page.getByTestId('mode-why').click();
  await expect(page.getByTestId('mode-explained')).toContainText(
    'Activé : quand tu coches un cadeau, personne ne voit ton prénom',
  );
  await page
    .getByTestId('visitor-idea')
    .filter({ hasText: 'Un circuit de billes' })
    .getByTestId('idea-box')
    .click();
  await expect(page.getByTestId('idea-mine')).toHaveText(
    'Tu l’offres en anonyme',
  );
  // The first tick on this device: its note, in the words of the mode
  // (Correction 30), once the note of the mode is gone.
  await expect(page.getByTestId('tick-notice')).toContainText(
    'Touche « Tu l’offres en anonyme » pour changer d’avis.',
  );
  await page.getByTestId('tick-understood').click();
  await expect(page.getByTestId('tick-notice')).toHaveCount(0);
  await page.getByTestId('off-list-action').click();
  await page.getByTestId('off-list-field').fill('Une surprise');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('off-list')).toContainText('Une surprise');
  await page.reload();
  await hydrated(page);
  await expect(page.getByTestId('mode-notice')).toHaveCount(0);
  await expect(bar).toHaveAttribute('data-mode', 'anonymous');
  await page.close();

  // The one who holds the list reads « Anonyme », and the first name of
  // the one who gives in nothing they are sent.
  const holder = await open(state.receiver, `/listes/${state.listId}`);
  await expect(holder.getByTestId('idea-who')).toHaveText(['Anonyme']);
  await expect(holder.getByTestId('holder-off-list')).toContainText('Anonyme');
  await holder.close();
  expect(await holderView()).not.toContain(state.giver);
});

test('the switch stays free: turned off, the next tick says my name', async () => {
  const page = await open(state.giver, `/l/${state.token}`);
  await page.getByTestId('mode-switch').click();
  const bar = page.getByTestId('mode-bar');
  await expect(bar).toHaveAttribute('data-mode', 'named');
  await page.getByTestId('mode-why').click();
  await expect(page.getByTestId('mode-explained')).toContainText(
    'Désactivé : quand tu coches un cadeau, ceux qui tiennent la liste voient ton prénom.',
  );
  await page
    .getByTestId('visitor-idea')
    .filter({ hasText: 'Un vélo' })
    .getByTestId('idea-box')
    .click();
  await expect(page.getByTestId('idea-mine').last()).toHaveText('Tu l’offres');
  // Kept for the next time, and the address no longer turns it on.
  await page.goto(state.path);
  await hydrated(page);
  await expect(bar).toHaveAttribute('data-mode', 'named');
  await expect(page.getByTestId('mode-notice')).toHaveCount(0);
  await page.close();
  // What was ticked in anonymous mode did not change.
  const doc = await ok(
    await as(state.receiver).request.get(`/api/lists/${state.listId}`),
  );
  const views = Object.fromEntries(
    doc.people[0].ideas.map((idea: { text: string; view: unknown }) => [
      idea.text,
      idea.view,
    ]),
  );
  expect(views['Un circuit de billes']).toEqual({ kind: 'taken', by: null });
  expect(views['Un vélo']).toEqual({ kind: 'taken', by: state.giver });
});

test('the draw is found without the link, and with another address', async ({
  browser,
}) => {
  // By the address of the account alone, on another list of the same
  // person.
  const page = await open(state.giver, `/l/${state.second}`);
  await expect(page.getByTestId('mode-bar')).toHaveAttribute(
    'data-mode',
    'anonymous',
  );
  await expect(page.getByTestId('mode-notice')).toBeVisible();
  await page.close();

  // Someone who has nothing to do with it: under their first name, no
  // note, whatever the list.
  const other = await open(state.other, `/l/${state.token}`);
  await expect(other.getByTestId('mode-bar')).toHaveAttribute(
    'data-mode',
    'named',
  );
  await expect(other.getByTestId('mode-notice')).toHaveCount(0);
  await other.close();

  // Another address, with the link of the draw: found by the
  // participation it carries, signed. Made up, it finds nothing.
  const signed = new URL(state.path, 'http://x').searchParams.get('p') ?? '';
  const elsewhere = await login(browser, 'autre-masque@example.com', 'Autre');
  const found = await ok(
    await elsewhere.request.get(
      `/api/l/${state.second}?p=${encodeURIComponent(signed)}`,
    ),
  );
  expect(found.mode).toEqual({ anonymous: true, notice: true });
  await elsewhere.close();
  const forger = await login(browser, 'faux-masque@example.com', 'Faux');
  const forged = await ok(
    await forger.request.get(
      `/api/l/${state.second}?p=${encodeURIComponent(`${signed.split('.')[0]}.AAAA`)}`,
    ),
  );
  expect(forged.mode).toEqual({ anonymous: false, notice: false });
  // « ?anonyme » alone turns it on, without a note; a choice made stays.
  const asked = await login(browser, 'demande-masque@example.com', 'Demande');
  expect(
    (await ok(await asked.request.get(`/api/l/${state.second}?anonyme=1`)))
      .mode,
  ).toEqual({ anonymous: true, notice: false });
  expect(
    await ok(
      await asked.request.put(`/api/l/${state.second}/mode`, {
        data: { anonymous: false },
      }),
    ),
  ).toEqual({ anonymous: false, notice: false });
  expect(
    (await ok(await asked.request.get(`/api/l/${state.second}?anonyme=1`)))
      .mode,
  ).toEqual({ anonymous: false, notice: false });
  await forger.close();
  await asked.close();
});

test('without a session no bar; without a first name, anonymous', async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await expect(page.getByTestId('visitor-idea').first()).toBeVisible();
  await expect(page.getByTestId('mode-bar')).toHaveCount(0);
  // Ticking asks for an address; the first name is optional.
  await page
    .getByTestId('visitor-idea')
    .filter({ hasText: 'Un puzzle' })
    .getByTestId('idea-box')
    .click();
  await expect(page.getByTestId('login-no-name')).toHaveText(
    'Sans prénom, tu coches en anonyme.',
  );
  await context.close();

  // An account without a first name: anonymous, without a note.
  const nameless = await login(browser, 'sans-prenom-masque@example.com');
  const mine = await nameless.newPage();
  await mine.goto(`/l/${state.token}`);
  await hydrated(mine);
  await expect(mine.getByTestId('mode-bar')).toHaveAttribute(
    'data-mode',
    'anonymous',
  );
  await expect(mine.getByTestId('mode-notice')).toHaveCount(0);
  await nameless.close();

  // Those who hold the list have no bar by its link: they tick under
  // their name, in their document.
  const holder = await open(state.receiver, `/l/${state.token}`);
  await expect(holder.getByTestId('visitor-idea').first()).toBeVisible();
  await expect(holder.getByTestId('mode-bar')).toHaveCount(0);
  await holder.close();
});

test('unshared or unlinked, the link leaves the result', async () => {
  if (!state.admin) throw new Error('admin context missing');
  const api = as(state.receiver).request;
  const read = async () =>
    (
      await ok(
        await state.admin!.post(`/api/p/${state.tokens[state.giver]}/reveal`),
      )
    ).list;
  await api.post(`/api/lists/${state.listId}/share`, { data: { ask: 'off' } });
  expect(await read()).toBeNull();
  await api.post(`/api/lists/${state.listId}/share`, { data: { ask: 'on' } });
  expect((await read()).title).toBe('Noël chez nous');
  await ok(
    await api.put(`/api/p/${state.tokens[state.receiver]}/hints/list`, {
      data: { listId: null },
    }),
  );
  expect(await read()).toBeNull();
});
