import { plainEmail, type Email } from './messages';
import { translate, type Locale } from '#shared/i18n';

/**
 * The email that invites someone to hold a gift list (lot 25, README
 * 22.20): it says who invites and to which list, that the list will be
 * among theirs once they log in with this address, and that they may
 * leave it alone.
 * @param invite - Who invites, and the name of the list.
 * @param invite.by - The first name of the one who invites.
 * @param invite.title - The name of the list.
 * @param link - The page of the list.
 * @param locale - Language of the email.
 * @returns Subject, text and HTML.
 */
export const buildHolderInviteEmail = (
  invite: { by: string; title: string },
  link: string,
  locale: Locale,
): Email =>
  plainEmail({
    subject: translate(locale, 'lists.inviteEmail.subject', invite),
    before: [
      translate(locale, 'lists.inviteEmail.intro', invite),
      translate(locale, 'lists.inviteEmail.action'),
    ],
    link,
    after: [translate(locale, 'lists.inviteEmail.ignore', invite)],
  });
