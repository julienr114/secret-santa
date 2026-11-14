import { toValue, type MaybeRefOrGetter } from 'vue';
import type { PublicGroup } from '#server/database/groups';
import type { Participant, PublicEdition } from '#server/database/editions';
import type { ExclusionRow } from '#server/database/schema';
import type { JournalEntry } from '#server/utils/audit';
import type { PublicPerson } from '#server/utils/people';
import type { Rules, RulesPatch } from '#server/utils/rules';
import type { Locale } from '#shared/i18n';
import { keys } from './keys';
import { api, useApiMutation, useApiQuery } from './useApi';

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
  useApiQuery<Dashboard>(
    () => keys.dashboard(toValue(slug)),
    () => base(slug),
  );

export type GroupJournal = {
  entries: JournalEntry[];
  editions: { id: string; label: string }[];
  currentEditionId: string | null;
  language: Locale;
};

/** The public journal, in the language the admin is used in. */
export const useGroupJournalQuery = (
  slug: Slug,
  locale: MaybeRefOrGetter<Locale>,
) =>
  useApiQuery<GroupJournal>(
    () => [...keys.group(toValue(slug)), 'journal', toValue(locale)],
    () => `${base(slug)}/journal?locale=${toValue(locale)}`,
  );

/** An organiser of the group; `me` marks the logged-in account. */
export type OrganizerRow = { accountId: string; email: string; me: boolean };

/** The organisers of a group. */
export const useOrganizersQuery = (slug: Slug) =>
  useApiQuery<{ organizers: OrganizerRow[] }>(
    () => [...keys.group(toValue(slug)), 'organizers'],
    () => `${base(slug)}/organizers`,
  );

/** Makes the owner of an address an organiser of the group. */
export const useAddOrganizerMutation = (slug: Slug) =>
  useApiMutation<unknown, string>(
    (email) =>
      api(`${base(slug)}/organizers`, { method: 'POST', body: { email } }),
    () => groupKeys(slug),
  );

/** Takes an organiser off the group, by account. */
export const useRemoveOrganizerMutation = (slug: Slug) =>
  useApiMutation<{ ok: true }, string>(
    (accountId) =>
      api(`${base(slug)}/organizers/${accountId}`, { method: 'DELETE' }),
    () => groupKeys(slug),
  );

export const usePeopleQuery = (slug: Slug) =>
  useApiQuery<PeoplePayload>(
    () => keys.people(toValue(slug)),
    () => `${base(slug)}/persons`,
  );

export const useRulesQuery = (slug: Slug) =>
  useApiQuery<{ rules: Rules }>(
    () => keys.rules(toValue(slug)),
    () => `${base(slug)}/rules`,
  );

export const useEditionQuery = (slug: Slug, id: Slug) =>
  useApiQuery<EditionPayload>(
    () => keys.edition(toValue(slug), toValue(id)),
    () => `${base(slug)}/editions/${toValue(id)}`,
  );

export type PersonBody = {
  firstName: string;
  lastName: string | null;
  email?: string | null;
  language?: Locale;
  avatarEmoji?: string;
  avatarColor?: string;
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

/** Opens, renews or closes the invitation link of a group. */
export const useInviteLinkMutation = (slug: Slug) =>
  useApiMutation<
    { inviteCode: string | null },
    {
      open: boolean;
      renew?: boolean;
      until?: string | null;
      places?: number;
      message?: string | null;
    }
  >(
    (body) => api(`${base(slug)}/invite`, { method: 'POST', body }),
    () => groupKeys(slug),
  );
