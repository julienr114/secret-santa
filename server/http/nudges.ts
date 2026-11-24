import { and, eq, isNull, ne } from 'drizzle-orm';
import type { Db } from '#server/database/client';
import {
  accounts,
  secretSantas,
  partyOrganisers,
  type SecretSantaRow,
} from '#server/database/schema';
import { gameMembers } from '#server/database/guesses';
import { santaNameForSubject } from '#server/database/editions';
import { personalPath } from '#server/database/participations';
import { recordEvent } from '#server/database/audit';
import { emailChoicesOf } from '#server/database/news';
import { ownEmailGoes } from '#server/utils/newsEmail';
import { appUrl, nowIso } from './context';
import { sendEmails } from './email';
import {
  autoReminderAt,
  autoReminderDecision,
  autoReminderTargets,
  daysLeft,
  nudgeTime,
  playedCount,
  toRemind,
} from '#server/utils/nudges';
import type { GuessMode } from '#server/utils/guesses';
import {
  buildGuessAutoReminderEmail,
  buildGuessEndEmail,
  buildGuessPointEmail,
} from '#server/utils/messages';
import { localeOf } from '#shared/i18n';

// The reminders of « Devine qui » that the scheduled task sends (README
// 22.17, Correction 15): the automatic one to the players, and the
// organisers' point and end. Each goes once, claimed before sending, so
// two runs never send twice. Never who guessed what.

type Context = { db: Db; dataKey: CryptoKey };
type Group = { id: string; name: string; slug: string; category: string };

/** Sets a column once; false when another run already did. */
const claim = async (
  db: Db,
  editionId: string,
  column: 'guessAutoReminderSentAt' | 'guessPointSentAt' | 'guessEndSentAt',
): Promise<boolean> => {
  const done = await db
    .update(secretSantas)
    .set({ [column]: nowIso() })
    .where(and(eq(secretSantas.id, editionId), isNull(secretSantas[column])))
    .returning({ id: secretSantas.id });
  return done.length > 0;
};

/** The organisers who want news of the game (« Me tenir au courant »). */
const newsRecipients = (db: Db, groupId: string) =>
  db
    .select({
      email: accounts.email,
      language: accounts.language,
      firstName: accounts.firstName,
    })
    .from(partyOrganisers)
    .innerJoin(accounts, eq(accounts.id, partyOrganisers.accountId))
    .where(
      and(
        eq(partyOrganisers.partyId, groupId),
        eq(partyOrganisers.guessNews, true),
        isNull(accounts.disabledAt),
        // « Aucun email » (ticket 121).
        ne(accounts.emailNews, 'none'),
      ),
    );

/**
 * The automatic reminder, when it is due: once, to those with an address
 * who did not play (or only guessed their own Santa, in « Toutes les
 * paires »), and did not pass their turn. Settled for good when it may
 * not go. Written in the journal as an action of the system, without a
 * name.
 * @param ctx - The database and the key.
 * @param edition - The edition.
 * @param group - Its group.
 * @param now - The time now.
 * @returns Once done.
 */
export const autoRemind = async (
  ctx: Context,
  edition: SecretSantaRow,
  group: Group,
  now: string,
) => {
  if (!edition.guessEndsAt || !edition.guessTimeZone) return;
  const decision = autoReminderDecision(
    edition,
    now,
    autoReminderAt(edition.guessEndsAt, edition.guessTimeZone),
  );
  if (decision === 'wait' || decision === 'done') return;
  if (!(await claim(ctx.db, edition.id, 'guessAutoReminderSentAt'))) return;
  if (decision !== 'send') return;
  const members = await gameMembers(ctx.db, edition.id);
  const targets = autoReminderTargets(members, edition.guessMode as GuessMode);
  if (targets.length === 0) return;
  const count = playedCount(members);
  const days = Math.max(
    1,
    daysLeft(edition.guessEndsAt, now, edition.guessTimeZone),
  );
  const santaName = await santaNameForSubject(ctx.db, edition);
  // Never to an account that wants no email (ticket 121).
  const choices = await emailChoicesOf(
    ctx.db,
    targets.map(({ id }) => members.find((m) => m.id === id)?.email ?? null),
  );
  const reached = targets.filter(({ id }) => {
    const email = members.find((m) => m.id === id)?.email;
    return ownEmailGoes(choices.get(email?.toLowerCase() ?? '') ?? null);
  });
  const emails = await Promise.all(
    reached.map(async ({ id, text }) => {
      const member = members.find((m) => m.id === id)!;
      const page = appUrl(
        undefined,
        `${await personalPath(member.participation, ctx.dataKey)}/devine`,
      );
      return {
        ...buildGuessAutoReminderEmail(
          {
            firstName: member.person.firstName,
            groupName: group.name,
            editionLabel: edition.label,
            santaName,
            link: page,
            skipLink: `${page}?passer=1`,
            christmas: group.category === 'christmas',
            guessEndsAt: edition.guessEndsAt!,
            guessTimeZone: edition.guessTimeZone,
            played: count.played,
            total: count.total,
            days,
          },
          text,
          localeOf(member.person.language),
        ),
        to: member.email!,
      };
    }),
  );
  // A failed send changes nothing: the organiser can still remind.
  if (emails.length > 0) await sendEmails(undefined, emails, { db: ctx.db });
  await recordEvent(ctx.db, {
    type: 'guess_auto_reminder_sent',
    groupId: group.id,
    editionId: edition.id,
    actor: 'system',
    meta: { count: emails.length },
  });
};

