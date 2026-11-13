import { z } from 'zod';
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
