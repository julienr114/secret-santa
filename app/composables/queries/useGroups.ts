import type { PublicGroup } from '#server/database/groups';
import { keys } from './keys';
import { api, useApiMutation } from './useApi';

type CreateGroupBody = {
  name: string;
  organizers?: string[];
};
/**
 * Creates a group. The creator may just have become an organiser: the
 * session is read again so that the screens follow.
 */
export const useCreateGroupMutation = () => {
  const { fetch } = useUserSession();
  return useApiMutation<{ group: PublicGroup }, CreateGroupBody>(
    async (body) => {
      const result = await api<{ group: PublicGroup }>('/api/admin/groups', {
        method: 'POST',
        body,
      });
      await fetch();
      return result;
    },
    () => [keys.home(), keys.adminGroups(), keys.adminAccounts()],
  );
};

/** Super-admin only: the group and everything it owns, for good. */
export const useDeleteGroupMutation = () =>
  useApiMutation<{ ok: true }, { id: string; confirm: string }>(
    ({ id, confirm }) =>
      api(`/api/admin/groups/${id}/delete`, {
        method: 'POST',
        body: { confirm },
      }),
    () => [keys.home(), keys.adminGroups(), keys.adminAccounts()],
  );
