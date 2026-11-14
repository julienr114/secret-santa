import { removeOrganizer } from '#server/database/groups';
import { requireGroupAccess } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { canRemoveOrganizer } from '#server/utils/auth';

// Removes an organiser from the group. Their account stays; if they
// organise nothing else, it simply has no access any more.
export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const accountId = getRouterParam(event, 'accountId') ?? '';
  if (!canRemoveOrganizer(user, accountId)) {
    throw createError({ statusCode: 409, statusMessage: 'cannot_remove_self' });
  }
  const removed = await removeOrganizer(db, group.id, accountId);
  if (removed.length === 0) throw notFound('organizer_not_found');
  return { ok: true };
});
