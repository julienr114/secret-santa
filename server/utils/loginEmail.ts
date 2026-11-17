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

/**
 * Tells a super-admin that someone asks to create a group.
 * @param request - Who asks, and why, in their words.
 * @param link - The admin page where the request is answered.
 * @param locale - Language of the super-admin.
 * @returns Subject, text and HTML.
 */
export const buildGroupRequestEmail = (
  request: { email: string; message: string },
  link: string,
  locale: Locale,
): Email =>
  plainEmail({
    subject: translate(locale, 'auth.requestEmail.subject'),
    before: [
      translate(locale, 'auth.requestEmail.intro', { email: request.email }),
      request.message,
      translate(locale, 'auth.requestEmail.action'),
    ],
    link,
  });

/** Longest word a super-admin may add to an answer. */
export const DECISION_NOTE_MAX = 300;

/**
 * Tells the asker what was decided about their request, with the
 * super-admin's word if they wrote one.
 * @param approved - Whether the request was approved.
 * @param link - The home page of the app.
 * @param locale - Language of the account.
 * @param note - The super-admin's word, or nothing.
 * @returns Subject, text and HTML.
 */
export const buildDecisionEmail = (
  approved: boolean,
  link: string,
  locale: Locale,
  note: string | null = null,
): Email => {
  const key = approved ? ('approved' as const) : ('refused' as const);
  return plainEmail({
    subject: translate(locale, `auth.decisionEmail.${key}Subject`),
    before: [
      translate(locale, `auth.decisionEmail.${key}`),
      ...(note ? [translate(locale, 'auth.decisionEmail.note'), note] : []),
    ],
    link,
  });
};
