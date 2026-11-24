import type { PartyCategory } from './categories';

// « Quelle liste pour ton Secret Santa ? » (docs/spec/v3/listes.md,
// « Depuis mon Secret Santa », ticket 136, maquette V3TirageQuelleListe):
// the lists I hold this year where I figure, the one chosen beforehand
// first. Pure.

/** The Secret Santa's event, as the choice compares the lists with it. */
export type DrawEvent = { id: string; category: PartyCategory };

/** A list I could give to the one who draws me. */
export type DrawListCandidate = {
  id: string;
  /** Its events: its occasion, and those it is shared in. */
  events: readonly DrawEvent[];
  /** When it was last changed. */
  updatedAt: string;
};

/**
 * How near a list is to the Secret Santa's event: 0 for the same event,
 * 1 for an event of the same category, 2 otherwise.
 * @param event - The Secret Santa's event.
 * @param list - A list.
 * @returns Its rank.
 */
const rankOf = (event: DrawEvent, list: DrawListCandidate): number => {
  if (list.events.some((one) => one.id === event.id)) return 0;
  if (list.events.some((one) => one.category === event.category)) return 1;
  return 2;
};

/**
 * The lists in the order the sheet shows them: the one chosen beforehand
 * first (the same event, else the same category, else the most recent),
 * then the others by the same rule.
 * @param event - The Secret Santa's event.
 * @param lists - My lists of this year where I figure.
 * @returns Their ids, in order; the first is chosen beforehand.
 */
export const drawListOrder = (
  event: DrawEvent,
  lists: readonly DrawListCandidate[],
): string[] =>
  lists
    .toSorted(
      (a, b) =>
        rankOf(event, a) - rankOf(event, b) ||
        b.updatedAt.localeCompare(a.updatedAt),
    )
    .map((list) => list.id);
