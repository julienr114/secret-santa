import { useDb } from '#server/database/client';
import { findMember, memberOf, placesOfMember } from '#server/database/lists';
import { requireAccount } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { todayIso } from '#server/http/lists';
import { ageOn, memberRemoval } from '#server/utils/lists';

// A person of « Mes proches » (ListePersonne): their practical details
// and their tastes, and what deleting them would take (FamilleSupprimer).
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const row = await findMember(
    db,
    user.accountId,
    getRouterParam(event, 'id') ?? '',
  );
  if (!row) throw notFound();
  const member = memberOf(row);
  const { places, claimed } = await placesOfMember(db, user.accountId, row.id);
  return {
    member: {
      ...member,
      age: member.birthDate ? ageOn(member.birthDate, todayIso()) : null,
    },
    removal: memberRemoval(
      { isSelf: row.isSelf, holdsWithMe: false },
      places,
      claimed,
    ),
  };
});
