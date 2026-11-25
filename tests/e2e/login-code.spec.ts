import { expect, test } from '@playwright/test';
import { hydrated } from './helpers';

// The login by a code (ticket 123, ConnexionCode): in the installed app
// only, six digits copied from the email, validated at the sixth; good
// on the device that asked, five tries at most. In a browser, the link of
// before, unchanged.

/** The page believes it runs installed on the phone. */
const installed = () =>
  Object.defineProperty(window, 'matchMedia', {
    value: (query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      onchange: null,
      dispatchEvent: () => false,
    }),
  });

test('the installed app logs in with six digits', async ({ page }) => {
  await page.addInitScript(installed);
  await page.goto('/login');
  await hydrated(page);
  await page.getByLabel('Adresse email').fill('code-app@example.com');
  const asked = page.waitForResponse((r) => r.url().endsWith('/api/auth/link'));
  await page.getByRole('button', { name: 'Recevoir un code' }).click();
  const { devCode } = await (await asked).json();
  expect(devCode).toMatch(/^\d{6}$/);
  await expect(page.getByTestId('login-code')).toContainText('Tape ton code');
  await expect(page.getByTestId('login-code')).toContainText(
    'code-app@example.com',
  );
  await page.getByTestId('login-code-field').fill(devCode);
  await expect(page).toHaveURL(/\/$/);
  await hydrated(page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Bonjour',
  );
});

test('in a browser, nothing changes: the link of before', async ({ page }) => {
  await page.goto('/login');
  await hydrated(page);
  await page.getByLabel('Adresse email').fill('code-browser@example.com');
  const asked = page.waitForResponse((r) => r.url().endsWith('/api/auth/link'));
  await page
    .getByRole('button', { name: 'Recevoir un lien de connexion' })
    .click();
  const answer = await (await asked).json();
  expect(answer.devLink).toBeTruthy();
  expect(answer.devCode).toBeUndefined();
  await expect(page.getByTestId('login-sent')).toBeVisible();
  await expect(page.getByTestId('login-code')).toHaveCount(0);
});

test('a code asked on one device logs no other in', async ({
  playwright,
  baseURL,
}) => {
  const phone = await playwright.request.newContext({ baseURL });
  const other = await playwright.request.newContext({ baseURL });
  try {
    const email = 'code-device@example.com';
    const { devCode } = await (
      await phone.post('/api/auth/link', { data: { email, code: true } })
    ).json();
    const elsewhere = await other.post('/api/auth/code', {
      data: { email, code: devCode },
    });
    expect(elsewhere.status()).toBe(401);
    const here = await phone.post('/api/auth/code', {
      data: { email, code: devCode },
    });
    expect(here.status()).toBe(200);
    // Once.
    const again = await phone.post('/api/auth/code', {
      data: { email, code: devCode },
    });
    expect(again.status()).toBe(401);
  } finally {
    await phone.dispose();
    await other.dispose();
  }
});

test('the sixth try is refused, even with the right code', async ({
  playwright,
  baseURL,
}) => {
  const phone = await playwright.request.newContext({ baseURL });
  try {
    const email = 'code-tries@example.com';
    const { devCode } = await (
      await phone.post('/api/auth/link', { data: { email, code: true } })
    ).json();
    const wrong = devCode === '000000' ? '111111' : '000000';
    // One after the other: each try counts.
    await [1, 2, 3, 4, 5].reduce(
      (done) =>
        done.then(async () => {
          const tried = await phone.post('/api/auth/code', {
            data: { email, code: wrong },
          });
          expect(tried.status()).toBe(401);
        }),
      Promise.resolve(),
    );
    const sixth = await phone.post('/api/auth/code', {
      data: { email, code: devCode },
    });
    expect(sixth.status()).toBe(401);
  } finally {
    await phone.dispose();
  }
});
