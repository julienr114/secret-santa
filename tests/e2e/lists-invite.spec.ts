import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { apiLogin, heading, hydrated } from './helpers';

// Holding a list at two levels, and the page of an invitation (README
// 22.20, lot 25 bis): one of my people invited by a pill accepts with
// his account and « aide à écrire », refused on everything that manages
// the list; an address without an account creates it by the link, which
// acts once; a refusal shows, and is erased. (An invitation expired is
// covered by the unit tests: time does not pass here.)
test.describe.configure({ mode: 'serial' });

const CAMILLE = 'invite-camille@example.com';
const HUGO = 'invite-hugo@example.com';
const TONTON = 'invite-tonton@example.com';
const MAMIE = 'invite-mamie@example.com';
const state: {
  camille?: BrowserContext;
  listId: string;
  leo: string;
  hugoLink: string;
} = { listId: '', leo: '', hugoLink: '' };

const asCamille = async (): Promise<Page> => {
  if (!state.camille) throw new Error('Camille is not logged in');
  const page = await state.camille.newPage();
  await page.goto(`/listes/${state.listId}/teneurs`);
  await hydrated(page);
  await expect(heading(page)).toHaveText('Ceux qui tiennent la liste');
  return page;
};
/** Sends the invitation from the page, and reads its link back. */
const sendAndGetLink = async (page: Page, button: string): Promise<string> => {
  const sent = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith(`/api/lists/${state.listId}/holders`),
  );
  await page.getByRole('button', { name: button }).click();
  const { devLink } = await (await sent).json();
  return devLink;
};

test.beforeAll(async ({ browser }) => {
  state.camille = await browser.newContext();
  await apiLogin(state.camille.request, CAMILLE);
  await state.camille.request.put('/api/auth/profile', {
    data: { firstName: 'Camille', avatarEmoji: '🦌', avatarColor: 'plum' },
  });
  // Hugo has an account; he is never logged in here but by the invitation.
  const hugo = await browser.newContext();
  await apiLogin(hugo.request, HUGO);
  await hugo.request.put('/api/auth/profile', {
    data: { firstName: 'Hugo', avatarEmoji: '🐧', avatarColor: 'frost' },
  });
  await hugo.close();
  const api = state.camille.request;
  const { id } = await (
    await api.post('/api/lists', {
      data: { icon: { emoji: '🎄', color: 'pine' }, title: 'Noël à inviter' },
    })
  ).json();
  const leo = await (
    await api.post(`/api/lists/${id}/people`, {
      data: {
        newMember: {
          firstName: 'Léo',
          avatar: { emoji: '🚀', color: 'pine' },
        },
      },
    })
  ).json();
  // One of Camille's people, linked to his account, and not on the list.
  const member = await (
    await api.post('/api/family', {
      data: { firstName: 'Hugo', avatar: { emoji: '🐧', color: 'frost' } },
    })
  ).json();
  await api.patch(`/api/family/${member.id}`, { data: { email: HUGO } });
  Object.assign(state, { listId: id, leo: leo.id });
});

test.afterAll(async () => {
  await state.camille?.close();
});

