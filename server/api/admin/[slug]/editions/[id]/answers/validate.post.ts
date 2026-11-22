import { deleteAnswersOf, findAnswers } from '#server/database/answers';
import { drawStatements } from '#server/database/draw';
import { listParticipants } from '#server/database/editions';
import { recordEvent } from '#server/database/audit';
import { tellParticipants } from '#server/database/newsEvents';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf, newId, nowIso } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { answersAllow, pairsFromAnswers } from '#server/utils/answers';

// « Valider le tirage » (README 22.12): when everyone answered and it fits,
// or only one answer is missing and follows from the others, the answers
// become an ordinary draw (receivers encrypted) and are deleted. No
// exclusion was applied: the draw was made elsewhere. The response never
// contains an answer.
export default defineEventHandler(async (event) => {
  const { user, group, db, edition, rules } = await requireEdition(event);
  unwrap(answersAllow(edition, 'validate'));
  const dataKey = await dataKeyOf(event);
  const participants = await listParticipants(db, edition.id);
  const pairs = unwrap(
    pairsFromAnswers(
      participants.map((p) => p.id),
      await findAnswers(db, edition.id, dataKey),
    ),
  );
  const statements = await drawStatements(
    db,
    {
      editionId: edition.id,
      pairs,
      snapshot: { rules, manualExclusions: [] },
      now: nowIso(),
      newId,
    },
    dataKey,
  );
  await db.batch([...statements, deleteAnswersOf(db, edition.id)]).catch(() => {
    throw createError({
      statusCode: 409,
      statusMessage: 'invalid_transition',
    });
  });
  await recordEvent(db, {
    type: 'answers_validated',
    groupId: group.id,
    editionId: edition.id,
    actor: user.role,
    meta: { count: pairs.length },
  });
  // « Ton enveloppe t'attend », in the app (ticket 120).
  await tellParticipants(
    db,
    { secretSantaId: edition.id, partyId: group.id, kind: 'envelope' },
    nowIso(),
  );
  return { ok: true, count: pairs.length };
});