/**
 * The organisers' point, five days before the end, while someone is left
 * to remind: who has not played, who has no address, when the automatic
 * reminder goes. Once; to the organisers who want news.
 * @param ctx - The database and the key.
 * @param edition - The edition.
 * @param group - Its group.
 * @param now - The time now.
 * @returns Once done.
 */
export const organizerPoint = async (
  ctx: Context,
  edition: SecretSantaRow,
  group: Group,
  now: string,
) => {
  if (
    edition.guessPointSentAt ||
    !edition.guessEndsAt ||
    !edition.guessTimeZone ||
    edition.revealedAt
  ) {
    return;
  }
  const members = await gameMembers(ctx.db, edition.id);
  const left = toRemind(members);
  if (!nudgeTime(edition.guessEndsAt, now, left.length)) return;
  if (!(await claim(ctx.db, edition.id, 'guessPointSentAt'))) return;
  const recipients = await newsRecipients(ctx.db, group.id);
  if (recipients.length === 0) return;
  const count = playedCount(members);
  const autoAt = autoReminderAt(edition.guessEndsAt, edition.guessTimeZone);
  const autoIn =
    edition.guessAutoReminder && !edition.guessAutoReminderSentAt
      ? Math.max(1, daysLeft(autoAt, now, edition.guessTimeZone))
      : null;
  const santaName = await santaNameForSubject(ctx.db, edition);
  await sendEmails(
    undefined,
    recipients.map((r) => ({
      ...buildGuessPointEmail(
        {
          firstName: r.firstName ?? '',
          groupName: group.name,
          editionLabel: edition.label,
          santaName,
          link: appUrl(
            undefined,
            `/admin/${group.slug}/editions/${edition.id}`,
          ),
          guessEndsAt: edition.guessEndsAt!,
          guessTimeZone: edition.guessTimeZone,
          played: count.played,
          total: count.total,
          missing: left.map((m) => m.person.firstName),
          noEmail: left.filter((m) => !m.email).map((m) => m.person.firstName),
          days: daysLeft(edition.guessEndsAt!, now, edition.guessTimeZone!),
          autoIn,
        },
        localeOf(r.language),
      ),
      to: r.email,
    })),
    { db: ctx.db },
  );
};

/**
 * The organisers' email when the guesses close by time: how many played,
 * « Dévoiler le tirage », and that it reveals itself the day after.
 * Once; to the organisers who want news. Not when the reveal closed them.
 * @param ctx - The database and the key.
 * @param edition - The edition.
 * @param group - Its group.
 * @returns Once done.
 */
export const organizerEnd = async (
  ctx: Context,
  edition: SecretSantaRow,
  group: Group,
) => {
  if (edition.guessEndSentAt || edition.revealedAt || !edition.guessEndsAt) {
    return;
  }
  if (!(await claim(ctx.db, edition.id, 'guessEndSentAt'))) return;
  const recipients = await newsRecipients(ctx.db, group.id);
  if (recipients.length === 0) return;
  const count = playedCount(await gameMembers(ctx.db, edition.id));
  const santaName = await santaNameForSubject(ctx.db, edition);
  await sendEmails(
    undefined,
    recipients.map((r) => ({
      ...buildGuessEndEmail(
        {
          firstName: r.firstName ?? '',
          groupName: group.name,
          editionLabel: edition.label,
          link: appUrl(
            undefined,
            `/admin/${group.slug}/editions/${edition.id}`,
          ),
          guessEndsAt: edition.guessEndsAt!,
          guessTimeZone: edition.guessTimeZone,
          played: count.played,
          total: count.total,
          santaName,
        },
        localeOf(r.language),
      ),
      to: r.email,
    })),
    { db: ctx.db },
  );
};
