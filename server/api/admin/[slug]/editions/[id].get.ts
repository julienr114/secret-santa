import { requireGroupAccess } from '#server/http/auth';
import { dataKeyOf, nowIso } from '#server/http/context';
import { notFound, unwrap } from '#server/http/errors';
import {
  findEdition,
  listParticipants,
  publicEdition,
  type Participant,
} from '#server/database/editions';
import { findAnswers } from '#server/database/answers';
import { mergeRules } from '#server/utils/rules';
import { wasDrawCancelled } from '#server/database/audit';
import {
  answerStatusOf,
  answersCard,
  answersState,
  type AnswerStatus,
} from '#server/utils/answers';
import type { H3Event } from 'h3';
import { and, eq } from 'drizzle-orm';
import { partyOrganisers } from '#server/database/schema';
import { gameMembers } from '#server/database/guesses';
import { gamePossible, guessesOpen } from '#server/utils/guesses';
import { nudgeTime, playedCount, toRemind } from '#server/utils/nudges';

/**
 * Where the answers of a draw made elsewhere stand (README 22.12): who
 * answered, who clashes, whether the last one follows from the others.
 * Never what anyone answered.
 */
const answersOf = async (
  event: H3Event,
  db: Parameters<typeof findAnswers>[0],
  editionId: string,
  participants: Participant[],
) => {
  const ids = participants.map((p) => p.id);
  const state = answersState(
    ids,
    await findAnswers(db, editionId, await dataKeyOf(event)),
  );
  const statusOf = (p: Participant): AnswerStatus =>
    answerStatusOf({
      answered: state.answered.includes(p.id),
      inConflict: state.conflicts.includes(p.id),
      messageSentAt: p.messageSentAt ?? null,
    });
  return {
    participants: participants.map((p) => ({
      ...p,
      answerStatus: statusOf(p),
    })),
    answers: {
      card: answersCard(state),
      /** Persons whose answers clash. */
      conflicts: state.conflicts,
      /** The one person left, when their answer follows from the others. */
      deducedFor: state.deduced?.giverId ?? null,
    },
  };
};

export default defineEventHandler(async (event) => {
  const { group, db, user } = await requireGroupAccess(event);
  const edition = await findEdition(db, group.id, getRouterParam(event, 'id'));
  if (!edition) throw notFound('edition_not_found');
  const [participants, cancelled] = await Promise.all([
    listParticipants(db, edition.id),
    wasDrawCancelled(db, group.id, edition.id),
  ]);
  const collecting =
    edition.status === 'preparing' && edition.drawMode === 'elsewhere';
  const answers = collecting
    ? await answersOf(event, db, edition.id, participants)
    : { participants, answers: null };
  // « Devine qui » (README 22.17): who has played or passed their turn,
  // never what.
  const members =
    edition.guessMode === 'none' ? [] : await gameMembers(db, edition.id);
  const players = new Set(members.filter((m) => m.played).map((m) => m.id));
  const skipped = new Set(members.filter((m) => m.skipped).map((m) => m.id));
  const count = playedCount(members);
  const left = toRemind(members).length;
  const now = nowIso();
  const open = guessesOpen(edition, now);
  // « Me tenir au courant » is each organiser's own (Correction 15).
  const [membership] = await db
    .select({ guessNews: partyOrganisers.guessNews })
    .from(partyOrganisers)
    .where(
      and(
        eq(partyOrganisers.partyId, group.id),
        eq(partyOrganisers.accountId, user.accountId),
      ),
    )
    .limit(1);
  const guess = {
    mode: edition.guessMode,
    endsAt: edition.guessEndsAt,
    timeZone: edition.guessTimeZone,
    open,
    players: count.played,
    /** Those who did not pass their turn. */
    total: count.total,
    /** Not played, not passed their turn. */
    left,
    // The organiser's last reminder; there is no limit (Correction 15).
    reminderSentAt: edition.guessReminderSentAt,
    autoReminder: edition.guessAutoReminder,
    news: membership?.guessNews ?? null,
    // Five days before the end, someone left: the card asks to remind.
    nudge: open && nudgeTime(edition.guessEndsAt, now, left),
    // The setting is free before the draw; after a draw of three, the
    // game cannot be turned on (Correction 12).
    possible:
      edition.status === 'preparing' || gamePossible(participants.length),
    // « Père Noël » is only said in a Christmas party (vocabulaire.md).
    christmas: group.category === 'christmas',
  };
  return {
    edition: publicEdition(edition, participants.length),
    rules: unwrap(mergeRules(edition.rules)),
    participants: answers.participants.map((p) => ({
      ...p,
      played: players.has(p.id),
      skipped: skipped.has(p.id),
    })) as (Participant & {
      answerStatus?: AnswerStatus;
      played: boolean;
      skipped: boolean;
    })[],
    guess,
    answers: answers.answers,
    // Drawn again after a cancelled draw: « Nouveau tirage » is the
    // message to send.
    redrawn: edition.status === 'drawn' && cancelled,
  };
});
