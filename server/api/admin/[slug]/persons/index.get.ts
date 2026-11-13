import { requireGroupAccess } from '#server/http/auth';
import {
  listCouples,
  listExclusions,
  listPeople,
} from '#server/database/people';
import { publicPerson } from '#server/utils/people';

// Everything the "Personnes" screen needs in one round trip.
export default defineEventHandler(async (event) => {
  const { group, db } = await requireGroupAccess(event);
  const [people, groupCouples, exclusions] = await Promise.all([
    listPeople(db, group.id),
    listCouples(db, group.id),
    listExclusions(db, group.id),
  ]);
  return {
    persons: people.map(publicPerson),
    couples: groupCouples,
    exclusions,
  };
});
