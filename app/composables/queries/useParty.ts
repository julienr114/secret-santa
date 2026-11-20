import type { PartyPage, TakenPerson } from '#server/database/parties';
import type { PartyCategory } from '#shared/utils/categories';
import { keys } from './keys';
import { api, useApiMutation, useApiQuery } from './useApi';

// The party (V3, ticket 104): its page, its creation, its settings,
// leaving it.

/** The page of a party, for a member or an organiser. */
export const usePartyQuery = (slug: MaybeRefOrGetter<string>) =>
  useApiQuery<PartyPage>(
    () => keys.party(toValue(slug)),
    () => `/api/parties/${toValue(slug)}`,
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
  memberIds: string[];
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
