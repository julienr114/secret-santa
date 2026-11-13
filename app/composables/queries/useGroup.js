import { useQuery } from '@tanstack/vue-query';
import { toValue } from 'vue';
import { keys } from './keys.js';
import { api, useApiMutation } from './useApi.js';

// Reads and writes scoped to one group. `slug` may be a ref.
const base = (slug) => `/api/admin/${toValue(slug)}`;

export const useDashboardQuery = (slug) =>
  useQuery({
    queryKey: keys.dashboard(toValue(slug)),
    queryFn: () => api(base(slug)),
  });

export const usePeopleQuery = (slug) =>
  useQuery({
    queryKey: keys.people(toValue(slug)),
    queryFn: () => api(`${base(slug)}/persons`),
  });

export const useRulesQuery = (slug) =>
  useQuery({
    queryKey: keys.rules(toValue(slug)),
    queryFn: () => api(`${base(slug)}/rules`),
  });

export const useEditionQuery = (slug, id) =>
  useQuery({
    queryKey: keys.edition(toValue(slug), toValue(id)),
    queryFn: () => api(`${base(slug)}/editions/${toValue(id)}`),
  });

const groupKeys = (slug) => [keys.group(toValue(slug))];

export const useCreatePersonMutation = (slug) =>
  useApiMutation(
    (body) => api(`${base(slug)}/persons`, { method: 'POST', body }),
    () => groupKeys(slug),
  );

export const useUpdatePersonMutation = (slug) =>
  useApiMutation(
    ({ id, ...body }) =>
      api(`${base(slug)}/persons/${id}`, { method: 'PATCH', body }),
    () => groupKeys(slug),
  );

export const useDeletePersonMutation = (slug) =>
  useApiMutation(
    (id) => api(`${base(slug)}/persons/${id}`, { method: 'DELETE' }),
    () => groupKeys(slug),
  );

export const useCreateCoupleMutation = (slug) =>
  useApiMutation(
    (body) => api(`${base(slug)}/couples`, { method: 'POST', body }),
    () => groupKeys(slug),
  );

export const useEndCoupleMutation = (slug) =>
  useApiMutation(
    (id) => api(`${base(slug)}/couples/${id}`, { method: 'DELETE' }),
    () => groupKeys(slug),
  );

export const useCreateExclusionMutation = (slug) =>
  useApiMutation(
    (body) => api(`${base(slug)}/exclusions`, { method: 'POST', body }),
    () => groupKeys(slug),
  );

export const useDeleteExclusionMutation = (slug) =>
  useApiMutation(
    (id) => api(`${base(slug)}/exclusions/${id}`, { method: 'DELETE' }),
    () => groupKeys(slug),
  );

export const useUpdateRulesMutation = (slug) =>
  useApiMutation(
    (body) => api(`${base(slug)}/rules`, { method: 'PATCH', body }),
    () => groupKeys(slug),
  );

export const useCreateEditionMutation = (slug) =>
  useApiMutation(
    (body) => api(`${base(slug)}/editions`, { method: 'POST', body }),
    () => groupKeys(slug),
  );

export const useUpdateEditionMutation = (slug) =>
  useApiMutation(
    ({ id, ...body }) =>
      api(`${base(slug)}/editions/${id}`, { method: 'PATCH', body }),
    () => groupKeys(slug),
  );
