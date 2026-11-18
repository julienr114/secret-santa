import { canUseEmail } from '#server/utils/people';
import { findPersonByGroupEmail } from '#server/database/invite';
import { eq } from 'drizzle-orm';
import { findAccountById } from '#server/database/accounts';
import { persons } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { unwrap } from '#server/http/errors';
import { requirePersonalLink } from '#server/http/personal';
import { canClaim } from '#server/utils/invite';

// Links a draw opened by its personal link to the logged-in account: the
// person takes the account's address, so the draw shows on its home page.
// The personal link is the credential, as for everything under /p.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { db, person } = await requirePersonalLink(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  unwrap(canClaim(person.email, account.email));
  unwrap(
    canUseEmail(
      account.email,
      await findPersonByGroupEmail(db, person.groupId, account.email),
      person.id,
    ),
  );
  if (person.email !== account.email) {
    await db
      .update(persons)
      .set({ email: account.email })
      .where(eq(persons.id, person.id));
  }
  return { ok: true };
});
