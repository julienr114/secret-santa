import type { H3Event } from 'h3';
import type { Db } from '#server/database/client';
import { organizerRecipients } from '#server/database/notify';
import { sendEmails } from './email';
import type { Email } from '#server/utils/messages';
import { localeOf, type Locale } from '#shared/i18n';

/**
 * Emails every organiser of a group, each in their own language. A failed
 * send changes nothing for the action that caused it.
 * @param context - The database, and the request when there is one.
 * @param groupId - The group.
 * @param build - The email, for a language.
 */
export const notifyOrganizers = async (
  context: { db: Db; event?: H3Event },
  groupId: string,
  build: (locale: Locale) => Email,
): Promise<void> => {
  const recipients = await organizerRecipients(context.db, groupId);
  if (recipients.length === 0) return;
  await sendEmails(
    context.event,
    recipients.map(({ email, language }) => ({
      ...build(localeOf(language)),
      to: email,
    })),
  );
};