test('invited by his pill, Hugo accepts with his account and helps write', async ({
  browser,
}) => {
  const camille = await asCamille();
  await expect(camille.getByTestId('holder-level')).toHaveText('Gère la liste');
  // My people linked to an account, then « Quelqu'un d'autre »; nothing
  // else until one is chosen.
  await expect(camille.getByTestId('invite-pill')).toHaveText(['Hugo']);
  await expect(camille.getByTestId('invite-send')).toHaveCount(0);
  await camille.getByTestId('invite-pill').click();
  await expect(camille.getByLabel('Son adresse email')).toHaveCount(0);
  await expect(camille.getByRole('radio').first()).toBeChecked();
  state.hugoLink = await sendAndGetLink(camille, 'Inviter Hugo');
  const line = camille.getByTestId('holder-invite');
  await expect(line).toContainText('Hugo');
  await expect(line).toContainText('valable jusqu’au');
  await expect(line).toContainText('Aide à écrire');
  // Invited, he is no longer proposed.
  await expect(camille.getByTestId('invite-pill')).toHaveCount(0);

  // The page speaks to him, by the first name of his account.
  const context = await browser.newContext();
  const hugo = await context.newPage();
  await hugo.goto(state.hugoLink);
  await hydrated(hugo);
  await expect(hugo.getByTestId('invitation-title')).toHaveText(
    'Hugo, Camille t’invite',
  );
  await expect(hugo.getByTestId('invitation-managing')).toContainText(
    'ça reste à Camille',
  );
  await expect(hugo.getByTestId('invitation-name')).toHaveCount(0);
  await expect(hugo.getByTestId('invitation-about')).toHaveCount(0);
  await expect(hugo.getByTestId('invitation-not-you')).toContainText(
    'Tu n’es pas Hugo ?',
  );
  // Neither « Signaler » nor « Ne plus recevoir d'emails » yet.
  await expect(hugo.getByText('Signaler')).toHaveCount(0);
  await expect(hugo.getByText('Ne plus recevoir')).toHaveCount(0);
  // Opening the page used nothing up: the button does.
  await hugo.getByRole('button', { name: 'Accepter l’invitation' }).click();
  await hugo.waitForURL(`**/listes/${state.listId}`);
  await hydrated(hugo);
  await expect(hugo.getByTestId('holders-line')).toContainText(
    'Tu tiens cette liste avec Camille.',
  );
  // He reads the sharing, and does not touch it (Correction 28,
  // maquette ListeAideSansPartage): no switch, and the link is not his
  // to have while the list is not shared.
  await expect(hugo.getByTestId('share-readonly')).toContainText(
    'Pas encore activé par Camille',
  );
  await expect(hugo.getByTestId('share-switch')).toHaveCount(0);
  await expect(hugo.getByTestId('share-helper')).toHaveCount(0);
  const asHugo = () =>
    context.request
      .get(`/api/lists/${state.listId}`)
      .then((answer) => answer.json());
  expect((await asHugo()).list.shareToken).toBeNull();
  expect(
    (
      await context.request.post(`/api/lists/${state.listId}/share`, {
        data: {},
      })
    ).status(),
  ).toBe(403);
  // Camille shares: he may send the link, nothing more (ListeAidePartage).
  const shared = await (
    await camille.request.post(`/api/lists/${state.listId}/share`, { data: {} })
  ).json();
  await hugo.reload();
  await hydrated(hugo);
  await expect(hugo.getByTestId('share-readonly')).toContainText(
    'Activé par Camille',
  );
  await expect(hugo.getByTestId('share-helper')).toHaveText('Partager');
  await expect(hugo.getByTestId('share-switch')).toHaveCount(0);
  await expect(hugo.getByTestId('share-panel')).toHaveCount(0);
  expect((await asHugo()).list.shareToken).toBe(shared.token);
  // Stopped: the link is no longer sent to him, though it is kept.
  await camille.request.post(`/api/lists/${state.listId}/share`, {
    data: { ask: 'off' },
  });
  expect((await asHugo()).list.shareToken).toBeNull();
  await hugo.reload();
  await hydrated(hugo);
  // He writes everywhere.
  const leo = hugo.getByTestId('list-person').filter({ hasText: 'Léo' });
  await leo.getByPlaceholder('Une idée pour Léo…').click();
  await hugo.keyboard.type('Un cerf-volant');
  await hugo.keyboard.press('Enter');
  await expect(leo.getByTestId('idea-text')).toHaveText('Un cerf-volant');

  // Refused on sharing, inviting, levels, taking off, and deleting.
  const api = hugo.request;
  const base = `/api/lists/${state.listId}`;
  const seen = await (await api.get(`${base}/holders`)).json();
  expect(seen.manages).toBe(false);
  expect(seen.suggestions).toEqual([]);
  const camilleId = seen.holders.find(
    (holder: { me: boolean }) => !holder.me,
  ).accountId;
  const hugoId = seen.holders.find((h: { me: boolean }) => h.me).accountId;
  const refused = await Promise.all([
    api.post(`${base}/share`, { data: {} }),
    api.post(`${base}/holders`, { data: { email: MAMIE } }),
    api.patch(`${base}/holders/${hugoId}`, { data: { level: 'manage' } }),
    api.patch(`${base}/holders/${camilleId}`, { data: { level: 'write' } }),
    api.delete(`${base}/holders/${camilleId}`),
    api.delete(`${base}/invites/unknown`),
    api.post(`${base}/invites/unknown/resend`),
    api.delete(base),
  ]);
  expect(refused.map((response) => response.status())).toEqual(
    Array.from({ length: 8 }, () => 403),
  );
  // In his page, the levels are read, not touched; he may only leave.
  await hugo.goto(`/listes/${state.listId}/teneurs`);
  await hydrated(hugo);
  await expect(hugo.getByTestId('invite-form')).toHaveCount(0);
  await expect(
    hugo
      .getByTestId('holder')
      .filter({ hasText: 'Camille' })
      .getByRole('button'),
  ).toHaveCount(0);

  // The link acted once: it opens nothing any more, for anyone.
  const other = await browser.newContext();
  const stranger = await other.newPage();
  await stranger.goto(state.hugoLink);
  await hydrated(stranger);
  await expect(stranger.getByTestId('invitation-accepted')).toContainText(
    'Tu as déjà accepté cette invitation.',
  );
  const token = state.hugoLink.split('/').at(-1);
  expect(
    (await other.request.post(`/api/invitations/${token}/accept`)).status(),
  ).toBe(410);
  expect(
    (await other.request.post(`/api/invitations/${token}/decline`)).status(),
  ).toBe(410);
  expect((await other.request.get(`/api/lists/${state.listId}`)).status()).toBe(
    401,
  );
  await other.close();

  // Camille changes his level by touching it; the last who manages stays.
  await camille.reload();
  await hydrated(camille);
  const his = camille.getByTestId('holder').filter({ hasText: 'Hugo' });
  await expect(his.getByTestId('holder-level')).toContainText('Aide à écrire');
  await his.getByTestId('holder-level').click();
  await camille.getByRole('menuitem', { name: /Gère la liste/ }).click();
  await expect(his.getByTestId('holder-level')).toContainText('Gère la liste');
  await his.getByTestId('holder-level').click();
  await camille.getByRole('menuitem', { name: /Aide à écrire/ }).click();
  await expect(his.getByTestId('holder-level')).toContainText('Aide à écrire');
  const last = await camille.request.patch(`${base}/holders/${camilleId}`, {
    data: { level: 'write' },
  });
  expect(last.status()).toBe(409);
  expect(
    (await camille.request.delete(`${base}/holders/${camilleId}`)).status(),
  ).toBe(409);
  // « Aide à écrire » leaves by himself.
  expect((await api.delete(`${base}/holders/${hugoId}`)).status()).toBe(200);
  await context.close();
  await camille.close();
});

