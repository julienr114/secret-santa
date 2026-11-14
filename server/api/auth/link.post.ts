import { z } from 'zod';
import { useDb } from '#server/database/client';
import {
  createAccount,
  findAccountByEmail,
  findPersonByEmail,
  recentLinkRequests,
  replaceLoginLink,
} from '#server/database/accounts';
import { appUrl, ipHashOf, nowIso, secretsOf } from '#server/http/context';
import { sendEmails } from '#server/http/email';
import { validatedBody } from '#server/http/validate';
import {
  accountEmailSchema,
  canRequestLink,
  superAdminEmails,
} from '#server/utils/accounts';
import { generateToken, hashToken } from '#server/utils/crypto';
import { buildLoginEmail } from '#server/utils/loginEmail';
import { localeOf } from '#shared/i18n';

// Asks for a login link (README 22.5). The answer is the same whether the
// address had an account or not, so that accounts cannot be listed.
// Sign-up is open: a new address gets its account here, a plain one that
// can create no group (README 22.2). It is a super-admin when declared in
// NUXT_SUPER_ADMIN_EMAILS, and takes the language of the participant an
// organiser registered with that address, if any. Only a disabled account
// gets no link.
const bodySchema = z.object({ email: accountEmailSchema });

export default defineEventHandler(async (event) => {
  const { email } = await validatedBody(event, bodySchema);
  const db = useDb(event);
  const secrets = secretsOf(event);
  const now = nowIso();
  const ipHash = await ipHashOf(event);
  const declared = superAdminEmails(secrets.superAdminEmails).includes(email);
  const existing = await findAccountByEmail(db, email);

  const recent = await recentLinkRequests(db, {
    accountId: existing?.id ?? null,
    ipHash,
    now,
  });
  if (!canRequestLink(recent, secrets.linkRequestsPerIp).ok) {
    throw createError({
      statusCode: 429,
      statusMessage: 'too_many_attempts',
    });
  }

  const account =
    existing ??
    (await createAccount(db, {
      email,
      isSuperAdmin: declared,
      language: localeOf((await findPersonByEmail(db, email))?.language),
      now,
    }));
  if (account.disabledAt) return { ok: true };

  const token = generateToken();
  await replaceLoginLink(db, {
    accountId: account.id,
    tokenHash: await hashToken(token),
    ipHash,
    now,
  });
  const link = appUrl(event, `/login/${token}`);
  // A failed send changes nothing to the answer: the user asks again.
  await sendEmails(event, [
    { ...buildLoginEmail(link, account.language), to: account.email },
  ]);
  setResponseHeader(event, 'Cache-Control', 'no-store');
  return secrets.devLoginLinks ? { ok: true, devLink: link } : { ok: true };
});
