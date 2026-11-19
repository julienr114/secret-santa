import { z } from 'zod';
import {
  findHeldList,
  peopleOfLists,
  resumeList,
} from '#server/database/lists';
import { notFound } from '#server/http/errors';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { canResumeInto } from '#server/utils/lists';

// « Repartir d'une liste » (lot 27, README 22.20), in the empty document
// of a new list: the icon, the word, the people and the ideas nobody
// ticked of a list I hold. Only into a draft nobody is on yet; the old
// list does not change.
const bodySchema = z.object({ from: z.string().min(1).max(40) });

export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  const { from } = await validatedBody(event, bodySchema);
  const source = await findHeldList(db, user.accountId, from);
  if (!source || source.id === list.id) throw notFound();
  const people = (await peopleOfLists(db, [list.id])).get(list.id) ?? [];
  if (!canResumeInto({ sharedAt: list.sharedAt, peopleCount: people.length })) {
    throw createError({ statusCode: 409, statusMessage: 'list_not_empty' });
  }
  await resumeList(db, list, source);
  return { ok: true };
});
