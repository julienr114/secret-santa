import { useDb } from '#server/database/client';
import { familyOf, listCountsOfMembers } from '#server/database/lists';
import { requireAccount } from '#server/http/auth';
import { todayIso } from '#server/http/lists';
import { ageOn } from '#server/utils/lists';

// « Mes proches » (README 22.20, maquette Famille): everyone, kept from
// one list to the next, those on no list included, each with their age
// and on how many of my lists they are.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const counts = await listCountsOfMembers(db, user.accountId);
  const today = todayIso();
  return {
    members: (await familyOf(db, user.accountId)).map((member) => ({
      ...member,
      age: member.birthDate ? ageOn(member.birthDate, today) : null,
      lists: counts.get(member.id) ?? 0,
    })),
  };
});
