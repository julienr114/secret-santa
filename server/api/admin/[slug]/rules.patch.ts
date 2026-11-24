import { eq } from 'drizzle-orm';
import { parties, secretSantas } from '#server/database/schema';
import { recordEvent } from '#server/database/audit';
import { requireGroupAccess } from '#server/http/auth';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { mergeRules, rulesPatchSchema } from '#server/utils/rules';

// The group stores its full, validated rule set (defaults applied): the
// starting values of its next Secret Santa. Each Secret Santa now holds
// its own rules (ticket 101); until its settings have their own screen,
// a change here goes into each of them too, as it did before through the
// group. This screen and the edition's touch different rules.
export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const patch = await validatedBody(event, rulesPatchSchema);
  const rules = unwrap(mergeRules(group.rules, patch));
  const santas = await db
    .select({ id: secretSantas.id, rules: secretSantas.rules })
    .from(secretSantas)
    .where(eq(secretSantas.partyId, group.id));
  await db.batch([
    db.update(parties).set({ rules }).where(eq(parties.id, group.id)),
    // One statement per Secret Santa: each keeps its other rules.
    ...santas.map((santa) =>
      db
        .update(secretSantas)
        .set({ rules: unwrap(mergeRules(santa.rules, patch)) })
        .where(eq(secretSantas.id, santa.id)),
    ),
  ]);
  await recordEvent(db, {
    type: 'rules_changed',
    groupId: group.id,
    actor: user.role,
  });
  return { rules };
});
