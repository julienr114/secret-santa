import { eq } from 'drizzle-orm';
import { editions } from '#server/database/schema';
import { findEdition, publicEdition } from '#server/database/editions';
import { recordEvent } from '#server/database/audit';
import { requireGroupAccess } from '#server/http/auth';
import { notFound, unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { editionPatchSchema } from '#server/utils/editions';
import { mergeRules } from '#server/utils/rules';

// Label and rule overrides. Status changes have their own routes (step 4).
export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const edition = await findEdition(db, group.id, getRouterParam(event, 'id'));
  if (!edition) throw notFound('edition_not_found');
  if (edition.status === 'closed') {
    throw createError({ statusCode: 409, statusMessage: 'edition_closed' });
  }
  const patch = await validatedBody(event, editionPatchSchema);
  unwrap(mergeRules(group.rules, patch.rulesOverride));
  await db.update(editions).set(patch).where(eq(editions.id, edition.id));
  if (patch.rulesOverride !== undefined) {
    await recordEvent(db, {
      type: 'rules_changed',
      groupId: group.id,
      editionId: edition.id,
      actor: user.role,
    });
  }
  return { edition: publicEdition({ ...edition, ...patch }) };
});
