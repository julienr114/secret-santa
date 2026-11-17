import type { Role } from './auth';
import type { EditionStatus } from './editions';
import { daysUntil, isIsoDay, partyIsOver } from './rules';
import type { GiverHintsState } from './hints';
import type { HomeAnswer } from './personal';
import type { AnswersCard } from './answers';

// The home of an account (README 11 and 22.10): which card goes on top,
// how the page is laid out, and one card per group. Pure: the route
// gathers the data, the page shows it.

/** A draw the account takes part in, as the home needs it. */
export type HomeDrawState = {
  id: string;
  /** The personal page of the draw. */
  path: string;
  groupId: string;
  groupName: string;
  editionLabel: string;
  status: EditionStatus;
  /** The result was seen at least once. */
  revealed: boolean;
  /** The group uses gift hints (README 22.11). */
  hintsOn: boolean;
  /** They left hints: an answer, a text or an idea. */
  hasHints: boolean;
  /**
   * The hints of the person they give to, as they see them (lot 16 bis):
   * none, some, or new since they last opened their result.
   */
  receiverHints: GiverHintsState;
  /** A draw made elsewhere: their answer to give, or given (22.12). */
  answer: HomeAnswer;
  /**
   * « Devine qui » (22.17): open and not played yet, or its palmarès come
   * and not watched; null when the game is off.
   */
  game: {
    open: boolean;
    played: boolean;
    palmares: boolean;
    seen: boolean;
    endsAt: string | null;
  } | null;
  /** An ISO day, or older free text, or empty. */
  eventDate: string;
};

/** The current edition of a group the account organises. */
export type HomeEditionState = {
  id: string;
  label: string;
  status: EditionStatus;
  participants: number;
  /** Not sent their message yet, and not looked either. */
  toNotify: number;
  /** Sent their message, not opened their page yet. */
  notOpened: number;
  viewed: number;
  eventDate: string;
  /** Can the draw be made? Null when it was not checked. */
  drawPossible: boolean | null;
  /**
   * A draw made elsewhere (README 22.12): where its answers stand, and how
   * many were given; null when the app draws.
   */
  answers: { card: AnswersCard; answered: number } | null;
};

/** A group the account organises, with its current edition. */
export type HomeGroupState = {
  id: string;
  slug: string;
  name: string;
  current: HomeEditionState | null;
};

/** What the home knows about the account. */
export type HomeState = {
  role: Role;
  firstName: string | null;
  draws: HomeDrawState[];
  groups: HomeGroupState[];
  canCreateGroup: boolean;
  /** Group requests awaiting the super-admin; 0 for everyone else. */
  pendingRequests: number;
};

/** The cards of the top of the home, in the order of README 22.10. */
export const HOME_ACTIONS = [
  'notify',
  'requests',
  'discover',
  'giveAnswer',
  'palmares',
  'readHints',
  'remind',
  'fixDraw',
  'fixAnswers',
  'validateAnswers',
  'startDraw',
  'askAnswers',
  'guess',
  'addHints',
  'close',
  'prepare',
  'createGroup',
  'completeProfile',
] as const;
export type HomeActionKind = (typeof HOME_ACTIONS)[number];

/** The card on top of the home. */
export type HomeAction = {
  kind: HomeActionKind;
  /** The group it is about; null for the account itself. */
  groupName: string | null;
  /** How many people it is about (to notify, requests, not opened…). */
  count: number;
  /** Where its button leads. */
  to: string;
  /** What "Plus tard" remembers; null when the card cannot be put off. */
  dismissKey: string | null;
};

/** How far before the party an organiser is told some links are unopened. */
export const REMIND_DAYS = 7;
/** The month from which a group without an edition is asked to prepare one. */
export const PREPARE_FROM_MONTH = 10;

/** A candidate for the top card, with what breaks ties. */
type Candidate = HomeAction & { eventDate: string };

/**
 * The days left before a party, to sort candidates: the nearest first, a
 * party without a date or already over last.
 * @param eventDate - The date of the party.
 * @param today - ISO day.
 * @returns The days left, or Infinity.
 */
const daysLeft = (eventDate: string, today: string): number =>
  daysUntil(eventDate, today) ?? Number.POSITIVE_INFINITY;

/**
 * A candidate when its condition holds.
 * @param condition - Whether the card is asked for.
 * @param candidate - The card.
 * @returns The card alone, or nothing.
 */
const when = (condition: boolean, candidate: Candidate): Candidate[] =>
  condition ? [candidate] : [];

/**
 * Orders the candidates: by the rank of their card, then, for the same
 * card, the nearest party, the most people concerned, the group's name.
 * @param today - ISO day.
 * @returns A comparison function.
 */
