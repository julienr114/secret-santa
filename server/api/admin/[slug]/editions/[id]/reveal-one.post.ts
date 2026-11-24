import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { assignments } from '#server/database/schema';
import { recordEvent } from '#server/database/audit';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf } from '#server/http/context';
import { notFound } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { decrypt } from '#server/utils/crypto';

// Last-resort access to one participant's result for the guardian
// (decisions of 2026-11-13: first the whole draw, then one person at a
// time, so that a doubt about someone does not expose everyone). Guards:
// a typed sentence, and above all a public journal entry naming whose
// result was looked at. (The password asked again until the accounts no
// longer exists: logins are by link.)
const REVEAL_SENTENCE = 'JE VEUX VOIR LE TIRAGE';

const bodySchema = z.object({
  personId: z.string().min(1),
  sentence: z.string(),
});

export default defineEventHandler(async (event) => {
  const { user, group, db, edition } = await requireEdition(event, {
    afterTheYear: true,
  });
  if (edition.status !== 'drawn') {
    throw createError({ statusCode: 409, statusMessage: 'invalid_transition' });
  }
  const { personId, sentence } = await validatedBody(event, bodySchema);
  if (sentence.trim().toUpperCase() !== REVEAL_SENTENCE) {
    throw createError({ statusCode: 400, statusMessage: 'wrong_sentence' });
  }
  const [row] = await db
    .select()
    .from(assignments)
    .where(
      and(
        eq(assignments.secretSantaId, edition.id),
        eq(assignments.giverPersonId, personId),
      ),
    )
    .limit(1);
  if (!row) throw notFound('participation_not_found');

  await recordEvent(db, {
    type: 'result_revealed',
    groupId: group.id,
    editionId: edition.id,
    personId,
    actor: user.role,
  });
  const receiver = await decrypt(
    { enc: row.receiverEnc, iv: row.receiverIv },
    await dataKeyOf(event),
  );
  setResponseHeader(event, 'Cache-Control', 'no-store');
  return {
    pair: {
      giverId: row.giverPersonId,
      receiverId: receiver.ok ? receiver.value : null,
    },
  };
});
