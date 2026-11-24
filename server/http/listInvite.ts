import type { H3Event } from 'h3';
import type { Db } from '#server/database/client';
import { findAccountByEmail, findAccountById } from '#server/database/accounts';
import { isoAfter } from '#server/utils/accounts';
import { generateToken, hashToken } from '#server/utils/crypto';
import { INVITE_TTL_MS, type HolderLevel } from '#server/utils/listAccess';
import { buildHolderInviteEmail } from '#server/utils/listEmail';
import { appUrl, nowIso } from './context';
import { sendEmails } from './email';
import { ownEmailGoes } from '#server/utils/newsEmail';
import { tellInvited } from '#server/database/newsEvents';

// Sending an invitation to hold a list (lot 25 bis, README 22.20): a
// fresh link of 256 bits, of which only the hash is kept, good for 7
// days like the invitation, and the email that carries it.

/**
 * A fresh link for an invitation.
 * @returns Its token, the hash to keep, and when it ends.
 */
export const freshInviteLink = async () => {
  const token = generateToken();
  return {
    token,
    tokenHash: await hashToken(token),
    expiresAt: isoAfter(nowIso(), INVITE_TTL_MS),
  };
};

/**
 * Sends the email of an invitation, in the language of the one invited
 * when they have an account, of the one who invites otherwise. A failed
 * send does not undo the invitation: it shows in the page, and can be
 * sent again once expired.
 * @param event - The request.
 * @param db - The database.
 * @param invite - The list, the address, the level, who invites, the
 *   token of the link and when it ends.
 * @returns The link, for the tests of a local server only.
 */
export const sendHolderInvite = async (
  event: H3Event,
  db: Db,
  invite: {
    listId: string;
    title: string;
    email: string;
    level: HolderLevel;
    byAccountId: string;
    token: string;
    expiresAt: string;
  },
): Promise<string> => {
  const me = await findAccountById(db, invite.byAccountId);
  const invited = await findAccountByEmail(db, invite.email);
  const link = appUrl(event, `/invitation/${invite.token}`);
  // In the app too, if the address has an account (ticket 120).
  await tellInvited(
    db,
    { listId: invite.listId, email: invite.email, by: me?.firstName ?? null },
    nowIso(),
  );
  // Never to an account that wants no email (ticket 121): the
  // invitation is in its « Quoi de neuf ».
  if (!ownEmailGoes(invited?.emailNews ?? null)) return link;
  await sendEmails(
    event,
    [
      {
        ...buildHolderInviteEmail(
          {
            by: me?.firstName ?? me?.email.split('@')[0] ?? '',
            title: invite.title,
            level: invite.level,
            expiresAt: invite.expiresAt,
          },
          link,
          invited?.language ?? me?.language ?? 'fr',
        ),
        to: invite.email,
        locale: invited?.language ?? me?.language ?? 'fr',
        by: me?.firstName ?? null,
      },
    ],
    { db },
  );
  return link;
};
