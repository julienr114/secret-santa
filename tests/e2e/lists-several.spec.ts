import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { apiLogin, heading, hydrated, openList } from './helpers';

// Gift lists held by several, and a person linked to their own account
// (README 22.20, lot 25): invited by address, an invitation still
// waiting is accepted by coming (its page is in lists-invite.spec); linked, someone writes their own ideas by the link, and
// nothing else.
test.describe.configure({ mode: 'serial' });

const CAMILLE = 'several-camille@example.com';
const HUGO = 'several-hugo@example.com';
const state: {
  camille?: BrowserContext;
  hugo?: BrowserContext;
  listId: string;
  token: string;
  leo: string;
  hugoPlace: string;
  hugoMember: string;
} = { listId: '', token: '', leo: '', hugoPlace: '', hugoMember: '' };

const as = async (who: 'camille' | 'hugo'): Promise<Page> => {
  const context = state[who];
  if (!context) throw new Error(`${who} is not logged in`);
  return context.newPage();
};

test.beforeAll(async ({ browser }) => {
  // One login each: an address may only ask for so many links.
  state.camille = await browser.newContext();
  state.hugo = await browser.newContext();
  await apiLogin(state.camille.request, CAMILLE);
  await apiLogin(state.hugo.request, HUGO);
  await state.camille.request.put('/api/auth/profile', {
    data: { firstName: 'Camille', avatarEmoji: '🦌', avatarColor: 'plum' },
  });
  await state.hugo.request.put('/api/auth/profile', {
    data: { firstName: 'Hugo', avatarEmoji: '🐧', avatarColor: 'frost' },
  });
  const api = state.camille.request;
  const { id } = await (
    await api.post('/api/lists', {
      data: { icon: { emoji: '❄️', color: 'night' }, title: 'Noël à deux' },
    })
  ).json();
  const person = async (firstName: string, emoji: string) =>
    (
      await api.post(`/api/lists/${id}/people`, {
        data: { newMember: { firstName, avatar: { emoji, color: 'pine' } } },
      })
    ).json();
  const leo = await person('Léo', '🚀');
  const hugo = await person('Hugo', '🐧');
  await api.post(`/api/lists/${id}/ideas`, {
    data: { listPersonId: leo.id, text: 'Circuit de billes' },
  });
  const { token } = await (
    await api.post(`/api/lists/${id}/share`, { data: {} })
  ).json();
  Object.assign(state, {
    listId: id,
    token,
    leo: leo.id,
    hugoPlace: hugo.id,
    hugoMember: hugo.memberId,
  });
});

test.afterAll(async () => {
  await state.camille?.close();
  await state.hugo?.close();
});

test('invited by address, Hugo holds the list by coming, and manages it', async () => {
  const camille = await as('camille');
  await camille.goto(`/listes/${state.listId}`);
  await hydrated(camille);
  // Alone for now: the way to hold it with others.
  await camille.getByTestId('holders-line').click();
  await expect(heading(camille)).toHaveText('Ceux qui tiennent la liste');
  await expect(camille.getByTestId('holder')).toHaveCount(1);
  await expect(camille.getByTestId('holder')).toContainText('C’est toi');
  // No address field before « Quelqu'un d'autre » is touched.
  await expect(camille.getByLabel('Son adresse email')).toHaveCount(0);
  await camille.getByTestId('invite-other').click();
  await camille.getByLabel('Son adresse email').fill(HUGO);
  await camille.getByText('Gérer la liste', { exact: true }).click();
  await camille.getByRole('button', { name: 'Envoyer l’invitation' }).click();
  await expect(camille.getByTestId('holder-invite')).toContainText(HUGO);
  await expect(camille.getByTestId('holder-invite')).toContainText(
    'valable jusqu’au',
  );
  // The same address is not invited twice.
  const again = await camille.request.post(
    `/api/lists/${state.listId}/holders`,
    { data: { email: HUGO } },
  );
  expect(again.status()).toBe(409);

  // The list is among Hugo's as soon as he opens his home.
  const hugo = await as('hugo');
  await hugo.goto('/');
  await hydrated(hugo);
  await openList(hugo, 'Noël à deux');
  await expect(hugo.getByTestId('holders-line')).toContainText(
    'Tu tiens cette liste avec Camille.',
  );
  // He ticks in the document, under his own first name.
  const leo = hugo.getByTestId('list-person').filter({ hasText: 'Léo' });
  await leo.getByTestId('holder-box').first().click();
  await expect(leo.getByTestId('idea-mine')).toContainText('Tu l’offres');

  // Camille reads his name, and the invitation is gone.
  await camille.goto(`/listes/${state.listId}`);
  await hydrated(camille);
  await expect(camille.getByTestId('idea-who')).toContainText(['Hugo']);
  await expect(camille.getByTestId('holders-line')).toContainText(
    'Tu tiens cette liste avec Hugo.',
  );
  await camille.getByTestId('holders-line').click();
  await expect(camille.getByTestId('holder')).toHaveCount(2);
  await expect(camille.getByTestId('holder-invite')).toHaveCount(0);

  // Those who manage take another off; the last one cannot leave.
  await camille
    .getByTestId('holder')
    .filter({ hasText: 'Hugo' })
    .getByTestId('holder-level')
    .click();
  await camille.getByRole('menuitem', { name: 'Retirer Hugo' }).click();
  await expect(camille.getByTestId('holder')).toHaveCount(1);
  expect((await hugo.request.get(`/api/lists/${state.listId}`)).status()).toBe(
    404,
  );
  const { holders } = await (
    await camille.request.get(`/api/lists/${state.listId}/holders`)
  ).json();
  const last = await camille.request.delete(
    `/api/lists/${state.listId}/holders/${holders[0].accountId}`,
  );
  expect(last.status()).toBe(409);
  await camille.close();
  await hugo.close();
});

