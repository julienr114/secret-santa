import { nextOccurrence } from './categories';
import { daysBetween } from './homeParties';

// The years of an event (docs/spec/v3/accueil-et-creation.md, « L'année
// suivante », « Après la date », « Les événements passés »; ticket 108):
// which year the home and the page of the event show, which are over, and
// what « Préparer » and « Reprendre ma liste de l'an dernier » offer.
// Pure.

/** How long an event stays on the home after its date (Q-009). */
export const DAYS_AFTER = {
  /** At most, while one of its Secret Santa is not closed. */
  withSecretSanta: 14,
  /** Without a Secret Santa. */
  without: 3,
} as const;

/** How long before its date « Préparer » is offered: two months. */
export const PREPARE_NOTICE_DAYS = 60;

/** A year of an event, as its timeline needs it. */
export type YearOfParty = {
  year: number;
  /** An ISO day; null while nobody gave it. */
  date: string | null;
  /** The states of its Secret Santa. */
  santas: readonly { status: string }[];
};

/**
 * Whether an event is still on the home for this year: before its date,
 * and after it while its Secret Santa is not closed, 14 days at most; 3
 * days without a Secret Santa. Closed, it leaves the day after.
 * @param year - Its date and the states of its Secret Santa.
 * @param today - « 2026-12-27 ».
 * @returns True while the home keeps it.
 */
export const stillOnHome = (
  year: Pick<YearOfParty, 'date' | 'santas'>,
  today: string,
): boolean => {
  if (!year.date) return true;
  const after = daysBetween(year.date, today);
  if (after <= 0) return true;
  if (year.santas.length === 0) return after <= DAYS_AFTER.without;
  return (
    after <= DAYS_AFTER.withSecretSanta &&
    year.santas.some((santa) => santa.status !== 'closed')
  );
};

/** The year an event is at, and those that are over. */
export type Timeline = {
  /**
   * The year the home and the page of the event show: the latest while
   * the home keeps it, else the next one for an event that comes back;
   * null for an event that is over for good.
   */
  current: { year: number; date: string | null } | null;
  /** The years over, the latest first. */
  past: { year: number; date: string | null }[];
};

/**
 * Where an event is in its years.
 * @param party - Whether it comes back, and its usual day.
 * @param years - Its years, in any order.
 * @param today - « 2027-01-10 ».
 * @returns The current year, and the years over.
 */
export const partyTimeline = (
  party: { recurring: boolean; usualDate: string | null },
  years: readonly YearOfParty[],
  today: string,
): Timeline => {
  const sorted = years.toSorted((a, b) => b.year - a.year);
  const plain = ({ year, date }: YearOfParty) => ({ year, date });
  const latest = sorted[0];
  if (latest && stillOnHome(latest, today)) {
    return { current: plain(latest), past: sorted.slice(1).map(plain) };
  }
  if (party.recurring && party.usualDate) {
    const date = nextOccurrence(party.usualDate, today);
    const year = Number(date.slice(0, 4));
    const made = sorted.find((row) => row.year === year);
    return {
      current: { year, date: made?.date ?? date },
      past: sorted.filter((row) => row.year < year).map(plain),
    };
  }
  if (!latest) {
    return {
      current: { year: Number(today.slice(0, 4)), date: null },
      past: [],
    };
  }
  return { current: null, past: sorted.map(plain) };
};

/**
 * Whether a year of an event is over: before the year it is at, or any
 * year of an event over for good. Nothing changes in a year over.
 * @param timeline - Where the event is.
 * @param year - « 2025 ».
 * @returns True once over.
 */
export const yearIsOver = (timeline: Timeline, year: number): boolean =>
  timeline.current === null || year < timeline.current.year;

/**
 * The year a list belongs to (Q-020): the year of its date, else of its
 * creation. A list made for an event takes the date of its year.
 * @param list - Its date and when it was made.
 * @returns « 2026 ».
 */
export const listYear = (list: {
  eventDate: string | null;
  createdAt: string;
}): number => Number((list.eventDate ?? list.createdAt).slice(0, 4));

/**
 * Whether the home offers to prepare the year to come (V3AccueilAnnee):
 * to an organiser, for an event that comes back, two months before its
 * date, when that year has no Secret Santa yet and the year before had.
 * @param input - My role, the event, its current year, and how many Secret Santa each has.
 * @param today - « 2027-10-25 ».
 * @returns The year to prepare, or null.
 */
