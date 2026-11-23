import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// A box ticked or unticked shows it at once (Julien, 23 November 2026),
// without waiting for the server; refused, it comes back as it was.
test.describe.configure({ mode: 'serial' });

const state: {
  holder?: BrowserContext;
  visitor?: BrowserContext;
  token: string;
} = { token: '' };

test.beforeAll(async ({ browser }) => {
  const login = async (email: string, firstName: string) => {
    const context = await browser.newContext();
    await apiLogin(context.request, email);
    await context.request.put('/api/auth/profile', {
      data: { firstName, avatarEmoji: '🦌', avatarColor: 'plum' },
    });
    return context;
  };
  state.holder = await login('tick-now-holder@example.com', 'Camille');
  state.visitor = await login('tick-now-visitor@example.com', 'Mamie');
  const api = state.holder.request;
  const { id } = await (
    await api.post('/api/lists', {
      data: {
        icon: { emoji: '🎄', color: 'pine' },
        title: 'Noël tout de suite',
      },
    })
  ).json();
  const leo = await (
    await api.post(`/api/lists/${id}/people`, {
      data: {
        newMember: {
          firstName: 'Léo',
          avatar: { emoji: '🚀', color: 'frost' },
        },
      },
    })
  ).json();
  for (const text of ['Vélo', 'Puzzle']) {
    await api.post(`/api/lists/${id}/ideas`, {
      data: { listPersonId: leo.id, text },
    });
  }
  state.token = (
    await (
      await api.post(`/api/lists/${id}/share`, { data: { ask: 'on' } })
    ).json()
  ).token;
});

test.afterAll(async () => {
  await state.holder?.close();
  await state.visitor?.close();
});

const slowClaims = (page: Page) =>
  page.route('**/claims**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    await route.fallback();
  });

test('the box turns at once, before the server answers', async () => {
  const page = await state.visitor!.newPage();
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await slowClaims(page);
  const line = page.getByTestId('visitor-idea').filter({ hasText: 'Vélo' });
  await line.getByTestId('idea-box').click();
  // Within the 400 ms the server takes.
  await expect(line.getByTestId('idea-mine')).toContainText('Tu l’offres', {
    timeout: 300,
  });
  await page.getByTestId('tick-understood').click();
  await expect(line.getByTestId('idea-mine')).toContainText('Tu l’offres');
  await page.close();
});

test('tapped quickly many times, it ends on the last tap, on the server too', async () => {
  const page = await state.visitor!.newPage();
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await slowClaims(page);
  const line = page.getByTestId('visitor-idea').filter({ hasText: 'Vélo' });
  const box = line.getByTestId('idea-box');
  // Ticked: seven taps, untick, tick, … , untick.
  for (const _tap of Array.from({ length: 7 })) await box.click();
  await expect(line.getByTestId('idea-mine')).toHaveCount(0);
  // Once every request is answered, the list read again says the same.
  await page.waitForTimeout(7 * 400 + 1000);
  await expect(line.getByTestId('idea-mine')).toHaveCount(0);
  const doc = await (
    await state.visitor!.request.get(`/api/l/${state.token}`)
  ).json();
  const velo = doc.people[0].ideas.find(
    (idea: { text: string }) => idea.text === 'Vélo',
  );
  expect(velo.view.kind).toBe('free');
  await page.close();
});

test('refused, it comes back as it was', async () => {
  const page = await state.visitor!.newPage();
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  const { promise: refused, resolve: refuse } =
    Promise.withResolvers<undefined>();
  await page.route('**/claims**', async (route) => {
    await refused;
    await route.fulfill({ status: 500, body: '{}' });
  });
  const line = page.getByTestId('visitor-idea').filter({ hasText: 'Puzzle' });
  await line.getByTestId('idea-box').click();
  await expect(line.getByTestId('idea-mine')).toHaveCount(1);
  refuse(undefined);
  await expect(line.getByTestId('idea-mine')).toHaveCount(0);
  await page.close();
});
