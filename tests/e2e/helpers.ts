import { expect, type Page } from '@playwright/test';

export const SUPER_PASSWORD = 'e2e-super-password';

/** Waits for Vue to take over the page before interacting with it. */
export const hydrated = async (page: Page) => {
  await page.waitForFunction(
    () =>
      Boolean((window as { useNuxtApp?: unknown }).useNuxtApp) ||
      document.querySelector('#__nuxt')?.hasAttribute('data-v-app'),
  );
};

export const loginAsSuper = async (page: Page) => {
  await page.goto('/admin');
  await hydrated(page);
  await page.getByRole('tab', { name: 'Super-admin' }).click();
  await page.getByLabel('Mot de passe').fill(SUPER_PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/admin\/groupes$/);
};

export const loginAsGuardian = async (
  page: Page,
  slug: string,
  password: string,
) => {
  await page.goto('/admin');
  await hydrated(page);
  await page.getByLabel('Identifiant du groupe').fill(slug);
  await page.getByLabel('Mot de passe').fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/${slug}$`));
};

export const heading = (page: Page) => page.getByRole('heading', { level: 1 });
