// The news of an account (« Quoi de neuf », the red dots, ticket 120;
// README 22.22): what happened that concerns me, with the place to go
// and see it. Pure. A news never carries what its reader may not see:
// never a result of a draw, never the name of whoever asks for ideas.

/** What happened. */
export const NEWS_KINDS = [
  'envelope',
  'hint_request',
  'list_invite',
  'reminder',
  'new_ideas',
  'receiver_ideas',
  'ticked',
  'joined_gift',
  'revealed',
  'palmares',
  'joined',
  'all_viewed',
] as const;
export type NewsKind = (typeof NEWS_KINDS)[number];

/**
 * The place a news points at, and the gesture that makes it seen:
 * `santa`, my page of a Secret Santa; `follow`, the follow-up of one I
 * organise; `game`, « Devine qui »; `list`, a list; `party`, an event.
 */
export const NEWS_TARGETS = [
  'santa',
  'follow',
  'game',
  'list',
  'party',
] as const;
export type NewsTarget = (typeof NEWS_TARGETS)[number];

/** README 22.22: « ce qui presse », and « le reste ». */
export type NewsLevel = 'urgent' | 'other';

/** The level and the place of each kind. */
export const NEWS_SHAPE: Record<
  NewsKind,
  { level: NewsLevel; target: NewsTarget }
> = {
  envelope: { level: 'urgent', target: 'santa' },
  hint_request: { level: 'urgent', target: 'santa' },
  list_invite: { level: 'urgent', target: 'list' },
  reminder: { level: 'urgent', target: 'follow' },
  new_ideas: { level: 'other', target: 'list' },
  receiver_ideas: { level: 'other', target: 'santa' },
  ticked: { level: 'other', target: 'list' },
  joined_gift: { level: 'other', target: 'list' },
  revealed: { level: 'other', target: 'santa' },
  palmares: { level: 'other', target: 'game' },
  joined: { level: 'other', target: 'party' },
  all_viewed: { level: 'other', target: 'follow' },
};

/** After thirty days a news is gone (README 22.22). */
export const FORGET_DAYS = 30;

/**
 * Whether a news is forgotten: thirty days after it happened.
 * @param at - When it happened (ISO).
 * @param now - Now (ISO).
 * @returns True once forgotten.
 */
export const isForgotten = (at: string, now: string): boolean =>
  Date.parse(now) - Date.parse(at) >= FORGET_DAYS * 86_400_000;

/**
 * The instant before which news are forgotten.
 * @param now - Now (ISO).
 * @returns An ISO instant.
 */
export const forgetBefore = (now: string): string =>
  new Date(Date.parse(now) - FORGET_DAYS * 86_400_000).toISOString();

/** A news to write, for one account. */
export type NewNews = {
  accountId: string;
  kind: NewsKind;
  targetId: string;
  /** The event, when the news has one (a list finds its own). */
  partyId: string | null;
  /** A first name the text says: who joins, who invites, whose list. */
  name: string | null;
  /** The gift, for « se joint à » only. */
  detail: string | null;
};

/** A news already written and not seen yet. */
export type PendingNews = {
  id: string;
  accountId: string;
  kind: NewsKind;
  targetId: string;
  count: number;
  createdAt: string;
};

/**
 * What to write for new news: one of the same kind at the same place,
 * not seen yet and of the same day, is counted again (« 2 cadeaux ont
 * été cochés sur ta liste ») instead of being written twice. Several of
 * the same kind for the same account at once count as many.
 * @param pending - The news not seen yet of these accounts.
 * @param incoming - The news to write.
 * @param now - Now (ISO).
 * @returns The news to count again, with their new count, and those to add.
 */
export const groupNews = (
  pending: readonly PendingNews[],
  incoming: readonly NewNews[],
  now: string,
): {
  counted: { id: string; count: number }[];
  added: (NewNews & { count: number })[];
} => {
  const day = now.slice(0, 10);
  const keyOf = (news: { accountId: string; kind: string; targetId: string }) =>
    `${news.accountId}|${news.kind}|${news.targetId}`;
  const today = new Map(
    pending
      .filter((news) => news.createdAt.slice(0, 10) === day)
      .map((news) => [keyOf(news), news]),
  );
  const keys = [...new Set(incoming.map(keyOf))];
  return keys.reduce<ReturnType<typeof groupNews>>(
    (done, key) => {
      const group = incoming.filter((news) => keyOf(news) === key);
      const first = group[0]!;
      const existing = today.get(key);
      return existing
        ? {
            ...done,
            counted: [
              ...done.counted,
              { id: existing.id, count: existing.count + group.length },
            ],
          }
        : {
            ...done,
            added: [...done.added, { ...first, count: group.length }],
          };
    },
    { counted: [], added: [] },
  );
};

/** The day a news is told under, as « Quoi de neuf » writes it. */
export type NewsWhen =
  | { day: 'today' | 'yesterday'; time: string }
  | { day: 'weekday'; weekday: number }
  | { day: 'date'; date: string };

/**
 * When a news happened, in the words of « Quoi de neuf » (V3QuoiDeNeuf):
 * « Aujourd'hui, 9 h 12 », « Hier, 18 h 02 », a day of the week within
 * a week, a date before.
 * @param at - When it happened (ISO).
 * @param now - Now (ISO).
 * @param timeZone - Where it is read.
 * @returns The day, and the time when it is today or yesterday.
 */
export const newsWhen = (
  at: string,
  now: string,
  timeZone?: string,
): NewsWhen => {
  const dayOf = (iso: string) =>
    new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(iso));
  const days = Math.round(
    (Date.parse(dayOf(now)) - Date.parse(dayOf(at))) / 86_400_000,
  );
  if (days <= 1) return { day: days <= 0 ? 'today' : 'yesterday', time: at };
  if (days < 7) {
    const weekday = new Date(`${dayOf(at)}T12:00:00Z`).getUTCDay();
    return { day: 'weekday', weekday };
  }
  return { day: 'date', date: dayOf(at) };
};

/** A news as « Quoi de neuf » shows it, its section found. */
export type NewsSectioned<T> = T & {
  at: string;
  section: string;
};

/**
 * « Quoi de neuf » by event (accueil-et-creation.md): a section per
 * event, the one with the latest news on top; in a section, the latest
 * first.
 * @param news - The news, each with its section.
 * @returns The sections, in their order, with their news.
 */
export const newsSections = <T>(
  news: readonly NewsSectioned<T>[],
): { section: string; news: NewsSectioned<T>[] }[] => {
  const latest = news.toSorted((a, b) => b.at.localeCompare(a.at));
  return [...new Set(latest.map((one) => one.section))].map((section) => ({
    section,
    news: latest.filter((one) => one.section === section),
  }));
};

/**
 * The event a list's news go under (accueil-et-creation.md): of the
 * events of the list I am in, the one whose date is the nearest to come,
 * else the latest; null when I am in none (a public list where I ticked).
 * @param events - The events of the list I am in, with their date.
 * @param today - « 2026-11-20 ».
 * @returns The event, or null.
 */
export const listSection = (
  events: readonly { partyId: string; date: string | null }[],
  today: string,
): string | null => {
  const dated = events.toSorted((a, b) =>
    (a.date ?? '9999').localeCompare(b.date ?? '9999'),
  );
  const coming = dated.find((event) => (event.date ?? '9999') >= today);
  return (coming ?? dated.at(-1))?.partyId ?? null;
};
