import { z } from 'zod';
import { ok, fail, type Result } from './result';
import { displayName } from './people';
import {
  DEFAULT_LOCALE,
  hasMessage,
  translateKey,
  type Locale,
} from '#shared/i18n';

// Public journal (README section 9). Events are built here, stored by the
// routes, and described in the reader's language for display. Absolute rule: an event
// never says who drew whom, so meta is scrubbed of anything result-like.

export const AUDIT_TYPES = [
  'edition_created',
  'participant_added',
  'participant_removed',
  'rules_changed',
  'message_sent',
  'link_copied',
  'link_shared',
  'link_regenerated',
  'draw_done',
  'draw_cancelled',
  'results_revealed',
  'result_revealed',
  'result_viewed',
  'avatar_changed',
  'language_changed',
  'edition_closed',
  'draw_revealed',
  // A draw made elsewhere (README 22.12): never what anyone answered.
  'answers_started',
  'answer_given',
  'answer_changed',
  'answers_validated',
  'answers_abandoned',
  // « Devine qui » (README 22.17): never a guess.
  'guesses_enabled',
  'guesses_closed',
  'guess_results_ready',
  'guess_reminder_sent',
  'guess_auto_reminder_sent',
] as const;
export type AuditType = (typeof AUDIT_TYPES)[number];

export const ACTORS = [
  'participant',
  'guardian',
  'super_admin',
  'system',
] as const;
export type Actor = (typeof ACTORS)[number];

export type Meta = Record<string, unknown>;

const FORBIDDEN_META_KEY =
  /receiver|assignment|result|pin|token|hash|secret|password/i;

/** Drops, at any depth, keys that could carry a result or a secret. */
export const sanitizeMeta = (meta: unknown): unknown => {
  if (Array.isArray(meta)) return meta.map(sanitizeMeta);
  if (meta === null || typeof meta !== 'object') return meta;
  return Object.fromEntries(
    Object.entries(meta as Meta)
      .filter(([key]) => !FORBIDDEN_META_KEY.test(key))
      .map(([key, value]) => [key, sanitizeMeta(value)]),
  );
};

const eventSchema = z.object({
  type: z.enum(AUDIT_TYPES),
  groupId: z.string().min(1),
  editionId: z.string().min(1).nullable().default(null),
  personId: z.string().min(1).nullable().default(null),
  actor: z.enum(ACTORS),
  meta: z.record(z.string(), z.unknown()).nullable().default(null),
});

export type AuditEventInput = z.input<typeof eventSchema>;

export type AuditRow = {
  id: string;
  type: AuditType;
  groupId: string;
  editionId: string | null;
  personId: string | null;
  actor: Actor;
  meta: Meta | null;
  createdAt: string;
};

/** Builds an audit_log row. `id` and `now` are injected for testability. */
export const auditEvent = (
  event: AuditEventInput,
  { id, now }: { id: () => string; now: () => string },
): Result<AuditRow> => {
  const parsed = eventSchema.safeParse(event);
  if (!parsed.success) {
    return fail('invalid_audit_event', {
      issues: parsed.error.issues.map((i) => i.path.join('.')),
    });
  }
  const { meta, ...rest } = parsed.data;
  return ok({
    id: id(),
    ...rest,
    meta: meta ? (sanitizeMeta(meta) as Meta) : null,
    createdAt: now(),
  });
};

// --- Descriptions, in the reader's language ------------------------------

const text = (m: Meta, key: string, fallback: string): string =>
  typeof m[key] === 'string' || typeof m[key] === 'number'
    ? String(m[key])
    : fallback;
const num = (m: Meta, key: string, fallback: number): number =>
  typeof m[key] === 'number' ? (m[key] as number) : fallback;

const keyOrFallback = (key: string, fallback: string): string =>
  hasMessage(key) ? key : fallback;

export type DescribableEvent = {
  type: string;
  personId?: string | null;
  meta?: Meta | null;
};

