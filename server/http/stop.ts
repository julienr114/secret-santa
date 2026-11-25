import type { H3Event } from 'h3';
import { eq } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { accounts } from '#server/database/schema';
import { secretsOf } from './context';
import { emailPrint } from '#server/utils/emailPrint';
import { verifyStop } from '#server/utils/stopEmail';

/**
 * The address of a link « Ne plus recevoir d'emails », signed by the
 * server (ticket 130): no session needed. Anything else is not found.
 * @param event - The request, with the token in its path.
 * @returns The database, the address and its print.
 */
export const stopOf = async (event: H3Event) => {
  const secret = secretsOf(event).dataKey;
  const email = await verifyStop(getRouterParam(event, 'token') ?? '', secret);
  if (!email) {
    throw createError({ statusCode: 404, statusMessage: 'not_found' });
  }
  const db = useDb(event);
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.email, email))
    .limit(1);
  return {
    db,
    email,
    print: await emailPrint(email, secret),
    accountId: account?.id ?? null,
  };
};
