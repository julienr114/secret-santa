import type { IdeaView } from '#server/utils/lists';
import type { RemovableClaim } from '#server/utils/claims';

/** One of those who give an idea, as a pill under it. */
export type GiverPill = {
  /** Their first name; null for « Anonyme ». */
  name: string | null;
  /**
   * Their tick, when the one looking may take it off (those who hold
   * the list, and never their own): touching the pill then unfolds
   * « Décocher ».
   */
  claimId: string | null;
};

/** The row of pills under an idea (Corrections 28 and 29). */
export type IdeaChips = {
  /** The others who give it, one pill each; never the one looking. */
  givers: GiverPill[];
  /** « 7 personnes », when too many give it to name them. */
  crowd: number | null;
  /** « Au complet »: a gift given by several that nobody may join. */
  closed: boolean;
  /**
   * My own state, one pill: « Tu l'offres », « Tu l'offres en anonyme »,
   * or « Tu participes ».
   */
  mine: 'alone' | 'anonymous' | 'group' | null;
  /** « Se joindre »: a gift given by several that I may still join. */
  join: boolean;
};

/** Beyond this many others, they are counted instead of named. */
export const NAMED_GIVERS_MAX = 3;

/**
 * What the row of pills under an idea says (maquettes ListeTeneur,
 * ListeDecocher, ListeVisiteurMes, ListePlusieursLigne), in its order:
 * the others who give it, by first name (or how many, beyond three, for
 * who cannot take a tick off: those who can keep one pill each, since
 * each pill unticks its own person), « Au complet », then my own state
 * in one pill, then « Se joindre ». Each named pill finds its own tick
 * among those that may be taken off, by first name, in the order they
 * were ticked. I am never named: my state says it.
 * @param view - What the line says of who gives it.
 * @param claims - The ticks the one looking may take off.
 * @returns The pills of the row.
 */
export const ideaChips = (
  view: IdeaView,
  claims: readonly RemovableClaim[],
): IdeaChips => {
  const none = {
    givers: [],
    crowd: null,
    closed: false,
    mine: null,
    join: false,
  };
  if (view.kind === 'free') return none;
  if (view.kind === 'mine') {
    return { ...none, mine: view.anonymous ? 'anonymous' : 'alone' };
  }
  if (view.kind === 'taken') {
    const claimId = claims[0]?.id ?? null;
    // Who does not hold the list reads no name: the box says « pris ».
    return view.by === null && claimId === null
      ? none
      : { ...none, givers: [{ name: view.by, claimId }] };
  }
  const others = view.people.filter((person) => !person.me);
  const named = claims.length > 0 || others.length <= NAMED_GIVERS_MAX;
  return {
    givers: named
      ? others.reduce<{ pills: GiverPill[]; left: RemovableClaim[] }>(
          (acc, person) => {
            const at = acc.left.findIndex((claim) => claim.by === person.name);
            return {
              pills: [
                ...acc.pills,
                { name: person.name, claimId: acc.left[at]?.id ?? null },
              ],
              left: acc.left.filter((_, index) => index !== at),
            };
          },
          { pills: [], left: [...claims] },
        ).pills
      : [],
    crowd: named ? null : view.people.length,
    closed: view.closed,
    mine: view.mine ? 'group' : null,
    join: !view.closed && !view.mine,
  };
};

/**
 * Several first names as one reads them: « Mamie, Tonton et Hugo ».
 * @param names - The first names.
 * @param and - The word « et », in the language of the screen.
 * @returns The names in one go, empty without any.
 */
export const namesInOne = (names: readonly string[], and: string): string => {
  const last = names.at(-1) ?? '';
  return names.length > 1
    ? `${names.slice(0, -1).join(', ')} ${and} ${last}`
    : last;
};
