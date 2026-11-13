import { eq } from 'drizzle-orm';
import { editions } from '../../../../database/schema.js';
import { findEdition, publicEdition } from '../../../../database/editions.js';
import { recordEvent } from '../../../../database/audit.js';
import { requireGroupAccess } from '../../../../http/auth.js';
import { notFound, unwrap } from '../../../../http/errors.js';
import { validatedBody } from '../../../../http/validate.js';
import { editionPatchSchema } from '../../../../utils/editions.js';
import { mergeRules } from '../../../../utils/rules.js';

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
