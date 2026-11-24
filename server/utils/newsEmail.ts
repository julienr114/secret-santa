import { emailSubject, escapeHtml, type Email } from './messages';
import { translate, translateKey, type Locale } from '#shared/i18n';
import {
  NEWS_EMAIL,
  newsText,
  type EmailNews,
  type NewsKind,
  type NewsLevel,
  type NewsWords,
} from '#shared/utils/news';

// « Me prévenir » by email (ticket 121, README 22.22, NotifReglage,
// NotifEmailResume): whether a news of an account goes by email, when,
// and the two emails, one news at a time or the summary of the morning.
// Pure. Never a result of a draw, never who asks for ideas: the news do
// not hold them.

/** When the person is told on a phone, what presses waits this long. */
export const PHONE_WAIT_MS = 10 * 60_000;

/** The summary goes from this hour on (UTC), once a day. */
export const SUMMARY_HOUR_UTC = 8;

/**
 * How a news goes by email: `now`, at once; `wait`, ten minutes after,
 * if still not seen (a phone was told first); `summary`, in the next
 * summary of the morning; `none`, not by email.
 */
export type EmailWhen = 'now' | 'wait' | 'summary' | 'none';

/**
 * Whether, and when, a news goes by email (README 22.22): with « Aucun
 * email », never; with « Tout de suite », at once; with « Un résumé le
 * matin », what presses at once (ten minutes after when a phone is
 * told), the rest in the summary. A news seen, or gone already, does not
 * go; nor one whose kind has its own email, or none yet.
 * @param news - Its kind, its level, and where it is.
 * @param news.kind - What happened.
 * @param news.level - What presses, or the rest.
 * @param news.mailable - Whether it may go (the organiser may say no).
 * @param news.seen - Whether it was seen.
 * @param news.emailed - Whether it went already.
 * @param account - The choice of the account, and whether a phone of
 *   theirs is told (ticket 124).
 * @param account.mode - « Par email ».
 * @param account.phone - A phone is told.
 * @returns When.
 */
export const emailWhen = (
  news: {
    kind: NewsKind;
    level: NewsLevel;
    mailable: boolean;
    seen: boolean;
    emailed: boolean;
  },
  account: { mode: EmailNews; phone: boolean },
): EmailWhen => {
  if (
    account.mode === 'none' ||
    NEWS_EMAIL[news.kind] !== 'news' ||
    !news.mailable ||
    news.seen ||
    news.emailed
  ) {
    return 'none';
  }
  if (account.mode === 'instant') return 'now';
  if (news.level === 'urgent') return account.phone ? 'wait' : 'now';
  return 'summary';
};

/**
 * Whether a news that goes at once, or after the wait, is to go now.
 * @param when - When it goes.
 * @param at - When it happened, its last time (ISO).
 * @param now - Now (ISO).
 * @returns True when it goes now.
 */
export const goesNow = (when: EmailWhen, at: string, now: string): boolean =>
  when === 'now' ||
  (when === 'wait' && Date.parse(now) - Date.parse(at) >= PHONE_WAIT_MS);

/**
 * Whether the summary of an account is due: once a day, from the
 * morning on.
 * @param sentOn - The day of its last summary, « 2026-11-24 ».
 * @param now - Now (ISO).
 * @returns True when it may go.
 */
export const summaryDue = (sentOn: string | null, now: string): boolean =>
  new Date(now).getUTCHours() >= SUMMARY_HOUR_UTC &&
  sentOn !== now.slice(0, 10);

/**
 * The morning of a day, when its summary may go: what happened after it
 * waits for the summary of the next day.
 * @param now - Now (ISO).
 * @returns The morning of that day (ISO).
 */
export const morningOf = (now: string): string =>
  `${now.slice(0, 10)}T${String(SUMMARY_HOUR_UTC).padStart(2, '0')}:00:00.000Z`;

/**
 * Whether an email of its own (an invitation to hold a list, a request
 * for ideas, the reminder of the organisers, « Devine qui ») goes: always
 * to someone without an account, never to an account that wants no email.
 * @param mode - « Par email » of the account of that address, if any.
 * @returns True when it goes.
 */
