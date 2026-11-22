import { requireGroupAccess } from '#server/http/auth';
import { listExclusions, listPeople } from '#server/database/people';
import { membersExtras } from '#server/database/membersPage';
import { publicPerson } from '#server/utils/people';

// Everything « Membres » needs in one round trip: the people and their
// exclusions; by where each came in, and where I may add someone (ticket
// 117).
export default defineEventHandler(async (event) => {
  const { group, db, user } = await requireGroupAccess(event);
  const [people, exclusions, extras] = await Promise.all([
    listPeople(db, group.id),
    listExclusions(db, group.id),
    membersExtras(db, group.id, user.accountId),
  ]);
  return { persons: people.map(publicPerson), exclusions, ...extras };
});
