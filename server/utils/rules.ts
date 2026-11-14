import { z } from 'zod';
import { ok, fail, type Result } from './result';

// Draw rules (README section 5). Keys are English in code; the UI shows the
// French labels. Group rules hold the defaults, an edition may override.

export const manualExclusionSchema = z.object({
  giverId: z.string().min(1),
  receiverId: z.string().min(1),
  reciprocal: z.boolean().default(false),
});

// Raw shape without defaults: for partial overrides, only the given keys
// survive. `rulesSchema` adds the defaults for a complete rule set.
const shape = {
  excludePreviousYears: z.number().int().min(0).max(10),
  budget: z.string().max(200),
  eventDate: z.string().max(100),
  guardianMessage: z.string().max(1000),
  // Words the organiser adds to the messages sent to participants.
  messageNote: z.string().max(500),
  // Above or below the standard message.
  messageNotePosition: z.enum(['before', 'after']),
  wishlist: z.boolean(),
  maxWishes: z.number().int().min(1).max(50),
};

export const rulesSchema = z.object({
  excludePreviousYears: shape.excludePreviousYears.default(1),
  budget: shape.budget.default(''),
  eventDate: shape.eventDate.default(''),
  guardianMessage: shape.guardianMessage.default(''),
  messageNote: shape.messageNote.default(''),
  messageNotePosition: shape.messageNotePosition.default('after'),
  wishlist: shape.wishlist.default(true),
  maxWishes: shape.maxWishes.default(10),
});

/** A partial rule set: only the keys to override. */
export const rulesPatchSchema = z.object(shape).partial();

// Nullable variant for an edition: null means "no override".
export const rulesOverrideSchema = rulesPatchSchema.nullable();

export type Rules = z.infer<typeof rulesSchema>;
export type RulesPatch = z.infer<typeof rulesPatchSchema>;

export const DEFAULT_RULES: Readonly<Rules> = Object.freeze(
  rulesSchema.parse({}),
);

const dropNullish = (object: unknown): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries((object ?? {}) as Record<string, unknown>).filter(
      ([, value]) => value !== null && value !== undefined,
    ),
  );

/**
 * Effective rules for an edition: defaults, then group rules, then the
 * edition override. Unknown keys are dropped, invalid values rejected.
 */
export const mergeRules = (
  groupRules: unknown,
  editionOverride?: unknown,
): Result<Rules> => {
  const parsed = rulesSchema.safeParse({
    ...DEFAULT_RULES,
    ...dropNullish(groupRules),
    ...dropNullish(editionOverride),
  });
  return parsed.success
    ? ok(parsed.data)
    : fail('invalid_rules', {
        issues: parsed.error.issues.map((i) => i.path.join('.')),
      });
};

// --- Date of the party ----------------------------------------------------
// Stored in `eventDate`. Entered with a date picker since plan v7, so it is
// an ISO day ("2026-12-24"); older values are free text ("24 décembre")
// and are shown as they are.

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export const isIsoDay = (value: string | null | undefined): value is string =>
  typeof value === 'string' &&
  ISO_DAY.test(value) &&
  !Number.isNaN(Date.parse(`${value}T12:00:00Z`));

/** "24 décembre", "December 24", "24. Dezember"; free text is kept as is. */
export const formatEventDate = (
  value: string | null | undefined,
  locale: string,
): string =>
  isIsoDay(value)
    ? new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
      }).format(new Date(`${value}T12:00:00Z`))
    : (value ?? '');

/**
 * Whether the party is over on `today` (an ISO day). Unknown when there is
 * no date or a free-text one: then nothing says it is too early.
 */
export const partyIsOver = (
  eventDate: string | null | undefined,
  today: string,
): boolean => !isIsoDay(eventDate) || today > eventDate;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How many days are left before the party.
 * @param eventDate - The date of the party.
 * @param today - ISO day.
 * @returns 0 on the day, a positive count before it; null when the party
 *   is over or has no ISO date.
 */
export const daysUntil = (
  eventDate: string | null | undefined,
  today: string,
): number | null => {
  if (!isIsoDay(eventDate) || !isIsoDay(today) || today > eventDate) {
    return null;
  }
  return Math.round((Date.parse(eventDate) - Date.parse(today)) / DAY_MS);
};
