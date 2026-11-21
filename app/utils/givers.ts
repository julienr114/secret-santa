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

/**
 * Those the sheet « Qui l'offre ? » shows, in its order (21 November
 * 2026): « Moi », those who give the idea now, then the others as the list
 * offers them, and last the first names written in the sheet, not saved
 * yet. Each once.
 * @param candidates - Who the list offers, « Moi » first.
 * @param giving - The keys of who gives the idea now, the first first.
 * @param written - The first names written in the sheet.
 * @returns The rows.
 */
export const sheetPeople = <C extends { key: string; kind: string }>(
  candidates: readonly C[],
  giving: readonly string[],
  written: readonly C[] = [],
): C[] => {
  const me = candidates.filter((candidate) => candidate.kind === 'me');
  const now = giving.flatMap((key) =>
    candidates.filter(
      (candidate) => candidate.key === key && candidate.kind !== 'me',
    ),
  );
  const rest = candidates.filter(
    (candidate) => candidate.kind !== 'me' && !giving.includes(candidate.key),
  );
  return [...me, ...now, ...rest, ...written];
};

/**
 * Who is chosen once a row is touched: one person, the one touched in
 * place of the one before; several, the one touched in or out.
 * @param chosen - Who is chosen.
 * @param key - The row touched.
 * @param mode - One person, or several.
 * @returns Who is chosen after.
 */
export const touchGiver = (
  chosen: readonly string[],
  key: string,
  mode: 'alone' | 'group',
): string[] => {
  if (mode === 'alone') return [key];
  return chosen.includes(key)
    ? chosen.filter((other) => other !== key)
    : [...chosen, key];
};

/**
 * Who stays chosen when « Une personne » is chosen again: the first of
 * them, as the rows show them.
 * @param chosen - Who is chosen.
 * @param rows - The keys of the rows, in their order.
 * @returns At most one.
 */
export const firstChosen = (
  chosen: readonly string[],
  rows: readonly string[],
): string[] => {
  const first = rows.find((key) => chosen.includes(key));
  return first ? [first] : [];
};

/**
 * When a tick was made, as its trace says it: today, or its day.
 * @param at - When (ISO).
 * @param today - Today (YYYY-MM-DD, UTC like `at`).
 * @returns `today`, or the day (YYYY-MM-DD).
 */
export const traceDay = (at: string, today: string): string | 'today' => {
  const day = at.slice(0, 10);
  return day === today ? 'today' : day;
};
