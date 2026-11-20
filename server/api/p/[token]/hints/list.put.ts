import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { participations } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { unwrap } from '#server/http/errors';
import { hintsPayload, linkableLists } from '#server/http/hints';
import { requirePersonalLink } from '#server/http/personal';
import { validatedBody } from '#server/http/validate';
import { nowIso } from '#server/http/context';
import { syncLinkedList } from '#server/database/listParties';
import { canLinkList } from '#server/utils/anonymous';
import { canEditHints } from '#server/utils/hints';

// « Ma liste de cadeaux », among my hints (lot 27 ter, README 22.20): the
// gift list the one who gives to me will be shown a link to, or none. A
// whole list, one I hold or figure on, and shared. Not journaled, like
// the rest of the hints, and nobody is told.
const bodySchema = z.object({ listId: z.string().min(1).max(40).nullable() });

export default defineEventHandler(async (event) => {
  const ctx = await requirePersonalLink(event);
  const { db, participation, edition, rules } = ctx;
  unwrap(canEditHints(edition.status, rules.giftHints));
  if (rules.giftHints !== 'full') {
    throw createError({
      statusCode: 403,
      statusMessage: 'gift_hints_disabled',
    });
  }
  const { listId } = await validatedBody(event, bodySchema);
  const user = await requireAccount(event);
  if (
    listId &&
    !canLinkList(
      (await linkableLists(db, user.accountId)).find(
        (list) => list.id === listId,
      ),
    )
  ) {
    throw createError({ statusCode: 409, statusMessage: 'list_not_linkable' });
  }
  await db
    .update(participations)
    .set({ giftListId: listId })
    .where(eq(participations.id, participation.id));
  // The list goes into the party of the draw (ticket 101).
  await syncLinkedList(
    db,
    { secretSantaId: participation.secretSantaId, listId },
    participation.giftListId,
    nowIso(),
  );
  return hintsPayload(
    { ...ctx, participation: { ...participation, giftListId: listId } },
    user.accountId,
  );
});
