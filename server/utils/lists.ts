// Gift lists (README 22.19, lots 21 and 22): a family writes its gift
// ideas for an event, shares a link, and everyone ticks what they give so
// that nobody has the same idea. Apart from the draws. The core, pure:
// what state a list is in, what it needs to be shared, what each one sees
// of a line, the sentences of the « Listes » tab, the ideas carried over
// from one list to the next.
import { z } from 'zod';
import type { Avatar } from './avatars';

export const LIST_TITLE_MAX = 80;
export const LIST_NOTE_MAX = 500;
export const IDEA_TEXT_MAX = 200;
export const MEMBER_NAME_MAX = 40;
export const MEMBER_FIELD_MAX = 40;

/** The symbols of a list, in four families of their own (ListeIcone). */
export const LIST_ICON_GROUPS = {
  winter: [
    '❄️',
    '🎄',
    '🎁',
    '⭐',
    '🕯️',
    '☃️',
    '🔔',
    '🧦',
    '🦌',
    '🎅',
    '🌨️',
    '🏔️',
  ],
  party: [
    '🎂',
    '🎈',
    '🎉',
    '🎊',
    '🥂',
    '🍾',
    '🧁',
    '🪅',
    '🎵',
    '💃',
    '🪩',
    '🎇',
  ],
  moments: ['👶', '🍼', '💍', '💐', '🎓', '🏡', '🔑', '✈️', '🎒'],
  seasons: ['🌸', '🐣', '🌷', '☀️', '🏖️', '🍉', '🍂', '🎃', '🍄'],
} as const;
export type ListIconGroup = keyof typeof LIST_ICON_GROUPS;
export const LIST_ICON_GROUP_KEYS = Object.keys(
  LIST_ICON_GROUPS,
) as ListIconGroup[];
export const LIST_EMOJIS = Object.values(LIST_ICON_GROUPS).flat();
export type ListEmoji = (typeof LIST_EMOJIS)[number];

/** Six solid colours for the square tile of a list. */
export const LIST_COLORS = [
  'pine',
  'brick',
  'mustard',
  'plum',
  'night',
  'kraft',
] as const;
export type ListColor = (typeof LIST_COLORS)[number];
export type ListIcon = { emoji: ListEmoji; color: ListColor };

export const listIconSchema = z.object({
  emoji: z.enum(LIST_EMOJIS as [ListEmoji, ...ListEmoji[]]),
  color: z.enum(LIST_COLORS),
});

/**
 * A random icon for a new list.
 * @param random - A random integer below its argument.
 * @returns The icon.
 */
export const randomListIcon = (random: (n: number) => number): ListIcon => ({
  emoji: LIST_EMOJIS[random(LIST_EMOJIS.length)]!,
  color: LIST_COLORS[random(LIST_COLORS.length)]!,
});

/** A draft only its holder sees; shared once its link exists; past after its day. */
export type ListStatus = 'draft' | 'shared' | 'past';

/**
 * The state of a list.
 * @param list - Its link's date of creation and its day, if any.
 * @param list.sharedAt - When it was first shared, or null.
 * @param list.eventDate - Its day (YYYY-MM-DD), or null.
 * @param today - Today (YYYY-MM-DD).
 * @returns Draft, shared or past.
 */
export const listStatus = (
  list: { sharedAt: string | null; eventDate: string | null },
  today: string,
): ListStatus => {
  if (!list.sharedAt) return 'draft';
  return list.eventDate && list.eventDate < today ? 'past' : 'shared';
};

/** What a list lacks to be shared: a name, someone on it. */
export type ShareMissing = 'title' | 'people';

/**
 * What is missing before a list can be shared (ListePartager says it
 * instead of making the link).
 * @param list - Its name and how many people are on it.
 * @param list.title - The name of the event.
 * @param list.peopleCount - How many people are on it.
 * @returns The missing things, none when it can be shared.
 */
