import type { HolderLevel } from './listAccess';
import { plainEmail, type Email } from './messages';
import { translate, type Locale } from '#shared/i18n';

/**
 * The day an invitation ends, as its email and its page say it: « 26
 * novembre », at the hour of Paris.
 * @param iso - When it ends.
 * @param locale - Language.
 * @returns The day and the month.
 */
export const inviteDay = (iso: string, locale: Locale): string =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  }).format(new Date(iso));

/**
 * The email that invites someone to hold a gift list (lot 25 bis, README
 * 22.20, maquette ListeInvitationEmail): who invites, to which list, what
 * the level given lets them do, one link to the page of the invitation,
 * until when it is good, that it can be refused, and a word on what the
 * app is. No image. The links « Signaler » and « Ne plus recevoir
 * d'emails » come with lots 39 and 35.
 * @param invite - Who invites, the list, the level and when it ends.
 * @param invite.by - The first name of the one who invites.
 * @param invite.title - The name of the list.
 * @param invite.level - What the one invited will be able to do.
 * @param invite.expiresAt - When the invitation ends, ISO.
 * @param link - The page of the invitation.
 * @param locale - Language of the email.
 * @returns Subject, text and HTML.
 */
export const buildHolderInviteEmail = (
  invite: { by: string; title: string; level: HolderLevel; expiresAt: string },
  link: string,
  locale: Locale,
): Email =>
  plainEmail({
    subject: translate(locale, 'lists.inviteEmail.subject', invite),
    before: [
      translate(locale, 'lists.inviteEmail.hello'),
      translate(locale, `lists.inviteEmail.intro.${invite.level}`, invite),
      translate(locale, 'lists.inviteEmail.action'),
    ],
    link,
    after: [
      translate(locale, 'lists.inviteEmail.until', {
        date: inviteDay(invite.expiresAt, locale),
      }),
      translate(locale, 'lists.invitation.about'),
    ],
  });
