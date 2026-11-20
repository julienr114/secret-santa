import { useDb } from '#server/database/client';
import {
  deleteMember,
  findMember,
  holdTogether,
  placesOfMember,
} from '#server/database/lists';
import { requireAccount } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { signalLists } from '#server/http/live';
import { memberRemoval } from '#server/utils/lists';

// « Supprimer de mes proches » (Correction 24, README 22.20): the person,
// their page and tastes go for good, and they leave every list they are
// on with their ideas and what was ticked. Refused for « Moi », and for
// a person linked to an account that holds a list with me.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const row = await findMember(
    db,
    user.accountId,
    getRouterParam(event, 'id') ?? '',
  );
  if (!row) throw notFound();
  const { places, claimed } = await placesOfMember(db, row.id);
  const removal = memberRemoval(
    {
      isSelf: row.isSelf,
      holdsWithMe: Boolean(
        row.linkedAccountId &&
        (await holdTogether(db, user.accountId, row.linkedAccountId)),
      ),
    },
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
  // Live (lot 26): they leave every list they were on, at everyone's.
  // Their lists are only known before they go, so it is said from here.
  signalLists(
    event,
    places.map((place) => place.list.id),
  );
  return { ok: true };
});
