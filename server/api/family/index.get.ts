import { useDb } from '#server/database/client';
import { familyOf, listCountsOfMembers } from '#server/database/lists';
import { requireAccount } from '#server/http/auth';
import { memberView, todayIso } from '#server/http/lists';

// « Mes proches » (README 22.20, maquette Famille): everyone, kept from
// one list to the next, those on no list included, each with their age
// and on how many lists they are.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const counts = await listCountsOfMembers(db, user.accountId);
  const today = todayIso();
  const viewer = { accountId: user.accountId, role: 'holder' as const };
  return {
    members: (await familyOf(db, user.accountId)).map((member) => ({
      ...memberView(member, today, viewer),
      lists: counts.get(member.id) ?? 0,
    })),
  };
});
