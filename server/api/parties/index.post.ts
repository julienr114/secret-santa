import { useDb } from '#server/database/client';
import { isoAfter } from '#server/utils/accounts';
import { refuseWhileSignupsPaused } from '#server/http/pauses';
import { findAccountById } from '#server/database/accounts';
import { isMyMember } from '#server/database/forWhom';
import { createParty } from '#server/database/parties';
import { notFound } from '#server/http/errors';
import { requireAccount } from '#server/http/auth';
import { nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { partyInputSchema } from '#server/utils/parties';

// « Pour quelle occasion ? » (ticket 104): creates a party, free for any
// account (docs/spec/v3/modele.md). The account organises it. A birthday
// is for one of its own people, or for nobody (ticket 118).
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const body = await validatedBody(event, partyInputSchema);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  // No new event while sign-ups are suspended (ticket 129).
  await refuseWhileSignupsPaused(db, account.isSuperAdmin);
  // Never in the past (Julien, 25 November 2026): a day of margin for
  // the time zones, the server counting in UTC.
  if (body.date < isoAfter(nowIso(), -24 * 60 * 60 * 1000).slice(0, 10)) {
    throw createError({ statusCode: 400, statusMessage: 'date_past' });
  }
  if (
    body.forMemberId &&
    !(await isMyMember(db, account.id, body.forMemberId))
  ) {
    throw notFound();
  }
  const slug = await createParty(db, account, body, nowIso());
  setResponseStatus(event, 201);
  return { slug };
});
