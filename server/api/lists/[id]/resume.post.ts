import { z } from 'zod';
import {
  findHeldList,
  peopleOfLists,
  resumeList,
} from '#server/database/lists';
import { sharedEventsOf } from '#server/database/listSharing';
import { notFound } from '#server/http/errors';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { canResumeInto, isSingleList } from '#server/utils/lists';

// « Repartir d'une liste » (lot 27, README 22.20, Q-032): the icon, the
// word, the people and the ideas nobody ticked of a list I hold, into a
// list that has no idea yet, people or not. The people there keep their
// place; the old list does not change.
const bodySchema = z.object({ from: z.string().min(1).max(40) });

export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  const { from } = await validatedBody(event, bodySchema);
  const source = await findHeldList(db, user.accountId, from);
  if (!source || source.id === list.id) throw notFound();
  const people = (await peopleOfLists(db, [list.id])).get(list.id) ?? [];
  if (
    !canResumeInto({
      ideas: people.reduce((sum, person) => sum + person.ideas.length, 0),
      single: isSingleList(people),
    })
  ) {
    throw createError({ statusCode: 409, statusMessage: 'list_not_empty' });
  }
  // The marks are for the time of a draft: a list already shared is read
  // as it is.
  const draft =
    list.sharedAt === null && (await sharedEventsOf(db, list.id)).length === 0;
  await resumeList(db, list, source, draft);
  return { ok: true };
});
