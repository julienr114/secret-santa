import { z } from 'zod';
import {
  claimsOfLists,
  leaveClaim,
  removeClaim,
} from '#server/database/claims';
import { notFound } from '#server/http/errors';
import { requireHeldList } from '#server/http/lists';
import { validatedQuery } from '#server/http/validate';
import { mayRemoveClaim } from '#server/utils/claims';

// Those who hold a list untick in its document (README 22.19): what they
// gave themselves, or, naming it (`?claim=`), the tick of someone else
// (Correction 25: Mamie ticked, then said she no longer takes it). The
// tick is named by its own row, which says nothing of whose it is: an
// anonymous one goes like any other.
const querySchema = z.object({ claim: z.string().min(1).max(40).optional() });

export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  const ideaId = getRouterParam(event, 'ideaId') ?? '';
  const { claim: claimId } = await validatedQuery(event, querySchema);
  if (!claimId) {
    await leaveClaim(db, ideaId, user.accountId);
    return { ok: true };
  }
  const claim = (await claimsOfLists(db, [list.id])).find(
    (c) => c.id === claimId && c.ideaId === ideaId,
  );
  if (!claim) throw notFound();
  if (!mayRemoveClaim({ accountId: user.accountId, holds: true }, claim)) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }
  await removeClaim(db, { listId: list.id, ideaId, claimId });
  return { ok: true };
});