test('linked to his account, Hugo writes his own ideas, and only his', async () => {
  // « Son compte », on his page among Camille's people.
  const camille = await as('camille');
  await camille.goto(`/famille/${state.hugoMember}`);
  await hydrated(camille);
  await expect(camille.getByTestId('member-email')).toContainText('Aucune');
  await camille.getByTestId('member-email').click();
  // A page of its own (Correction 27): one line, the keyboard of addresses.
  await expect(heading(camille)).toHaveText('Son adresse email');
  const field = camille.getByTestId('member-field');
  await expect(field).toHaveAttribute('placeholder', 'prenom@exemple.fr');
  await expect(field).toHaveAttribute('inputmode', 'email');
  // The one sentence of these pages: what the address is for.
  await expect(camille.getByTestId('email-help')).toHaveText(
    'Facultatif. Avec un compte à cette adresse, Hugo pourra écrire ses propres idées sur tes listes.',
  );
  await expect(field).toHaveAttribute('autocapitalize', 'none');
  await expect(camille.getByTestId('member-field-validate')).toBeDisabled();
  await field.fill(HUGO);
  await camille.getByTestId('member-field-validate').click();
  await expect(heading(camille)).toHaveText('Hugo');
  await expect(camille.getByTestId('member-email')).toContainText(HUGO);
  // Linked: the page shows where it stands, and « Ne plus relier ».
  await camille.getByTestId('member-email').click();
  await expect(camille.getByTestId('member-account')).toContainText(
    'Relié à son compte',
  );
  await expect(camille.getByTestId('member-unlink')).toBeVisible();
  await expect(camille.getByTestId('email-help')).toContainText(
    'Hugo peut écrire ses propres idées, sans voir qui offre quoi.',
  );
  await expect(camille.getByTestId('member-field')).toHaveCount(0);
  await camille.getByRole('button', { name: 'Retour' }).click();
  await expect(heading(camille)).toHaveText('Hugo');
  // His name and icon are his from now on.
  await expect(camille.getByTestId('member-name')).toHaveCount(0);

  // The list is among his, before he ever opened it.
  const hugo = await as('hugo');
  await hugo.goto('/');
  await hydrated(hugo);
  await openList(hugo, 'Noël à deux');
  await expect(hugo.getByTestId('visitor-sentence')).toHaveCount(0);
  // His section first, « Hugo (moi) », where he writes in place.
  const first = hugo.getByTestId('visitor-person').first();
  await expect(first.getByTestId('me-tag')).toHaveText('(moi)');
  await first.getByPlaceholder('Une idée pour toi…').click();
  await hugo.keyboard.type('Un bon couteau');
  await hugo.keyboard.press('Enter');
  await expect(first.getByTestId('idea-text')).toHaveText('Un bon couteau');
  await expect(
    first.getByPlaceholder('Une autre idée pour toi…'),
  ).toBeVisible();
  // Not for anyone else, and he does not see who gives what.
  const forLeo = await hugo.request.post(`/api/l/${state.token}/ideas`, {
    data: { listPersonId: state.leo, text: 'Pas à moi', after: null },
  });
  expect(forLeo.status()).toBe(404);
  const seen = await (await hugo.request.get(`/api/l/${state.token}`)).json();
  expect(seen.holds).toBe(false);
  expect(seen.figures).toBe(true);
  expect(JSON.stringify(seen)).not.toContain(HUGO);

  // Camille finds his idea in her document; his name is not hers to write.
  await camille.goto(`/listes/${state.listId}`);
  await hydrated(camille);
  // (Léo's section names Hugo too, who gives him a gift.)
  const his = camille
    .getByTestId('list-person')
    .filter({ has: camille.getByRole('heading', { name: 'Hugo' }) });
  await expect(his.getByTestId('idea-text')).toHaveText('Un bon couteau');
  await expect(his.getByTestId('person-name')).toHaveCount(0);
  await expect(his.getByTestId('person-icon')).toHaveCount(0);

  // While he holds a list with her, he cannot be deleted from her people.
  await camille.request.post(`/api/lists/${state.listId}/holders`, {
    data: { email: HUGO },
  });
  await hugo.request.get('/api/lists');
  const refused = await camille.request.delete(
    `/api/family/${state.hugoMember}`,
  );
  expect(refused.status()).toBe(409);
  // « Ne plus relier »: he is a guest again.
  await camille.request.patch(`/api/family/${state.hugoMember}`, {
    data: { email: null },
  });
  const after = await (
    await camille.request.get(`/api/family/${state.hugoMember}`)
  ).json();
  expect(after.member.linked).toBe(false);
  await camille.close();
  await hugo.close();
});
