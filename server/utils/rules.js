import { z } from 'zod';
import { ok, fail } from './result.js';

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
  excludeSpouse: z.boolean(),
  excludePreviousYears: z.number().int().min(0).max(10),
  registrationRequired: z.boolean(),
  budget: z.string().max(200),
  eventDate: z.string().max(100),
  guardianMessage: z.string().max(1000),
  maxPinAttempts: z.number().int().min(1).max(20),
  wishlist: z.boolean(),
  maxWishes: z.number().int().min(1).max(50),
};

const DEFAULTS = {
  excludeSpouse: true,
  excludePreviousYears: 1,
  registrationRequired: true,
  budget: '',
  eventDate: '',
  guardianMessage: '',
  maxPinAttempts: 5,
  wishlist: true,
  maxWishes: 10,
};

export const rulesSchema = z.object(
  Object.fromEntries(
    Object.entries(shape).map(([key, type]) => [
      key,
      type.default(DEFAULTS[key]),
    ]),
  ),
);

/** A partial rule set: only the keys to override. */
export const rulesPatchSchema = z.object(shape).partial();

// Nullable variant for an edition: null means "no override".
export const rulesOverrideSchema = rulesPatchSchema.nullable();

/** @typedef {import('zod').infer<typeof rulesSchema>} Rules */

export const DEFAULT_RULES = Object.freeze(rulesSchema.parse({}));

const dropNullish = (object) =>
  Object.fromEntries(
    Object.entries(object ?? {}).filter(
      ([, value]) => value !== null && value !== undefined,
    ),
  );

/**
 * Effective rules for an edition: defaults, then group rules, then the
 * edition override. Unknown keys are dropped, invalid values rejected.
 * @param {unknown} groupRules
 * @param {unknown} [editionOverride]
 * @returns {import('./result.js').Result<Rules>}
 */
export const mergeRules = (groupRules, editionOverride) => {
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
