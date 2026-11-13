import { eq } from 'drizzle-orm';
import { groups } from '../../../database/schema.js';
import { recordEvent } from '../../../database/audit.js';
import { requireGroupAccess } from '../../../http/auth.js';
import { unwrap } from '../../../http/errors.js';
import { validatedBody } from '../../../http/validate.js';
import { mergeRules, rulesPatchSchema } from '../../../utils/rules.js';

// The group stores its full, validated rule set (defaults applied).
export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const patch = await validatedBody(event, rulesPatchSchema);
  const rules = unwrap(mergeRules(group.rules, patch));
  await db.update(groups).set({ rules }).where(eq(groups.id, group.id));
  await recordEvent(db, {
    type: 'rules_changed',
    groupId: group.id,
    actor: user.role,
  });
  return { rules };
});
