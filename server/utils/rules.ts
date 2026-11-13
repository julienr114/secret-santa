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
  wishlist: z.boolean(),
  maxWishes: z.number().int().min(1).max(50),
};

export const rulesSchema = z.object({
  excludePreviousYears: shape.excludePreviousYears.default(1),
  budget: shape.budget.default(''),
  eventDate: shape.eventDate.default(''),
  guardianMessage: shape.guardianMessage.default(''),
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
