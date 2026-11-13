import { z } from 'zod';
import { ok, fail } from './result.js';

// Draw rules (README section 5). Keys are English in code; the UI shows the
// French labels. Group rules hold the defaults, an edition may override.

export const manualExclusionSchema = z.object({
  giverId: z.string().min(1),
  receiverId: z.string().min(1),
  reciprocal: z.boolean().default(false),
});

export const rulesSchema = z.object({
  excludeSpouse: z.boolean().default(true),
  excludePreviousYears: z.number().int().min(0).max(10).default(1),
  registrationRequired: z.boolean().default(true),
  budget: z.string().max(200).default(''),
  eventDate: z.string().max(100).default(''),
  guardianMessage: z.string().max(1000).default(''),
  maxPinAttempts: z.number().int().min(1).max(20).default(5),
  wishlist: z.boolean().default(true),
  maxWishes: z.number().int().min(1).max(50).default(10),
});

// A partial override: every key optional, nulls mean "no override".
export const rulesOverrideSchema = rulesSchema.partial().nullable();

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
