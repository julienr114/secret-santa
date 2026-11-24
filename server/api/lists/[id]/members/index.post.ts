import { z } from 'zod';
import { findAccountByEmail, findAccountById } from '#server/database/accounts';
import { findPersonByGroupEmail } from '#server/database/invite';
import { tellEntered } from '#server/database/newsEvents';
import { appUrl, nowIso, secretsOf } from '#server/http/context';
import { sendEmails } from '#server/http/email';
import { letIn } from '#server/http/entries';
import { requireListInvite } from '#server/http/listMembers';
import { validatedBody } from '#server/http/validate';
import { buildListSharedEmail } from '#server/utils/listEmail';
import { emailSchema, nameSchema } from '#server/utils/people';

// « Par son adresse email » (V3ListeInviter, ticket 117): a first name and
// an address. The person is a member of the list's event at once, by the
// list, and gets an email in my name (V3ListePartageEmail) with the link
// of the list; with an account, a news instead, which goes by email as
// they chose (ticket 121). Someone already a member is
// told so: they see the list already.
const bodySchema = z.object({ firstName: nameSchema, email: emailSchema });

export default defineEventHandler(async (event) => {
  const { db, user, list, party } = await requireListInvite(event);
  const { firstName, email } = await validatedBody(event, bodySchema);
  if (!list.shareToken) {
    throw createError({ statusCode: 409, statusMessage: 'list_not_open' });
  }
  const found = await findPersonByGroupEmail(db, party.id, email);
  if (found?.active) {
    throw createError({ statusCode: 409, statusMessage: 'already_member' });
  }
  const now = nowIso();
  const invited = await findAccountByEmail(db, email);
  await letIn(db, {
    partyId: party.id,
    newcomers: [{ firstName, email, language: invited?.language }],
    via: { listId: list.id },
    now,
  });
  const me = await findAccountById(db, user.accountId);
  const by = me?.firstName ?? me?.email.split('@')[0] ?? '';
  await tellEntered(
    db,
    {
      kind: 'list_shared',
      targetId: list.id,
      partyId: party.id,
      emails: [email],
      by: { accountId: user.accountId, name: me?.firstName ?? null },
    },
    now,
  );
  const link = appUrl(event, `/l/${list.shareToken}`);
  // An account is told by its news, by email as it chose (ticket 121);
  // an address without one, by this email.
  if (!invited) {
    await sendEmails(
      event,
      [
        {
          ...buildListSharedEmail(
            { by, title: list.title },
            link,
            me?.language ?? 'fr',
          ),
          to: email,
        },
      ],
      { db },
    );
  }
  setResponseStatus(event, 201);
  return secretsOf(event).devLoginLinks
    ? { ok: true, devLink: link }
    : { ok: true };
});
