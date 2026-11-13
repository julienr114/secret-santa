import { z } from 'zod';
import { rulesOverrideSchema } from './rules.js';

// Editions of a group (README 4.1). Pure helpers; the routes do the I/O.

export const EDITION_STATUSES = ['draft', 'invitations', 'drawn', 'closed'];

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

/** Sensible defaults for the "new edition" form. */
export const nextEditionDefaults = (editions, now) => {
  const thisYear = new Date(now).getUTCFullYear();
  const latest = Math.max(thisYear - 1, ...editions.map((e) => e.year));
  const year = editions.some((e) => e.year === thisYear)
    ? latest + 1
    : thisYear;
  return { label: `Noël ${year}`, year };
};

/** The edition the guardian is working on: the most recent one not closed. */
export const currentEdition = (editions) =>
  editions
    .filter((e) => e.status !== 'closed')
    .toSorted(
      (a, b) => b.year - a.year || b.createdAt.localeCompare(a.createdAt),
    )[0] ?? null;

/** The edition whose participants a new one starts from. */
export const previousEdition = (editions, year) =>
  editions
    .filter((e) => e.year < year || (e.year === year && e.status === 'closed'))
    .toSorted(
      (a, b) => b.year - a.year || b.createdAt.localeCompare(a.createdAt),
    )[0] ?? null;

/** Status badges for a participant card (README section 11). */
export const participantBadges = ({
  messageSentAt,
  viewCount,
  hasPin,
  pinLocked,
  wishesCount,
}) =>
  [
    messageSentAt && 'sent',
    hasPin && 'pin_set',
    wishesCount > 0 && 'wishes',
    viewCount > 0 && 'viewed',
    pinLocked && 'locked',
  ].filter(Boolean);
