import { z } from 'zod';
import { ok, fail, type Result } from './result';
import { rulesOverrideSchema } from './rules';

// Editions of a group (README 4.1). Pure helpers; the routes do the I/O.

export const EDITION_STATUSES = [
  'draft',
  'invitations',
  'drawn',
  'closed',
] as const;
export type EditionStatus = (typeof EDITION_STATUSES)[number];

export const editionInputSchema = z.object({
  label: z.string().trim().min(1).max(60),
  year: z.number().int().min(2000).max(2100),
});

export const editionPatchSchema = z
  .object({
    label: z.string().trim().min(1).max(60),
    rulesOverride: rulesOverrideSchema,
  })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, 'nothing to update');

export type EditionLike = { year: number; status: string; createdAt: string };

/** Sensible defaults for the "new edition" form. */
export const nextEditionDefaults = (editions: EditionLike[], now: string) => {
  const thisYear = new Date(now).getUTCFullYear();
  const latest = Math.max(thisYear - 1, ...editions.map((e) => e.year));
  const year = editions.some((e) => e.year === thisYear)
    ? latest + 1
    : thisYear;
  return { label: `Noël ${year}`, year };
};

const newestFirst = <E extends EditionLike>(a: E, b: E) =>
  b.year - a.year || b.createdAt.localeCompare(a.createdAt);

/** The edition the guardian is working on: the most recent one not closed. */
export const currentEdition = <E extends EditionLike>(
  editions: E[],
): E | null =>
  editions.filter((e) => e.status !== 'closed').toSorted(newestFirst)[0] ??
  null;

/** The edition whose participants a new one starts from. */
export const previousEdition = <E extends EditionLike>(
  editions: E[],
  year: number,
): E | null =>
  editions
    .filter((e) => e.year < year || (e.year === year && e.status === 'closed'))
    .toSorted(newestFirst)[0] ?? null;

export type ParticipantStatus = {
  messageSentAt?: string | null;
  viewCount: number;
  hasPin: boolean;
  pinLocked?: boolean;
  wishesCount: number;
};

export const BADGES = [
  'sent',
  'pin_set',
  'wishes',
  'viewed',
  'locked',
] as const;
export type Badge = (typeof BADGES)[number];

/** Status badges for a participant card (README section 11). */
export const participantBadges = ({
  messageSentAt,
  viewCount,
  hasPin,
  pinLocked,
  wishesCount,
}: ParticipantStatus): Badge[] =>
  [
    messageSentAt ? 'sent' : null,
    hasPin ? 'pin_set' : null,
    wishesCount > 0 ? 'wishes' : null,
    viewCount > 0 ? 'viewed' : null,
    pinLocked ? 'locked' : null,
  ].filter((b): b is Badge => b !== null);

// --- Lifecycle (README 4.1) ---------------------------------------------

export const EDITION_ACTIONS = [
  'open',
  'draw',
  'cancel_draw',
  'close',
] as const;
export type EditionAction = (typeof EDITION_ACTIONS)[number];

const TRANSITIONS: Record<
  EditionAction,
  { from: EditionStatus; to: EditionStatus }
> = {
  open: { from: 'draft', to: 'invitations' },
  draw: { from: 'invitations', to: 'drawn' },
  cancel_draw: { from: 'drawn', to: 'invitations' },
  close: { from: 'drawn', to: 'closed' },
};

/** The status an action leads to, or why it is not allowed now. */
export const nextStatus = (
  status: EditionStatus,
  action: EditionAction,
): Result<EditionStatus> => {
  const transition = TRANSITIONS[action];
  return transition.from === status
    ? ok(transition.to)
    : fail('invalid_transition', { status, action, expected: transition.from });
};

/** The participant list can change until the draw (README 4.1). */
export const canEditParticipants = (status: EditionStatus): boolean =>
  status === 'draft' || status === 'invitations';

/** Links are sent once invitations are open, and until the edition is closed. */
export const canSendLinks = (status: EditionStatus): boolean =>
  status === 'invitations' || status === 'drawn';

// --- History for the "previous years" exclusion (README 6.1) ------------

export type PastEdition = {
  id: string;
  year: number;
  status: string;
  createdAt: string;
};
export type PastAssignment = {
  editionId: string;
  giverId: string;
  receiverId: string;
};

/** The N most recent drawn or closed editions, other than the current one. */
export const historyEditions = <E extends PastEdition>(
  editions: E[],
  currentId: string,
  years: number,
): E[] =>
  editions
    .filter(
      (e) =>
        e.id !== currentId && (e.status === 'drawn' || e.status === 'closed'),
    )
    .toSorted(
      (a, b) => b.year - a.year || b.createdAt.localeCompare(a.createdAt),
    )
    .slice(0, Math.max(0, years));

/**
 * giverId -> receivers they had in the given editions. A giver absent from
 * an edition has no assignment there, so that year adds no exclusion.
 */
export const buildHistory = (
  assignments: PastAssignment[],
  editionIds: string[],
): Record<string, string[]> =>
  assignments
    .filter((a) => editionIds.includes(a.editionId))
    .reduce<Record<string, string[]>>(
      (acc, a) => ({
        ...acc,
        [a.giverId]: [...new Set([...(acc[a.giverId] ?? []), a.receiverId])],
      }),
      {},
    );

/** Who still has to choose a code, when the rule requires it (README 5). */
export const missingPins = <P extends { id: string; hasPin: boolean }>(
  participants: P[],
): P[] => participants.filter((p) => !p.hasPin);
