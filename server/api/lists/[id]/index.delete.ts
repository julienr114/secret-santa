import { z } from 'zod';
import { deleteList } from '#server/database/lists';
import { requireManagedList } from '#server/http/lists';
import { validatedQuery } from '#server/http/validate';
import { canDeleteList } from '#server/utils/lists';

// Deleting a list, for those who manage it (README 22.19, 22.20). A
// document left without a name and without anyone is not kept: the page
// that made it deletes it on leaving, and only a draft goes that way.
// « Supprimer la liste », asked on purpose (`?sure=1`) from the page that
// says what is lost, deletes any list: its people leave it (they stay
// among « Mes proches »), its ideas, what was ticked and its link go, for
// everyone who holds it. It cannot be undone.
const querySchema = z.object({ sure: z.literal('1').optional() });

export default defineEventHandler(async (event) => {
  const { db, list } = await requireManagedList(event, 'deleteList');
  const { sure } = await validatedQuery(event, querySchema);
  if (!canDeleteList(list, sure === '1')) {
    throw createError({ statusCode: 409, statusMessage: 'list_shared' });
  }
  await deleteList(db, list.id);
  return { ok: true };
});
