import { requireGroupAccess } from '#server/http/auth';
import { listExclusions, listPeople } from '#server/database/people';
import { publicPerson } from '#server/utils/people';

// Everything the "Personnes" screen needs in one round trip.
export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const [people, exclusions] = await Promise.all([
    listPeople(db, group.id),
    listExclusions(db, group.id),
  ]);
  return { persons: people.map(publicPerson), exclusions };
});
