import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { useDb } from '#server/database/client';
import { findAccountById, revokeAllSessions } from '#server/database/accounts';
import { accounts } from '#server/database/schema';
import { requireSuperAdmin } from '#server/http/auth';
import { nowIso } from '#server/http/context';
import { notFound, unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { canDisableAccount, secretSantaLimitSchema } from '#server/utils/quota';
import { profileSchema } from '#server/utils/people';

// Super-admin only: how many Secret Santa an account may organise at once,
// whether it may log in at all, and its profile (names, avatar). Disabling
// closes the sessions at once.
const bodySchema = profileSchema
  .omit({ language: true })
  .partial()
  .extend({
    secretSantaLimit: secretSantaLimitSchema.optional(),
    disabled: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'nothing to update');

export default defineEventHandler(async (event) => {
  const user = await requireSuperAdmin(event);
  const id = getRouterParam(event, 'id') ?? '';
  const body = await validatedBody(event, bodySchema);
  const { secretSantaLimit: _limit, disabled: _disabled, ...profile } = body;
  const db = useDb(event);
  const account = await findAccountById(db, id);
  if (!account) throw notFound('account_not_found');
  if (body.disabled) unwrap(canDisableAccount(user.accountId, id));
  const now = nowIso();
  await db
    .update(accounts)
    .set({
      ...profile,
      ...(body.secretSantaLimit !== undefined
        ? { secretSantaLimit: body.secretSantaLimit }
        : {}),
      ...(body.disabled !== undefined
        ? { disabledAt: body.disabled ? (account.disabledAt ?? now) : null }
        : {}),
    })
    .where(eq(accounts.id, id));
  if (body.disabled) await revokeAllSessions(db, id, now);
  return { ok: true };
});
