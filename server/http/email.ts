import type { H3Event } from 'h3';
import type { Db } from '#server/database/client';
import { countUp, countersOf, markOnce } from '#server/database/counters';
import { isSwitchOn, setSwitch } from '#server/database/switches';
import { appUrl, nowIso, secretsOf } from './context';
import { ok, fail, type Result } from '#server/utils/result';
import { plainEmail, type Email } from '#server/utils/messages';
import { crossesWarning, emailMayLeave, EMAIL_CAPS } from '#server/utils/spend';
import { translate, type Locale } from '#shared/i18n';

// Outgoing email through Resend's batch endpoint: one HTTPS call for the
// whole list, which keeps a bulk send far below the Workers free plan's
// limit of 50 subrequests per request. Every email but a login link stops
// while « Suspendre les emails » is on (ticket 129); what leaves is
// counted by day, the super-admin is warned at 70 % of a cap, and the
// cap of the month reached suspends the emails by itself.

const RESEND_BATCH_URL = 'https://api.resend.com/emails/batch';

export type OutgoingEmail = Email & { to: string };

export const emailConfigured = (event: H3Event): boolean =>
  Boolean(secretsOf(event).resendApiKey);

/** One call to the email service. Never logs a recipient or a link. */
const postBatch = async (
  event: H3Event | undefined,
  emails: OutgoingEmail[],
): Promise<Result<{ count: number }>> => {
  const { resendApiKey, emailFrom } = secretsOf(event);
  const response = await fetch(RESEND_BATCH_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${resendApiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(
      emails.map(({ to, subject, text, html }) => ({
        from: emailFrom,
        to: [to],
        subject,
        text,
        html,
      })),
    ),
  }).catch(() => null);
  if (!response) return fail('email_failed', { status: 0 });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      name?: string;
    } | null;
    return fail('email_failed', {
      status: response.status,
      name: body?.name ?? null,
    });
  }
  return ok({ count: emails.length });
};

/**
 * The warning to the super-admins at 70 % of a cap (V3Admin), in French:
 * their addresses are not accounts with a language of their own.
 * @param event - The request, if any.
 * @param data - Which cap, how many of how many.
 * @param data.period - The day, or the month.
 * @param data.used - The emails sent.
 * @param data.cap - The cap.
 * @returns Once sent, or not.
 */
const warnSuperAdmins = async (
  event: H3Event | undefined,
  data: { period: 'day' | 'month'; used: number; cap: number },
): Promise<void> => {
  const to = secretsOf(event)
    .superAdminEmails.split(',')
    .map((email) => email.trim())
    .filter(Boolean);
  if (to.length === 0) return;
  const locale: Locale = 'fr';
  const email = plainEmail({
    subject: translate(locale, `notify.capWarning.subject.${data.period}`),
    before: [
      translate(locale, `notify.capWarning.body.${data.period}`, {
        used: data.used,
        cap: data.cap,
      }),
      translate(locale, 'notify.capWarning.next'),
    ],
    link: appUrl(event, '/admin'),
  });
  await postBatch(
    event,
    to.map((address) => ({ ...email, to: address })),
  );
};

/**
 * Sends the emails, all or none: a login link always, any other unless
 * the emails are suspended. Counts them, warns at 70 % of a cap, and
 * suspends the emails once the cap of the month is reached.
 * @param event - The request, if any (the scheduled task has none).
 * @param emails - The emails.
 * @param options - The database, and whether these are login links.
 * @param options.db - The database.
 * @param options.login - Login links: they leave whatever happens.
 * @returns How many left, or why none did.
 */
export const sendEmails = async (
  event: H3Event | undefined,
  emails: OutgoingEmail[],
  options: { db: Db; login?: boolean },
): Promise<Result<{ count: number }>> => {
  if (!secretsOf(event).resendApiKey) return fail('email_not_configured');
  if (emails.length === 0) return ok({ count: 0 });
  const { db } = options;
  const paused = await isSwitchOn(db, 'emails');
  if (!emailMayLeave({ login: Boolean(options.login), paused })) {
    return fail('emails_paused');
  }
  const day = nowIso().slice(0, 10);
  const before = await countersOf(db, day);
  const sent = await postBatch(event, emails);
  if (!sent.ok) {
    await countUp(db, 'emails_rejected', day, emails.length);
    return sent;
  }
  await countUp(db, 'emails_sent', day, emails.length);
  const today = before.day.emails_sent ?? 0;
  const month = before.month.emails_sent ?? 0;
  if (
    crossesWarning(today, emails.length, EMAIL_CAPS.day) &&
    (await markOnce(db, 'warned_emails_day', day))
  ) {
    await warnSuperAdmins(event, {
      period: 'day',
      used: today + emails.length,
      cap: EMAIL_CAPS.day,
    });
  }
  if (
    crossesWarning(month, emails.length, EMAIL_CAPS.month) &&
    (await markOnce(db, 'warned_emails_month', `${day.slice(0, 7)}-01`))
  ) {
    await warnSuperAdmins(event, {
      period: 'month',
      used: month + emails.length,
      cap: EMAIL_CAPS.month,
    });
  }
  // The cap of the month reached: the emails stop by themselves.
  if (month + emails.length >= EMAIL_CAPS.month) {
    await setSwitch(db, 'emails', true);
  }
  return sent;
};
