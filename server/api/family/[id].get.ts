import { useDb } from '#server/database/client';
import {
  findReachableMember,
  holdTogether,
  memberOf,
  placesOfMember,
} from '#server/database/lists';
import { requireAccount } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { memberView, todayIso } from '#server/http/lists';
import { memberRemoval, type MemberRemoval } from '#server/utils/lists';

// A person of « Mes proches » (ListePersonne), or of a list I hold with
// whoever they belong to: their practical details and their tastes, and,
// for one of mine, what deleting them would take (FamilleSupprimer).
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const row = await findReachableMember(
    db,
    user.accountId,
    getRouterParam(event, 'id') ?? '',
  );
  if (!row) throw notFound();
  const member = memberOf(row);
  const mine = row.accountId === user.accountId;
  const { places, claimed } = await placesOfMember(db, row.id);
  const removal: MemberRemoval = mine
    ? memberRemoval(
        {
          isSelf: row.isSelf,
          holdsWithMe: Boolean(
            row.linkedAccountId &&
            (await holdTogether(db, user.accountId, row.linkedAccountId)),
          ),
        },
        places,
        claimed,
      )
    : // Someone else's: theirs to delete.
      { allowed: false, why: 'holder' };
  return {
    member: memberView(member, todayIso(), {
      accountId: user.accountId,
      role: 'holder',
    }),
    /** Among my own people: I may link them to their account. */
    mine,
    removal,
  };
});