const byUrgency =
  (today: string) =>
  (a: Candidate, b: Candidate): number =>
    HOME_ACTIONS.indexOf(a.kind) - HOME_ACTIONS.indexOf(b.kind) ||
    daysLeft(a.eventDate, today) - daysLeft(b.eventDate, today) ||
    b.count - a.count ||
    (a.groupName ?? '').localeCompare(b.groupName ?? '');

/**
 * The cards the groups the account organises ask for.
 * @param groups - The organised groups.
 * @param today - ISO day.
 * @returns The candidates, in no order.
 */
const organizerCandidates = (
  groups: readonly HomeGroupState[],
  today: string,
): Candidate[] =>
  groups.flatMap((group): Candidate[] => {
    const edition = group.current;
    const base = { groupName: group.name, dismissKey: null as string | null };
    if (!edition) {
      return Number(today.slice(5, 7)) >= PREPARE_FROM_MONTH
        ? [
            {
              ...base,
              kind: 'prepare',
              count: 0,
              to: `/admin/${group.slug}/editions/nouvelle`,
              dismissKey: `prepare:${group.id}:${today.slice(0, 4)}`,
              eventDate: '',
            },
          ]
        : [];
    }
    const page = `/admin/${group.slug}/editions/${edition.id}`;
    const at = { ...base, to: page, eventDate: edition.eventDate };
    if (edition.status === 'preparing' && edition.answers) {
      const ANSWER_CARDS = {
        conflict: 'fixAnswers',
        ready: 'validateAnswers',
        oneMissing: 'validateAnswers',
        collect: 'askAnswers',
      } as const;
      return [
        {
          ...at,
          kind: ANSWER_CARDS[edition.answers.card],
          count: edition.participants - edition.answers.answered,
        },
      ];
    }
    if (edition.status === 'preparing') {
      return [
        {
          ...at,
          kind: edition.drawPossible === false ? 'fixDraw' : 'startDraw',
          count: edition.participants,
        },
      ];
    }
    if (edition.status !== 'drawn') return [];
    const days = daysUntil(edition.eventDate, today);
    return [
      ...when(edition.toNotify > 0, {
        ...at,
        kind: 'notify',
        count: edition.toNotify,
        to: `${page}/emails?type=drawn`,
      }),
      ...when(
        edition.toNotify === 0 &&
          edition.notOpened > 0 &&
          days !== null &&
          days <= REMIND_DAYS,
        { ...at, kind: 'remind', count: edition.notOpened },
      ),
      ...when(
        isIsoDay(edition.eventDate) && partyIsOver(edition.eventDate, today),
        { ...at, kind: 'close', count: 0, dismissKey: `close:${edition.id}` },
      ),
    ];
  });

/**
 * The cards the draws of the account ask for.
 * @param draws - The draws the account takes part in.
 * @returns The candidates, in no order.
 */
const participantCandidates = (draws: readonly HomeDrawState[]): Candidate[] =>
  draws.flatMap((draw): Candidate[] => {
    const at = { groupName: draw.groupName, eventDate: draw.eventDate };
    if (draw.status === 'closed') return [];
    if (draw.status === 'drawn' && !draw.revealed) {
      return [
        { ...at, kind: 'discover', count: 1, to: draw.path, dismissKey: null },
      ];
    }
    if (draw.status === 'preparing' && draw.answer === 'toGive') {
      return [
        {
          ...at,
          kind: 'giveAnswer',
          count: 1,
          to: draw.path,
          dismissKey: null,
        },
      ];
    }
    return [
      // « Devine qui » (22.17): the palmarès to watch, once one's own
      // result was seen; a guess to make, optional.
      ...when(Boolean(draw.game?.palmares && !draw.game.seen), {
        ...at,
        kind: 'palmares',
        count: 1,
        to: `${draw.path}/devine/palmares`,
        dismissKey: null,
      }),
      ...when(Boolean(draw.game?.open && !draw.game.played), {
        ...at,
        kind: 'guess',
        count: 1,
        to: `${draw.path}/devine`,
        dismissKey: `guess:${draw.id}`,
      }),
      ...when(draw.status === 'drawn' && draw.receiverHints === 'new', {
        ...at,
        kind: 'readHints',
        count: 1,
        to: draw.path,
        dismissKey: null,
      }),
      ...when(draw.hintsOn && !draw.hasHints, {
        ...at,
        kind: 'addHints',
        count: 0,
        to: `${draw.path}/pistes`,
        dismissKey: `addHints:${draw.id}`,
      }),
    ];
  });

/**
 * The cards of the account itself: requests to answer, a group to
 * create, a first name to give.
 * @param home - The home of the account.
 * @returns The candidates, in no order.
 */
