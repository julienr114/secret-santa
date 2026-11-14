import { eq } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { accounts } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { validatedBody } from '#server/http/validate';
import { profileSchema } from '#server/utils/people';

// The profile of the logged-in account: first name, last name, avatar and
// language. It only gives defaults for the groups created later; people
// already in a group keep what the group says.
// Each screen sends its own part: the names, the avatar or the language.
const bodySchema = profileSchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'nothing to update');

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const profile = await validatedBody(event, bodySchema);
  await useDb(event)
    .update(accounts)
    .set(profile)
    .where(eq(accounts.id, user.accountId));
  return { ok: true };
});
