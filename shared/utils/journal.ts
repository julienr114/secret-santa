// The journal as it is shown (docs/refonte, lot 6): « L'essentiel » leaves
// out the small changes, repeated events of a day become one line that
// unfolds, and the lines are sorted by day. Pure.

/** What the functions need of a journal entry. */
export type JournalLike = {
  type: string;
  createdAt: string;
  editionId: string | null;
  /** The person the event is about. */
  personId?: string | null;
  /** For a message sent: which one, and how. */
  messageType?: string | null;
  via?: string | null;
};

/** Events « L'essentiel » leaves out: a new icon, another language. */
const MINOR = new Set(['avatar_changed', 'language_changed']);

/** Events that come by the handful, folded into one line when repeated. */
export const GROUPED_TYPES = [
  'result_viewed',
  'message_sent',
  'link_copied',
  'link_shared',
  'participant_added',
] as const;
const GROUPED = new Set<string>(GROUPED_TYPES);

/**
 * The entries of « L'essentiel »: all but the changes of icon and of
 * language.
 * @param entries - The journal, in any order.
 * @returns The same entries, in the same order, without the minor ones.
 */
export const essentialEvents = <E extends JournalLike>(entries: E[]): E[] =>
  entries.filter((entry) => !MINOR.has(entry.type));

/** One line of the journal: an event, or several of a kind, newest first. */
export type JournalLine<E> =
  { kind: 'one'; entry: E } | { kind: 'group'; type: string; entries: E[] };

/**
 * The entries about one person.
 * @param entries - The journal, in any order.
 * @param personId - The person; null keeps everyone.
 * @returns The entries about them, in the same order.
 */
export const aboutPerson = <E extends JournalLike>(
  entries: E[],
  personId: string | null,
): E[] =>
  personId === null
    ? entries
    : entries.filter((entry) => entry.personId === personId);

/**
 * Folds the events of a kind that happened the same day, in the same
 * edition, into one line, placed where the newest of them is. Messages
 * sent fold only with the same message sent the same way (« Tirage fait »
 * by email).
 * @param entries - The journal, newest first.
 * @param dayOf - The day of a moment, as the reader counts days.
 * @returns The lines, newest first; a kind seen once stays a single event.
 */
export const groupEvents = <E extends JournalLike>(
  entries: E[],
  dayOf: (iso: string) => string,
): JournalLine<E>[] => {
  const keyOf = (entry: E) =>
    GROUPED.has(entry.type)
      ? [
          dayOf(entry.createdAt),
          entry.editionId ?? '',
          entry.type,
          entry.messageType ?? '',
          entry.via ?? '',
        ].join('|')
      : null;
  const together = (key: string) =>
    entries.filter((entry) => keyOf(entry) === key);
  return entries.flatMap((entry, index): JournalLine<E>[] => {
    const key = keyOf(entry);
    if (key === null) return [{ kind: 'one', entry }];
    const kin = together(key);
    if (kin.length === 1) return [{ kind: 'one', entry }];
    // The line goes where the newest of its events is; the others are in it.
    if (kin[0] !== entries[index]) return [];
    return [{ kind: 'group', type: entry.type, entries: kin }];
  });
};

/**
 * The newest event of a line.
 * @param line - A line of the journal.
 * @returns Its event, or the newest of its events.
 */
export const newestOf = <E>(line: JournalLine<E>): E =>
  line.kind === 'one' ? line.entry : line.entries[0]!;

/** The lines of one day, under its heading. */
export type JournalDay<E> = { day: string; lines: JournalLine<E>[] };

/**
 * Sorts lines into days, keeping their order.
 * @param lines - The lines, newest first.
 * @param dayOf - The day of a moment, as the reader counts days.
 * @returns One entry per day, newest first.
 */
export const journalDays = <E extends JournalLike>(
  lines: JournalLine<E>[],
  dayOf: (iso: string) => string,
): JournalDay<E>[] =>
  lines.reduce<JournalDay<E>[]>((days, line) => {
    const day = dayOf(newestOf(line).createdAt);
    const last = days.at(-1);
    return last?.day === day
      ? [...days.slice(0, -1), { day, lines: [...last.lines, line] }]
      : [...days, { day, lines: [line] }];
  }, []);