const accountCandidates = (home: HomeState): Candidate[] => {
  const at = { groupName: null, eventDate: '' };
  return [
    ...when(home.role === 'super_admin' && home.pendingRequests > 0, {
      ...at,
      kind: 'requests',
      count: home.pendingRequests,
      to: '/admin',
      dismissKey: null,
    }),
    ...when(home.canCreateGroup && home.groups.length === 0, {
      ...at,
      kind: 'createGroup',
      count: 0,
      to: '/admin/groupes/nouveau',
      dismissKey: 'createGroup',
    }),
    ...when(!home.firstName, {
      ...at,
      kind: 'completeProfile',
      count: 0,
      to: '/compte',
      dismissKey: 'completeProfile',
    }),
  ];
};

/**
 * The one card on top of the home (README 22.10): every candidate, for
 * every group and every role of the account, ranked; the first one wins.
 * First what blocks others, then what blocks me, then what the date makes
 * urgent, then the next normal step, then what is optional.
 * @param home - The home of the account.
 * @param today - ISO day.
 * @param dismissed - The cards put off with "Plus tard".
 * @returns The card to show, or null.
 */
export const pickHomeAction = (
  home: HomeState,
  today: string,
  dismissed: readonly string[] = [],
): HomeAction | null => {
  const [first] = [
    ...organizerCandidates(home.groups, today),
    ...participantCandidates(home.draws),
    ...accountCandidates(home),
  ]
    .filter((c) => c.dismissKey === null || !dismissed.includes(c.dismissKey))
    .toSorted(byUrgency(today));
  if (!first) return null;
  const { eventDate: _eventDate, ...action } = first;
  return action;
};

/** How the home is laid out. */
export type HomeLayout = 'empty' | 'singleDraw' | 'draws' | 'groups';

/**
 * The draws not closed yet.
 * @param draws - The draws of the account.
 * @returns Those still going on.
 */
export const currentDraws = <D extends HomeDrawState>(
  draws: readonly D[],
): D[] => draws.filter((draw) => draw.status !== 'closed');

/**
 * How the home is laid out: by group as soon as the account organises
 * one, otherwise by its draws going on (none, one, several).
 * @param home - The home of the account.
 * @returns The layout.
 */
export const homeLayout = (
  home: Pick<HomeState, 'draws' | 'groups'>,
): HomeLayout => {
  if (home.groups.length > 0) return 'groups';
  const count = currentDraws(home.draws).length;
  if (count === 0) return 'empty';
  return count === 1 ? 'singleDraw' : 'draws';
};

/** One group on the home, whatever the account's part in it. */
export type GroupCard<D extends HomeDrawState = HomeDrawState> = {
  groupId: string;
  name: string;
  /** Set when the account organises the group. */
  slug: string | null;
  /** The account's own draw in the group, if it takes part. */
  draw: D | null;
  /** The edition going on, if the account organises the group. */
  edition: HomeEditionState | null;
  eventDate: string;
};

/**
 * One card per group, once even when the account both organises it and
 * takes part in it: the groups it organises, and those where it only
 * takes part in a draw going on. By name.
 * @param home - The home of the account.
 * @returns The cards.
 */
export const groupCards = <D extends HomeDrawState>(home: {
  draws: readonly D[];
  groups: readonly HomeGroupState[];
}): GroupCard<D>[] => {
  const draws = currentDraws(home.draws);
  const drawOf = (groupId: string) =>
    draws.find((draw) => draw.groupId === groupId) ?? null;
  const organized = home.groups.map((group): GroupCard<D> => {
    const draw = drawOf(group.id);
    return {
      groupId: group.id,
      name: group.name,
      slug: group.slug,
      draw,
      edition: group.current,
      eventDate: group.current?.eventDate || draw?.eventDate || '',
    };
  });
  const ids = new Set(home.groups.map((group) => group.id));
  const joined = draws
    .filter((draw) => !ids.has(draw.groupId))
    .filter(
      (draw, index, list) =>
        list.findIndex((d) => d.groupId === draw.groupId) === index,
    )
    .map((draw): GroupCard<D> => ({
      groupId: draw.groupId,
      name: draw.groupName,
      slug: null,
      draw,
      edition: null,
      eventDate: draw.eventDate,
    }));
  return [...organized, ...joined].toSorted((a, b) =>
    a.name.localeCompare(b.name),
  );
};

/** The closed draws of one year. */
export type PastYear<T> = { year: number; draws: T[] };

/**
 * The closed draws, grouped by year, the latest year first; within a
 * year, by group name.
 * @param draws - The draws of the account, with their year.
 * @returns One entry per year that has some.
 */
export const pastDrawsByYear = <
  T extends { status: string; year: number; groupName: string },
>(
  draws: readonly T[],
): PastYear<T>[] => {
  const past = draws.filter((draw) => draw.status === 'closed');
  return [...new Set(past.map((draw) => draw.year))]
    .toSorted((a, b) => b - a)
    .map((year) => ({
      year,
      draws: past
        .filter((draw) => draw.year === year)
        .toSorted((a, b) => a.groupName.localeCompare(b.groupName)),
    }));
};
