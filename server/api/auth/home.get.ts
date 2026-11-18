import {
  participationsWithHints,
  receiverHintsOf,
} from '#server/database/hints';
import { useDb } from '#server/database/client';
import { findAccountById } from '#server/database/accounts';
import { listOrganizedGroups, publicGroup } from '#server/database/groups';
import {
  latestRequest,
  oldestPendingRequest,
  pendingRequestCount,
  quotaAccountOf,
} from '#server/database/quota';
import { fullName } from '#server/utils/people';
import { remainingGroups } from '#server/utils/quota';
import {
  currentEditionSummaries,
  listParticipationsByEmail,
} from '#server/database/home';
import { findRevealedReceiver, loadDrawContext } from '#server/database/draw';
import { requireAccount } from '#server/http/auth';
import { dataKeyOf, nowIso } from '#server/http/context';
import { and, inArray } from 'drizzle-orm';
import { auditLog } from '#server/database/schema';
import { avatarOf } from '#server/utils/avatars';
import { ALERT_TYPES, journalSignal } from '#server/utils/audit';
import { decrypt } from '#server/utils/crypto';
import { checkFeasibility } from '#server/utils/draw';
import { nextStep } from '#server/utils/personal';
import { mergeRules, partyIsOver } from '#server/utils/rules';
import { answersOfEdition } from '#server/database/answers';
import { answersCard } from '#server/utils/answers';
import { gamePayload } from '#server/http/guesses';

/**
 * How many editions to prepare get their draw checked on the home: the
 * check reads the history of the group, and D1 caps the queries of one
 * request (README 22.10).
 */
const CHECKED_EDITIONS_MAX = 3;

