import type { GroupOverview } from '#server/utils/overview';
import type { PublicGroup } from '#server/database/groups';
import type { Avatar } from '#server/utils/avatars';
import type { AdminAccount } from '#server/database/quota';
import { keys } from './keys';
import { api, useApiMutation, useApiQuery } from './useApi';

// The super-admin's pages: accounts and every group (README 22.2).

/** How loaded the app is, to weigh a new group. */
export type AppStats = {
  groups: number;
  /** Groups with a draw in progress. */
  active: number;
  load: 'ok' | 'near' | 'over';
};
/** An account as the admin sees it; `me` marks the logged-in one. */
/** A group of an account, with its members and its draw in progress. */
export type AdminAccountGroup = AdminAccount['groups'][number] & GroupOverview;
export type AdminAccountRow = Omit<AdminAccount, 'groups'> & {
  groups: AdminAccountGroup[];
  me: boolean;
};
/** A group of the app, with its members and its draw in progress. */
export type AdminGroupRow = PublicGroup & GroupOverview;

/** Every account, and how loaded the app is. */
export const useAdminAccountsQuery = () =>
  useApiQuery<{
    accounts: AdminAccountRow[];
    stats: AppStats;
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

/** Every group of the app. */
export const useAllGroupsQuery = () =>
  useApiQuery<{ groups: AdminGroupRow[] }>(
    () => keys.adminGroups(),
    () => '/api/admin/groups',
  );
