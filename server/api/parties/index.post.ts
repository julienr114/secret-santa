import { useDb } from '#server/database/client';
import { findAccountById } from '#server/database/accounts';
import { createParty } from '#server/database/parties';
import { requireAccount } from '#server/http/auth';
import { nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { partyInputSchema } from '#server/utils/parties';

// « Pour quelle occasion ? » (ticket 104): creates a party, free for any
// account (docs/spec/v3/modele.md). The account organises it.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const body = await validatedBody(event, partyInputSchema);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  const slug = await createParty(db, account, body, nowIso());
  setResponseStatus(event, 201);
  return { slug };
});
