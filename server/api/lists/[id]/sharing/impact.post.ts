import { z } from 'zod';
import { holdersOfLists } from '#server/database/lists';
import {
  audienceOf,
  claimersOf,
  sharedEventsOf,
} from '#server/database/listSharing';
import { requireManagedList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { losingClaimers } from '#server/utils/listSharing';

// Before a narrower sharing (« Resserrer le partage », ticket 106): how
// many people who ticked a gift would no longer open the list. A count,
// never who.
const bodySchema = z.object({
  parties: z.array(z.string().min(1).max(40)).max(100),
  isPublic: z.boolean(),
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
  return {
    claimers: losingClaimers(
      claimers,
      (holders.get(list.id) ?? []).map((holder) => holder.accountId),
      before,
      after,
    ),
  };
});
