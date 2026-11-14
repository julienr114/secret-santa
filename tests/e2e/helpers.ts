import { expect, type APIRequestContext, type Page } from '@playwright/test';

// Logging in goes through a magic link. The test server returns it in the
// answer (development mode) instead of emailing it. Every spec has its
// own super-admin address: an address may only ask for a few links an
// hour.

/** Waits for Vue to take over the page before interacting with it. */
export const hydrated = async (page: Page) => {
  await page.waitForFunction(
    () =>
      Boolean((window as { useNuxtApp?: unknown }).useNuxtApp) ||
      document.querySelector('#__nuxt')?.hasAttribute('data-v-app'),
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

/** Logs an organiser in and opens their group. */
export const loginAsOrganizer = async (
  page: Page,
  slug: string,
  email: string,
) => {
  await apiLogin(page.request, email);
  await page.goto(`/admin/${slug}`);
  await hydrated(page);
  await expect(page).toHaveURL(new RegExp(`/admin/${slug}$`));
};
