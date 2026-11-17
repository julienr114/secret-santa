import type { JournalPersonCard } from '#server/database/journal';
import { useQuery, type QueryKey } from '@tanstack/vue-query';
import { toValue, type MaybeRefOrGetter } from 'vue';
import type { Avatar } from '#server/utils/avatars';
import type { JournalEntry } from '#server/utils/audit';
import type { EditionStatus } from '#server/utils/editions';
import type { PersonalPhase } from '#server/utils/personal';
import type { Locale } from '#shared/i18n';
import { keys } from './keys';
import { api, useApiMutation } from './useApi';

// Participant side (README 4.3): everything goes through the personal link.

type Token = MaybeRefOrGetter<string>;

export type PersonalState = {
  /**
   * Is this draw in the logged-in account (`mine`), can it be added
   * (`free`), or is it someone else's (`other`)? Null without an account.
   */
  linked: 'mine' | 'free' | 'other' | null;
  /** Their own address, offered for an account while logged out. */
  email: string | null;
  firstName: string;
  language: Locale;
  avatar: Avatar;
  avatarEditable: boolean;
  groupName: string;
  editionLabel: string;
  status: EditionStatus;
  phase: PersonalPhase;
  /** The day of the party (ISO), or empty. */
  eventDate: string;
  wishlist: boolean;
  wishesEditable: boolean;
  wishesCount: number;
  /** Has already discovered their result at least once. */
  revealed: boolean;
  /** Ideas in the receiver's list; 0 until the first reveal. */
  receiverWishesCount: number;
};
export type WishItem = { label: string; url: string | null };
export type WishesPayload = {
  wishes: WishItem[];
  maxWishes: number;
  editable: boolean;
  language: Locale;
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
  people: JournalPersonCard[];
  /** The participant reading it. */
  me: string;
  currentEditionId: string;
  language: Locale;
};

const base = (token: Token) => `/api/p/${toValue(token)}`;

/**
 * A read behind a personal link. No retry: a refused link will not get
 * better, and the page must say so at once. A failure during server
 * rendering is left to the page, which shows the "invalid link" screen.
 * Every answer carries the participant's preferred language, which the
 * interface then follows (without touching this device's own choice).
 */
const usePersonalRead = <T extends { language: Locale }>(
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
  const { locale } = useLocale();
  const follow = (data: T | undefined) => {
    if (data) locale.value = data.language;
  };
  onServerPrefetch(async () => {
    if (enabled()) await query.suspense().catch(() => undefined);
    follow(query.data.value);
  });
  watch(() => query.data.value, follow, { immediate: true });
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

/** The participant's preferred language; every read follows it. */
export const useSaveLanguageMutation = (token: Token) =>
  useApiMutation<{ language: Locale }, Locale>(
    (language) =>
      api(`${base(token)}/language`, { method: 'PUT', body: { language } }),
    () => [keys.personal(toValue(token))],
  );

/**
 * The "Découvrir" button. A mutation on purpose: the result is never
 * cached, it lives in the page's state and is gone on leave or reload
 * (README section 11). The rest is refetched: the journal may have gained
 * an entry, and the page now offers to see the result again.
 */
export const useRevealMutation = (token: Token) =>
  useApiMutation<Reveal, undefined>(
    () => api(`${base(token)}/reveal`, { method: 'POST' }),
    () => [keys.personal(toValue(token))],
  );
