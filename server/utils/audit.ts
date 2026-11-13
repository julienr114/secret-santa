import { z } from 'zod';
import { ok, fail, type Result } from './result';

// Public journal (README section 9). Events are built here, stored by the
// routes, and described in French for display. Absolute rule: an event
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
  'result_viewed',
  'wishes_updated',
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

// --- French descriptions -------------------------------------------------

const MESSAGE_LABELS: Record<string, string> = {
  invitation: "l'invitation",
  drawn: 'le message « tirage fait »',
  reminder: 'la relance',
  redraw: 'le message « nouveau tirage »',
};

const VIA_LABELS: Record<string, string> = {
  copy: ' (message copié)',
  share: ' (partagé)',
};

const text = (m: Meta, key: string, fallback = '?'): string =>
  typeof m[key] === 'string' || typeof m[key] === 'number'
    ? String(m[key])
    : fallback;
const num = (m: Meta, key: string, fallback: number): number =>
  typeof m[key] === 'number' ? (m[key] as number) : fallback;
const ordinal = (n: number) => (n === 1 ? '1ʳᵉ' : `${n}ᵉ`);
const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;

type Describe = (name: string, meta: Meta) => string;

const DESCRIPTIONS: Record<AuditType, Describe> = {
  edition_created: (_, m) =>
    `L'édition ${text(m, 'label', '')} a été créée`.replace('  ', ' '),
  participant_added: (name) => `${name} rejoint l'édition`,
  participant_removed: (name) => `${name} quitte l'édition`,
  rules_changed: () => 'Le gardien a modifié les règles du tirage',
  message_sent: (name, m) =>
    `Le gardien a envoyé ${MESSAGE_LABELS[text(m, 'messageType', '')] ?? 'un message'} à ${name}${
      VIA_LABELS[text(m, 'via', '')] ?? ''
    }`,
  link_copied: (name) => `Le gardien a copié le lien de ${name}`,
  link_shared: (name) => `Le gardien a partagé le lien de ${name}`,
  link_regenerated: (name) => `Le lien de ${name} a été régénéré`,
  draw_done: (_, m) =>
    `Le tirage a été effectué pour ${plural(num(m, 'count', 0), 'participant')}`,
  draw_cancelled: (_, m) =>
    `Le tirage a été annulé. Motif : ${text(m, 'reason', 'non précisé')}`,
  result_viewed: (name, m) =>
    `${name} a consulté son résultat (${ordinal(num(m, 'count', 1))} fois)`,
  wishes_updated: (name, m) =>
    `${name} a mis à jour sa liste de souhaits (${plural(num(m, 'count', 0), 'idée')})`,
  edition_closed: (_, m) =>
    `L'édition ${text(m, 'label', '')} est clôturée`.replace('  ', ' '),
};

export type DescribableEvent = {
  type: string;
  personId?: string | null;
  meta?: Meta | null;
};

/** French sentence for an event. `names` maps person ids to display names. */
export const describeEvent = (
  event: DescribableEvent,
  { names = {} }: { names?: Record<string, string> } = {},
): string => {
  const describe = (DESCRIPTIONS as Record<string, Describe | undefined>)[
    event.type
  ];
  if (!describe) return 'Événement inconnu';
  const name = (event.personId && names[event.personId]) || "Quelqu'un";
  return describe(name, event.meta ?? {});
};
