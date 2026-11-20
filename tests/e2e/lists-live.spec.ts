import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// A list watched live (lot 26, README 22.20, maquette ListeLiveTeneur),
// with two browsers and a third: what one does arrives at the others by
// itself; those who hold the list see who is there and who writes which
// line; a visitor is counted, never named, and learns nothing of who is
// there.
test.describe.configure({ mode: 'serial' });

const CAMILLE = 'live-camille@example.com';
const HUGO = 'live-hugo@example.com';
const MAMIE = 'live-mamie@example.com';
const state: {
  camille?: BrowserContext;
  hugo?: BrowserContext;
  mamie?: BrowserContext;
  listId: string;
  token: string;
  leo: string;
} = { listId: '', token: '', leo: '' };

const open = async (who: 'camille' | 'hugo' | 'mamie', path: string) => {
  const context = state[who];
  if (!context) throw new Error(`${who} is not logged in`);
  const page = await context.newPage();
  await page.goto(path);
  await hydrated(page);
  return page;
};
/** Puts the caret at the end of the field being written. */
const toEnd = (page: Page) =>
  page.evaluate(() => {
    const field = document.activeElement as HTMLTextAreaElement | null;
    field?.setSelectionRange(field.value.length, field.value.length);
  });
const leo = (page: Page) =>
  page
    .getByTestId('list-person')
    .filter({ has: page.getByRole('heading', { name: 'Léo' }) });

test.beforeAll(async ({ browser }) => {
  const login = async (email: string, firstName: string, emoji: string) => {
    const context = await browser.newContext();
    await apiLogin(context.request, email);
    await context.request.put('/api/auth/profile', {
      data: { firstName, avatarEmoji: emoji, avatarColor: 'frost' },
    });
    return context;
  };
  state.camille = await login(CAMILLE, 'Camille', '🦌');
  state.hugo = await login(HUGO, 'Hugo', '🐧');
  state.mamie = await login(MAMIE, 'Mamie', '🧣');
  const api = state.camille.request;
  const { id } = await (
    await api.post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, title: 'Noël en direct' },
    })
  ).json();
  const person = await (
    await api.post(`/api/lists/${id}/people`, {
      data: {
        newMember: { firstName: 'Léo', avatar: { emoji: '🚀', color: 'pine' } },
      },
    })
  ).json();
  await api.post(`/api/lists/${id}/ideas`, {
    data: { listPersonId: person.id, text: 'Circuit de billes' },
  });
  const { token } = await (
    await api.post(`/api/lists/${id}/share`, { data: {} })
  ).json();
  // Hugo holds the list too (an invitation still waiting is accepted by
  // coming).
  await api.post(`/api/lists/${id}/holders`, {
    data: { email: HUGO, level: 'manage' },
  });
  await state.hugo.request.get('/api/lists');
  Object.assign(state, { listId: id, token, leo: person.id });
});

test.afterAll(async () => {
  await state.camille?.close();
  await state.hugo?.close();
  await state.mamie?.close();
});