test('an address without an account creates it by the link, once', async ({
  browser,
}) => {
  const camille = await asCamille();
  await camille.getByTestId('invite-other').click();
  await camille.getByLabel('Son adresse email').fill(TONTON);
  await camille.getByText('Gérer la liste', { exact: true }).click();
  const link = await sendAndGetLink(camille, 'Envoyer l’invitation');
  await expect(camille.getByTestId('holder-invite')).toContainText(TONTON);

  const context = await browser.newContext();
  const tonton = await context.newPage();
  await tonton.goto(link);
  await hydrated(tonton);
  await expect(tonton.getByTestId('invitation-title')).toHaveText(
    'Camille t’invite',
  );
  await expect(tonton.getByTestId('invitation-managing')).toContainText(
    'comme Camille',
  );
  await expect(tonton.getByTestId('invitation-address')).toContainText(TONTON);
  await expect(tonton.getByTestId('invitation-about')).toContainText(
    'gratuite et sans publicité',
  );
  // A first name, empty, and nothing else to fill in.
  const accept = tonton.getByRole('button', {
    name: 'Accepter, et créer mon compte',
  });
  await expect(tonton.getByTestId('invitation-name')).toHaveValue('');
  await expect(accept).toBeDisabled();
  await tonton.getByTestId('invitation-name').fill('Tonton');
  await accept.click();
  // Logged in without a second email, on the list, which he manages.
  await tonton.waitForURL(`**/listes/${state.listId}`);
  await hydrated(tonton);
  await expect(tonton.getByTestId('share-switch')).toBeEnabled();
  await expect(tonton.getByTestId('share-readonly')).toHaveCount(0);
  const mine = await (
    await context.request.get(`/api/lists/${state.listId}/holders`)
  ).json();
  expect(mine.manages).toBe(true);
  expect(
    mine.holders.map((holder: { name: string }) => holder.name).toSorted(),
  ).toEqual(['Camille', 'Tonton']);
  // The link is used up.
  await tonton.goto(link);
  await hydrated(tonton);
  await expect(tonton.getByTestId('invitation-accepted')).toBeVisible();
  await context.close();
  await camille.close();
});

test('a refusal shows, without a reason, and is erased', async ({
  browser,
}) => {
  const api = state.camille?.request;
  if (!api) throw new Error('Camille is not logged in');
  const { devLink } = await (
    await api.post(`/api/lists/${state.listId}/holders`, {
      data: { email: MAMIE },
    })
  ).json();
  const context = await browser.newContext();
  const mamie = await context.newPage();
  await mamie.goto(devLink);
  await hydrated(mamie);
  await mamie.getByRole('button', { name: 'Non merci' }).click();
  await expect(mamie.getByTestId('invitation-declined')).toContainText(
    'Tu as refusé cette invitation.',
  );
  // Refused, the link opens nothing: no account was made, no list held.
  const token = devLink.split('/').at(-1);
  expect(
    (
      await context.request.post(`/api/invitations/${token}/accept`, {
        data: { firstName: 'Mamie' },
      })
    ).status(),
  ).toBe(410);
  await context.close();

  const camille = await asCamille();
  const line = camille.getByTestId('holder-invite');
  await expect(line).toHaveAttribute('data-state', 'declined');
  await expect(line).toContainText('A refusé · le');
  // The same person can be invited again, which replaces the refusal…
  const again = await api.post(`/api/lists/${state.listId}/holders`, {
    data: { email: MAMIE },
  });
  expect(again.status()).toBe(201);
  await camille.reload();
  await hydrated(camille);
  await expect(line).toHaveAttribute('data-state', 'waiting');
  // … and an invitation waiting is cancelled from its level.
  await line.getByTestId('invite-level').click();
  await camille.getByRole('menuitem', { name: 'Annuler l’invitation' }).click();
  await expect(line).toHaveCount(0);
  // Cancelled, its link is unknown.
  const { devLink: gone } = await again.json();
  const stranger = await browser.newContext();
  const page = await stranger.newPage();
  await page.goto(gone);
  await hydrated(page);
  await expect(page.getByTestId('invitation-unknown')).toBeVisible();
  await stranger.close();
  await camille.close();
});
