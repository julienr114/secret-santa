import type { H3Event } from 'h3';
import { secretsOf } from './context';
import { ok, fail, type Result } from '#server/utils/result';
import type { Email } from '#server/utils/messages';

// Outgoing email through Resend's batch endpoint: one HTTPS call for the
// whole list, which keeps a bulk send far below the Workers free plan's
// limit of 50 subrequests per request.

const RESEND_BATCH_URL = 'https://api.resend.com/emails/batch';

export type OutgoingEmail = Email & { to: string };

export const emailConfigured = (event: H3Event): boolean =>
  Boolean(secretsOf(event).resendApiKey);

/** Sends the emails, all or none. Never logs a recipient or a link. */
export const sendEmails = async (
  event: H3Event,
  emails: OutgoingEmail[],
): Promise<Result<{ count: number }>> => {
  const { resendApiKey, emailFrom } = secretsOf(event);
  if (!resendApiKey) return fail('email_not_configured');
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
