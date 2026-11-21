import { z } from 'zod';
import { findAccountById } from '#server/database/accounts';
import { forgetCarried } from '#server/database/lists';
import { saveSharing, sharingOptions } from '#server/database/listSharing';
import { nowIso } from '#server/http/context';
import { requireManagedList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';

// Saves « Qui verra ta liste ? » (ticket 106): the events ticked, among
// those offered, and « Tout le monde, avec le lien ». All unticked and not
// public, the list is a draft again. Those who lose it were told before,
// on the screen; their ticks stay.
const bodySchema = z.object({
  parties: z.array(z.string().min(1).max(40)).max(100),
  /** The events ticked for « Celui qui m'a tiré » (ticket 107). */
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
  const drawn = new Set(
    options.filter((option) => option.drawn).map((option) => option.id),
  );
  if (
    body.parties.some((id) => !offered.has(id)) ||
    body.givers.some((id) => !drawn.has(id) && !offered.has(id))
  ) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  }
  await saveSharing(
    db,
    list,
    {
      partyIds: body.parties,
      giverIds: body.givers.filter((id) => !body.parties.includes(id)),
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