test('what one writes or ticks arrives at the others by itself', async () => {
  const camille = await open('camille', `/listes/${state.listId}`);
  const hugo = await open('hugo', `/listes/${state.listId}`);
  const mamie = await open('mamie', `/l/${state.token}`);

  // Those who hold the list see each other, and count the visitor.
  await expect(camille.getByTestId('live-here')).toHaveText(
    'Hugo est là en ce moment.',
  );
  await expect(hugo.getByTestId('live-here')).toHaveText(
    'Camille est là en ce moment.',
  );
  await expect(camille.getByTestId('live-visitors')).toHaveText(
    '1 visiteur en ce moment',
  );
  // The visitor is told nothing of who is there.
  await expect(mamie.getByTestId('live-presence')).toHaveCount(0);
  await expect(mamie.locator('body')).not.toContainText('en ce moment');

  // Hugo writes an idea: Camille sees it grow as he types, tinted, with
  // his name; the visitor sees nothing until it is saved.
  await leo(hugo).getByPlaceholder('Une autre idée…').click();
  await hugo.keyboard.type('Un tél');
  const ghost = camille.getByTestId('line-ghost');
  await expect(ghost).toContainText('Un tél');
  await expect(ghost).toContainText('Hugo écrit…');
  await hugo.keyboard.type('escope');
  await expect(ghost).toContainText('Un télescope');
  await expect(hugo.getByTestId('line-ghost')).toHaveCount(0);
  await expect(mamie.locator('body')).not.toContainText('Un tél');
  // Saved: it is a line of the list, at Camille's and at Mamie's.
  await hugo.keyboard.press('Enter');
  await expect(ghost).toHaveCount(0);
  await expect(leo(camille).getByTestId('idea-text')).toHaveText([
    'Circuit de billes',
    'Un télescope',
  ]);
  await expect(mamie.locator('body')).toContainText('Un télescope');

  // Mamie ticks by the link: Camille reads her name without reloading.
  await mamie
    .getByTestId('visitor-idea')
    .filter({ hasText: 'Circuit de billes' })
    .getByTestId('idea-box')
    .click();
  await expect(camille.getByTestId('idea-who')).toHaveText(['Mamie']);
  await expect(hugo.getByTestId('idea-who')).toHaveText(['Mamie']);

  // Hugo is in a line: at Camille's it is his, and cannot be touched.
  const his = leo(hugo)
    .getByTestId('idea-text')
    .filter({ hasText: 'Un télescope' });
  await his.click();
  const locked = camille.locator('[data-locked]');
  await expect(locked).toContainText('Un télescope');
  await expect(camille.getByTestId('line-writing')).toHaveText('Hugo écrit…');
  await expect(locked).toHaveCSS('pointer-events', 'none');
  // Nothing to do on it is offered meanwhile: neither who gives it, nor
  // the box.
  await expect(locked.getByTestId('idea-who')).toHaveCount(0);
  // Not at his own, nor at the visitor's.
  await expect(hugo.locator('[data-locked]')).toHaveCount(0);
  await expect(mamie.locator('body')).not.toContainText('écrit…');
  // What he types shows at Camille's before he validates.
  await hugo.keyboard.type(' pour enfant');
  await expect(locked).toContainText('Un télescope pour enfant');
  // His caret is where he is: three letters back, the text is cut there.
  for (const _ of [1, 2, 3]) await hugo.keyboard.press('ArrowLeft');
  await expect
    .poll(() =>
      locked.evaluate(
        (line) =>
          line.querySelector('[data-testid="live-caret"]')?.nextSibling
            ?.textContent ?? '',
      ),
    )
    .toBe('ant');
  await hugo.keyboard.press('End');
  // He validates: the line is free again, with what he wrote.
  await hugo.keyboard.press('Enter');
  await expect(camille.locator('[data-locked]')).toHaveCount(0);
  await expect(leo(camille).getByTestId('idea-text')).toHaveText([
    'Circuit de billes',
    'Un télescope pour enfant',
  ]);

  // The name of the list, its word and a first name written in place
  // are locked the same way, and show what is typed.
  await hugo.getByTestId('list-title').click();
  await toEnd(hugo);
  await hugo.keyboard.type(' !');
  const lock = camille.getByTestId('live-lock');
  await expect(lock).toContainText('Noël en direct !');
  await expect(lock).toContainText('Hugo écrit…');
  await expect(camille.getByTestId('list-title')).toHaveCount(0);
  await hugo.keyboard.press('Enter');
  await expect(lock).toHaveCount(0);
  await expect(camille.getByTestId('list-title')).toHaveValue(
    'Noël en direct !',
  );
  await leo(hugo).getByTestId('person-name').click();
  await toEnd(hugo);
  await hugo.keyboard.type('n');
  await expect(leo(camille).getByTestId('live-lock')).toContainText('Léon');
  await expect(leo(camille).getByTestId('person-name')).toHaveCount(0);
  await hugo.keyboard.press('Escape');
  await expect(camille.getByTestId('live-lock')).toHaveCount(0);

  // The page of one of the people changes: it shows on the list, at
  // everyone's, without reloading.
  if (!state.camille) throw new Error('Camille is not logged in');
  const { people } = await (
    await state.camille.request.get(`/api/lists/${state.listId}`)
  ).json();
  await state.camille.request.patch(`/api/family/${people[0].member.id}`, {
    data: { clothingSize: '6 ans' },
  });
  await expect(leo(hugo)).toContainText('taille 6 ans');
  await expect(leo(camille)).toContainText('taille 6 ans');
  await expect(mamie.locator('body')).toContainText('taille 6 ans');

  // « Ceux qui tiennent la liste » says who is there now.
  const holders = await open('camille', `/listes/${state.listId}/teneurs`);
  await expect(
    holders.getByTestId('holder').filter({ hasText: 'Hugo' }),
  ).toContainText('Là en ce moment');
  await holders.close();

  // Hugo leaves: Camille is alone again; the visitor is still counted.
  await hugo.close();
  await expect(camille.getByTestId('live-here')).toHaveCount(0);
  await expect(camille.getByTestId('live-visitors')).toHaveText(
    '1 visiteur en ce moment',
  );
  await mamie.close();
  await expect(camille.getByTestId('live-presence')).toHaveCount(0);
  await camille.close();
});

test('nobody connects to a room without a ticket of the app', async () => {
  if (!state.mamie || !state.camille) throw new Error('not logged in');
  // No ticket for a list one does not hold; one by its link, as a visitor.
  expect(
    (
      await state.mamie.request.post(`/api/lists/${state.listId}/live`)
    ).status(),
  ).toBe(404);
  const visitor = await (
    await state.mamie.request.post(`/api/l/${state.token}/live`)
  ).json();
  expect(visitor.live).toBe(true);
  // Nothing readable in a ticket says more than « a visitor ».
  const [body] = String(visitor.ticket).split('.');
  const said = JSON.parse(Buffer.from(body ?? '', 'base64url').toString());
  expect(said.role).toBe('visitor');
  expect(said.accountId).toBeNull();
  expect(said.name).toBe('');
  // The room refuses a connection without a ticket, or with one made up.
  const page = await state.mamie.newPage();
  await page.goto('/login');
  const refused = await page.evaluate(
    (path) =>
      Promise.all(
        ['', '?ticket=abc.def'].map(
          (query) =>
            new Promise<string>((resolve) => {
              const scheme = location.protocol === 'https:' ? 'wss:' : 'ws:';
              const socket = new WebSocket(
                `${scheme}//${location.host}${path}${query}`,
              );
              socket.addEventListener('open', () => resolve('open'));
              socket.addEventListener('error', () => resolve('refused'));
              socket.addEventListener('close', () => resolve('refused'));
            }),
        ),
      ),
    `/live/${state.listId}`,
  );
  expect(refused).toEqual(['refused', 'refused']);
  await page.close();
});
