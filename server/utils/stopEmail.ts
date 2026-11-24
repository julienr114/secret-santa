import { escapeHtml, type Email } from './messages';
import { toBase64Url } from './crypto';
import { translate, type Locale } from '#shared/i18n';

// « Ne plus recevoir d'emails » (ticket 130, README 22.25, StopEmail,
// StopDemande, StopConfirme): an address is known by its print, never
// kept in clear for someone without an account; the link at the foot of
// each email carries the address, signed, and works without logging in;
// « Signaler cet envoi » carries the event and the account that sent.
// Only the login link a person asks for goes to an address that refused.

/** Why an address receives nothing: it refused, it does not exist, it complained. */
export type BlockCause = 'person' | 'bounce' | 'complaint';

/** What the one who types a blocked address is told (StopSaisie). */
export type BlockWarning = 'refused' | 'unknown';

const encoder = new TextEncoder();
const keyOf = (secret: string, domain: string, usage: 'sign' | 'verify') =>
  crypto.subtle.importKey(
    'raw',
    encoder.encode(`${domain}:${secret}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  );
const fromBase64Url = (text: string): Uint8Array<ArrayBuffer> =>
  new Uint8Array(
    [...atob(text.replaceAll('-', '+').replaceAll('_', '/'))].map((c) =>
      c.charCodeAt(0),
    ),
  );

/**
 * An address as the app keeps it: lower case, trimmed.
 * @param email - The address.
 * @returns The same, plain.
 */
export const plainAddress = (email: string): string =>
  email.trim().toLowerCase();

/**
 * The print of an address, with the pepper of the server: the same
 * address always gives the same print, which says nothing of it.
 * @param email - The address.
 * @param secret - The secret of the server.
 * @returns The print, in hexadecimal.
 */
export const emailPrint = async (
  email: string,
  secret: string,
): Promise<string> => {
  const mac = await crypto.subtle.sign(
    'HMAC',
    await keyOf(secret, 'email-print', 'sign'),
    encoder.encode(plainAddress(email)),
  );
  return Array.from(new Uint8Array(mac), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
};

/**
 * Signs what a link carries.
 * @param domain - What the link is for.
 * @param text - What it carries.
 * @param secret - The secret of the server.
 * @returns The token.
 */
const sign = async (domain: string, text: string, secret: string) => {
  const mac = await crypto.subtle.sign(
    'HMAC',
    await keyOf(secret, domain, 'sign'),
    encoder.encode(text),
  );
  return `${toBase64Url(encoder.encode(text))}.${toBase64Url(new Uint8Array(mac))}`;
};

/**
 * Reads what a signed link carries: only what the server signed.
 * @param domain - What the link is for.
 * @param token - The token.
 * @param secret - The secret of the server.
 * @returns What it carries, or null.
 */
const verify = async (
  domain: string,
  token: string,
  secret: string,
): Promise<string | null> => {
  const [body, mac, ...rest] = token.split('.');
  if (!body || !mac || rest.length > 0 || !secret) return null;
  try {
    const text = new TextDecoder().decode(fromBase64Url(body));
    const valid = await crypto.subtle.verify(
      'HMAC',
      await keyOf(secret, domain, 'verify'),
      fromBase64Url(mac),
      encoder.encode(text),
    );
    return valid ? text : null;
  } catch {
    return null;
  }
};

/**
 * The token of « Ne plus recevoir d'emails » for an address.
 * @param email - The address.
 * @param secret - The secret of the server.
 * @returns The token.
 */
export const signStop = (email: string, secret: string): Promise<string> =>
  sign('email-stop', plainAddress(email), secret);

/**
 * The address of a token of « Ne plus recevoir d'emails ».
 * @param token - The token.
 * @param secret - The secret of the server.
 * @returns The address, or null.
 */
export const verifyStop = (
  token: string,
  secret: string,
): Promise<string | null> => verify('email-stop', token, secret);

/** Who sent an email at an organiser's request, for « Signaler cet envoi ». */
export type SentBy = { partyId: string; accountId: string | null };

/**
 * The token of « Signaler cet envoi ».
 * @param by - The event, and the account that sent.
 * @param secret - The secret of the server.
 * @returns The token.
 */
export const signReport = (by: SentBy, secret: string): Promise<string> =>
  sign('email-report', `${by.partyId}|${by.accountId ?? ''}`, secret);

/**
 * What a token of « Signaler cet envoi » names.
 * @param token - The token.
 * @param secret - The secret of the server.
 * @returns The event and the account, or null.
 */
export const verifyReport = async (
  token: string,
  secret: string,
): Promise<SentBy | null> => {
  const text = await verify('email-report', token, secret);
  if (!text) return null;
  const [partyId, accountId] = text.split('|');
  return partyId ? { partyId, accountId: accountId || null } : null;
};

/**
 * Whether an email may go to an address: never to one that refused, but
 * the login link the person asks for.
 * @param input - Whether the address is blocked, whether it is a login.
 * @param input.blocked - The address is blocked.
 * @param input.login - The email is a login link.
 * @returns True when it may go.
 */
export const mayReceive = (input: {
  blocked: boolean;
  login: boolean;
}): boolean => input.login || !input.blocked;

/**
 * What the one who types a blocked address reads (StopSaisie): that the
 * person asked for it, or that the address does not seem to exist.
 * @param cause - Why it is blocked; null when it is not.
 * @returns The warning, or null.
 */
export const blockWarning = (cause: BlockCause | null): BlockWarning | null => {
  if (!cause) return null;
  return cause === 'bounce' ? 'unknown' : 'refused';
};

/** What the foot of an email carries. */
export type Foot = {
  /** « Ne plus recevoir d'emails d'Under the Tree ». */
  stop: string;
  /** « Signaler cet envoi », for an email an organiser sent. */
  report?: { link: string; by: string | null };
  /** The first email to this address: who gave it, and what is known. */
  first?: { by: string | null };
};

/**
 * An email with its foot (StopEmail): on a first email, what the app
 * knows of the address and who gave it; then how to refuse the emails,
 * and, when an organiser sent it, how to report it.
 * @param email - The email.
 * @param foot - The links, and whether it is the first.
 * @param locale - The language of the email.
 * @returns The email, its foot added to its text and its HTML.
 */
export const withFoot = (email: Email, foot: Foot, locale: Locale): Email => {
  const first = foot.first
    ? foot.first.by
      ? translate(locale, 'notify.foot.firstBy', { name: foot.first.by })
      : translate(locale, 'notify.foot.first')
    : null;
  const stopAsk = translate(locale, 'notify.foot.stopAsk');
  const stop = translate(locale, 'notify.foot.stop');
  const reportAsk = foot.report?.by
    ? translate(locale, 'notify.foot.reportAskBy', { name: foot.report.by })
    : translate(locale, 'notify.foot.reportAsk');
  const report = translate(locale, 'notify.foot.report');
  const small = 'margin:0 0 8px;font-size:13px;color:#6b5a7a';
  const a = (href: string, label: string) =>
    `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
  return {
    ...email,
    text: [
      email.text,
      ...(first ? ['', first] : []),
      '',
      '--',
      `${stopAsk} ${stop}`,
      foot.stop,
      ...(foot.report ? [`${reportAsk} ${report}`, foot.report.link] : []),
    ].join('\n'),
    html: [
      email.html,
      ...(first
        ? [`<p style="margin:16px 0 0;font-size:14px">${escapeHtml(first)}</p>`]
        : []),
      '<div style="margin-top:20px;padding-top:14px;border-top:1px solid #d6d3d1;font-family:sans-serif">',
      `<p style="${small}">${escapeHtml(stopAsk)} ${a(foot.stop, stop)}</p>`,
      ...(foot.report
        ? [
            `<p style="${small}">${escapeHtml(reportAsk)} ${a(foot.report.link, report)}</p>`,
          ]
        : []),
      '</div>',
    ].join(''),
  };
};
