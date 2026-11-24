import { expect, test } from '@playwright/test';
import { apiLogin, hydrated } from './helpers';

// The line being written is a white card (ticket 144, docs/spec/v3/
// listes.md, « La ligne qu'on écrit, la ligne qu'on déplace »): touching
// an idea moves neither its box nor its text, and nothing is red around
// it.
const CAMILLE = 'camille-carte@example.com';

test('touching an idea moves neither its box nor its text', async ({
  page,
}) => {
  await apiLogin(page.request, CAMILLE);
  const party = await page.request.post('/api/parties', {
    data: {
      category: 'christmas',
      name: 'Famille Carte',
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
  await page.request.post(`/api/lists/${id}/ideas`, {
    data: { listPersonId, text: 'Un circuit de billes' },
  });
  await page.goto(`/listes/${id}`);
  await hydrated(page);

  const line = page.locator('[data-line]').first();
  // Where a thing is on the page, whatever the scroll.
  const at = async (target: typeof line) => {
    const rect = (await target.boundingBox())!;
    const scrollY = await page.evaluate(() => window.scrollY);
    return { x: rect.x, y: rect.y + scrollY };
  };
  const box = line.getByTestId('holder-box');
  const before = {
    box: await at(box),
    text: await at(line.getByTestId('idea-text')),
  };
  await line.getByTestId('idea-text').click();
  const field = line.getByTestId('idea-field');
  await expect(field).toBeFocused();
  const after = {
    box: await at(box),
    text: await at(field),
  };
  expect(after.box.x).toBeCloseTo(before.box.x, 0);
  expect(after.box.y).toBeCloseTo(before.box.y, 0);
  expect(after.text.x).toBeCloseTo(before.text.x, 0);
  expect(after.text.y).toBeCloseTo(before.text.y, 0);
  // A white card: no line on its left.
  expect(
    await line.evaluate((el) => getComputedStyle(el).borderLeftWidth),
  ).toBe('0px');
  expect(
    await line.evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
  ).toBe('16px');
});
