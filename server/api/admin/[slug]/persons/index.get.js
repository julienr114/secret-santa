import { requireGroupAccess } from '../../../../http/auth.js';
import {
  listCouples,
  listExclusions,
  listPeople,
} from '../../../../database/people.js';
import { publicPerson } from '../../../../utils/people.js';

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
