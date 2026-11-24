import { expect, test } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// « Ajouter quelqu'un », on the page of the members (docs/spec/v3/fete.md,
// « Les membres », ticket 158; V3FeteMembres, V3FeteMembresAjouter): one
// line, which leads straight to the one place someone may be added, asks
// where when there are several, and gives way to what may be created
// when there is none.

const CAMILLE = 'camille-ajouter@example.com';
const year = new Date().getFullYear() + 1;

test('« Ajouter quelqu’un »: nowhere, one place, then two', async ({
  page,
}) => {
  await apiLogin(page.request, CAMILLE);
  const created = await page.request.post('/api/parties', {
    data: {
      category: 'christmas',
      name: 'Noël Ajouter',
      date: `${year}-12-25`,
      recurring: true,
    },
  });
  expect(created.ok()).toBe(true);
  const slug = (await created.json()).slug as string;
  const members = `/e/${slug}/membres`;

  // Nowhere yet: what the card of the home offers, the Secret Santa first
  // at Christmas.
  await page.goto(members);
  await hydrated(page);
  await expect(page.getByTestId('members-add')).toHaveCount(0);
  await expect(page.locator('[data-testid^="members-create-"]')).toHaveText([
    'Créer un Secret Santa',
    'Créer une liste de cadeaux',
  ]);

  // A Secret Santa being prepared: the line leads straight to it.
  const santa = await page.request.post(`/api/admin/${slug}/editions`, {
    data: { label: 'Noël', year, eventDate: `${year}-12-25` },
  });
  expect(santa.status()).toBe(201);
  const santaId = (await santa.json()).edition.id as string;
  await page.reload();
  await hydrated(page);
  const add = page.getByTestId('members-add');
  await expect(add).toContainText('Ajouter quelqu’un');
  await expect(add).toContainText('Au Secret Santa');
  await expect(page.locator('[data-testid^="members-create-"]')).toHaveCount(0);
  await add.getByRole('link').click();
  await expect(page).toHaveURL(
    new RegExp(`/admin/${slug}/editions/${santaId}/ajouter$`),
  );

  // And a list of mine shared with its members: the line asks where.
  const list = await page.request.post('/api/lists', {
    data: { icon: { emoji: '🎄', color: 'pine' }, party: slug },
  });
  expect(list.ok()).toBe(true);
  const listId = (await list.json()).id as string;
  const { options } = await (
    await page.request.get(`/api/lists/${listId}/sharing`)
  ).json();
  const event = options.find((one: { slug: string }) => one.slug === slug);
  expect(
    (
      await page.request.put(`/api/lists/${listId}/sharing`, {
        data: { parties: [event.id], givers: [], isPublic: false },
      })
    ).ok(),
  ).toBe(true);
  await page.goto(members);
  await hydrated(page);
  await expect(add).toHaveText(/^Ajouter quelqu’un$/);
  await add.click();
  const sheet = page.getByTestId('members-add-sheet');
  await expect(sheet.getByTestId('members-add-santa')).toContainText(
    'Au Secret SantaPour participer au tirage',
  );
  await expect(sheet.getByTestId('members-add-list')).toContainText(
    'À ma liste de cadeauxPour voir la liste et cocher un cadeau',
  );
  await sheet.getByTestId('members-add-list').getByRole('link').click();
  await expect(page).toHaveURL(
    new RegExp(`/listes/${listId}\\?partage=inviter$`),
  );
});
