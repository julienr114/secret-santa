import type { PublicGroup } from '#server/database/groups';
import type { EditionStatus } from '#server/utils/editions';
import type { Role, SessionUser } from '#server/utils/auth';
import type { Avatar } from '#server/utils/avatars';
import { keys } from './keys';
import { api, useApiMutation, useApiQuery } from './useApi';

// Accounts: login by a magic link, and the sessions of the account
// (README 22.5).

export type AccountSession = {
  id: string;
  current: boolean;
  device: string | null;
  createdAt: string;
  lastSeenAt: string;
};
export type AccountPayload = {
  email: string;
  isSuperAdmin: boolean;
  sessions: AccountSession[];
};

/**
 * Asks for a login link. The answer never says whether the address has
 * an account; `devLink` only exists in development mode.
 */
export const useRequestLinkMutation = () =>
  useApiMutation<{ ok: true; devLink?: string }, string>((email) =>
    api('/api/auth/link', { method: 'POST', body: { email } }),
  );

/** Consumes a login link and loads the new session. */
export const useConfirmLinkMutation = () => {
  const { fetch } = useUserSession();
  return useApiMutation<{ user: SessionUser }, string>(async (token) => {
    const result = await api<{ user: SessionUser }>('/api/auth/confirm', {
      method: 'POST',
      body: { token },
    });
    await fetch();
    return result;
  });
};

/** One draw the account takes part in, opened through its personal link. */
export type HomeDraw = {
  id: string;
  path: string;
  groupName: string;
  editionLabel: string;
  status: EditionStatus;
  firstName: string;
  avatar: Avatar;
};
export type HomePayload = {
  role: Role;
  draws: HomeDraw[];
  groups: PublicGroup[];
};

/** The home of the account: its draws and the groups it manages. */
export const useHomeQuery = () =>
  useApiQuery<HomePayload>(
    () => keys.home(),
    () => '/api/auth/home',
  );

/** "My account": the address and the devices it is logged in on. */
export const useAccountQuery = () =>
  useApiQuery<AccountPayload>(
    () => keys.account(),
    () => '/api/auth/sessions',
  );

/** Closes every session of the account, this one included. */
export const useRevokeAllMutation = () => {
  const { clear } = useUserSession();
  return useApiMutation<{ ok: true }, undefined>(async () => {
    const result = await api<{ ok: true }>('/api/auth/sessions/revoke-all', {
      method: 'POST',
    });
    await clear();
    return result;
  });
};
