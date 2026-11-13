import { eq } from 'drizzle-orm';
import { participations } from '#server/database/schema';
import { personalLink } from '#server/database/participations';
import { recordEvent } from '#server/database/audit';
import { requireParticipation } from '#server/http/participation';
import { dataKeyOf, nowIso } from '#server/http/context';

// The bare link, for copying (journaled, README 9).
export default defineEventHandler(async (event) => {
  const { user, group, db, edition, person, participation } =
    await requireParticipation(event);
  const link = await personalLink(event, participation, await dataKeyOf(event));
  await db
    .update(participations)
    .set({ linkCopiedAt: nowIso() })
    .where(eq(participations.id, participation.id));
  await recordEvent(db, {
    type: 'link_copied',
    groupId: group.id,
    editionId: edition.id,
    personId: person.id,
    actor: user.role,
  });
  return { link };
});
