import type { GroupOverview } from '#server/utils/overview';
import type { PublicGroup } from '#server/database/groups';
import type { Avatar } from '#server/utils/avatars';
import type { AdminAccount } from '#server/database/quota';
import { keys } from './keys';
import { api, useApiMutation, useApiQuery } from './useApi';

// The super-admin's pages: accounts and every group (README 22.2).

/** How loaded the app is, to weigh a new party. */
export type AppStats = {
  groups: number;
  /** The Secret Santa in progress. */
  active: number;
  /** The parties at 30 active members. */
  fullParties: number;
  load: 'ok' | 'near' | 'over';
};
/** The emergency switches, on or off. */
export type AppSwitches = { newSecretSantas: boolean };
/** An account as the admin sees it; `me` marks the logged-in one. */
/** A group of an account, with its members and its draw in progress. */
export type AdminAccountGroup = AdminAccount['groups'][number] & GroupOverview;
export type AdminAccountRow = Omit<AdminAccount, 'groups'> & {
  groups: AdminAccountGroup[];
  me: boolean;
};
/** A group of the app, with its members and its draw in progress. */
export type AdminGroupRow = PublicGroup & GroupOverview;

/** Every account, how loaded the app is, and the emergency switches. */
export const useAdminAccountsQuery = () =>
  useApiQuery<{
    accounts: AdminAccountRow[];
    stats: AppStats;
    switches: AppSwitches;
  }>(
    () => keys.adminAccounts(),
    () => '/api/admin/accounts',
  );

/** Changes the profile or the limit of an account, or its access. */
export const useUpdateAccountMutation = () =>
  useApiMutation<
    { ok: true },
    {
      id: string;
      secretSantaLimit?: number;
      disabled?: boolean;
      firstName?: string;
      lastName?: string | null;
      avatarEmoji?: Avatar['emoji'];
      avatarColor?: Avatar['color'];
    }
  >(
    ({ id, ...body }) =>
      api(`/api/admin/accounts/${id}`, { method: 'PATCH', body }),
    () => [keys.adminAccounts()],
  );

/** Turns an emergency switch on or off. */
export const useSwitchMutation = () =>
  useApiMutation<{ ok: true }, AppSwitches>(
    (body) => api('/api/admin/switches', { method: 'PATCH', body }),
    () => [keys.adminAccounts(), keys.newSecretSanta()],
  );

/** Every group of the app. */
export const useAllGroupsQuery = () =>
  useApiQuery<{ groups: AdminGroupRow[] }>(
    () => keys.adminGroups(),
    () => '/api/admin/groups',
  );
