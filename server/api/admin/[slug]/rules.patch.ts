import { eq } from 'drizzle-orm';
import { groups } from '#server/database/schema';
import { recordEvent } from '#server/database/audit';
import { requireGroupAccess } from '#server/http/auth';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { mergeRules, rulesPatchSchema } from '#server/utils/rules';

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
