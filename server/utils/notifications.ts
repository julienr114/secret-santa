import { emailSubject, plainEmail, type Email } from './messages';
import { daysUntil, formatEventDate } from './rules';
import type { EditionStatus } from './editions';
import { translate, type Locale } from '#shared/i18n';

// The reminder to the organisers of an event (README 22.2): the exchange
// is near and some have not discovered their result. The other emails to
// the organisers are news now, sent as each chose (ticket 121). Pure.

/** How many days before the exchange the reminder goes. */
export const REMINDER_DAYS = 3;

/**
 * Whether everyone in the edition has discovered their result.
 * @param counts - Participants, and how many have looked.
 * @returns True when nobody is left, and there is somebody.
 */
export const isEveryoneViewed = (counts: {
  participants: number;
  viewed: number;
}): boolean => counts.participants > 0 && counts.viewed >= counts.participants;

/**
 * Whether the reminder of an edition is due on `today`: drawn, a dated
 * exchange within the next days, and no reminder sent yet.
 * @param edition - Status, date of the exchange, reminder already sent.
 * @param today - ISO day.
 * @returns True when it is time.
 */
export const isReminderDue = (
  edition: {
    status: EditionStatus;
    eventDate: string;
    reminderSentAt: string | null;
  },
  today: string,
): boolean => {
  if (edition.status !== 'drawn' || edition.reminderSentAt) return false;
  const days = daysUntil(edition.eventDate, today);
  return days !== null && days <= REMINDER_DAYS;
};

/**
 * The exchange is near and some have not discovered their result.
 * @param data - Group, edition, date, who is missing, link to the edition.
 * @param locale - Language of the organiser.
 * @returns The email.
 */
export const buildReminderEmail = (
  data: {
    groupName: string;
    editionLabel: string;
    eventDate: string;
    missing: string[];
    santaName?: string | null;
    link: string;
  },
  locale: Locale,
): Email =>
  plainEmail({
    subject: emailSubject(
      locale,
      { event: data.groupName, santa: data.santaName },
      translate(locale, 'notify.reminder.subject'),
    ),
    before: [
      translate(locale, 'notify.reminder.body', {
        edition: data.editionLabel,
        date: formatEventDate(data.eventDate, locale),
      }),
      translate(locale, 'notify.reminder.missing', {
        count: data.missing.length,
        names: data.missing.join(', '),
      }),
      translate(locale, 'notify.reminder.next'),
    ],
    link: data.link,
  });
