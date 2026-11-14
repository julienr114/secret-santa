import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { findRequest, quotaAccountOf } from '#server/database/quota';
import { accounts, groupRequests } from '#server/database/schema';
import { requireSuperAdmin } from '#server/http/auth';
import { appUrl, nowIso } from '#server/http/context';
import { sendEmails } from '#server/http/email';
import { notFound } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { buildDecisionEmail } from '#server/utils/loginEmail';
import { quotaAfterApproval } from '#server/utils/quota';
import { localeOf } from '#shared/i18n';

// Super-admin only: answers a request for a group. Approving leaves the
// account room for one more group; either way the asker is told by email.
const bodySchema = z.object({ approve: z.boolean() });

export default defineEventHandler(async (event) => {
  const user = await requireSuperAdmin(event);
  const { approve } = await validatedBody(event, bodySchema);
  const db = useDb(event);
  const row = await findRequest(db, getRouterParam(event, 'id') ?? '');
  if (!row) throw notFound('request_not_found');
  const now = nowIso();
  // Only a pending request is decided: two super-admins cannot both win.
  const decided = await db
    .update(groupRequests)
    .set({
      status: approve ? 'approved' : 'refused',
      decidedAt: now,
      decidedBy: user.accountId,
    })
    .where(
      and(
        eq(groupRequests.id, row.request.id),
        eq(groupRequests.status, 'pending'),
      ),
    )
    .returning({ id: groupRequests.id });
  if (decided.length === 0) {
    throw createError({ statusCode: 409, statusMessage: 'request_decided' });
  }
  if (approve) {
    await db
      .update(accounts)
      .set({
        groupQuota: quotaAfterApproval(await quotaAccountOf(db, row.account)),
      })
      .where(eq(accounts.id, row.account.id));
  }
  await sendEmails(event, [
    {
      ...buildDecisionEmail(
        approve,
        appUrl(event, '/'),
        localeOf(row.account.language),
      ),
      to: row.account.email,
    },
  ]);
  return { ok: true };
});
