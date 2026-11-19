import type { H3Event } from 'h3';
import { useDb } from '#server/database/client';
import { findInviteByToken } from '#server/database/lists';
import { hashToken } from '#server/utils/crypto';

// The page of an invitation to hold a list, opened by the link of its
// email (lot 25 bis, README 22.20). The link is a secret of 256 bits,
// looked up by its hash; it acts once, by a button, never by opening the
// page: a mail scanner or a link preview cannot use it up.

const TOKEN = /^[A-Za-z0-9_-]{43}$/;

/**
 * The invitation a link leads to, with its list and who sent it; 404 for
 * a link unknown, or whose invitation was cancelled or replaced.
 * @param event - The request, with the token in its path.
 * @returns The database and the invitation.
 */
export const invitationOfLink = async (event: H3Event) => {
  const refuse = () =>
    createError({ statusCode: 404, statusMessage: 'invite_unknown' });
  const token = getRouterParam(event, 'token') ?? '';
  if (!TOKEN.test(token)) throw refuse();
  const db = useDb(event);
  const row = await findInviteByToken(db, await hashToken(token));
  if (!row) throw refuse();
  return { db, ...row };
};
