import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { findAccountById, revokeAllSessions } from '#server/database/accounts';
import { approvePendingRequest } from '#server/database/quota';
import { accounts } from '#server/database/schema';
import { requireSuperAdmin } from '#server/http/auth';
import { appUrl, nowIso } from '#server/http/context';
import { sendEmails } from '#server/http/email';
import { buildDecisionEmail } from '#server/utils/loginEmail';
import { localeOf } from '#shared/i18n';
import { notFound, unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { canDisableAccount, groupQuotaSchema } from '#server/utils/quota';
import { profileSchema } from '#server/utils/people';

// Super-admin only: how many groups an account may create, and whether it
// may log in at all, and its profile (names, avatar). Raising the quota answers a pending request: it is
// approved and the asker told by email. Disabling closes the sessions at
// once.
const bodySchema = profileSchema
  .omit({ language: true })
  .partial()
  .extend({
    groupQuota: groupQuotaSchema.optional(),
    disabled: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'nothing to update');

export default defineEventHandler(async (event) => {
  const user = await requireSuperAdmin(event);
  const id = getRouterParam(event, 'id') ?? '';
  const body = await validatedBody(event, bodySchema);
  const { groupQuota: _quota, disabled: _disabled, ...profile } = body;
  const db = useDb(event);
  const account = await findAccountById(db, id);
  if (!account) throw notFound('account_not_found');
  if (body.disabled) unwrap(canDisableAccount(user.accountId, id));
  const now = nowIso();
  await db
    .update(accounts)
    .set({
      ...profile,
      ...(body.groupQuota !== undefined ? { groupQuota: body.groupQuota } : {}),
      ...(body.disabled !== undefined
        ? { disabledAt: body.disabled ? (account.disabledAt ?? now) : null }
        : {}),
    })
    .where(eq(accounts.id, id));
  if (body.disabled) await revokeAllSessions(db, id, now);
  const raised =
    body.groupQuota !== undefined && body.groupQuota > account.groupQuota;
  if (
    raised &&
    (await approvePendingRequest(db, {
      accountId: id,
      decidedBy: user.accountId,
      now,
    }))
  ) {
    await sendEmails(event, [
      {
        ...buildDecisionEmail(
          true,
          appUrl(event, '/'),
          localeOf(account.language),
        ),
        to: account.email,
      },
    ]);
  }
  return { ok: true };
});
