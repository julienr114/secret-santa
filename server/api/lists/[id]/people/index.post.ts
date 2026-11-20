import {
  addPersonToList,
  createMember,
  findMember,
  givePartTo,
  peopleOfLists,
} from '#server/database/lists';
import { countFamily, countPeople } from '#server/database/caps';
import { requireRoom } from '#server/http/caps';
import { notFound } from '#server/http/errors';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { addPersonSchema } from '#server/utils/listSchemas';
import { addPersonRefusal, isSingleList } from '#server/utils/lists';

// « Ajouter quelqu'un » (README 22.19): a person of my family, with their
// ideas nobody gave on their last list, or someone new, who joins my
// family. On a list without people (lot 27 bis), the first person added
// takes the ideas already written: the list is then by person. Not once
// it is shared.
export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  const body = await validatedBody(event, addPersonSchema);
  await requireRoom('people', countPeople(db, list.id));
  const people = (await peopleOfLists(db, [list.id])).get(list.id) ?? [];
  const refusal = addPersonRefusal({ sharedAt: list.sharedAt, people });
  if (refusal) throw createError({ statusCode: 409, statusMessage: refusal });
  if ('newMember' in body) {
    await requireRoom('family', countFamily(db, user.accountId));
  }
  const memberId =
    'memberId' in body
      ? (await findMember(db, user.accountId, body.memberId))?.id
      : await createMember(db, user.accountId, body.newMember);
  if (!memberId) throw notFound();
  const hidden = isSingleList(people) ? people[0] : undefined;
  if (hidden) {
    await givePartTo(db, hidden.id, memberId);
    setResponseStatus(event, 201);
    return { id: hidden.id, memberId };
  }
  try {
    const id = await addPersonToList(db, list, memberId);
    setResponseStatus(event, 201);
    return { id, memberId };
  } catch {
    // Already on the list: a second tap.
    throw createError({ statusCode: 409, statusMessage: 'conflict' });
  }
});
