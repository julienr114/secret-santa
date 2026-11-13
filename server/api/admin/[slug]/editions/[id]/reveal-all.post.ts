import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { assignments } from '#server/database/schema';
import { recordEvent } from '#server/database/audit';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf, secretsOf } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { decrypt, timingSafeEqual, verifySecret } from '#server/utils/crypto';

// Last-resort access to the current draw for the guardian (decision of
// 2026-11-13). Guards: the guardian's password again, a typed sentence,
// and a public journal entry every participant can read.
const REVEAL_SENTENCE = 'JE VEUX VOIR LE TIRAGE';

const bodySchema = z.object({
  password: z.string().min(1).max(200),
  sentence: z.string(),
});

export default defineEventHandler(async (event) => {
  const { user, group, db, edition } = await requireEdition(event);
  if (edition.status !== 'drawn') {
    throw createError({ statusCode: 409, statusMessage: 'invalid_transition' });
  }
  const { password, sentence } = await validatedBody(event, bodySchema);
  if (sentence.trim().toUpperCase() !== REVEAL_SENTENCE) {
    throw createError({ statusCode: 400, statusMessage: 'wrong_sentence' });
  }
  const secrets = secretsOf(event);
  const passwordOk =
    user.role === 'super_admin'
      ? Boolean(secrets.superAdminPassword) &&
        timingSafeEqual(password, secrets.superAdminPassword)
      : Boolean(group.guardianPasswordHash) &&
        (await verifySecret(password, {
          hash: group.guardianPasswordHash ?? '',
          salt: group.guardianPasswordSalt ?? '',
          pepper: secrets.pinPepper,
          iterations: secrets.pbkdf2Iterations,
        }));
  if (!passwordOk)
    throw createError({
      statusCode: 401,
      statusMessage: 'invalid_credentials',
    });

  await recordEvent(db, {
    type: 'results_revealed',
    groupId: group.id,
    editionId: edition.id,
    actor: user.role,
  });
  const dataKey = await dataKeyOf(event);
  const rows = await db
    .select()
    .from(assignments)
    .where(eq(assignments.editionId, edition.id));
  const pairs = await Promise.all(
    rows.map(async (row) => {
      const receiver = await decrypt(
        { enc: row.receiverEnc, iv: row.receiverIv },
        dataKey,
      );
      return {
        giverId: row.giverPersonId,
        receiverId: receiver.ok ? receiver.value : null,
      };
    }),
  );
  setResponseHeader(event, 'Cache-Control', 'no-store');
  return { pairs };
});
