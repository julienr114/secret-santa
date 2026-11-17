import {
  findHintRequest,
  insertHintRequest,
  participationHasHints,
} from '#server/database/hints';
import { findReceiverParticipationId } from '#server/database/draw';
import { requirePersonalLink } from '#server/http/personal';
import { emailParticipant } from '#server/http/hints';
import { dataKeyOf } from '#server/http/context';
import { notFound, unwrap } from '#server/http/errors';
import { encrypt } from '#server/utils/crypto';
import { buildHintsRequestEmail, canRequestHints } from '#server/utils/hints';

// « Lui demander des pistes » (README 22.11): once per draw, sent at once.
// Anonymous: no journal line, nothing for the organiser, and the email
// does not say who asks. Who asked is kept encrypted, only to write to
// them when the hints arrive.
export default defineEventHandler(async (event) => {
  const { db, participation, edition, person, group, rules } =
    await requirePersonalLink(event);
  // One asks for the person one discovered.
  if (participation.viewCount === 0) {
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
      mode: rules.giftHints,
      receiverHasHints: await participationHasHints(
        db,
        receiverParticipationId,
      ),
      alreadyRequested: Boolean(
        await findHintRequest(db, receiverParticipationId),
      ),
    }),
  );
  const requester = await encrypt(participation.id, dataKey);
  await insertHintRequest(db, {
    receiverParticipationId,
    editionId: edition.id,
    requesterEnc: requester.enc,
    requesterIv: requester.iv,
  });
  const emailed = await emailParticipant(
    event,
    db,
    receiverParticipationId,
    (data, locale) =>
      buildHintsRequestEmail(
        { ...data, editionLabel: edition.label, groupName: group.name },
        locale,
      ),
    '/pistes',
  );
  return { requested: true, emailed };
});
