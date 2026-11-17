import type { GroupOverview } from '#server/utils/overview';
import type { PublicGroup } from '#server/database/groups';
import type { Avatar } from '#server/utils/avatars';
import type { AdminAccount } from '#server/database/quota';
import { keys } from './keys';
import { api, useApiMutation, useApiQuery } from './useApi';

// The super-admin's pages: accounts, requests for a group, every group
// (README 22.2).

/** A request for a group awaiting a decision. */
export type PendingRequest = {
  id: string;
  accountId: string;
  email: string;
  message: string;
  createdAt: string;
};
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

/** The pending requests and every account. */
export const useAdminAccountsQuery = () =>
  useApiQuery<{
    requests: PendingRequest[];
    accounts: AdminAccountRow[];
    stats: AppStats;
  }>(
    () => keys.adminAccounts(),
    () => '/api/admin/accounts',
  );

/** Changes the profile or the quota of an account, or its access. */
export const useUpdateAccountMutation = () =>
  useApiMutation<
    { ok: true },
    {
      id: string;
      groupQuota?: number;
      disabled?: boolean;
      firstName?: string;
      lastName?: string | null;
      avatarEmoji?: Avatar['emoji'];
      avatarColor?: Avatar['color'];
    }
  >(
    ({ id, ...body }) =>
      api(`/api/admin/accounts/${id}`, { method: 'PATCH', body }),
    // Raising a quota may answer a request: the bottom bar counts them.
    () => [keys.adminAccounts(), keys.home()],
  );

/** Approves or refuses a request for a group. */
export const useDecideRequestMutation = () =>
  useApiMutation<{ ok: true }, { id: string; approve: boolean; note?: string }>(
    ({ id, approve, note }) =>
      api(`/api/admin/group-requests/${id}/decide`, {
        method: 'POST',
        body: { approve, ...(note ? { note } : {}) },
      }),
    () => [keys.adminAccounts(), keys.home()],
  );

/** Every group of the app. */
export const useAllGroupsQuery = () =>
  useApiQuery<{ groups: AdminGroupRow[] }>(
    () => keys.adminGroups(),
    () => '/api/admin/groups',
  );
