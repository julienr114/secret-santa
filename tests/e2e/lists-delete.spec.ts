import { expect, test } from '@playwright/test';
import { apiLogin, heading, hydrated } from './helpers';

// « Supprimer la liste » (asked by Julien on 19 November 2026): a red
// line at the bottom of the document, for those who manage the list,
// leads to a page that says what is lost; then the list is gone for
// everyone, its link with it, and its people stay among « Mes proches ».
const CAMILLE = 'delete-camille@example.com';
const MAMIE = 'delete-mamie@example.com';
const HUGO = 'delete-hugo@example.com';

test('a list is deleted on purpose, after reading what is lost', async ({
  page,
  browser,
}) => {
  await apiLogin(page.request, CAMILLE);
  await page.request.put('/api/auth/profile', {
    data: { firstName: 'Camille', avatarEmoji: '🦌', avatarColor: 'plum' },
  });
  const api = page.request;
  const { id } = await (
    await api.post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, title: 'Noël à effacer' },
    })
  ).json();
  const leo = await (
    await api.post(`/api/lists/${id}/people`, {
      data: {
        newMember: { firstName: 'Léo', avatar: { emoji: '🚀', color: 'pine' } },
      },
    })
  ).json();
  const idea = async (text: string) =>
    (
      await (
        await api.post(`/api/lists/${id}/ideas`, {
          data: { listPersonId: leo.id, text },
        })
      ).json()
    ).id;
  const circuit = await idea('Circuit de billes');
  await idea('Un télescope');
  const { token } = await (
    await api.post(`/api/lists/${id}/share`, { data: {} })
  ).json();
  // Mamie gives one; Hugo holds the list, and « aide à écrire ».
  const mamie = await browser.newContext();
  await apiLogin(mamie.request, MAMIE);
  await mamie.request.post(`/api/l/${token}/claims`, {
    data: { ideaId: circuit },
  });
  const { devLink } = await (
    await api.post(`/api/lists/${id}/holders`, { data: { email: HUGO } })
  ).json();
  const hugo = await browser.newContext();
  await hugo.request.post(
    `/api/invitations/${devLink.split('/').at(-1)}/accept`,
    { data: { firstName: 'Hugo' } },
  );

  // « Aide à écrire » neither sees the red line nor deletes.
  const his = await hugo.newPage();
  await his.goto(`/listes/${id}`);
  await hydrated(his);
  await expect(his.getByTestId('add-someone')).toBeVisible();
  await expect(his.getByTestId('list-remove')).toHaveCount(0);
  expect((await hugo.request.delete(`/api/lists/${id}?sure=1`)).status()).toBe(
    403,
  );
  // A shared list never goes by the way an empty document does.
  expect((await api.delete(`/api/lists/${id}`)).status()).toBe(409);

  // The red line, then the page that says what is lost.
  await page.goto(`/listes/${id}`);
  await hydrated(page);
  await page.getByTestId('list-remove').click();
  await expect(heading(page)).toHaveText('Supprimer « Noël à effacer » ?');
  const lost = page.getByTestId('list-removal');
  await expect(lost).toContainText('Ses 2 idées de cadeaux sont effacées.');
  await expect(lost).toContainText(
    '1 cadeau déjà prévu est perdu : celui qui l’avait coché n’est pas prévenu.',
  );
  await expect(lost).toContainText('Son lien ne marche plus.');
  await expect(lost).toContainText('Elle disparaît aussi pour Hugo.');
  await expect(lost).toContainText(
    'Les personnes restent dans « Mes proches », avec leur fiche.',
  );
  // « Annuler » leaves everything as it was.
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(page.getByTestId('list-remove')).toBeVisible();
  expect((await api.get(`/api/lists/${id}`)).status()).toBe(200);

  await page.getByTestId('list-remove').click();
  await page.getByTestId('list-delete').click();
  await expect(page).toHaveURL(/\/listes$/);
  await expect(
    page.getByText('Liste supprimée', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByTestId('list-card').filter({ hasText: 'Noël à effacer' }),
  ).toHaveCount(0);
  // Gone for everyone, its link with it: the link answers as for a list
  // not shared with you, saying nothing (ticket 106).
  expect((await api.get(`/api/lists/${id}`)).status()).toBe(404);
  expect((await hugo.request.get(`/api/lists/${id}`)).status()).toBe(404);
  expect((await mamie.request.get(`/api/l/${token}`)).status()).toBe(403);
  // Léo stays among Camille's people.
  const family = await (await api.get('/api/family')).text();
  expect(family).toContain('Léo');
  await mamie.close();
  await hugo.close();
});
