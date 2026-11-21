import type { GiverHintsState } from '#server/utils/hints';
import type { GuessMode } from '#server/utils/guesses';
import type { gamePayload } from '#server/http/guesses';
import type { JournalPersonCard } from '#server/database/journal';
import { useQuery, type QueryKey } from '@tanstack/vue-query';
import { toValue, type MaybeRefOrGetter } from 'vue';
import type { Avatar } from '#server/utils/avatars';
import type { JournalEntry } from '#server/utils/audit';
import type { EditionStatus } from '#server/utils/editions';
import type { PersonalPhase } from '#server/utils/personal';
import type { Locale } from '#shared/i18n';
import type {
  GiftHintsMode,
  HintAnswer,
  HintQuestion,
  HintText,
  Portrait,
} from '#shared/utils/hints';
import { keys } from './keys';
import { api, useApiMutation, useApiQuery } from './useApi';

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
  /** How many organisers the group has (« tes organisateurs »). */
  organizers: number;
  editionLabel: string;
  status: EditionStatus;
  phase: PersonalPhase;
  /** The day of the party (ISO), or empty. */
  eventDate: string;
  budget: string;
  /** The organiser's words to the participants, or empty. */
  guardianMessage: string;
  /** What the group lets participants note (README 22.11). */
  giftHints: GiftHintsMode;
  hintsEditable: boolean;
  /** They left hints of their own. */
  hasHints: boolean;
  /** Has already discovered their result at least once. */
  revealed: boolean;
  /**
   * The organiser revealed the draw: it is visible to the whole group
   * (README 22.18), read with `useOpenDrawQuery`.
   */
  drawRevealed: boolean;
  /** The hints of the person they give to: none, some, or new. */
  receiverHints: GiverHintsState;
  /** « Lui demander des pistes » is still possible. */
  canAskHints: boolean;
  /** Alerts of the journal since it was last opened from this page. */
  /** The stage of my list for the event (ticket 107), or null. */
  myList: 'draft' | 'giver' | 'parties' | 'public' | null;
  journalAlerts: number;
  /** Drawn by the app, or already elsewhere (README 22.12). */
  drawMode: 'app' | 'elsewhere';
  /** « Devine qui » (README 22.17): what its tile and cards need. */
  guess: {
    mode: GuessMode;
    open: boolean;
    endsAt: string | null;
    played: boolean;
    revealed: boolean;
    /** Someone played: there is a palmarès, small or full. */
    palmares: boolean;
    seen: boolean;
    /** « Je passe mon tour » (Correction 15), and whether it is offered. */
    skipped: boolean;
    canSkip: boolean;
    /** « 4 sur 6 ont joué », among those who did not pass their turn. */
    count: { played: number; total: number };
  } | null;
  /** While answers are collected: theirs given, and how many are. */
  answer: { given: boolean; answered: number; total: number } | null;
};
/** Someone they may say they give to. */
export type AnswerChoice = { id: string; name: string; avatar: Avatar };
/** Who they may name, and their own answer when they ask to see it. */
export type AnswerPayload = {
  choices: AnswerChoice[];
  receiver: AnswerChoice | null;
};
export type WishItem = { label: string; url: string | null };
/** What the giver reads on their result. */
export type GiverHints = {
  /** The group setting: which questions were asked. */
  mode: 'full' | 'portrait';
  portrait: Portrait;
  ideas: WishItem[];
  /** They already asked for hints. */
  requested: boolean;
  /** Left or changed since the result was last opened (lot 16 bis). */
  isNew: boolean;
  /** When they last changed. */
  updatedAt: string | null;
};
/** The page « Mes pistes de cadeaux ». */
export type HintsPayload = {
  mode: GiftHintsMode;
  editable: boolean;
  ideasEditable: boolean;
  portrait: Portrait;
  ideas: WishItem[];
  maxIdeas: number;
  /** Someone asked for hints and none arrived yet. */
  requested: boolean;
  /** The earlier edition whose hints can be reused, on an empty page. */
  previousEdition: string | null;
  /**
   * « Ma liste de cadeaux » (lot 27 ter); null where the group keeps no
   * precise ideas. `holds` is known to my account only.
   */
  list: {
    loggedIn: boolean;
    linked: (ListTile & { holds: boolean | null }) | null;
  } | null;
  language: Locale;
};
/** A gift list, as the hints name it. */
export type ListTile = {
  id: string;
  title: string;
  icon: { emoji: string; color: string };
  shared: boolean;
};
/** A gift list I may link to my hints. */
export type LinkableList = ListTile & { holds: boolean; holder: string };
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
  /** What the receiver left; null when the group has no hints. */
  hints: GiverHints | null;
  /**
   * « La liste de cadeaux d'Inès » (ticket 107): where it opens, in
   * anonymous mode on her part, and how many ideas came since my last
   * visit.
   */
  list?: {
    title: string;
    icon: { emoji: string; color: string };
    path: string;
    newIdeas: number;
  } | null;
  receiverHasEmail: boolean;
  requesterHasEmail: boolean;
  viewCount: number;
};
/** A person of a revealed draw. */
export type DrawPerson = { id: string; name: string; avatar: Avatar };
/** A revealed draw, for a participant (README 22.18). */
export type OpenDrawPayload = Reveal & {
  receiver: DrawPerson;
  santa: DrawPerson | null;
  pairs: { giver: DrawPerson; receiver: DrawPerson }[];
  revealedAt: string;
  /** Who revealed: themselves, a person by name, or nobody known. */
  revealedBy: { kind: 'me' } | { kind: 'name'; name: string } | null;
  language: Locale;
};
export type JournalPayload = {
  entries: JournalEntry[];
  editions: { id: string; label: string }[];
  people: JournalPersonCard[];
  /** The participant reading it. */
  me: string;
  currentEditionId: string;
  /** How many organisers the group has (« tes organisateurs »). */
  organizers: number;
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
    // A link the server already refused stays refused: asking again on
    // mount would show the skeleton instead of « Ce lien ne marche plus ».
    retryOnMount: false,
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

/** The draw, once revealed (README 22.18); not asked before. */
export const useOpenDrawQuery = (token: Token, enabled: () => boolean) =>
  usePersonalRead<OpenDrawPayload>(
    () => keys.draw(toValue(token)),
    () => `${base(token)}/draw`,
    enabled,
  );

export const useWishesQuery = (token: Token) =>
  usePersonalRead<WishesPayload>(
    () => keys.wishes(toValue(token)),
    () => `${base(token)}/wishes`,
  );

/** « Mes pistes de cadeaux » (README 22.11). */
export const useHintsQuery = (token: Token) =>
  usePersonalRead<HintsPayload>(
    () => keys.hints(toValue(token)),
    () => `${base(token)}/hints`,
  );

/** One answer or one text: only the keys given change. */
export type HintsPatch = {
  answers?: Partial<Record<HintQuestion, HintAnswer | null>>;
  texts?: Partial<Record<HintText, string | null>>;
};

export const useSaveHintsMutation = (token: Token) =>
  useApiMutation<HintsPayload, HintsPatch>(
    (patch) => api(`${base(token)}/hints`, { method: 'PATCH', body: patch }),
    () => [keys.personal(toValue(token))],
  );

/** « Quelle liste ? »: the gift lists of my account, once logged in. */
export const useLinkableListsQuery = (
  token: Token,
  enabled: MaybeRefOrGetter<boolean>,
) =>
  useApiQuery<LinkableList[]>(
    () => [...keys.hints(toValue(token)), 'lists'],
    () => `${base(token)}/hints/lists`,
    enabled,
  );

/** « Ma liste de cadeaux »: one of my lists, or none. */
export const useLinkListMutation = (token: Token) =>
  useApiMutation<HintsPayload, string | null>(
    (listId) =>
      api(`${base(token)}/hints/list`, { method: 'PUT', body: { listId } }),
    () => [keys.personal(toValue(token))],
  );

/** « Reprendre mes pistes de {édition} », on an empty page. */
export const useCopyHintsMutation = (token: Token) =>
  useApiMutation<HintsPayload, undefined>(
    () => api(`${base(token)}/hints/copy`, { method: 'POST' }),
    () => [keys.personal(toValue(token))],
  );

/**
 * « Lui demander des pistes »: once per draw, anonymous. Nothing is
 * refetched: the result lives in the page's state, and only says now that
 * the request left.
 */
export const useRequestHintsMutation = (token: Token) =>
  useApiMutation<{ requested: true; emailed: boolean }, undefined>(() =>
    api(`${base(token)}/hints/request`, { method: 'POST' }),
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

/** Opening the journal: the alerts on the page start again from now. */
export const useJournalSeenMutation = (token: Token) =>
  useApiMutation<{ ok: true }, undefined>(
    () => api(`${base(token)}/journal-seen`, { method: 'POST' }),
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

/**
 * Opens their answer to a draw made elsewhere (README 22.12): the people
 * they may name and the one they named. A mutation, like the result: only
 * on demand, never kept in the cache.
 */
export const useOpenAnswerMutation = (token: Token) =>
  useApiMutation<AnswerPayload, undefined>(
    () => api(`${base(token)}/answer`),
    () => [],
  );

/** Says who they give to, or corrects it. */
export const useSaveAnswerMutation = (token: Token) =>
  useApiMutation<{ ok: true }, string>(
    (personId) =>
      api(`${base(token)}/answer`, { method: 'PUT', body: { personId } }),
    () => [keys.personal(toValue(token))],
  );

/** « Devine qui » for one participant (README 22.17). */
export type GamePayload = NonNullable<Awaited<ReturnType<typeof gamePayload>>>;

export const useGameQuery = (token: Token) =>
  usePersonalRead<GamePayload>(
    () => keys.game(toValue(token)),
    () => `${base(token)}/guess`,
  );

/** A guess made, changed or taken back (`giverId: null`). */
export const useGuessMutation = (token: Token) =>
  useApiMutation<unknown, { recipientId: string; giverId: string | null }>(
    (body) => api(`${base(token)}/guess`, { method: 'PUT', body }),
    () => [keys.personal(toValue(token))],
  );

/** « Je passe mon tour », or « Finalement, je joue » (Correction 15). */
export const useSkipGameMutation = (token: Token) =>
  useApiMutation<{ skipped: boolean }, boolean>(
    (skip) =>
      api(`${base(token)}/guess/skip`, { method: 'POST', body: { skip } }),
    // The home's card follows too.
    () => [keys.personal(toValue(token)), keys.home()],
  );

/** The palmarès was watched: « Revoir », guesses corrected. */
export const useResultsSeenMutation = (token: Token) =>
  useApiMutation<unknown, undefined>(
    () => api(`${base(token)}/guess/seen`, { method: 'POST' }),
    () => [keys.personal(toValue(token))],
  );
