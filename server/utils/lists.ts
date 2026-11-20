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
 * @param list.sharedAt - Since when it is shared by its link, or null.
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

/** What the switch « Partage par lien » asks (README 22.19). */
export const SHARE_ASKS = ['on', 'off', 'renew'] as const;
export type ShareAsk = (typeof SHARE_ASKS)[number];

/**
 * The link of a list after its switch is touched. On: the list is
 * shared, by the link it already had if it ever had one. Off: the link
 * stops working at once and is kept, so that sharing again gives the same
 * one. Renew: another link, only while the list is shared.
 * @param list - The link and the day of sharing as they stand.
 * @param list.shareToken - The link, or null before the first sharing.
 * @param list.sharedAt - Since when it is shared, or null when it is not.
 * @param ask - What is asked.
 * @param fresh - A new link and the present time, used when needed.
 * @param fresh.token - A link nobody has.
 * @param fresh.now - The present time.
 * @returns The link and the day of sharing to store.
 */
export const shareChange = (
  list: { shareToken: string | null; sharedAt: string | null },
  ask: ShareAsk,
  fresh: { token: string; now: string },
): { shareToken: string | null; sharedAt: string | null } => {
  if (ask === 'off') return { shareToken: list.shareToken, sharedAt: null };
  if (ask === 'renew') {
    return list.sharedAt
      ? { shareToken: fresh.token, sharedAt: list.sharedAt }
      : { shareToken: list.shareToken, sharedAt: null };
  }
  return {
    shareToken: list.shareToken ?? fresh.token,
    sharedAt: list.sharedAt ?? fresh.now,
  };
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
 * Whether a list may be deleted. An empty document goes by itself when
 * it is left, and only a draft goes that way: a shared list is deleted
 * on purpose, from its own page, which says first what is lost.
 * @param list - The list.
 * @param list.sharedAt - When it was shared, or null.
 * @param sure - Asked on purpose, after reading what is lost.
 * @returns True when it may go.
 */
export const canDeleteList = (
  list: { sharedAt: string | null },
  sure: boolean,
): boolean => sure || !list.sharedAt;

// --- A list without people (lot 27 bis, README 22.20) -------------------

/** A part of a list, as its shape is read from it. */
type Part = { member: { placeholder: boolean } };

/**
 * Whether a list is « sans personne »: for a wedding, a housewarming,
 * its ideas one under the other. It then has one part, hidden, which
 * belongs to nobody.
 * @param people - The parts of the list.
 * @returns True for a list without people.
 */
export const isSingleList = (people: readonly Part[]): boolean =>
  people.length === 1 && people[0]?.member.placeholder === true;

/** Why the shape of a list cannot change. */
export type ShapeRefusal = 'list_shared' | 'several_people';

/**
 * Why a list cannot become « sans personne », if it cannot: its shape
 * only changes while it is not shared (those who have its link would
 * see it turn into something else), and the ideas of several people
 * cannot be mixed into one list.
 * @param list - The list.
 * @param list.sharedAt - When it was shared, or null.
 * @param list.people - Its parts.
 * @returns The reason, or null when it may (or already is).
 */
export const singleRefusal = (list: {
  sharedAt: string | null;
  people: readonly Part[];
}): ShapeRefusal | null => {
  if (isSingleList(list.people)) return null;
  if (list.sharedAt) return 'list_shared';
  return list.people.length > 1 ? 'several_people' : null;
};

/**
 * Why a person cannot be added to a list, if they cannot: a list without
 * people already shared stays as it is.
 * @param list - The list.
 * @param list.sharedAt - When it was shared, or null.
 * @param list.people - Its parts.
 * @returns The reason, or null when they may.
 */
export const addPersonRefusal = (list: {
  sharedAt: string | null;
  people: readonly Part[];
}): ShapeRefusal | null =>
  isSingleList(list.people) && list.sharedAt ? 'list_shared' : null;

// --- Taking a list up again (lot 27, README 22.20) ----------------------

/** A person of a list, with their ideas, as taking it up again reads it. */
export type ResumablePerson = {
  memberId: string;
  position: number;
  /** The hidden part of a list without people. */
  placeholder?: boolean;
  ideas: readonly {
    text: string;
    url: string | null;
    position: number;
    planned: boolean;
  }[];
};

/**
 * What a new list takes from an old one: its icon, its word (only one the
 * holder wrote: the starting text comes by itself), its people in their
 * order, and the ideas nobody ticked. What stays behind: the gifts
 * ticked, the gifts not on the list, the name and the day, which are to
 * be filled in.
 * @param source - The old list.
 * @param source.icon - Its icon.
 * @param source.note - Its word, or null.
 * @param source.noteEdited - Whether the holder wrote that word.
 * @param source.people - Its people, with their ideas.
 * @returns What the new list starts with.
 */
export const resumedList = (source: {
  icon: { emoji: string; color: string };
  note: string | null;
  noteEdited: boolean;
  people: readonly ResumablePerson[];
}) => ({
  icon: source.icon,
  note: source.noteEdited ? source.note : null,
  noteEdited: source.noteEdited,
  people: source.people
    .toSorted((a, b) => a.position - b.position)
    .map((person) => ({
      memberId: person.memberId,
      ideas: carriedIdeas(person.ideas),
    })),
});

/**
 * What taking a list up again would bring, for its line: « 4 personnes ·
 * 6 idées pas encore offertes » ; a list without people says so instead
 * of « 1 personne ».
 * @param people - The people of the old list, with their ideas.
 * @returns How many people, how many ideas nobody ticked, and whether
 *   it is a list without people.
 */
export const resumeSummary = (
  people: readonly ResumablePerson[],
): { people: number; ideas: number; single: boolean } => ({
  people: people.length,
  single: isSingleList(
    people.map((person) => ({
      member: { placeholder: person.placeholder === true },
    })),
  ),
  ideas: people.reduce(
    (sum, person) => sum + carriedIdeas(person.ideas).length,
    0,
  ),
});

/**
 * Whether a list can be started from another: only while it is still an
 * empty draft, so that nothing written is ever mixed with what comes.
 * @param list - The new list.
 * @param list.sharedAt - When it was shared, or null.
 * @param list.peopleCount - How many people are on it.
 * @returns True for a draft nobody is on.
 */
export const canResumeInto = (list: {
  sharedAt: string | null;
  peopleCount: number;
}): boolean => !list.sharedAt && list.peopleCount === 0;

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

/** Where a person is on one of my lists, for what deleting them takes. */
export type MemberPlace = {
  list: { id: string; title: string };
  /** Their ideas on this list. */
  ideaIds: readonly string[];
  /** The gifts not on the list that someone plans for them. */
  offList: number;
};

/** What deleting a person from « Mes proches » takes, or why it cannot. */
export type MemberRemoval =
  | { allowed: false; why: 'self' | 'holder' }
  | {
      allowed: true;
      /** The lists they leave. */
      lists: { id: string; title: string }[];
      /** Their ideas that go with them. */
      ideas: number;
      /** The gifts already planned for them, lost. */
      planned: number;
    };

/**
 * What deleting a person from « Mes proches » takes with them (Correction
 * 24, README 22.20): their places on my lists, their ideas there, and the
 * gifts already planned for them, an idea ticked or a gift off the list.
 * Refused for « Moi », and for a person linked to an account that holds
 * one of my lists with me.
 * @param member - Who is deleted.
 * @param member.isSelf - Whether it is « Moi ».
 * @param member.holdsWithMe - Whether their account holds a list with me.
 * @param places - Where they are, on my lists.
 * @param claimed - The ideas someone ticked.
 * @returns What goes, or why nothing does.
 */
export const memberRemoval = (
  member: { isSelf: boolean; holdsWithMe: boolean },
  places: readonly MemberPlace[],
  claimed: ReadonlySet<string>,
): MemberRemoval => {
  if (member.isSelf) return { allowed: false, why: 'self' };
  if (member.holdsWithMe) return { allowed: false, why: 'holder' };
  const ideaIds = places.flatMap((place) => place.ideaIds);
  return {
    allowed: true,
    lists: places.map((place) => place.list),
    ideas: ideaIds.length,
    planned:
      ideaIds.filter((id) => claimed.has(id)).length +
      places.reduce((sum, place) => sum + place.offList, 0),
  };
};