export const ownEmailGoes = (mode: EmailNews | null): boolean =>
  mode !== 'none';

/** A news as an email tells it. */
export type MailedNews = NewsWords & {
  /** The event, or the list, the news belongs to. */
  place: string;
  /** Where it opens, absolute. */
  link: string;
};

const html = (parts: string[]) =>
  [
    '<div style="font-family:sans-serif;font-size:16px;line-height:1.5">',
    ...parts,
    '</div>',
  ].join('');
const p = (inner: string, style = 'margin:0 0 14px') =>
  `<p style="${style}">${inner}</p>`;
const a = (href: string, label: string) =>
  `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
const small = 'margin:0 0 14px;font-size:13px;color:#6b5a7a';

/** A news of a list I follow (ticket 122): its email says how to stop. */
const followed = (kind: NewsKind) =>
  kind === 'followed_ideas' || kind === 'followed_person';

/**
 * The line that stops following, under an email that tells of a list I
 * follow: « Me prévenir » lists them, each with « Ne plus suivre ».
 * @param kinds - The kinds the email tells.
 * @param link - « Me prévenir ».
 * @param locale - The language.
 * @returns Its text and its HTML, or nothing.
 */
const stopLine = (
  kinds: readonly NewsKind[],
  link: string,
  locale: Locale,
): { text: string[]; html: string[] } => {
  if (!kinds.some(followed)) return { text: [], html: [] };
  const label = translate(locale, 'notify.unfollow');
  return {
    text: [label, `${link}#suivis`],
    html: [p(a(`${link}#suivis`, label), small)],
  };
};

/**
 * The email of one news (« Tout de suite », or what presses): its
 * subject names the event (secret-santa.md, « Les objets des emails »),
 * its body says the news as « Quoi de neuf » does, with the link.
 * @param data - Who it is for, the news, the link of « Me prévenir ».
 * @param data.firstName - The first name of the account, if known.
 * @param data.news - The news.
 * @param data.settings - The link of « Me prévenir ».
 * @param locale - The language of the account.
 * @returns The email.
 */
export const buildNewsEmail = (
  data: { firstName: string | null; news: MailedNews; settings: string },
  locale: Locale,
): Email => {
  const { key, params } = newsText(data.news);
  const hello = data.firstName
    ? translate(locale, 'notify.hello', { firstName: data.firstName })
    : translate(locale, 'notify.helloNoName');
  const said = translateKey(locale, key, params);
  const footer = translate(locale, 'notify.news.footer');
  const settings = translate(locale, 'notify.settings');
  const stop = stopLine([data.news.kind], data.settings, locale);
  return {
    subject: emailSubject(
      locale,
      { event: data.news.place },
      translateKey(
        locale,
        `notify.news.subject.${data.news.kind}${data.news.kind === 'followed_ideas' && !data.news.name ? 'List' : ''}`,
        params,
      ),
    ),
    text: [
      hello,
      '',
      said,
      data.news.link,
      '',
      `${footer} ${settings}`,
      data.settings,
      ...stop.text,
    ].join('\n'),
    html: html([
      p(escapeHtml(hello)),
      p(escapeHtml(said)),
      p(a(data.news.link, data.news.link), 'margin:0 0 20px'),
      p(`${escapeHtml(footer)} ${a(data.settings, settings)}`, small),
      ...stop.html,
    ]),
  };
};

/** A block of the summary: an event, or a list of its own. */
export type SummaryBlock = {
  title: string;
  /** Where the block opens, absolute. */
  link: string;
  /** An event, or a list. */
  opens: 'party' | 'list';
  news: NewsWords[];
};

/**
 * The summary of the morning (NotifEmailResume): how many news since
 * yesterday, a block per event, at the name of the event, as « Quoi de
 * neuf » arranges them, in text only.
 * @param data - Who it is for, the blocks, the link of « Me prévenir ».
 * @param data.firstName - The first name of the account, if known.
 * @param data.blocks - The blocks, in their order.
 * @param data.settings - The link of « Me prévenir ».
 * @param locale - The language of the account.
 * @returns The email.
 */
