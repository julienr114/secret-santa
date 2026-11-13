import { useQuery } from '@tanstack/vue-query';
import type { PublicGroup } from '#server/database/groups';
import { keys } from './keys';
import { api, useApiMutation } from './useApi';

type GroupsResponse = { groups: PublicGroup[] };
type CreateGroupBody = {
  slug: string;
  name: string;
  guardianPassword?: string;
};
type UpdateGroupBody = { id: string; name?: string; guardianPassword?: string };

export const useGroupsQuery = () =>
  useQuery({
    queryKey: keys.groups(),
    queryFn: () => api<GroupsResponse>('/api/admin/groups'),
  });

export const useCreateGroupMutation = () =>
  useApiMutation<{ group: PublicGroup }, CreateGroupBody>(
    (body) => api('/api/admin/groups', { method: 'POST', body }),
    () => [keys.groups()],
  );

export const useUpdateGroupMutation = () =>
  useApiMutation<{ group: PublicGroup }, UpdateGroupBody>(
    ({ id, ...body }) =>
      api(`/api/admin/groups/${id}`, { method: 'PATCH', body }),
    () => [keys.groups()],
  );
