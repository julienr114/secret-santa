import { z } from 'zod';
import { holdersOfLists } from '#server/database/lists';
import {
  audienceOf,
  claimersOf,
  membersOf,
  sharedEventsOf,
} from '#server/database/listSharing';
import { requireManagedList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { losingClaimers, losingMembers } from '#server/utils/listSharing';

// Before a narrower sharing (« Resserrer le partage », ticket 106): how
// many members of the events left, and how many people who ticked a
// gift, would no longer open the list. Counts, never who.
const bodySchema = z.object({
  parties: z.array(z.string().min(1).max(40)).max(100),
  isPublic: z.boolean(),
  /** The events ticked before this gesture: whose members it concerns. */
  from: z.array(z.string().min(1).max(40)).max(100).optional(),
});

export default defineEventHandler(async (event) => {
  const { db, list } = await requireManagedList(event, 'share');
  const body = await validatedBody(event, bodySchema);
  const shared = (await sharedEventsOf(db, list.id))
    .filter((row) => row.visibility === 'party')
    .map((row) => row.id);
  const [claimers, holders, before, after] = await Promise.all([
    claimersOf(db, list.id),
    holdersOfLists(db, [list.id]),
    audienceOf(db, shared, list.sharedAt !== null),
    audienceOf(db, body.parties, body.isPublic),
  ]);
  const holding = holders.get(list.id) ?? [];
  const left = (body.from ?? shared).filter(
    (id) => shared.includes(id) && !body.parties.includes(id),
  );
  return {
    members: losingMembers(
      await membersOf(db, left),
      holding.map((holder) => holder.email),
      after,
    ),
    claimers: losingClaimers(
      claimers,
      holding.map((holder) => holder.accountId),
      before,
      after,
    ),
  };
});
