import type { PartyPage, TakenPerson } from '#server/database/parties';
import type { PastYearLine, PastYearPage } from '#server/database/pastYears';
import type { PartyCategory } from '#shared/utils/categories';
import { keys } from './keys';
import { api, useApiMutation, useApiQuery } from './useApi';

// The party (V3, ticket 104): its page, its creation, its settings,
// leaving it.

/** The page of a party, for a member or an organiser. */
export const usePartyQuery = (
  slug: MaybeRefOrGetter<string>,
  enabled: MaybeRefOrGetter<boolean> = true,
) =>
  useApiQuery<PartyPage>(
    () => keys.party(toValue(slug)),
    () => `/api/parties/${toValue(slug)}`,
    enabled,
  );

export type PartyCandidates = {
  parties: {
    id: string;
    name: string;
    category: PartyCategory;
    iconEmoji: string | null;
  }[];
  people: TakenPerson[];
};

/** The parties I organise and their people, to take some into a new one. */
export const usePartyCandidatesQuery = () =>
  useApiQuery<PartyCandidates>(
    () => keys.partyCandidates(),
    () => '/api/parties/candidates',
  );

export type PartyBody = {
  category: PartyCategory;
  name: string;
  date: string;
  recurring: boolean;
  /** A birthday: the one of my people it is for (ticket 118). */
  forMemberId?: string | null;
};

/**
 * Creates a party. Its creator organises it: the session is read again so
 * that the screens follow.
 */
export const useCreatePartyMutation = () => {
  const { fetch } = useUserSession();
  return useApiMutation<{ slug: string }, PartyBody>(
    async (body) => {
      const result = await api<{ slug: string }>('/api/parties', {
        method: 'POST',
        body,
      });
      await fetch();
      return result;
    },
    () => [keys.home(), keys.partyCandidates()],
  );
};

export type PartyPatch = Partial<{
  category: PartyCategory;
  date: string;
  recurring: boolean;
  /** « Pour » (ticket 118): one of my people, or null for « Personne ». */
  forMemberId: string | null;
}>;

/** The settings of the party itself. */
export const useUpdatePartyMutation = (slug: MaybeRefOrGetter<string>) =>
  useApiMutation<{ ok: true }, PartyPatch>(
    (body) => api(`/api/parties/${toValue(slug)}`, { method: 'PATCH', body }),
    () => [keys.group(toValue(slug)), keys.home()],
  );

/** « Quitter cette fête ». */
export const useLeavePartyMutation = (slug: MaybeRefOrGetter<string>) =>
  useApiMutation<{ ok: true }, undefined>(
    () => api(`/api/parties/${toValue(slug)}/leave`, { method: 'POST' }),
    () => [keys.home(), keys.lists()],
  );

/** « Les événements passés » (ticket 108): by year, a line per event. */
export const usePastEventsQuery = () =>
  useApiQuery<{ years: { year: number; lines: PastYearLine[] }[] }>(
    () => keys.pastEvents(),
    () => '/api/past',
  );

/** A year over of a party, read only (ticket 108). */
export const usePastYearQuery = (
  slug: MaybeRefOrGetter<string>,
  year: MaybeRefOrGetter<number>,
) =>
  useApiQuery<PastYearPage>(
    () => keys.pastYear(toValue(slug), toValue(year)),
    () => `/api/parties/${toValue(slug)}/years/${toValue(year)}`,
  );

/** « Préparer Noël 2027 » (ticket 108): the Secret Santa of last year again. */
export const usePrepareYearMutation = (slug: MaybeRefOrGetter<string>) =>
  useApiMutation<{ year: number; secretSantas: { id: string }[] }, undefined>(
    () => api(`/api/admin/${toValue(slug)}/prepare`, { method: 'POST' }),
    () => [keys.home(), keys.group(toValue(slug))],
  );
