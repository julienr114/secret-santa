import { z } from 'zod';
import { findAccountByEmail, findAccountById } from '#server/database/accounts';
import {
  addInvite,
  holdersOfLists,
  invitesOfList,
} from '#server/database/lists';
import { appUrl } from '#server/http/context';
import { sendEmails } from '#server/http/email';
import { requireHeldList } from '#server/http/lists';
import { validatedBody } from '#server/http/validate';
import { inviteRefusal } from '#server/utils/listAccess';
import { buildHolderInviteEmail } from '#server/utils/listEmail';
import { emailSchema } from '#server/utils/people';

// « Inviter quelqu'un à tenir la liste » (README 22.20): by address. An
// email says who invites; the list is among theirs once they log in with
// that address. A failed send does not undo the invitation.
const bodySchema = z.object({ email: emailSchema });

export default defineEventHandler(async (event) => {
  const { db, user, list } = await requireHeldList(event);
  const { email } = await validatedBody(event, bodySchema);
  const holders = (await holdersOfLists(db, [list.id])).get(list.id) ?? [];
  const refusal = inviteRefusal(email, {
    holderEmails: holders.map((holder) => holder.email),
    invitedEmails: (await invitesOfList(db, list.id)).map((i) => i.email),
  });
  if (refusal) {
    throw createError({
      statusCode: 409,
      statusMessage: `already_${refusal}`,
    });
  }
  await addInvite(db, { listId: list.id, email, invitedBy: user.accountId });
  const me = await findAccountById(db, user.accountId);
  const invited = await findAccountByEmail(db, email);
  // In the language of the one invited when they have an account, of the
  // one who invites otherwise.
  await sendEmails(event, [
    {
      ...buildHolderInviteEmail(
        {
          by: me?.firstName ?? me?.email ?? '',
          title: list.title,
        },
        appUrl(event, `/listes/${list.id}`),
        invited?.language ?? me?.language ?? 'fr',
      ),
      to: email,
    },
  ]);
  setResponseStatus(event, 201);
  return { ok: true };
});