export const buildSummaryEmail = (
  data: { firstName: string | null; blocks: SummaryBlock[]; settings: string },
  locale: Locale,
): Email => {
  const count = data.blocks
    .flatMap((block) => block.news)
    .reduce((sum, news) => sum + news.count, 0);
  const hello = data.firstName
    ? translate(locale, 'notify.hello', { firstName: data.firstName })
    : translate(locale, 'notify.helloNoName');
  const intro = translate(locale, 'notify.summary.intro');
  const footer = translate(locale, 'notify.summary.footer');
  const settings = translate(locale, 'notify.settings');
  const app = translate(locale, 'common.appName');
  const stop = stopLine(
    data.blocks.flatMap((block) => block.news.map((news) => news.kind)),
    data.settings,
    locale,
  );
  const blocks = data.blocks.map((block) => ({
    ...block,
    lines: block.news.map((news) => {
      const { key, params } = newsText(news);
      return translateKey(locale, key, params);
    }),
    label: translate(
      locale,
      block.opens === 'party'
        ? 'notify.summary.openParty'
        : 'notify.summary.openList',
    ),
  }));
  return {
    subject: translate(locale, 'notify.summary.subject', { count }),
    text: [
      hello,
      '',
      intro,
      '',
      ...blocks.flatMap((block) => [
        block.title,
        ...block.lines,
        block.link,
        '',
      ]),
      app,
      '',
      `${footer} ${settings}`,
      data.settings,
      ...stop.text,
    ].join('\n'),
    html: html([
      p(escapeHtml(hello)),
      p(escapeHtml(intro)),
      ...blocks.map((block) =>
        p(
          [
            `<strong>${escapeHtml(block.title)}</strong>`,
            ...block.lines.map(escapeHtml),
            a(block.link, block.label),
          ].join('<br>'),
        ),
      ),
      p(escapeHtml(app)),
      p(`${escapeHtml(footer)} ${a(data.settings, settings)}`, small),
      ...stop.html,
    ]),
  };
};

/** What one run of the scheduled task sends at most. */
export const NEWS_EMAILS_PER_RUN = 40;

/** A news waiting for its email, with its account's choice. */
export type WaitingNews = {
  id: string;
  accountId: string;
  kind: NewsKind;
  level: NewsLevel;
  mailable: boolean;
  /** Its last time (ISO). */
  at: string;
  mode: EmailNews;
  summarySentOn: string | null;
};

/**
 * What one run sends (ticket 121): each news that goes now in an email of
 * its own, and the summary of each account whose morning has come, with
 * the news of before that morning. The oldest first; no more than one run can send.
 * @param waiting - The news not seen nor sent yet, the oldest first.
 * @param now - Now (ISO).
 * @param max - How many emails one run sends.
 * @returns The news to send one by one, and the summaries by account.
 */
export const planNewsEmails = (
  waiting: readonly WaitingNews[],
  now: string,
  max = NEWS_EMAILS_PER_RUN,
): { single: WaitingNews[]; summaries: Map<string, WaitingNews[]> } => {
  const timed = waiting.map((news) => ({
    news,
    when: emailWhen(
      { ...news, seen: false, emailed: false },
      { mode: news.mode, phone: false },
    ),
  }));
  const single = timed
    .filter(({ news, when }) => goesNow(when, news.at, now))
    .map(({ news }) => news)
    .slice(0, max);
  const summed = timed
    .filter(
      ({ news, when }) =>
        when === 'summary' &&
        summaryDue(news.summarySentOn, now) &&
        news.at < morningOf(now),
    )
    .map(({ news }) => news);
  const accounts = [...new Set(summed.map((news) => news.accountId))].slice(
    0,
    Math.max(0, max - single.length),
  );
  return {
    single,
    summaries: new Map(
      accounts.map((accountId) => [
        accountId,
        summed.filter((news) => news.accountId === accountId),
      ]),
    ),
  };
};
