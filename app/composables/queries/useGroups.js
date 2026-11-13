import { useQuery } from '@tanstack/vue-query';
import { keys } from './keys.js';
import { api, useApiMutation } from './useApi.js';

export const useGroupsQuery = () =>
  useQuery({
    queryKey: keys.groups(),
    queryFn: () => api('/api/admin/groups'),
  });

export const useCreateGroupMutation = () =>
  useApiMutation(
    (body) => api('/api/admin/groups', { method: 'POST', body }),
    () => [keys.groups()],
  );

export const useUpdateGroupMutation = () =>
  useApiMutation(
    ({ id, ...body }) =>
      api(`/api/admin/groups/${id}`, { method: 'PATCH', body }),
    () => [keys.groups()],
  );
