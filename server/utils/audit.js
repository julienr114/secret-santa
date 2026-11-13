import { z } from 'zod';
import { ok, fail } from './result.js';

// Public journal (README section 9). Events are built here, stored by the
// routes, and described in French for display. Absolute rule: an event
// never says who drew whom, so meta is scrubbed of anything result-like.

export const AUDIT_TYPES = [
  'edition_created',
  'participant_added',
  'participant_removed',
  'couple_changed',
  'rules_changed',
  'message_sent',
  'link_copied',
  'link_shared',
  'link_regenerated',
  'pin_set',
  'pin_failed',
  'pin_locked',
  'pin_unlocked',
  'pin_reset',
  'draw_done',
  'draw_cancelled',
  'result_viewed',
  'wishes_updated',
  'edition_closed',
];

export const ACTORS = ['participant', 'guardian', 'super_admin', 'system'];

const FORBIDDEN_META_KEY =
  /receiver|assignment|result|pin|token|hash|secret|password/i;

/** Drops, at any depth, keys that could carry a result or a secret. */
export const sanitizeMeta = (meta) => {
  if (Array.isArray(meta)) return meta.map(sanitizeMeta);
  if (meta === null || typeof meta !== 'object') return meta;
  return Object.fromEntries(
    Object.entries(meta)
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

/**
 * Builds an audit_log row. `id` and `now` are injected for testability.
 * @param {object} event
 * @param {{ id: () => string, now: () => string }} deps
 */
export const auditEvent = (event, { id, now }) => {
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
    meta: meta ? sanitizeMeta(meta) : null,
    createdAt: now(),
  });
};

// --- French descriptions -------------------------------------------------

const MESSAGE_LABELS = {
  invitation: "l'invitation",
  drawn: 'le message « tirage fait »',
  reminder: 'la relance',
  redraw: 'le message « nouveau tirage »',
};

const VIA_LABELS = {
  whatsapp: ' sur WhatsApp',
  copy: ' (message copié)',
  share: ' (lien partagé)',
};

const ordinal = (n) => (n === 1 ? '1ʳᵉ' : `${n}ᵉ`);
const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

const DESCRIPTIONS = {
  edition_created: (_, m) => `L'édition ${m.label ?? ''} a été créée`.trim(),
  participant_added: (name) => `${name} rejoint l'édition`,
  participant_removed: (name) => `${name} quitte l'édition`,
  couple_changed: (name, m) =>
    m.ended
      ? `Le couple ${name} + ${m.partnerName ?? '?'} n'est plus enregistré`
      : `Le couple ${name} + ${m.partnerName ?? '?'} a été enregistré`,
  rules_changed: () => 'Le gardien a modifié les règles du tirage',
  message_sent: (name, m) =>
    `Le gardien a envoyé ${MESSAGE_LABELS[m.messageType] ?? 'un message'} à ${name}${VIA_LABELS[m.via] ?? ''}`,
  link_copied: (name) => `Le gardien a copié le lien de ${name}`,
  link_shared: (name) => `Le gardien a partagé le lien de ${name}`,
  link_regenerated: (name) => `Le lien de ${name} a été régénéré`,
  pin_set: (name) => `${name} a choisi son code`,
  pin_failed: (name, m) =>
    `Code erroné sur le lien de ${name} (${m.attempts ?? '?'}/${m.max ?? '?'})`,
  pin_locked: (name, m) =>
    `Le lien de ${name} est bloqué après ${m.max ?? '?'} erreurs`,
  pin_unlocked: (name) => `Le gardien a débloqué le lien de ${name}`,
  pin_reset: (name) => `Le gardien a réinitialisé le code de ${name}`,
  draw_done: (_, m) =>
    `Le tirage a été effectué pour ${plural(m.count ?? 0, 'participant')}`,
  draw_cancelled: (_, m) =>
    `Le tirage a été annulé. Motif : ${m.reason ?? 'non précisé'}`,
  result_viewed: (name, m) =>
    `${name} a consulté son résultat (${ordinal(m.count ?? 1)} fois)`,
  wishes_updated: (name, m) =>
    `${name} a mis à jour sa liste de souhaits (${plural(m.count ?? 0, 'idée')})`,
  edition_closed: (_, m) => `L'édition ${m.label ?? ''} est clôturée`.trim(),
};

/**
 * French sentence for an event. `names` maps person ids to display names.
 * @param {{ type: string, personId?: string | null, meta?: object | null }} event
 * @param {{ names?: Record<string, string> }} context
 */
export const describeEvent = (event, { names = {} } = {}) => {
  const describe = DESCRIPTIONS[event.type];
  if (!describe) return 'Événement inconnu';
  const name = (event.personId && names[event.personId]) || "Quelqu'un";
  return describe(name, event.meta ?? {});
};
