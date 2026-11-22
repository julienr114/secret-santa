import {
  findHintRequest,
  insertHintRequest,
  participationHasHints,
} from '#server/database/hints';
import { findReceiverParticipationId } from '#server/database/draw';
import { santaNameForSubject } from '#server/database/editions';
import { requirePersonalLink } from '#server/http/personal';
import { emailParticipant } from '#server/http/hints';
import { dataKeyOf } from '#server/http/context';
import { notFound, unwrap } from '#server/http/errors';
import { buildHintsRequestEmail, canRequestHints } from '#server/utils/hints';

// « Lui demander des idées » (README 22.11): once per draw, sent at once.
// Anonymous, always, even once the draw is revealed (ticket 110): no
// journal line, nothing for the organiser, and the email does not say who
// asks. Who asked is not stored either: when the hints arrive, the giver
// is found again from the draw.
export default defineEventHandler(async (event) => {
  const { db, participation, edition, person, group } =
    await requirePersonalLink(event);
  // One asks for the person one discovered, or that the reveal shows.
  if (participation.viewCount === 0 && !edition.revealedAt) {
    throw createError({ statusCode: 409, statusMessage: 'result_not_seen' });
  }
  const dataKey = await dataKeyOf(event);
  const receiverParticipationId = await findReceiverParticipationId(
    db,
    edition.id,
    person.id,
    dataKey,
  );
  if (!receiverParticipationId) throw notFound('result_not_found');
  unwrap(
    canRequestHints({
      status: edition.status,
      // No setting any more (ticket 107): everything is available.
      mode: 'full',
      receiverHasHints: await participationHasHints(
        db,
        receiverParticipationId,
      ),
      alreadyRequested: Boolean(
        await findHintRequest(db, receiverParticipationId),
      ),
    }),
  );
  await insertHintRequest(db, {
    receiverParticipationId,
    editionId: edition.id,
  });
  const santaName = await santaNameForSubject(db, edition);
  const emailed = await emailParticipant(
    event,
    db,
    receiverParticipationId,
    (data, locale) =>
      buildHintsRequestEmail(
        {
          ...data,
          editionLabel: edition.label,
          groupName: group.name,
          santaName,
        },
        locale,
      ),
    '/liste',
  );
  return { requested: true, emailed };
});
