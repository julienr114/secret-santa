import type { PartyCategory } from './categories';

// « Repartir d'une liste » (docs/spec/v3/listes.md, ticket 119, maquette
// ListeNouvelleReprendre): only the lists I hold that look like the new
// one, three at most, never one with nothing in common. Pure.

/** How many lists the block offers, at most. */
export const RESUME_CHOICES_MAX = 3;

/** An event a list is in: its occasion, or one it is shared in. */
export type ResumeEvent = {
  id: string;
  category: PartyCategory;
  /** A birthday: the person it is for (ticket 118), or null. */
  forMemberId: string | null;
};

/** A list, as the block compares it. */
export type ResumeList = {
  id: string;
  /** The year of its date (Q-020). */
  year: number;
  createdAt: string;
  events: readonly ResumeEvent[];
  /** The people it is made for. */
  memberIds: readonly string[];
};

/**
 * Whether two events are of the same kind: a Christmas for a Christmas;
 * for a birthday, the one of the same person. « Autre » says nothing of
 * an event: two of them are not alike.
 * @param a - An event.
 * @param b - Another.
 * @returns True when alike.
 */
const sameKind = (a: ResumeEvent, b: ResumeEvent) => {
  if (a.category !== b.category || a.category === 'other') return false;
  return (
    a.category !== 'birthday' ||
    (a.forMemberId !== null && a.forMemberId === b.forMemberId)
  );
};

/**
 * How much an old list looks like the new one: 1, the same event another
 * year; 2, an event of the same kind; 3, someone in common; null for
 * nothing in common.
 * @param target - The new list.
 * @param list - An old one.
 * @returns Its rank, or null.
 */
const rankOf = (target: ResumeList, list: ResumeList): number | null => {
  const sameEvent = list.events.some((event) =>
    target.events.some((other) => other.id === event.id),
  );
  if (sameEvent && list.year !== target.year) return 1;
  if (
    list.events.some((event) =>
      target.events.some((other) => sameKind(event, other)),
    )
  ) {
    return 2;
  }
  if (list.memberIds.some((id) => target.memberIds.includes(id))) return 3;
  return null;
};

/**
 * The lists « Repartir d'une liste » offers on a new list, in order: those
 * of the same event another year, then those of an event of the same
 * kind, then those where one of its people figures; the most recent
 * first in each; three at most; none with nothing in common.
 * @param target - The new list.
 * @param lists - The other lists I hold.
 * @returns The ids to offer, in order.
 */
export const resumeChoices = (
  target: ResumeList,
  lists: readonly ResumeList[],
): string[] =>
  lists
    .filter((list) => list.id !== target.id)
    .flatMap((list) => {
      const rank = rankOf(target, list);
      return rank === null ? [] : [{ list, rank }];
    })
    .toSorted(
      (a, b) =>
        a.rank - b.rank ||
        b.list.year - a.list.year ||
        b.list.createdAt.localeCompare(a.list.createdAt),
    )
    .slice(0, RESUME_CHOICES_MAX)
    .map(({ list }) => list.id);
