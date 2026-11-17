import { z } from 'zod';
import {
  editionPersons,
  findAnswers,
  saveAnswer,
} from '#server/database/answers';
import { recordEvent } from '#server/database/audit';
import { dataKeyOf, nowIso } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { requirePersonalLink } from '#server/http/personal';
import { validatedBody } from '#server/http/validate';
import { answersAllow } from '#server/utils/answers';

// A participant says who they give to, or corrects it, until the
// organiser validates (README 22.12). The person comes from the link,
// never from the request. No error when it clashes with someone else's:
// that would let one guess who gives to whom. Each change is journaled,
// without what was answered, so that an organiser who takes part cannot
// probe quietly by changing their own.
const bodySchema = z.object({ personId: z.string().min(1) });

export default defineEventHandler(async (event) => {
  const { db, participation, edition, person, group } =
    await requirePersonalLink(event);
  unwrap(answersAllow(edition, 'answer'));
  const { personId } = await validatedBody(event, bodySchema);
  const people = await editionPersons(db, edition.id);
  if (personId === person.id || !people.some((p) => p.id === personId)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_answer' });
  }
  const dataKey = await dataKeyOf(event);
  const before = (await findAnswers(db, edition.id, dataKey)).find(
    (a) => a.giverId === person.id,
  );
  if (before?.receiverId === personId) return { ok: true };
  await saveAnswer(
    db,
    {
      participationId: participation.id,
      editionId: edition.id,
      receiverPersonId: personId,
    },
    dataKey,
    nowIso(),
  );
  await recordEvent(db, {
    type: before ? 'answer_changed' : 'answer_given',
    groupId: group.id,
    editionId: edition.id,
    personId: person.id,
    actor: 'participant',
  });
  return { ok: true };
});
