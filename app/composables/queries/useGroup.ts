import { useQuery } from '@tanstack/vue-query';
import { toValue, type MaybeRefOrGetter } from 'vue';
import type { PublicGroup } from '#server/database/groups';
import type { Participant, PublicEdition } from '#server/database/editions';
import type { CoupleRow, ExclusionRow } from '#server/database/schema';
import type { PublicPerson } from '#server/utils/people';
import type { Rules, RulesPatch } from '#server/utils/rules';
import { keys } from './keys';
import { api, useApiMutation } from './useApi';

// Reads and writes scoped to one group. `slug` may be a ref or a getter.

export type Dashboard = {
  group: PublicGroup;
  rules: Rules;
  editions: PublicEdition[];
  currentEditionId: string | null;
  nextEdition: { label: string; year: number };
};
export type PeoplePayload = {
  persons: PublicPerson[];
  couples: CoupleRow[];
  exclusions: ExclusionRow[];
};
export type EditionPayload = {
  edition: PublicEdition;
  rules: Rules;
  participants: Participant[];
};

type Slug = MaybeRefOrGetter<string>;
const base = (slug: Slug) => `/api/admin/${toValue(slug)}`;
const groupKeys = (slug: Slug) => [keys.group(toValue(slug))];

export const useDashboardQuery = (slug: Slug) =>
  useQuery({
    queryKey: computed(() => keys.dashboard(toValue(slug))),
    queryFn: () => api<Dashboard>(base(slug)),
  });

export const usePeopleQuery = (slug: Slug) =>
  useQuery({
    queryKey: computed(() => keys.people(toValue(slug))),
    queryFn: () => api<PeoplePayload>(`${base(slug)}/persons`),
  });

export const useRulesQuery = (slug: Slug) =>
  useQuery({
    queryKey: computed(() => keys.rules(toValue(slug))),
    queryFn: () => api<{ rules: Rules }>(`${base(slug)}/rules`),
  });

export const useEditionQuery = (slug: Slug, id: Slug) =>
  useQuery({
    queryKey: computed(() => keys.edition(toValue(slug), toValue(id))),
    queryFn: () => api<EditionPayload>(`${base(slug)}/editions/${toValue(id)}`),
  });

export type PersonBody = {
  firstName: string;
  lastName: string | null;
  phone: string | null;
};
export type PersonPatch = Partial<PersonBody & { active: boolean }> & {
  id: string;
};

export const useCreatePersonMutation = (slug: Slug) =>
  useApiMutation<{ person: PublicPerson }, PersonBody>(
    (body) => api(`${base(slug)}/persons`, { method: 'POST', body }),
    () => groupKeys(slug),
  );

export const useUpdatePersonMutation = (slug: Slug) =>
  useApiMutation<{ person: PublicPerson }, PersonPatch>(
    ({ id, ...body }) =>
      api(`${base(slug)}/persons/${id}`, { method: 'PATCH', body }),
    () => groupKeys(slug),
  );

export const useDeletePersonMutation = (slug: Slug) =>
  useApiMutation<{ ok: true }, string>(
    (id) => api(`${base(slug)}/persons/${id}`, { method: 'DELETE' }),
    () => groupKeys(slug),
  );

export const useCreateCoupleMutation = (slug: Slug) =>
  useApiMutation<
    { couple: CoupleRow },
    { personAId: string; personBId: string }
  >(
    (body) => api(`${base(slug)}/couples`, { method: 'POST', body }),
    () => groupKeys(slug),
  );

export const useEndCoupleMutation = (slug: Slug) =>
  useApiMutation<{ ok: true }, string>(
    (id) => api(`${base(slug)}/couples/${id}`, { method: 'DELETE' }),
    () => groupKeys(slug),
  );

export type ExclusionBody = {
  giverId: string;
  receiverId: string;
  reciprocal: boolean;
};

export const useCreateExclusionMutation = (slug: Slug) =>
  useApiMutation<{ exclusion: ExclusionRow }, ExclusionBody>(
    (body) => api(`${base(slug)}/exclusions`, { method: 'POST', body }),
    () => groupKeys(slug),
  );

export const useDeleteExclusionMutation = (slug: Slug) =>
  useApiMutation<{ ok: true }, string>(
    (id) => api(`${base(slug)}/exclusions/${id}`, { method: 'DELETE' }),
    () => groupKeys(slug),
  );

export const useUpdateRulesMutation = (slug: Slug) =>
  useApiMutation<{ rules: Rules }, RulesPatch>(
    (body) => api(`${base(slug)}/rules`, { method: 'PATCH', body }),
    () => groupKeys(slug),
  );

export const useCreateEditionMutation = (slug: Slug) =>
  useApiMutation<{ edition: PublicEdition }, { label: string; year: number }>(
    (body) => api(`${base(slug)}/editions`, { method: 'POST', body }),
    () => groupKeys(slug),
  );

export const useUpdateEditionMutation = (slug: Slug) =>
  useApiMutation<
    { edition: PublicEdition },
    { id: string; label?: string; rulesOverride?: RulesPatch | null }
  >(
    ({ id, ...body }) =>
      api(`${base(slug)}/editions/${id}`, { method: 'PATCH', body }),
    () => groupKeys(slug),
  );
