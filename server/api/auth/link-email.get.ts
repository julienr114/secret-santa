import { z } from 'zod';
import { useDb } from '#server/database/client';
import { findLoginLink } from '#server/database/accounts';
import { nowIso } from '#server/http/context';
import { validatedQuery } from '#server/http/validate';
import { usableLink } from '#server/utils/accounts';
import { hashToken } from '#server/utils/crypto';

// The address a login link logs in with, for « Tu vas être connecté avec
// hugo@example.com » (lot 11 of the redesign). Reading it never uses the
// link up: only « Se connecter » does (confirm.post.ts). Whoever holds
// the link is the one it was mailed to; unknown, used or expired links
// all get the same refusal.
const querySchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
});

export default defineEventHandler(async (event) => {
  const { token } = await validatedQuery(event, querySchema);
  const db = useDb(event);
  const row = await findLoginLink(db, await hashToken(token));
  setResponseHeader(event, 'Cache-Control', 'no-store');
  if (!row || !usableLink(row.link, nowIso()).ok || row.account.disabledAt) {
    throw createError({ statusCode: 410, statusMessage: 'login_link_invalid' });
  }
  return { email: row.account.email };
});
