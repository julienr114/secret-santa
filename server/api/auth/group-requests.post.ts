import { z } from 'zod';
import { useDb } from '#server/database/client';
import { findAccountById } from '#server/database/accounts';
import {
  latestRequest,
  listSuperAdmins,
  quotaAccountOf,
} from '#server/database/quota';
import { groupRequests } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { appUrl, newId, nowIso } from '#server/http/context';
import { sendEmails } from '#server/http/email';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { buildGroupRequestEmail } from '#server/utils/loginEmail';
import { canRequestGroup, requestMessageSchema } from '#server/utils/quota';
import { localeOf } from '#shared/i18n';

// Asks the super-admins for the right to create a group (README 22.2):
// one request at a time, announced to every super-admin by email.
const bodySchema = z.object({ message: requestMessageSchema });

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { message } = await validatedBody(event, bodySchema);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  const latest = await latestRequest(db, account.id);
  unwrap(
    canRequestGroup(
      await quotaAccountOf(db, account),
      latest?.status === 'pending',
    ),
  );
  const now = nowIso();
  await db.insert(groupRequests).values({
    id: newId(),
    accountId: account.id,
    message,
    status: 'pending',
    createdAt: now,
    decidedAt: null,
    decidedBy: null,
  });
  // A failed send does not lose the request: it waits on the admin page.
  const link = appUrl(event, '/admin/comptes');
  await sendEmails(
    event,
    (await listSuperAdmins(db)).map((admin) => ({
      ...buildGroupRequestEmail(
        { email: account.email, message },
        link,
        localeOf(admin.language),
      ),
      to: admin.email,
    })),
  );
  setResponseStatus(event, 201);
  return { ok: true };
});