export const shareMissing = (list: {
  title: string;
  peopleCount: number;
}): ShareMissing[] => [
  ...(list.title.trim() ? [] : ['title' as const]),
  ...(list.peopleCount > 0 ? [] : ['people' as const]),
];

/**
 * Whether a document left alone is worth keeping: a list without a name
 * and without anyone on it is not.
 * @param list - Its name and how many people are on it.
 * @param list.title - The name of the event.
 * @param list.peopleCount - How many people are on it.
 * @returns True when it is kept.
 */
export const isWorthKeeping = (list: {
  title: string;
  peopleCount: number;
}): boolean => shareMissing(list).length < 2;

/**
 * The word for the family: the starting text until it is changed, the
 * holder's own text after, nothing once erased.
 * @param note - What is stored: null while untouched.
 * @param edited - Whether it was ever changed.
 * @returns `default` for the starting text, `none`, or the text.
 */
export const noteOf = (
  note: string | null,
  edited: boolean,
): { kind: 'default' } | { kind: 'none' } | { kind: 'text'; text: string } => {
  if (!edited) return { kind: 'default' };
  const text = note?.trim() ?? '';
  return text ? { kind: 'text', text } : { kind: 'none' };
};

/**
 * What a line turns into once written: an address pasted becomes a link
 * of its own, the text keeps the rest (README 22.19, « lien »).
 * @param raw - What was typed or pasted.
 * @returns The text and the link, or null when nothing is left.
 */
export const splitIdea = (
  raw: string,
): { text: string; url: string | null } | null => {
  const found = raw.match(/https?:\/\/\S+/i);
  const url = found ? found[0].replace(/[),.;:!?]+$/, '') : null;
  const text = (url ? raw.replace(found![0], ' ') : raw)
    .replace(/\s+/g, ' ')
    .replace(/\s*:\s*$/, '')
    .trim();
  if (!text && !url) return null;
  return { text: text.slice(0, IDEA_TEXT_MAX), url };
};

/** Who gives an idea: alone, or a gift given by several. */
export type ClaimMode = 'alone' | 'group';

/** One account giving one idea (lot 22). */
export type Claim = {
  accountId: string;
  name: string;
  avatar: Avatar;
  mode: ClaimMode;
  /** Hidden from the holder: « Anonyme ». */
  anonymous: boolean;
  /** For a group: the one who proposed it closed it. */
  closed: boolean;
  createdAt: string;
};

/** What a line says of who gives it. */
export type IdeaView =
  | { kind: 'free' }
  | { kind: 'mine'; mode: 'alone'; anonymous: boolean }
  | { kind: 'taken'; by: string | null }
  | {
      kind: 'group';
      closed: boolean;
      mine: boolean;
      /** The viewer proposed it, or took it over: they may close it. */
      leads: boolean;
      people: { name: string; avatar: Avatar }[];
    };

/**
 * What a viewer sees of an idea (README 22.19, « Qui voit quoi »). The
 * holder sees who gives it, « Anonyme » (null) when asked; the others see
 * that it is taken, nothing more; a gift given by several shows who joins
 * to everyone. The one who proposed a group leads it; when they leave, the
 * next one does.
 * @param claims - Who gives it.
 * @param viewer - Who looks.
 * @param viewer.accountId - Their account, or null without one.
 * @param viewer.holds - Whether they hold the list.
 * @returns What the line shows.
 */
