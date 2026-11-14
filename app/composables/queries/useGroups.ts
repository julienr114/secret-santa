import type { PublicGroup } from '#server/database/groups';
import { keys } from './keys';
import { api, useApiMutation } from './useApi';

type CreateGroupBody = {
  slug: string;
  name: string;
  organizers?: string[];
};
export const useCreateGroupMutation = () =>
  useApiMutation<{ group: PublicGroup }, CreateGroupBody>(
    (body) => api('/api/admin/groups', { method: 'POST', body }),
    () => [keys.home()],
  );

/** Super-admin only: the group and everything it owns, for good. */
export const useDeleteGroupMutation = () =>
  useApiMutation<{ ok: true }, { id: string; confirm: string }>(
    ({ id, confirm }) =>
      api(`/api/admin/groups/${id}/delete`, {
        method: 'POST',
        body: { confirm },
      }),
    () => [keys.home()],
  );
