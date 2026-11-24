import { escapeHtml, plainEmail, type Email } from './messages';
import { spacedCode } from './loginCode';
import { translate, type Locale } from '#shared/i18n';

// The emails of the accounts: the login link, a request for a group and
// its answer. Short and plain, the link alone on its line.

/**
 * The email carrying a login link. It says nothing about the account, so
 * that it can be sent the same way to anyone.
 * @param link - The login link.
 * @param locale - Language of the account.
 * @returns Subject, text and HTML.
 */
export const buildLoginEmail = (link: string, locale: Locale): Email =>
  plainEmail({
    subject: translate(locale, 'auth.email.subject'),
    before: [translate(locale, 'auth.email.intro')],
    link,
    after: [
      translate(locale, 'auth.email.validity'),
      translate(locale, 'auth.email.ignore'),
    ],
  });

/**
 * The email carrying a login code (ticket 123, ConnexionCodeEmail): the
 * code in its subject and large in the email, no link (it would open in
 * the browser, not in the installed app). It says nothing about the
 * account either.
 * @param code - Six digits.
 * @param locale - Language of the account.
 * @returns Subject, text and HTML.
 */
export const buildCodeEmail = (code: string, locale: Locale): Email => {
  const spaced = spacedCode(code);
  const lines = {
    hello: translate(locale, 'auth.codeEmail.hello'),
    intro: translate(locale, 'auth.codeEmail.intro'),
    validity: translate(locale, 'auth.codeEmail.validity'),
    ignore: translate(locale, 'auth.codeEmail.ignore'),
    app: translate(locale, 'common.appName'),
    why: translate(locale, 'auth.codeEmail.why'),
  };
  const p = (text: string, style = 'margin:0 0 12px') =>
    `<p style="${style}">${escapeHtml(text)}</p>`;
  return {
    subject: translate(locale, 'auth.codeEmail.subject', { code: spaced }),
    text: [
      lines.hello,
      '',
      lines.intro,
      '',
      spaced,
      '',
      lines.validity,
      lines.ignore,
      '',
      lines.app,
      '',
      lines.why,
    ].join('\n'),
    html: [
      '<div style="font-family:sans-serif;font-size:16px;line-height:1.5">',
      p(lines.hello),
      p(lines.intro),
      p(
        spaced,
        'margin:8px 0 16px;font-size:32px;font-weight:700;letter-spacing:0.12em',
      ),
      p(lines.validity),
      p(lines.ignore),
      p(lines.app),
      p(lines.why, 'margin:12px 0 0;font-size:13px;color:#6b5a7a'),
      '</div>',
    ].join(''),
  };
};
