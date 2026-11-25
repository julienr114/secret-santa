import { z } from 'zod';
import { saveFollow } from '#server/database/follows';
import { requireAccount } from '#server/http/auth';
import { nowIso } from '#server/http/context';
import { listOfLink } from '#server/http/listLink';
import { roleOnList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';

// « Suivre » (ticket 122, ListeSuivre): what I follow on a list I may
// open without holding it, the whole list or some of its people, in
// place of what I followed. Those who hold it have nothing to follow.
const bodySchema = z.object({
  list: z.boolean(),
  people: z.array(z.string().min(1).max(64)).max(100),
});

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { db, list } = await listOfLink(event);
  const choice = await validatedBody(event, bodySchema);
  const { role } = await roleOnList(db, list, user.accountId);
  if (role === 'holder') {
    throw createError({ statusCode: 409, statusMessage: 'conflict' });
  }
  return saveFollow(
    db,
    { accountId: user.accountId, listId: list.id, choice },
    nowIso(),
  );
});
