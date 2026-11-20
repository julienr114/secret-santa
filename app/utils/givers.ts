import type { IdeaView } from '#server/utils/lists';

/** One of those who give an idea, as a pill under it: information only. */
export type GiverPill = {
  /** Their first name; null for « Anonyme ». */
  name: string | null;
};

/** The row of pills under an idea (Corrections 28, 29 and 30). */
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
 * ListeDecocherCase, ListeVisiteurMes, ListePlusieursLigne), in its
 * order: the others who give it, by first name (how many, beyond three),
 * « Au complet », then my own state in one pill, then « Se joindre ». The
 * pills of the others are never touched (Correction 30): their box
 * unticks. I am never named: my state says it.
 * @param view - What the line says of who gives it.
 * @param seesWho - Whether the one looking is told who ticked (those who
 *   hold the list): a tick without a name then reads « Anonyme ».
 * @returns The pills of the row.
 */
export const ideaChips = (view: IdeaView, seesWho = false): IdeaChips => {
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
    // Who does not hold the list reads no name: the box says « pris ».
    return view.by === null && !seesWho
      ? none
      : { ...none, givers: [{ name: view.by }] };
  }
  const others = view.people.filter((person) => !person.me);
  const named = others.length <= NAMED_GIVERS_MAX;
  return {
    givers: named ? others.map((person) => ({ name: person.name })) : [],
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
