import { and, asc, eq, inArray, isNull, ne, or } from 'drizzle-orm';
import type { Db } from './client';
import { accounts, news } from './schema';
import { newsSectionsOf, type NewsSection } from './newsPage';
import {
  buildNewsEmail,
  buildSummaryEmail,
  planNewsEmails,
  type SummaryBlock,
} from '#server/utils/newsEmail';
import type { Email } from '#server/utils/messages';
import { localeOf } from '#shared/i18n';
import { NEWS_EMAIL, NEWS_KINDS } from '#shared/utils/news';

// The emails of the news (ticket 121, README 22.22), sent by the
// scheduled task every quarter of an hour: what goes at once, and from
// the morning on, the summary of each account. Each news is marked sent
// before its email leaves, and a summary once a day: two runs never send
// the same twice. A failed send loses an email, never the news, which
// stays in « Quoi de neuf ».

/** The news read by one run, the oldest first. */
const WAITING_READ = 300;

/** The kinds that go by the email of the news. */
const MAILED_KINDS = NEWS_KINDS.filter((kind) => NEWS_EMAIL[kind] === 'news');

/** `inArray` with nothing in it still makes a valid query. */
const anyOf = (ids: readonly string[]) => (ids.length === 0 ? [''] : [...ids]);

/**
 * Sends the emails of the news that are due.
 * @param db - The database.
 * @param tools - The key of the personal links, now, the address of a
 *   page, and how emails leave.
 * @param tools.dataKey - The key of the personal links.
 * @param tools.now - Now (ISO).
 * @param tools.url - The absolute address of a path of the app.
 * @param tools.send - Sends emails.
 * @returns How many emails left.
 */
export const sendNewsEmails = async (
  db: Db,
  tools: {
    dataKey: CryptoKey;
    now: string;
    url: (path: string) => string;
    send: (emails: (Email & { to: string })[]) => Promise<unknown>;
  },
): Promise<number> => {
  const { now } = tools;
  const today = now.slice(0, 10);
  const waiting = await db
    .select({ news, account: accounts })
    .from(news)
    .innerJoin(accounts, eq(accounts.id, news.accountId))
    .where(
      and(
        eq(news.mailable, true),
        isNull(news.seenAt),
        isNull(news.emailedAt),
        inArray(news.kind, MAILED_KINDS),
        isNull(accounts.disabledAt),
        ne(accounts.emailNews, 'none'),
      ),
    )
    .orderBy(asc(news.updatedAt))
    .limit(WAITING_READ);
  const plan = planNewsEmails(
    waiting.map(({ news: row, account }) => ({
      id: row.id,
      accountId: row.accountId,
      kind: row.kind,
      level: row.level,
      mailable: row.mailable,
      at: row.updatedAt,
      mode: account.emailNews,
      summarySentOn: account.summarySentOn,
    })),
    now,
  );
  // The summary is claimed first, once a day.
  const summed = [...plan.summaries.keys()];
  const claimedAccounts =
    summed.length === 0
      ? []
      : (
          await db
            .update(accounts)
            .set({ summarySentOn: today })
            .where(
              and(
                inArray(accounts.id, summed),
                or(
                  isNull(accounts.summarySentOn),
                  ne(accounts.summarySentOn, today),
                ),
              ),
            )
            .returning({ id: accounts.id })
        ).map((row) => row.id);
  const wanted = [
    ...plan.single.map((one) => one.id),
    ...claimedAccounts.flatMap(
      (id) => plan.summaries.get(id)?.map((one) => one.id) ?? [],
    ),
  ];
  if (wanted.length === 0) return 0;
  const claimed = new Set(
    (
      await db
        .update(news)
        .set({ emailedAt: now })
        .where(and(inArray(news.id, anyOf(wanted)), isNull(news.emailedAt)))
        .returning({ id: news.id })
    ).map((row) => row.id),
  );
  const rows = waiting.filter(({ news: row }) => claimed.has(row.id));
  const owners = [
    ...new Map(rows.map(({ account }) => [account.id, account])).values(),
  ];
  const sections = await newsSectionsOf(
    db,
    owners,
    rows.map(({ news: row }) => row),
    tools.dataKey,
    now,
  );
  const settings = tools.url('/compte/me-prevenir');
  const linkOf = (to: string | null) => tools.url(to ?? '/quoi-de-neuf');
  /** A news of an account, in its section. */
  const placed = (accountId: string, newsId: string) => {
    const section = sections
      .get(accountId)
      ?.find((one) => one.news.some((line) => line.id === newsId));
    const line = section?.news.find((one) => one.id === newsId);
    return section && line ? { section, line } : null;
  };
  const singles = plan.single.flatMap((one) => {
    const owner = owners.find((account) => account.id === one.accountId);
    const found = claimed.has(one.id) ? placed(one.accountId, one.id) : null;
    if (!owner || !found) return [];
    return [
      {
        ...buildNewsEmail(
          {
            firstName: owner.firstName,
            news: {
              ...found.line,
              place: found.section.title,
              link: linkOf(found.line.to),
            },
            settings,
          },
          localeOf(owner.language),
        ),
        to: owner.email,
      },
    ];
  });
  /** The block of a section, with only the news of the summary. */
  const blockOf = (
    section: NewsSection,
    ids: ReadonlySet<string>,
  ): SummaryBlock[] => {
    const lines = section.news.filter((line) => ids.has(line.id));
    if (lines.length === 0) return [];
    return [
      {
        title: section.title,
        opens: section.slug ? 'party' : 'list',
        link: section.slug
          ? tools.url(`/e/${section.slug}`)
          : linkOf(lines[0]!.to),
        news: lines,
      },
    ];
  };
  const summaries = claimedAccounts.flatMap((accountId) => {
    const owner = owners.find((account) => account.id === accountId);
    const ids = new Set(
      (plan.summaries.get(accountId) ?? [])
        .map((one) => one.id)
        .filter((id) => claimed.has(id)),
    );
    const blocks = (sections.get(accountId) ?? []).flatMap((section) =>
      blockOf(section, ids),
    );
    if (!owner || blocks.length === 0) return [];
    return [
      {
        ...buildSummaryEmail(
          { firstName: owner.firstName, blocks, settings },
          localeOf(owner.language),
        ),
        to: owner.email,
      },
    ];
  });
  const emails = [...singles, ...summaries];
  if (emails.length > 0) await tools.send(emails);
  return emails.length;
};
