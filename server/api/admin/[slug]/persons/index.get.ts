import { requireGroupAccess } from '#server/http/auth';
import { listOrganizers } from '#server/database/groups';
import { listExclusions, listPeople } from '#server/database/people';
import { membersExtras } from '#server/database/membersPage';
import { publicPerson } from '#server/utils/people';
import { organisingIds } from '#shared/utils/members';

// Everything « Membres » needs in one round trip: the people and their
// exclusions; by where each came in, and where I may add someone (ticket
// 117); who organises, whose line begins with « Organise » (ticket 137).
export default defineEventHandler(async (event) => {
  const { group, db, user } = await requireGroupAccess(event);
  const [people, exclusions, extras, organisers] = await Promise.all([
    listPeople(db, group.id),
    listExclusions(db, group.id),
    membersExtras(db, group.id, user.accountId),
    listOrganizers(db, group.id),
  ]);
  return {
    persons: people.map(publicPerson),
    exclusions,
    ...extras,
    organising: organisingIds(
      people,
      organisers.map((organiser) => organiser.email),
    ),
  };
});
