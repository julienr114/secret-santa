import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { EMAIL_NEWS } from '#shared/utils/news';
import { useDb } from '#server/database/client';
import {
  listsFiguringOn,
  listsHeldBy,
  setSelfAvatar,
} from '#server/database/lists';
import { signalLists } from '#server/http/live';
import { accounts } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { validatedBody } from '#server/http/validate';
import { profileSchema } from '#server/utils/people';

// The profile of the logged-in account: first name, last name, avatar and
// language. It only gives defaults for the groups created later; people
// already in a group keep what the group says.
// Each screen sends its own part: the names, the avatar or the language;
// « Me prévenir » its choice for the emails (ticket 121).
const bodySchema = profileSchema
  .extend({ emailNews: z.enum(EMAIL_NEWS) })
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'nothing to update');

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const profile = await validatedBody(event, bodySchema);
  const db = useDb(event);
  await db.update(accounts).set(profile).where(eq(accounts.id, user.accountId));
  // « Moi », among my people, has the icon of the account.
  if (profile.avatarEmoji !== undefined || profile.avatarColor !== undefined) {
    await setSelfAvatar(db, user.accountId, {
      emoji: profile.avatarEmoji,
      color: profile.avatarColor,
    });
  }
  // Live (lot 26): my first name and my icon show on the lists I hold
  // and on those I figure on; they are told.
  if (
    profile.firstName !== undefined ||
    profile.avatarEmoji !== undefined ||
    profile.avatarColor !== undefined
  ) {
    signalLists(
      event,
      [
        ...(await listsHeldBy(db, user.accountId)),
        ...(await listsFiguringOn(db, user.accountId)),
      ].map((list) => list.id),
    );
  }
  return { ok: true };
});
