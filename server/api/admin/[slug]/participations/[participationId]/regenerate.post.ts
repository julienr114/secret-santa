import { eq } from 'drizzle-orm';
import { participations } from '#server/database/schema';
import { personalLink } from '#server/database/participations';
import { recordEvent } from '#server/database/audit';
import { requireParticipation } from '#server/http/participation';
import { dataKeyOf } from '#server/http/context';
import { encrypt, generateToken, hashToken } from '#server/utils/crypto';

// Compromised link (README 4.4): a new token, the old link stops working.
export default defineEventHandler(async (event) => {
  const { user, group, db, edition, person, participation } =
    await requireParticipation(event);
  if (edition.status === 'closed') {
    throw createError({ statusCode: 409, statusMessage: 'edition_closed' });
  }
  const dataKey = await dataKeyOf(event);
  const token = generateToken();
  const { enc, iv } = await encrypt(token, dataKey);
  const changes = {
    tokenHash: await hashToken(token),
    tokenEnc: enc,
    tokenIv: iv,
    messageSentAt: null,
  };
  await db
    .update(participations)
    .set(changes)
    .where(eq(participations.id, participation.id));
  await recordEvent(db, {
    type: 'link_regenerated',
    groupId: group.id,
    editionId: edition.id,
    personId: person.id,
    actor: user.role,
  });
  return {
    link: await personalLink(event, { tokenEnc: enc, tokenIv: iv }, dataKey),
  };
});
