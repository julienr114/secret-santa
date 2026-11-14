import { z } from 'zod';
import { and, count, eq } from 'drizzle-orm';
import { participations } from '#server/database/schema';
import { newParticipation } from '#server/database/editions';
import { findPerson } from '#server/database/people';
import { recordEvent } from '#server/database/audit';
import { requireEdition } from '#server/http/edition';
import { dataKeyOf } from '#server/http/context';
import { notFound, unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import {
  canEditParticipants,
  checkParticipantCount,
} from '#server/utils/editions';

const bodySchema = z.object({ personId: z.string().min(1) });

export default defineEventHandler(async (event) => {
  const { user, group, db, edition } = await requireEdition(event);
  if (!canEditParticipants(edition.status)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'participants_locked',
    });
  }
  const { personId } = await validatedBody(event, bodySchema);
  const person = await findPerson(db, group.id, personId);
  if (!person || !person.active) throw notFound('person_not_found');
  const [existing] = await db
    .select({ id: participations.id })
    .from(participations)
    .where(
      and(
        eq(participations.editionId, edition.id),
        eq(participations.personId, person.id),
      ),
    )
    .limit(1);
  if (existing)
    throw createError({
      statusCode: 409,
      statusMessage: 'already_participating',
    });
  const [size] = await db
    .select({ n: count() })
    .from(participations)
    .where(eq(participations.editionId, edition.id));
  unwrap(checkParticipantCount((size?.n ?? 0) + 1));
  const row = await newParticipation(
    { editionId: edition.id, personId: person.id },
    await dataKeyOf(event),
  );
  await db.insert(participations).values(row);
  await recordEvent(db, {
    type: 'participant_added',
    groupId: group.id,
    editionId: edition.id,
    personId: person.id,
    actor: user.role,
  });
  setResponseStatus(event, 201);
  return { participationId: row.id };
});
