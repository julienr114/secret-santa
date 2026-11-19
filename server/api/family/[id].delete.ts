import { useDb } from '#server/database/client';
import {
  deleteMember,
  findMember,
  placesOfMember,
} from '#server/database/lists';
import { requireAccount } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { memberRemoval } from '#server/utils/lists';

// « Supprimer de mes proches » (Correction 24, README 22.20): the person,
// their page and tastes go for good, and they leave every one of my lists
// with their ideas and what was ticked. Refused for « Moi ».
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const row = await findMember(
    db,
    user.accountId,
    getRouterParam(event, 'id') ?? '',
  );
  if (!row) throw notFound();
  const { places, claimed } = await placesOfMember(db, user.accountId, row.id);
  // Nobody holds a list with me yet (lot 25): never the case today.
  const removal = memberRemoval(
    { isSelf: row.isSelf, holdsWithMe: false },
    places,
    claimed,
  );
  if (!removal.allowed) {
    throw createError({
      statusCode: 409,
      statusMessage: `member_${removal.why}`,
    });
  }
  await deleteMember(db, row.id, places);
  return { ok: true };
});
