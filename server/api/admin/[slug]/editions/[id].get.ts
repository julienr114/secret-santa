import { requireGroupAccess } from '#server/http/auth';
import { dataKeyOf } from '#server/http/context';
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
  const { group, db } = await requireGroupAccess(event);
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
  return {
    edition: publicEdition(edition, participants.length),
    rules: unwrap(mergeRules(group.rules, edition.rulesOverride)),
    participants: answers.participants as (Participant & {
      answerStatus?: AnswerStatus;
    })[],
    answers: answers.answers,
    // Drawn again after a cancelled draw: « Nouveau tirage » is the
    // message to send.
    redrawn: edition.status === 'drawn' && cancelled,
  };
});