// The home of a logged-in account, the same for everyone: the draws the
// address takes part in, the groups it organises, and whether it may
// create one or where its request stands (with what it wrote). A
// super-admin also learns how many requests await them, and who has been
// waiting the longest. A draw is opened through its
// personal link: the address was proven by the login link, and it is the
// one the organiser gave for that person. Never a result here.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const account = await findAccountById(db, user.accountId);
  const rows = account
    ? await listParticipationsByEmail(db, account.email)
    : [];
  const dataKey = rows.length > 0 ? await dataKeyOf(event) : null;
  const withHints = await participationsWithHints(
    db,
    rows.map((row) => row.participation.id),
  );
  // The alerts of the journals of the draws going on (README 22.15).
  const going = rows.filter((row) => row.edition.status !== 'closed');
  const groupIds = [...new Set(going.map((row) => row.edition.groupId))];
  const alertRows =
    groupIds.length === 0
      ? []
      : await db
          .select({
            id: auditLog.id,
            groupId: auditLog.groupId,
            type: auditLog.type,
            personId: auditLog.personId,
            createdAt: auditLog.createdAt,
          })
          .from(auditLog)
          .where(
            and(
              inArray(auditLog.groupId, groupIds),
              inArray(auditLog.type, ALERT_TYPES),
            ),
          );
  const draws = await Promise.all(
    rows.map(
      async ({ participation, edition, person, groupName, groupRules }) => {
        const merged = mergeRules(groupRules, edition.rulesOverride);
        const rules = merged.ok
          ? merged.value
          : { giftHints: 'none' as const, eventDate: '' };
        // A draw made elsewhere (README 22.12): is their answer given?
        const answers =
          dataKey &&
          edition.status === 'preparing' &&
          edition.drawMode === 'elsewhere'
            ? await answersOfEdition(db, edition.id, dataKey)
            : null;
        const answer = answers
          ? answers.answered.includes(person.id)
            ? ('given' as const)
            : ('toGive' as const)
          : null;
        // « Devine qui » (22.17): a guess to make, or the palmarès.
        const game =
          dataKey && edition.guessMode !== 'none' && edition.status === 'drawn'
            ? await gamePayload(
                {
                  db,
                  edition,
                  person,
                  participation,
                  group: { name: groupName },
                  rules: { eventDate: rules.eventDate },
                },
                dataKey,
              )
            : null;
        // Revealed before the party: nothing is secret, the card says who
        // they give to (README 22.18, AccueilDevoileAvant).
        const openedReceiver =
          dataKey &&
          edition.status === 'drawn' &&
          edition.revealedAt &&
          !partyIsOver(rules.eventDate, nowIso().slice(0, 10))
            ? await findRevealedReceiver(db, edition.id, person.id, dataKey)
            : null;
        const token = dataKey
          ? await decrypt(
              { enc: participation.tokenEnc, iv: participation.tokenIv },
              dataKey,
            )
          : null;
        return {
          id: participation.id,
          path: token?.ok ? `/p/${token.value}` : null,
          groupId: edition.groupId,
          groupName,
          editionLabel: edition.label,
          year: edition.year,
          status: edition.status,
          step: nextStep({
            status: edition.status,
            revealed: participation.viewCount > 0,
            hintsOn: rules.giftHints !== 'none',
            hasHints: withHints.has(participation.id),
            answer,
          }),
          answer,
          revealed: participation.viewCount > 0,
          opened: openedReceiver
            ? {
                name: openedReceiver.firstName,
                avatar: avatarOf(openedReceiver),
              }
            : null,
          hintsOn: rules.giftHints !== 'none',
          hasHints: withHints.has(participation.id),
          // New hints from the person they give to (lot 16 bis); only
          // for a draw going on, once they have discovered their result.
          receiverHints:
            dataKey &&
            edition.status === 'drawn' &&
            participation.viewCount > 0 &&
            rules.giftHints !== 'none'
              ? (
                  await receiverHintsOf(
                    db,
                    {
                      editionId: edition.id,
                      personId: person.id,
                      lastViewedAt: participation.lastViewedAt,
                    },
                    dataKey,
                  )
                ).state
              : ('none' as const),
          game: game
            ? {
                open: game.open,
                played: game.mine.length > 0,
                palmares: Boolean(game.results && game.results.size !== 'none'),
                seen: Boolean(game.results?.seen),
                endsAt: game.endsAt,
                mode: game.mode,
                skipped: game.skipped,
                canSkip: game.canSkip,
                count: game.count,
              }
            : null,
          eventDate: rules.eventDate,
          firstName: person.firstName,
          avatar: avatarOf(person),
          // Alerts since the journal was last opened from this draw; never
          // opened, since the edition was created, so that a draw cancelled
          // then made again is still told (decided by Julien on 17 November
          // 2026).
          journal:
            edition.status === 'closed'
              ? null
              : journalSignal(
                  alertRows.filter((row) => row.groupId === edition.groupId),
                  person.id,
                  participation.journalSeenAt ?? edition.createdAt,
                ),
        };
      },
    ),
  );
  const managed = await listOrganizedGroups(db, user.accountId);
  const summaries = await currentEditionSummaries(db, managed);
  const collecting = (groupId: string) =>
    summaries[groupId]?.edition.status === 'preparing' &&
    summaries[groupId]?.edition.drawMode === 'elsewhere';
  const toCheck = managed
    .filter(
      (group) =>
        summaries[group.id]?.edition.status === 'preparing' &&
        !collecting(group.id),
    )
    .slice(0, CHECKED_EDITIONS_MAX);
  const answering = managed.filter((group) => collecting(group.id));
  const checkKey =
    toCheck.length > 0 || answering.length > 0 ? await dataKeyOf(event) : null;
  // Where the answers of a draw made elsewhere stand, never what they are.
  const answersByGroup = Object.fromEntries(
    await Promise.all(
      answering.map(async (group) => {
        const state = checkKey
          ? await answersOfEdition(
              db,
              summaries[group.id]!.edition.id,
              checkKey,
            )
          : null;
        return [
          group.id,
          state
            ? { card: answersCard(state), answered: state.answered.length }
            : null,
        ];
      }),
    ),
  ) as Record<
    string,
    { card: ReturnType<typeof answersCard>; answered: number } | null
  >;
  const drawPossible = Object.fromEntries(
    await Promise.all(
      toCheck.map(async (group) => {
        const { edition } = summaries[group.id]!;
        const rules = mergeRules(group.rules, edition.rulesOverride);
        if (!rules.ok || !checkKey) return [group.id, null];
        const { input } = await loadDrawContext(
          db,
          group.id,
          edition,
          rules.value,
          checkKey,
        );
        return [group.id, checkFeasibility(input).ok];
      }),
    ),
  ) as Record<string, boolean | null>;
  const request = account ? await latestRequest(db, account.id) : null;
  const quota = account ? await quotaAccountOf(db, account) : null;
  const oldest =
    user.role === 'super_admin' ? await oldestPendingRequest(db) : null;
  return {
    role: user.role,
    firstName: account?.firstName ?? null,
    lastName: account?.lastName ?? null,
    avatar: avatarOf({ id: user.accountId, ...account }),
    draws: draws.flatMap((draw) =>
      draw.path ? [{ ...draw, path: draw.path }] : [],
    ),
    groups: managed.map((group) => ({
      ...publicGroup(group),
      current: summaries[group.id]
        ? {
            ...summaries[group.id]!.summary,
            drawPossible: drawPossible[group.id] ?? null,
            answers: answersByGroup[group.id] ?? null,
          }
        : null,
    })),
    ...(() => {
      const left = quota ? remainingGroups(quota) : 0;
      return {
        canCreateGroup: left > 0,
        // How many more groups; null when there is no limit.
        groupsLeft: Number.isFinite(left) ? left : null,
      };
    })(),
    request: request
      ? {
          status: request.status,
          createdAt: request.createdAt,
          message: request.message,
          note: request.decisionNote,
        }
      : null,
    pendingRequests:
      user.role === 'super_admin' ? await pendingRequestCount(db) : 0,
    // Who has been waiting the longest, by name, or by address.
    oldestRequest: oldest
      ? {
          name: fullName(oldest.account) || oldest.account.email,
          since: oldest.request.createdAt,
        }
      : null,
  };
});
