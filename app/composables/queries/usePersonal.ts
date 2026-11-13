import { useQuery, type QueryKey } from '@tanstack/vue-query';
import { toValue, type MaybeRefOrGetter } from 'vue';
import type { Avatar } from '#server/utils/avatars';
import type { JournalEntry } from '#server/utils/audit';
import type { EditionStatus } from '#server/utils/editions';
import type { PersonalPhase } from '#server/utils/personal';
import { keys } from './keys';
import { api, useApiMutation } from './useApi';

// Participant side (README 4.3): everything goes through the personal link.

type Token = MaybeRefOrGetter<string>;

export type PersonalState = {
  firstName: string;
  avatar: Avatar;
  avatarEditable: boolean;
  groupName: string;
  editionLabel: string;
  status: EditionStatus;
  phase: PersonalPhase;
  wishlist: boolean;
  wishesEditable: boolean;
  wishesCount: number;
};
export type WishItem = { label: string; url: string | null };
export type WishesPayload = {
  wishes: WishItem[];
  maxWishes: number;
  editable: boolean;
};
export type Reveal = {
  receiver: { name: string; avatar: Avatar };
  budget: string;
  eventDate: string;
  guardianMessage: string;
  /** null when the group does not use wish lists. */
  wishes: WishItem[] | null;
  viewCount: number;
};
export type JournalPayload = {
  entries: JournalEntry[];
  editions: { id: string; label: string }[];
  currentEditionId: string;
};

const base = (token: Token) => `/api/p/${toValue(token)}`;

/**
 * A read behind a personal link. No retry: a refused link will not get
 * better, and the page must say so at once. A failure during server
 * rendering is left to the page, which shows the "invalid link" screen.
 */
const usePersonalRead = <T>(
  queryKey: () => QueryKey,
  path: () => string,
  enabled: () => boolean = () => true,
  refetchInterval?: (data: T | undefined) => number | false,
) => {
  const fetcher = useRequestFetch();
  const query = useQuery({
    queryKey: computed(queryKey),
    queryFn: () => fetcher<T>(path()) as Promise<T>,
    enabled: computed(enabled),
    retry: false,
    refetchInterval: (q) =>
      refetchInterval?.(q.state.data as T | undefined) ?? false,
  });
  onServerPrefetch(async () => {
    if (enabled()) await query.suspense().catch(() => undefined);
  });
  return query;
};

// "Live" enough without sockets: while the page is open and visible, the
// state is asked again every few seconds, so the "Découvrir" button shows
// up by itself when the guardian draws (and goes away if the draw is
// cancelled). A closed edition no longer changes. TanStack Query pauses
// the interval when the tab is in the background.
const PERSONAL_REFRESH_MS = 10_000;

export const usePersonalQuery = (token: Token) =>
  usePersonalRead<PersonalState>(
    () => keys.personal(toValue(token)),
    () => base(token),
    () => true,
    (data) => (data?.phase === 'closed' ? false : PERSONAL_REFRESH_MS),
  );

export const useWishesQuery = (token: Token) =>
  usePersonalRead<WishesPayload>(
    () => keys.wishes(toValue(token)),
    () => `${base(token)}/wishes`,
  );

export const useJournalQuery = (token: Token) =>
  usePersonalRead<JournalPayload>(
    () => keys.journal(toValue(token)),
    () => `${base(token)}/journal`,
  );

export const useSaveWishesMutation = (token: Token) =>
  useApiMutation<WishesPayload, WishItem[]>(
    (wishes) =>
      api(`${base(token)}/wishes`, { method: 'PUT', body: { wishes } }),
    () => [keys.personal(toValue(token))],
  );

export const useSaveAvatarMutation = (token: Token) =>
  useApiMutation<{ avatar: Avatar }, Avatar>(
    (avatar) => api(`${base(token)}/avatar`, { method: 'PUT', body: avatar }),
    () => [keys.personal(toValue(token))],
  );

/**
 * The "Découvrir" button. A mutation on purpose: the result is never
 * cached, it lives in the page's state and is gone on leave or reload
 * (README section 11). The journal is refetched: it gained an entry.
 */
export const useRevealMutation = (token: Token) =>
  useApiMutation<Reveal, undefined>(
    () => api(`${base(token)}/reveal`, { method: 'POST' }),
    () => [keys.journal(toValue(token))],
  );
