import { plainEmail, type Email } from './messages';
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
