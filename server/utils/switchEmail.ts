import { plainEmail, type Email } from './messages';
import { localeOf, translate, type Locale } from '#shared/i18n';

// The email of the day after the switch to the V3 (ticket 113): the word
// of « Quoi de neuf », once, to those who have a Secret Santa or a list
// under way, with its sentence on the link for those who held a list
// shared by link. Plain, the address of the app alone on its line.

/**
 * The email of the switch.
 * @param appUrl - The address of the app.
 * @param locale - The language of the account.
 * @param withLink - Whether they held a list shared by its link.
 * @returns Subject, text and HTML.
 */
export const buildSwitchEmail = (
  appUrl: string,
  locale: Locale,
  withLink: boolean,
): Email =>
  plainEmail({
    subject: translate(locale, 'news.note.subject'),
    before: [
      translate(locale, 'news.note.v3'),
      ...(withLink ? [translate(locale, 'news.note.v3Link')] : []),
    ],
    link: appUrl,
  });

/** Who gets the email of the switch: an address, its language, its link. */
export type SwitchRecipient = {
  email: string;
  locale: Locale;
  withLink: boolean;
};

/**
 * The recipients, from what `wrangler d1 execute --json` gives for the
 * query of `pnpm v3:mot --requete`: each address once, in its language
 * (French when it has none), those already sent to left out.
 * @param output - The parsed output of wrangler.
 * @param sent - The addresses already sent to.
 * @returns The recipients still to send to.
 */
export const switchRecipients = (
  output: unknown,
  sent: ReadonlySet<string>,
): SwitchRecipient[] => {
  const rows = (Array.isArray(output) ? output : [output]).flatMap((part) =>
    Array.isArray((part as { results?: unknown })?.results)
      ? ((part as { results: unknown[] }).results as Record<string, unknown>[])
      : [],
  );
  const seen = new Set<string>();
  return rows.flatMap((row) => {
    const email = String(row.email ?? '')
      .trim()
      .toLowerCase();
    if (!email.includes('@') || sent.has(email) || seen.has(email)) return [];
    seen.add(email);
    return [
      {
        email,
        locale: localeOf(row.language),
        withLink: Number(row.with_link) === 1,
      },
    ];
  });
};
