import { expect, test } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// An idea with only a link (ticket 140, docs/spec/v3/listes.md, « Une
// idée qui n'a qu'un lien »): its line shows the name of its site in
// the place of its text; touching it writes the idea, the link alone
// opens the site; it is named by its site everywhere.
const CAMILLE = 'camille-lien@example.com';

test('an idea with only a link is written, named and erased like the others', async ({
  page,
  browser,
}) => {
  await apiLogin(page.request, CAMILLE);
  const party = await page.request.post('/api/parties', {
    data: {
      category: 'christmas',
      name: 'Famille Lien',
      date: '2099-12-25',
      recurring: true,
      memberIds: [],
    },
  });
  const { slug } = (await party.json()) as { slug: string };
  const made = await page.request.post('/api/lists', {
    data: { icon: { emoji: '🎄', color: 'pine' }, party: slug },
  });
  const { id } = (await made.json()) as { id: string };
  const person = await page.request.post(`/api/lists/${id}/people`, {
    data: {
      newMember: { firstName: 'Léo', avatar: { emoji: '🚀', color: 'pine' } },
    },
  });
  const { id: listPersonId } = (await person.json()) as { id: string };
  const idea = await page.request.post(`/api/lists/${id}/ideas`, {
    data: { listPersonId, text: '', url: 'https://www.lutin-jouets.fr/billes' },
  });
  expect(idea.ok()).toBe(true);

  await page.goto(`/listes/${id}`);
  await hydrated(page);
  // The name of its site in the place of its text, which writes it.
  const text = page.getByTestId('idea-text');
  await expect(text).toHaveText('lutin-jouets.fr');
  await expect(page.getByTestId('idea-link')).toHaveAttribute(
    'href',
    'https://www.lutin-jouets.fr/billes',
  );
  await expect(
    page.getByRole('checkbox', { name: 'Je l’offre : lutin-jouets.fr' }),
  ).toBeVisible();
  await text.click();
  // Nothing written in its place: the field is empty.
  const field = page.getByTestId('idea-field').first();
  await expect(field).toBeFocused();
  await expect(field).toHaveValue('');
  await field.fill('Un circuit de billes');
  await field.press('Enter');
  await expect(page.getByTestId('idea-text')).toHaveText(
    'Un circuit de billes',
  );

  // Its text gone again, it is named by its site again.
  await page.getByTestId('idea-text').click();
  await page.getByTestId('idea-field').first().fill('');
  await page.getByTestId('idea-field').first().press('Enter');
  await expect(page.getByTestId('idea-text')).toHaveText('lutin-jouets.fr');

  // Who does not hold the list sees the same line, by its link.
  const doc = (await (await page.request.get(`/api/lists/${id}`)).json()) as {
    list: { shareToken: string };
  };
  await page.request.put(`/api/lists/${id}/sharing`, {
    data: { isPublic: true, parties: [] },
  });
  const outside = await browser.newPage();
  await outside.goto(`/l/${doc.list.shareToken}`);
  await hydrated(outside);
  await expect(outside.getByTestId('visitor-idea')).toContainText(
    'lutin-jouets.fr',
  );
  await expect(
    outside.getByRole('checkbox', { name: 'Je l’offre : lutin-jouets.fr' }),
  ).toBeVisible();
  await outside.close();

  // Emptied of its link too, it goes, as any idea.
  await page.getByTestId('idea-text').click();
  await page.getByTestId('idea-link-remove').click();
  await page.getByTestId('idea-field').first().focus();
  await page.getByTestId('idea-field').first().press('Enter');
  await expect(page.getByTestId('idea-text')).toHaveCount(0);
});