export const ideaView = (
  claims: readonly Claim[],
  viewer: { accountId: string | null; holds: boolean },
): IdeaView => {
  if (claims.length === 0) return { kind: 'free' };
  const ordered = claims.toSorted((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const leader = ordered[0]!;
  if (leader.mode === 'group') {
    return {
      kind: 'group',
      closed: leader.closed,
      mine: ordered.some((c) => c.accountId === viewer.accountId),
      leads: leader.accountId === viewer.accountId,
      people: ordered.map(({ name, avatar }) => ({ name, avatar })),
    };
  }
  if (leader.accountId === viewer.accountId) {
    return { kind: 'mine', mode: 'alone', anonymous: leader.anonymous };
  }
  return {
    kind: 'taken',
    by: viewer.holds && !leader.anonymous ? leader.name : null,
  };
};

/**
 * Whether an idea counts as planned: someone gives it, alone or with
 * others (a group nobody joined stays with the one who proposed it).
 * @param claims - Who gives it.
 * @returns True when it is planned.
 */
export const isPlanned = (claims: readonly unknown[]): boolean =>
  claims.length > 0;

/** The bottom sentence of a card of the « Listes » tab. */
export type CardSentence =
  | { key: 'planned'; count: number; mine: number }
  | { key: 'giving'; count: number }
  | { key: 'nothingYet' }
  | { key: 'noneYet' };

/**
 * The bottom sentence of a card: what I give there, whatever the list
 * (README 22.19). The holder reads how many gifts are planned, with theirs;
 * the others how many they give, or that they ticked nothing yet.
 * @param counts - What is planned on the list, and by the viewer.
 * @param counts.planned - The gifts planned, off-list ones included.
 * @param counts.mine - Those the viewer gives.
 * @param holds - Whether the viewer holds the list.
 * @returns The sentence, as a key and its numbers.
 */
export const cardSentence = (
  counts: { planned: number; mine: number },
  holds: boolean,
): CardSentence => {
  if (holds) {
    return counts.planned > 0
      ? { key: 'planned', count: counts.planned, mine: counts.mine }
      : { key: 'noneYet' };
  }
  return counts.mine > 0
    ? { key: 'giving', count: counts.mine }
    : { key: 'nothingYet' };
};

/**
 * The ideas a person brings to a new list: those of their last list that
 * nobody gave (README 22.19, « Ajouter quelqu'un »), in their order.
 * @param previous - Their ideas on their last list, each with whether it
 *   was planned.
 * @returns The text and link of each idea carried over.
 */
export const carriedIdeas = (
  previous: readonly {
    text: string;
    url: string | null;
    position: number;
    planned: boolean;
  }[],
): { text: string; url: string | null }[] =>
  previous
    .filter((idea) => !idea.planned)
    .toSorted((a, b) => a.position - b.position)
    .map(({ text, url }) => ({ text, url }));

/**
 * How many days until a list's day.
 * @param eventDate - Its day (YYYY-MM-DD).
 * @param today - Today (YYYY-MM-DD).
 * @returns The days, 0 on the day, negative after.
 */
export const daysUntil = (eventDate: string, today: string): number =>
  Math.round(
    (Date.parse(`${eventDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
      86_400_000,
  );

/**
 * The age of a person of the family, from their birth date.
 * @param birthDate - Their birth date (YYYY-MM-DD).
 * @param today - Today (YYYY-MM-DD).
 * @returns Their age in whole years.
 */
export const ageOn = (birthDate: string, today: string): number => {
  const [by, bm, bd] = birthDate.split('-').map(Number) as [
    number,
    number,
    number,
  ];
  const [ty, tm, td] = today.split('-').map(Number) as [number, number, number];
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
};

/**
 * The cards of the « Listes » tab: those still to come by date (a list
 * without a day last), then the past ones, the latest first.
 * @param lists - The lists, with their day and state.
 * @returns The coming ones and the past ones.
 */
export const sortCards = <
  T extends { eventDate: string | null; status: ListStatus; createdAt: string },
>(
  lists: readonly T[],
): { coming: T[]; past: T[] } => ({
  coming: lists
    .filter((l) => l.status !== 'past')
    .toSorted(
      (a, b) =>
        (a.eventDate ?? '9999').localeCompare(b.eventDate ?? '9999') ||
        b.createdAt.localeCompare(a.createdAt),
    ),
  past: lists
    .filter((l) => l.status === 'past')
    .toSorted((a, b) => (b.eventDate ?? '').localeCompare(a.eventDate ?? '')),
});
