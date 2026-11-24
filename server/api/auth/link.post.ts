import { avatarOf } from '#server/utils/avatars';
import { z } from 'zod';
import { useDb } from '#server/database/client';
import { refuseWhileSignupsPaused } from '#server/http/pauses';
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
import { accountEmailSchema, superAdminEmails } from '#server/utils/accounts';
import { LINK_LIMITS, linkVerdict } from '#server/utils/limits';
import { generateToken, hashToken } from '#server/utils/crypto';
import { buildLoginEmail } from '#server/utils/loginEmail';
import { safeNext } from '#server/utils/invite';
import { localeOf } from '#shared/i18n';
import { eq } from 'drizzle-orm';
import { accounts } from '#server/database/schema';
import { nameSchema } from '#server/utils/people';

// Asks for a login link (README 22.5). The answer is the same whether the
// address had an account or not, so that accounts cannot be listed.
// Sign-up is open: a new address gets its account here, a plain one that
// can create no group (README 22.2). It is a super-admin when declared in
// NUXT_SUPER_ADMIN_EMAILS, and takes the language of the participant an
// organiser registered with that address, if any. Only a disabled account
// gets no link. Limited (lot 38 A, README 8.4): 3 links per address and
// per hour, 20 per client address, a cap for the whole app per day; a
// client is refused, an address is answered the same without an email.
const bodySchema = z.object({
  email: accountEmailSchema,
  // Where to go back after logging in: an invitation or a personal page.
  next: z.string().max(100).optional(),
  // Given when signing up: the first name of the new account.
  firstName: nameSchema.optional(),
});

export default defineEventHandler(async (event) => {
  const { email, next, firstName } = await validatedBody(event, bodySchema);
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
  const verdict = linkVerdict(recent, {
    perEmail: secrets.linkRequestsPerEmail,
    perIp: secrets.linkRequestsPerIp,
    perDay: LINK_LIMITS.perDay,
  });
  // A client that asks too much: this says nothing of any address.
  if (verdict === 'refuse') {
    throw createError({
      statusCode: 429,
      statusMessage: 'too_many_requests',
    });
  }
  setResponseHeader(event, 'Cache-Control', 'no-store');
  // An address already sent enough links, or a day when the app sent too
  // many: the same answer, and no email.
  if (verdict === 'silent') return { ok: true };

  // No new account while sign-ups are suspended (ticket 129).
  if (!existing) await refuseWhileSignupsPaused(db, declared);
  // A new account takes the face it had in a Secret Santa, if any.
  const person = existing ? null : await findPersonByEmail(db, email);
  const account =
    existing ??
    (await createAccount(db, {
      email,
      isSuperAdmin: declared,
      language: localeOf(person?.language),
      firstName: firstName ?? null,
      avatar: person ? avatarOf(person) : null,
      now,
    }));
  if (account.disabledAt) return { ok: true };
  // Signing up again with an address already known only fills a missing
  // first name: the answer stays the same, accounts are not revealed.
  if (firstName && !account.firstName) {
    await db
      .update(accounts)
      .set({ firstName })
      .where(eq(accounts.id, account.id));
  }

  const token = generateToken();
  await replaceLoginLink(db, {
    accountId: account.id,
    tokenHash: await hashToken(token),
    ipHash,
    now,
  });
  const back = safeNext(next);
  const link = appUrl(
    event,
    `/login/${token}${back ? `?next=${encodeURIComponent(back)}` : ''}`,
  );
  // A failed send changes nothing to the answer: the user asks again.
  await sendEmails(
    event,
    [{ ...buildLoginEmail(link, account.language), to: account.email }],
    { db, login: true },
  );
  setResponseHeader(event, 'Cache-Control', 'no-store');
  return secrets.devLoginLinks ? { ok: true, devLink: link } : { ok: true };
});
