import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { participations, persons } from '#server/database/schema';
import { requireEdition } from '#server/http/edition';
import { addToSanta, takenFromMyEvents } from '#server/http/entries';
import { dataKeyOf, nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import { canEditParticipants } from '#server/utils/editions';

// « Reprendre ceux d'un autre événement » for a Secret Santa (V3FeteMembres
// Reprendre, ticket 117): those I tick in the events I organise become its
// participants, and so members of its event. Someone already taking part
// by that address is left as they are.
const bodySchema = z.object({
  personIds: z.array(z.string().min(1)).min(1).max(30),
});

export default defineEventHandler(async (event) => {
  const { user, group, db, edition } = await requireEdition(event);
  if (!canEditParticipants(edition.status)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'participants_locked',
    });
  }
  const { personIds } = await validatedBody(event, bodySchema);
  const taking = await db
    .select({ email: persons.email })
    .from(participations)
    .innerJoin(persons, eq(persons.id, participations.personId))
    .where(eq(participations.secretSantaId, edition.id));
  const newcomers = await takenFromMyEvents(db, user.accountId, {
    personIds,
    partyId: group.id,
    inAlready: taking.flatMap((row) => (row.email ? [row.email] : [])),
  });
  const added = await addToSanta(db, {
    santa: edition,
    newcomers,
    by: user,
    dataKey: await dataKeyOf(event),
    now: nowIso(),
  });
  setResponseStatus(event, 201);
  return { count: added.length };
});
