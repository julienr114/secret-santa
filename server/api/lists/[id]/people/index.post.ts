import {
  addPersonToList,
  createMember,
  findMember,
} from '#server/database/lists';
import { countFamily, countPeople } from '#server/database/caps';
import { requireRoom } from '#server/http/caps';
import { notFound } from '#server/http/errors';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { addPersonSchema } from '#server/utils/listSchemas';

// « Ajouter quelqu'un » (README 22.19): a person of my family, with their
// ideas nobody gave on their last list, or someone new, who joins my
// family.
export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  const body = await validatedBody(event, addPersonSchema);
  await requireRoom('people', countPeople(db, list.id));
  if ('newMember' in body) {
    await requireRoom('family', countFamily(db, user.accountId));
  }
  const memberId =
    'memberId' in body
      ? (await findMember(db, user.accountId, body.memberId))?.id
      : await createMember(db, user.accountId, body.newMember);
  if (!memberId) throw notFound();
  try {
    const id = await addPersonToList(db, list, memberId);
    setResponseStatus(event, 201);
    return { id, memberId };
  } catch {
    // Already on the list: a second tap.
    throw createError({ statusCode: 409, statusMessage: 'conflict' });
  }
});
