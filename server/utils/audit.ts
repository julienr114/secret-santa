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
  'wishes_updated',
  'avatar_changed',
  'language_changed',
  'edition_closed',
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
 * person ids to display names.
 */
export const describeEvent = (
  event: DescribableEvent,
  {
    names = {},
    locale = DEFAULT_LOCALE,
  }: { names?: Record<string, string>; locale?: Locale } = {},
): string => {
  const key = `journal.events.${event.type}`;
  if (!hasMessage(key)) return translateKey(locale, 'journal.unknown');
  const meta = event.meta ?? {};
  const t = (k: string) => translateKey(locale, k);
  return translateKey(locale, key, {
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
};

/**
 * Journal rows as shown to the group: one sentence each in `locale`,
 * newest first. People appear by first name, with the last name only to tell
 * homonyms apart (README 20). Meta is not passed on.
 */
export const journalEntries = (
  rows: JournalRow[],
  people: JournalPerson[],
  locale: Locale = DEFAULT_LOCALE,
): JournalEntry[] => {
  const names = Object.fromEntries(
    people.map((person) => [person.id, displayName(person, people)]),
  );
  return rows
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((row) => ({
      id: row.id,
      type: row.type,
      editionId: row.editionId ?? null,
      actor: row.actor,
      createdAt: row.createdAt,
      text: describeEvent(row, { names, locale }),
    }));
};
