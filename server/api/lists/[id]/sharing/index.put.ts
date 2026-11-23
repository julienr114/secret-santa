import { z } from 'zod';
import { findAccountById } from '#server/database/accounts';
import { unlinkElsewhere } from '#server/database/drawLists';
import { forgetCarried } from '#server/database/lists';
import { saveSharing, sharingOptions } from '#server/database/listSharing';
import { nowIso } from '#server/http/context';
import { requireManagedList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';

// Saves « Qui voit ta liste ? » (tickets 106, 139), at each gesture: the
// events shared with all their members, among those offered, those of
// « Celui qui m'a tiré » (both may hold for one event), and « Tout le
// monde ». Nobody and not public, the list is a draft again. Those who
// lose it were told before, on the screen; their ticks stay.
const bodySchema = z.object({
  parties: z.array(z.string().min(1).max(40)).max(100),
  /** The events of « Celui qui m'a tiré » (tickets 107, 139). */
  givers: z.array(z.string().min(1).max(40)).max(100).default([]),
  isPublic: z.boolean(),
});

export default defineEventHandler(async (event) => {
  const { db, list, user } = await requireManagedList(event, 'share');
  const body = await validatedBody(event, bodySchema);
  const account = await findAccountById(db, user.accountId);
  if (!account) throw createError({ statusCode: 401 });
  const options = await sharingOptions(db, list.id, account);
  const offered = new Set(options.map((option) => option.id));
  // « Celui qui m'a tiré » where I take part in a Secret Santa, or kept
  // where it already is.
  const drawn = new Set(
    options
      .filter((option) => option.drawn || option.giver)
      .map((option) => option.id),
  );
  if (
    body.parties.some((id) => !offered.has(id)) ||
    body.givers.some((id) => !drawn.has(id))
  ) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }
  // A Secret Santa has only one list (ticket 148): added here, it leaves
  // the other.
  for (const id of body.givers) {
    const option = options.find((one) => one.id === id);
    if (!option?.giver) await unlinkElsewhere(db, account.id, list.id, id);
  }
  await saveSharing(
    db,
    list,
    {
      partyIds: body.parties,
      giverIds: body.givers,
      isPublic: body.isPublic,
    },
    nowIso(),
  );
  // Shared for the first time: the marks of a list taken up again go
  // (lot 27).
  if (body.parties.length > 0 || body.givers.length > 0 || body.isPublic) {
    await forgetCarried(db, list.id);
  }
  return { ok: true };
});
