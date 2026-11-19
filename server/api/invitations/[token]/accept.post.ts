import { z } from 'zod';
import {
  createAccount,
  findAccountByEmail,
  openSessionFor,
} from '#server/database/accounts';
import { organizedGroupCount } from '#server/database/groups';
import { acceptInvite } from '#server/database/lists';
import { optionalAccount } from '#server/http/auth';
import { nowIso, secretsOf } from '#server/http/context';
import { invitationOfLink } from '#server/http/invitation';
import { settleArrivals } from '#server/http/lists';
import { superAdminEmails } from '#server/utils/accounts';
import { roleOf } from '#server/utils/auth';
import { inviteLinkUsable } from '#server/utils/listAccess';
import { nameSchema } from '#server/utils/people';
import { LOCALES } from '#shared/i18n';

// « Accepter l'invitation », or « Accepter, et créer mon compte » (lot 25
// bis, README 22.20). The link of the email proves the address, so it is
// worth a login for that address: the account is created there when
// there is none, with the first name given and no second email, a
// session opens, and the account holds the list at the level given. Once
// only: an invitation answered or expired gets a 410.
const bodySchema = z.object({
  firstName: nameSchema.optional(),
  language: z.enum(LOCALES).optional(),
});

export default defineEventHandler(async (event) => {
  const refuse = () =>
    createError({ statusCode: 410, statusMessage: 'invite_closed' });
  const { db, invite, by } = await invitationOfLink(event);
  const body = bodySchema.parse(
    (await readBody(event).catch(() => null)) ?? {},
  );
  const now = nowIso();
  if (!inviteLinkUsable(invite, now)) throw refuse();
  const existing = await findAccountByEmail(db, invite.email);
  if (existing?.disabledAt) throw refuse();
  if (!existing && !body.firstName) {
    throw createError({ statusCode: 400, statusMessage: 'first_name_missing' });
  }
  const account =
    existing ??
    (await createAccount(db, {
      email: invite.email,
      isSuperAdmin: superAdminEmails(
        secretsOf(event).superAdminEmails,
      ).includes(invite.email),
      language: body.language ?? by.language,
      firstName: body.firstName ?? null,
      now,
    }));
  if (!(await acceptInvite(db, invite, account.id, now))) throw refuse();
  // Whatever else waited for this address comes with it.
  await settleArrivals(db, account.id);
  // Already logged in as that account: the session stays as it is.
  const current = await optionalAccount(event);
  if (current?.accountId !== account.id) {
    const sessionId = await openSessionFor(db, {
      accountId: account.id,
      userAgent: getRequestHeader(event, 'user-agent') ?? null,
      now,
    });
    const role = roleOf({
      isSuperAdmin: account.isSuperAdmin,
      groupCount: await organizedGroupCount(db, account.id),
    });
    await setUserSession(event, {
      user: { role, accountId: account.id, sessionId },
      loggedInAt: now,
    });
  }
  setResponseHeader(event, 'Cache-Control', 'no-store');
  return { listId: invite.listId };
});
