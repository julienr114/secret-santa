import { expect, test, type APIRequestContext } from '@playwright/test';
import { apiLogin, heading, hydrated, loginAsOrganizer } from './helpers';

// Three languages (plan v7). A person has a preferred language: their
// personal page, the messages and the journal follow it. The admin side
// follows the visitor's own choice, kept on the device.
test.describe.configure({ mode: 'serial' });

const SLUG = 'famille-polyglotte';
const SUPER = 'super-language@example.com';
const ORGANIZER = 'orga-polyglotte@example.com';
const ADMIN = `/api/admin/${SLUG}`;
const state: { api?: APIRequestContext; editionId: string; link: string } = {
  editionId: '',
  link: '',
};
const api = () => {
  if (!state.api) throw new Error('api context missing');
  return state.api;
};
const messageOf = async (firstName: string, type = 'invitation') => {
  const { participants } = await (
    await api().get(`${ADMIN}/editions/${state.editionId}`)
  ).json();
  const { messages } = await (
    await api().get(
      `${ADMIN}/editions/${state.editionId}/messages?type=${type}`,
    )
  ).json();
  const person = participants.find(
    (p: { firstName: string }) => p.firstName === firstName,
  );
  return {
    language: person.language as string,
    ...(messages[person.participationId] as { text: string; link: string }),
  };
};

test.beforeAll(async ({ playwright, baseURL }) => {
  state.api = await playwright.request.newContext({ baseURL });
  await apiLogin(api(), SUPER);
  await api().post('/api/admin/groups', {
    data: {
      slug: SLUG,
      name: 'Famille Polyglotte',
      organizers: [ORGANIZER],
    },
  });
  await api().post(`${ADMIN}/persons`, {
    data: { firstName: 'Greta', language: 'de' },
  });
  await api().post(`${ADMIN}/persons`, { data: { firstName: 'Paul' } });
  const refused = await api().post(`${ADMIN}/persons`, {
    data: { firstName: 'Zed', language: 'es' },
  });
  expect(refused.status()).toBe(400);
  const edition = await api().post(`${ADMIN}/editions`, {
    data: { label: 'Noël 2026', year: 2026 },
  });
  state.editionId = (await edition.json()).edition.id;
  await api().post(`${ADMIN}/editions/${state.editionId}/open`);
  state.link = new URL((await messageOf('Greta')).link).pathname;
});

test.afterAll(async () => {
  await state.api?.dispose();
});

test('messages are written in the language of each person', async () => {
  const greta = await messageOf('Greta');
  expect(greta.language).toBe('de');
  expect(greta.text).toMatch(/^Hallo Greta! 🎁\nDu machst beim Wichteln/);
  const paul = await messageOf('Paul');
  expect(paul.language).toBe('fr');
  expect(paul.text).toMatch(/^Salut Paul ! 🎁/);
});

test('a personal page follows the preferred language, and can change it', async ({
  page,
}) => {
  // The browser asks for French; Greta's preference wins.
  await page.goto(state.link);
  await hydrated(page);
  await expect(heading(page)).toHaveText('Hallo Greta!');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(
    page.getByText('Die Auslosung hat noch nicht stattgefunden'),
  ).toBeVisible();

  await page.getByRole('link', { name: /Protokoll der Gruppe/ }).click();
  await expect(heading(page)).toHaveText('Protokoll der Gruppe');
  await expect(page.getByText('Greta nimmt an der Ausgabe teil')).toHaveCount(
    0,
  );
  await page.getByRole('link', { name: 'Zurück' }).click();

  // She switches to English: saved as her preference, not just on screen.
  await page.getByRole('button', { name: 'Sprache ändern' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'English' }).click();
  await expect(heading(page)).toHaveText('Hi Greta!');
  await expect.poll(async () => (await messageOf('Greta')).language).toBe('en');
  expect((await messageOf('Greta')).text).toMatch(/^Hi Greta! 🎁/);

  // Like every change made with a link, it is written to the journal.
  await page.getByRole('link', { name: /Group journal/ }).click();
  await expect(
    page.getByText('Greta changed their language (English)'),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Back' }).click();
  await expect(heading(page)).toHaveText('Hi Greta!');

  await page.reload();
  await hydrated(page);
  await expect(heading(page)).toHaveText('Hi Greta!');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('an unknown link speaks the language of the browser', async ({ page }) => {
  await page.goto(`/p/${'x'.repeat(43)}`);
  await hydrated(page);
  await expect(page.getByText("Ce lien n'est plus valable")).toBeVisible();
});

test('the admin side follows the choice made on the device', async ({
  page,
}) => {
  await loginAsOrganizer(page, SLUG, ORGANIZER);
  await expect(heading(page)).toHaveText('Famille Polyglotte');
  // Language and log out live in one menu; the logo is always there.
  await expect(
    page.getByRole('link', { name: /Under the Tree/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(
    page.getByRole('menuitem', { name: 'Se déconnecter' }),
  ).toBeVisible();
  await page.getByRole('menuitemcheckbox', { name: 'Deutsch' }).click();
  await expect(page.getByRole('button', { name: 'Menü' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  // Remembered across pages and reloads, without changing anyone's
  // preferred language.
  await page.reload();
  await hydrated(page);
  await expect(page.getByRole('button', { name: 'Menü' })).toBeVisible();
  await page.getByText('Personen', { exact: true }).click();
  await expect(
    page.getByRole('link', { name: /Under the Tree/ }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Zurück' })).toBeVisible();
  expect((await messageOf('Paul')).language).toBe('fr');
});
