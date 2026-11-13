import type { PublicGroup } from '#server/database/groups';
import { keys } from './keys';
import { api, useApiMutation, useApiQuery } from './useApi';

type GroupsResponse = { groups: PublicGroup[] };
type CreateGroupBody = {
  slug: string;
  name: string;
  guardianPassword?: string;
};
type UpdateGroupBody = {
  id: string;
  name?: string;
  guardianPassword?: string;
  emailSending?: boolean;
};

export const useGroupsQuery = () =>
  useApiQuery<GroupsResponse>(
    () => keys.groups(),
    () => '/api/admin/groups',
  );

export const useCreateGroupMutation = () =>
  useApiMutation<{ group: PublicGroup }, CreateGroupBody>(
    (body) => api('/api/admin/groups', { method: 'POST', body }),
    () => [keys.groups()],
  );

/** Super-admin only: the group and everything it owns, for good. */
export const useDeleteGroupMutation = () =>
  useApiMutation<{ ok: true }, { id: string; confirm: string }>(
    ({ id, confirm }) =>
      api(`/api/admin/groups/${id}/delete`, {
        method: 'POST',
        body: { confirm },
      }),
    () => [keys.groups()],
  );

export const useUpdateGroupMutation = () =>
  useApiMutation<{ group: PublicGroup }, UpdateGroupBody>(
    ({ id, ...body }) =>
      api(`/api/admin/groups/${id}`, { method: 'PATCH', body }),
    // The group's own screens show its name and options too.
    () => [keys.groups(), ['group']],
  );
