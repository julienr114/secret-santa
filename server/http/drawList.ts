import type { H3Event } from 'h3';
import { eq } from 'drizzle-orm';
import { adoptPersonAvatar, findAccountById } from '#server/database/accounts';
import { findPersonByGroupEmail } from '#server/database/invite';
import { persons } from '#server/database/schema';
import { requireAccount } from './auth';
import { unwrap } from './errors';
import { requirePersonalLink } from './personal';
import { canClaim } from '#server/utils/invite';
import { canUseEmail } from '#server/utils/people';

// « Ma liste de cadeaux », from my Secret Santa (tickets 107, 136): the
// personal link, and my account, which must be the person's. Logged in
// with the person's address, or taking it when the person has none, as
// « Ajouter à mon compte » does.

/**
 * The personal link and my account, checked to be the same person.
 * @param event - The request.
 * @returns The link's context, with my account.
 */
export const requireMyDraw = async (event: H3Event) => {
  const user = await requireAccount(event);
  const context = await requirePersonalLink(event);
  const { db, person } = context;
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  unwrap(canClaim(person.email, account.email));
  unwrap(
    canUseEmail(
      account.email,
      await findPersonByGroupEmail(db, person.partyId, account.email),
      person.id,
    ),
  );
  return { ...context, account };
};

/**
 * The person of the link becomes mine, by my address and, when my account
 * has none, my face.
 * @param context - What `requireMyDraw` gave.
 * @returns Once done.
 */
export const takeMyDraw = async (
  context: Awaited<ReturnType<typeof requireMyDraw>>,
) => {
  const { db, person, account } = context;
  if (person.email !== account.email) {
    await db
      .update(persons)
      .set({ email: account.email })
      .where(eq(persons.id, person.id));
  }
  // An account with no face of its own takes the one of the Secret Santa.
  await adoptPersonAvatar(db, account, person);
};
