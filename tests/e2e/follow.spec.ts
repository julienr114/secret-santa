import { expect, test, type Page } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// « Suivre » (ticket 122, ListeSuivre): on a list I may open without
// holding it, a bell at the end of each person's name and « Suivre toute
// la liste » under its word; « Me prévenir » lists what I follow, with
// « Ne plus suivre ». Without an account, a bell asks for an address.
test.describe.configure({ mode: 'serial' });

const HOLDER = 'follow-holder@example.com';
const READER = 'follow-reader@example.com';
const state = { token: '' };

test.beforeAll(async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL });
  await apiLogin(api, HOLDER);
  const { id } = await (
    await api.post('/api/lists', {
      data: { icon: { emoji: '❄️', color: 'night' }, title: 'Noël à suivre' },
    })
  ).json();
  for (const [firstName, emoji] of [
    ['Léo', '🚀'],
    ['Zoé', '🦄'],
  ] as const) {
    const place = await (
      await api.post(`/api/lists/${id}/people`, {
        data: { newMember: { firstName, avatar: { emoji, color: 'pine' } } },
      })
    ).json();
    await api.post(`/api/lists/${id}/ideas`, {
      data: { listPersonId: place.id, text: `Une idée pour ${firstName}` },
    });
  }
  const { token } = await (
    await api.post(`/api/lists/${id}/share`, { data: {} })
  ).json();
  state.token = token;
  await api.dispose();
});

const bell = (page: Page, name: string) =>
  page
    .getByTestId('visitor-person')
    .filter({ has: page.getByRole('heading', { name }) })
    .getByTestId('follow-bell');

test('a bell follows one person, and the line says so', async ({ page }) => {
  await apiLogin(page.request, READER);
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  const leo = bell(page, 'Léo');
  await expect(leo).toHaveAttribute('aria-pressed', 'false');
  await expect(leo).toHaveAccessibleName('Suivre Léo');
  await leo.click();
  await expect(leo).toHaveAttribute('aria-pressed', 'true');
  await expect(leo).toHaveAccessibleName('Ne plus suivre Léo');
  await expect(bell(page, 'Zoé')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('follow-state')).toContainText(
    'Tu suis les nouvelles idées pour Léo.',
  );
  // Kept: read again, still followed.
  await page.reload();
  await hydrated(page);
  await expect(bell(page, 'Léo')).toHaveAttribute('aria-pressed', 'true');
  // The whole list: every bell full, and « Ne plus suivre ».
  await page.getByTestId('follow-list').click();
  await expect(bell(page, 'Zoé')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('follow-state')).toContainText(
    'Tu suis les nouvelles idées de toute la liste.',
  );
  await expect(page.getByTestId('follow-list')).toHaveText('Ne plus suivre');
});

test('« Me prévenir » lists what I follow, and stops it', async ({ page }) => {
  await apiLogin(page.request, READER);
  await page.goto('/compte/me-prevenir#suivis');
  await hydrated(page);
  const following = page.getByTestId('following');
  await expect(following).toContainText('Noël à suivre');
  await expect(following).toContainText('Toute la liste');
  await following
    .getByRole('button', { name: 'Ne plus suivre Noël à suivre' })
    .click();
  await expect(following).toHaveCount(0);
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await expect(bell(page, 'Léo')).toHaveAttribute('aria-pressed', 'false');
});

test('who holds the list has no bell', async ({ page }) => {
  await apiLogin(page.request, HOLDER);
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await expect(page.getByTestId('visitor-person').first()).toBeVisible();
  await expect(page.getByTestId('follow-bell')).toHaveCount(0);
  await expect(page.getByTestId('follow-state')).toHaveCount(0);
});

test('without an account, a bell asks for an address to follow', async ({
  page,
}) => {
  await page.goto(`/l/${state.token}`);
  await hydrated(page);
  await bell(page, 'Zoé').click();
  await expect(page).toHaveURL(/\/connexion\?suivre=/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Ton adresse email, pour suivre',
  );
  await expect(page.getByTestId('login-no-name')).toHaveCount(0);
});