/**
 * One sentence for an event, in `locale` (French by default). `names` maps
 * person ids to display names; `own` tells it to the person it is about
 * (« Tu as découvert ton résultat »), for the events that have such a
 * sentence.
 */
export const describeEvent = (
  event: DescribableEvent,
  {
    names = {},
    locale = DEFAULT_LOCALE,
    own = false,
    senders = {},
  }: {
    names?: Record<string, string>;
    locale?: Locale;
    own?: boolean;
    /**
     * The first names of the organisers by account, when the event has
     * more than one (ticket 170): a sending says who made it.
     */
    senders?: Record<string, string>;
  } = {},
): string => {
  const meta = event.meta ?? {};
  const sender = senders[text(meta, 'by', '')] ?? null;
  const key = keyOrFallback(
    own ? `journal.own.${event.type}` : '',
    keyOrFallback(
      sender ? `journal.by.${event.type}` : '',
      `journal.events.${event.type}`,
    ),
  );
  if (!hasMessage(key)) return translateKey(locale, 'journal.unknown');
  const t = (k: string) => translateKey(locale, k);
  return translateKey(locale, key, {
    sender: sender ?? '',
    name: (event.personId && names[event.personId]) || t('journal.someone'),
    label: text(meta, 'label', ''),
    reason: text(meta, 'reason', t('journal.noReason')),
    count: num(meta, 'count', 0),
    what: t(
      keyOrFallback(
        `journal.what.${text(meta, 'messageType', '')}`,
        'journal.what.other',
      ),
    ),
    language: hasMessage(`common.language.${text(meta, 'language', '')}`)
      ? t(`common.language.${text(meta, 'language', '')}`)
      : '',
    via: hasMessage(`journal.via.${text(meta, 'via', '')}`)
      ? t(`journal.via.${text(meta, 'via', '')}`)
      : '',
    // An edition without a label must not leave a double space.
  }).replace('  ', ' ');
};

// --- Journal as displayed -------------------------------------------------

export type JournalPerson = {
  id: string;
  firstName: string;
  lastName?: string | null;
};
/**
 * Types no longer written nor shown: `wishes_updated`, since the gift
 * hints (README 22.11), whose old lines stay in the table.
 */
export const RETIRED_TYPES: readonly string[] = ['wishes_updated'];

export type JournalRow = DescribableEvent & {
  id: string;
  editionId?: string | null;
  actor: string;
  createdAt: string;
};
export type JournalEntry = {
  id: string;
  type: string;
  editionId: string | null;
  actor: string;
  createdAt: string;
  text: string;
  /** The person the event is about, if any. */
  personId: string | null;
  /** For a message sent: which one, and how (`email`, `copy`, `share`). */
  messageType: string | null;
  via: string | null;
  /** The sentence told to the reader, when the event is about them. */
  ownText: string | null;
};

/** Words of a meta that may be shown: the kind of message, and how. */
const metaWord = (meta: Meta | null | undefined, key: string) =>
  typeof meta?.[key] === 'string' ? (meta[key] as string) : null;

/** A journal whose people are known by keys. */
export type KeyedJournal<P extends { id: string }> = {
  entries: JournalEntry[];
  people: P[];
  me: string | null;
};

/**
 * Replaces the ids of the people by keys that only hold within this
 * answer (`p0`, `p1`…), for a participant: no answer of theirs carries
 * another person's id (README 8.3), yet the filter and the folded lines
 * still match a line with its person.
 * @param journal - The entries, the people they name, and the reader.
 * @returns The same journal, keyed.
 */
export const keyPeople = <P extends { id: string }>(
  journal: KeyedJournal<P>,
): KeyedJournal<P> => {
  const keys = new Map(journal.people.map((p, i) => [p.id, `p${i}`]));
  const keyOf = (id: string | null) =>
    id === null ? null : (keys.get(id) ?? null);
  return {
    entries: journal.entries.map((entry) => ({
      ...entry,
      personId: keyOf(entry.personId),
    })),
    people: journal.people.map((p) => ({ ...p, id: keyOf(p.id)! })),
    me: keyOf(journal.me),
  };
};

