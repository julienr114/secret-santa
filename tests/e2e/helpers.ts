import { expect, type APIRequestContext, type Page } from '@playwright/test';

// Logging in goes through a magic link. The test server returns it in the
// answer (development mode) instead of emailing it. Every spec has its
// own super-admin address: an address may only ask for a few links an
// hour.

/**
 * Waits for Vue to take over the page before interacting with it: the
 * application Vue hangs on its root once mounted. (`window.useNuxtApp`
 * is there earlier, while a field typed in would still lose its text.)
 */
export const hydrated = async (page: Page) => {
  await page.waitForFunction(() =>
    Boolean(
      (document.querySelector('#__nuxt') as { __vue_app__?: unknown } | null)
        ?.__vue_app__,
    ),
  );
};

export const heading = (page: Page) => page.getByRole('heading', { level: 1 });

/** Asks for a login link and uses it: the context is then logged in. */
export const apiLogin = async (api: APIRequestContext, email: string) => {
  const asked = await api.post('/api/auth/link', { data: { email } });
  const { devLink } = await asked.json();
  expect(devLink, `no login link for ${email}`).toBeTruthy();
  const confirmed = await api.post('/api/auth/confirm', {
    data: { token: new URL(devLink).pathname.split('/').at(-1) },
  });
  expect(confirmed.status(), `login of ${email}`).toBe(200);
};

/** Logs the page in and opens the home page. */
export const loginAsSuper = async (page: Page, email: string) => {
  await apiLogin(page.request, email);
  await page.goto('/');
  await hydrated(page);
  await expect(heading(page)).toHaveText('Bonjour');
};

/** Logs an organiser in and opens their party (the group of before). */
export const loginAsOrganizer = async (
  page: Page,
  slug: string,
  email: string,
) => {
  await apiLogin(page.request, email);
  await page.goto(`/e/${slug}`);
  await hydrated(page);
  await expect(page).toHaveURL(new RegExp(`/e/${slug}$`));
};

/**
 * Writes rows the screens can no longer make (the gift hints of before
 * the V3, ticket 107) straight into the database of the test server.
 * @param sql - The statements.
 * @returns Once written.
 */
export const seedSql = async (sql: string) => {
  const { execFileSync } = await import('node:child_process');
  execFileSync(
    'pnpm',
    [
      'wrangler',
      'd1',
      'execute',
      'secret-santa',
      '--local',
      '--persist-to',
      '.wrangler/e2e',
      '--command',
      sql,
    ],
    { stdio: 'pipe' },
  );
};

/**
 * Opens one of my lists by its name, as the page « Listes » did: it is
 * gone (ticket 114), its answer (`/api/lists`) still says which lists
 * are mine.
 * @param page - The page, logged in.
 * @param title - The name of the list.
 * @returns The id of the list.
 */
export const openList = async (page: Page, title: string) => {
  type Card = { id: string; title: string; holder: { token: string } | null };
  const { coming, past } = (await (
    await page.request.get('/api/lists')
  ).json()) as Record<'coming' | 'past', Card[]>;
  const list = [...coming, ...past].find((card) => card.title === title);
  expect(list, `no list « ${title} »`).toBeTruthy();
  // Held, its document; else, by its link.
  await page.goto(
    list!.holder ? `/l/${list!.holder.token}` : `/listes/${list!.id}`,
  );
  await hydrated(page);
  return list!.id;
};