export const yearToPrepare = (
  input: {
    organiser: boolean;
    recurring: boolean;
    current: { year: number; date: string | null } | null;
    /** The Secret Santa of the current year. */
    santas: number;
    /** The Secret Santa of the latest year over. */
    santasBefore: number;
  },
  today: string,
): number | null => {
  const { current } = input;
  if (!input.organiser || !input.recurring || !current?.date) return null;
  if (input.santas > 0 || input.santasBefore === 0) return null;
  const days = daysBetween(today, current.date);
  return days >= 0 && days <= PREPARE_NOTICE_DAYS ? current.year : null;
};

/**
 * Whether the home offers to take my list of last year again: for an
 * event that comes back, two months before its date, when I have no list
 * there this year and held one the year before.
 * @param input - The event, its current year, my lists there by year.
 * @param today - « 2027-10-25 ».
 * @returns The list to take again, or null.
 */
export const listToResume = (
  input: {
    recurring: boolean;
    current: { year: number; date: string | null } | null;
    /** The lists I hold in the event, with their year, the latest first. */
    mine: readonly { id: string; year: number }[];
  },
  today: string,
): string | null => {
  const { current } = input;
  if (!input.recurring || !current?.date) return null;
  const days = daysBetween(today, current.date);
  if (days < 0 || days > PREPARE_NOTICE_DAYS) return null;
  if (input.mine.some((list) => list.year >= current.year)) return null;
  return input.mine.find((list) => list.year < current.year)?.id ?? null;
};

/**
 * The name of a Secret Santa prepared for the year after: its year moved
 * on (« Noël 2026 » becomes « Noël 2027 »), a name without it kept (« Les
 * enfants »).
 * @param label - Its name last year.
 * @param from - Last year.
 * @param to - The year prepared.
 * @returns The new name.
 */
export const labelForYear = (label: string, from: number, to: number) =>
  label.replaceAll(String(from), String(to));

/** What I did in a year over, the first case that applies (lignes.md). */
export type PastDeed =
  | { kind: 'gaveTo'; names: string[] }
  | { kind: 'offered'; count: number }
  | { kind: 'received'; count: number }
  | null;

/**
 * What the line of a year over says I did there: whom I gave to (my own
 * result, the only place it is written outside my page), else the gifts
 * I ticked, else the gifts ticked on the lists I held, else nothing.
 * @param input - The first names I drew, my ticks, the ticks on my lists.
 * @returns The case, or null.
 */
export const pastDeed = (input: {
  gaveTo: readonly string[];
  offered: number;
  /** Null when I held no list there. */
  received: number | null;
}): PastDeed => {
  if (input.gaveTo.length > 0)
    return { kind: 'gaveTo', names: [...input.gaveTo] };
  if (input.offered > 0) return { kind: 'offered', count: input.offered };
  if (input.received !== null && input.received > 0) {
    return { kind: 'received', count: input.received };
  }
  return null;
};

/** A line of « Les événements passés ». */
export type PastLine = { year: number; date: string | null; name: string };

/**
 * « Les événements passés », by year, the latest first; within a year,
 * the latest date first. An event that comes back has a line per year.
 * @param lines - One per event and year over.
 * @returns The years and their lines.
 */
export const pastByYear = <T extends PastLine>(
  lines: readonly T[],
): { year: number; lines: T[] }[] => {
  const sorted = lines.toSorted(
    (a, b) =>
      b.year - a.year ||
      (b.date ?? '').localeCompare(a.date ?? '') ||
      a.name.localeCompare(b.name),
  );
  return [...new Set(sorted.map((line) => line.year))].map((year) => ({
    year,
    lines: sorted.filter((line) => line.year === year),
  }));
};

/**
 * What the line « Les événements passés » of the home says (lignes.md):
 * the name of the latest, then how many others; an event that comes back
 * counts once per year over.
 * @param lines - One per event and year over.
 * @returns The latest name and the others' count, or null when none.
 */
export const pastSummary = (
  lines: readonly PastLine[],
): { latest: string; others: number } | null => {
  const [latest] = pastByYear(lines).flatMap((entry) => entry.lines);
  return latest ? { latest: latest.name, others: lines.length - 1 } : null;
};