/**
 * Journal rows as shown to the group: one sentence each in `locale`,
 * newest first. People appear by first name, with the last name only to tell
 * homonyms apart (README 20). Of the meta, only the kind of a message sent
 * and how it went are passed on. `me`, the reader when they are a
 * participant, gets the events about them told in the second person too.
 */
export const journalEntries = (
  rows: JournalRow[],
  people: JournalPerson[],
  locale: Locale = DEFAULT_LOCALE,
  me: string | null = null,
  senders: Record<string, string> = {},
): JournalEntry[] => {
  const names = Object.fromEntries(
    people.map((person) => [person.id, displayName(person, people)]),
  );
  return rows
    .filter((row) => !RETIRED_TYPES.includes(row.type))
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((row) => ({
      id: row.id,
      type: row.type,
      editionId: row.editionId ?? null,
      actor: row.actor,
      createdAt: row.createdAt,
      text: describeEvent(row, { names, locale, senders }),
      personId: row.personId ?? null,
      messageType: metaWord(row.meta, 'messageType'),
      via: metaWord(row.meta, 'via'),
      ownText:
        me !== null && row.personId === me
          ? describeEvent(row, { names, locale, own: true })
          : null,
    }));
};

// --- Alerts since the last visit (lot 12, README 22.15) -------------------

/**
 * What every participant is told about on their page (README 22.15): a
 * result looked at, the results revealed before the party, a cancelled
 * draw; their own renewed link is told to them only.
 */
const GROUP_ALERTS = new Set<string>([
  'result_revealed',
  'results_revealed',
  'draw_cancelled',
]);

/** The kinds of event the participant is told about, as stored. */
export const ALERT_TYPES = [...GROUP_ALERTS, 'link_regenerated'];

/** An event of the journal, as the alerts need it. */
export type AlertRow = {
  id: string;
  type: string;
  personId: string | null;
  createdAt: string;
};

/**
 * The alerts of the journal a participant has not seen since they last
 * opened it: an access to a result, the results revealed before the
 * party, a cancelled draw, and the renewal of their own link.
 * @param rows - Events of the group.
 * @param me - The participant's person.
 * @param since - When they last opened the journal (never: the edition's creation).
 * @returns Those alerts, newest first.
 */
export const unseenAlertRows = <R extends AlertRow>(
  rows: R[],
  me: string,
  since: string,
): R[] =>
  rows
    .filter(
      (row) =>
        row.createdAt > since &&
        (GROUP_ALERTS.has(row.type) ||
          (row.type === 'link_regenerated' && row.personId === me)),
    )
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));

/**
 * How many alerts of the journal a participant has not seen.
 * @param rows - Events of the group.
 * @param me - The participant's person.
 * @param since - When they last opened the journal (never: the edition's creation).
 * @returns The number of alerts after `since`.
 */
export const unseenAlerts = (rows: AlertRow[], me: string, since: string) =>
  unseenAlertRows(rows, me, since).length;

/** What the home says of a draw's journal (README 22.15, lot 14). */
export type JournalSignal = {
  count: number;
  /** The alert, when there is only one: its kind, day and line. */
  alert: { id: string; type: string; createdAt: string } | null;
};

/**
 * The signal of a draw's journal on the home: how many alerts wait, and
 * which one when it is alone.
 * @param rows - Events of the group.
 * @param me - The participant's person.
 * @param since - When they last opened the journal (never: the edition's creation).
 * @returns The signal, or null when nothing waits.
 */
export const journalSignal = (
  rows: AlertRow[],
  me: string,
  since: string,
): JournalSignal | null => {
  const unseen = unseenAlertRows(rows, me, since);
  if (unseen.length === 0) return null;
  const [only] = unseen;
  return {
    count: unseen.length,
    alert:
      unseen.length === 1 && only
        ? { id: only.id, type: only.type, createdAt: only.createdAt }
        : null,
  };
};
