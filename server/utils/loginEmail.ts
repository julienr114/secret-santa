import { escapeHtml, type Email } from './messages';
import { translate, type Locale } from '#shared/i18n';

/**
 * The email carrying a login link: short, plain, the link alone on its
 * line. It says nothing about the account, so that it can be sent the
 * same way to anyone.
 * @param link - The login link.
 * @param locale - Language of the account.
 * @returns Subject, text and HTML.
 */
export const buildLoginEmail = (link: string, locale: Locale): Email => {
  const intro = translate(locale, 'auth.email.intro');
  const after = [
    translate(locale, 'auth.email.validity'),
    translate(locale, 'auth.email.ignore'),
  ];
  const href = escapeHtml(link);
  const paragraph = (line: string) =>
    `<p style="margin:0 0 12px">${escapeHtml(line)}</p>`;
  return {
    subject: translate(locale, 'auth.email.subject'),
    text: [intro, link, '', ...after].join('\n'),
    html: [
      '<div style="font-family:sans-serif;font-size:16px;line-height:1.5">',
      paragraph(intro),
      `<p style="margin:0 0 20px"><a href="${href}">${href}</a></p>`,
      ...after.map(paragraph),
      '</div>',
    ].join(''),
  };
};
