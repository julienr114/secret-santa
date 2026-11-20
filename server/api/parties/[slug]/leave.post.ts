import { leaveParty } from '#server/database/parties';
import { nowIso } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { requireParty } from '#server/http/party';
import { canLeaveParty } from '#server/utils/parties';

// « Quitter cette fête » (V3FeteQuitter, ticket 104): my lists leave it,
// my ticks stay. A member only.
export default defineEventHandler(async (event) => {
  const { db, party, account, role, me } = await requireParty(event);
  unwrap(canLeaveParty(role));
  if (!me) throw createError({ statusCode: 403, statusMessage: 'forbidden' });
  await leaveParty(db, { party, account, me }, nowIso());
  return { ok: true };
});
