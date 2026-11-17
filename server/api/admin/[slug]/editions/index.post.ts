import { carriedGame } from '#server/utils/guesses';
import { eq } from 'drizzle-orm';
import { editions, participations } from '#server/database/schema';
import {
  listEditions,
  newParticipation,
  publicEdition,
} from '#server/database/editions';
import { listPeople } from '#server/database/people';
import { recordEvent } from '#server/database/audit';
import { requireGroupAccess } from '#server/http/auth';
import { dataKeyOf, newId, nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import {
  checkParticipantCount,
  editionInputSchema,
  previousEdition,
} from '#server/utils/editions';
import { unwrap } from '#server/http/errors';

// Creates an edition, ready to prepare: links work at once. Its participants start as those of the previous
// edition who are still active (README 4.2), or every active person for a
// first edition. Each gets a personal link right away.
export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const body = await validatedBody(event, editionInputSchema);
  const dataKey = await dataKeyOf(event);
  const existing = await listEditions(db, group.id);
  if (existing.some((e) => e.status !== 'closed')) {
    throw createError({
      statusCode: 409,
      statusMessage: 'edition_in_progress',
    });
  }
  const previous = previousEdition(existing, body.year);
  const previousIds = previous
    ? (
        await db
          .select({ personId: participations.personId })
          .from(participations)
          .where(eq(participations.editionId, previous.id))
      ).map((r) => r.personId)
    : null;
  const people = (await listPeople(db, group.id)).filter(
    (p) => p.active && (previousIds === null || previousIds.includes(p.id)),
  );
  unwrap(checkParticipantCount(people.length));
  const edition: typeof editions.$inferSelect = {
    id: newId(),
    groupId: group.id,
    label: body.label,
    year: body.year,
    status: 'preparing',
    // The day of the party belongs to the edition (README 22.9), and so do
    // a budget and a word given with it.
    rulesOverride: {
      eventDate: body.eventDate,
      ...(body.budget === undefined ? {} : { budget: body.budget }),
      ...(body.guardianMessage === undefined
        ? {}
        : { guardianMessage: body.guardianMessage }),
    },
    rulesSnapshot: null,
    historyWaivers: null,
    reminderSentAt: null,
    drawnAt: null,
    closedAt: null,
    revealedAt: null,
    drawMode: 'app',
    // « Devine qui » is taken from the previous edition (README 22.17),
    // its end moved to the new party at the same time of day.
    ...carriedGame(previous, body.eventDate),
    guessReminderSentAt: null,
    guessesClosedAt: null,
    guessResultsSentAt: null,
    createdAt: nowIso(),
  };
  const rows = await Promise.all(
    people.map((p) =>
      newParticipation({ editionId: edition.id, personId: p.id }, dataKey),
    ),
  );
  // One statement per participant: D1 caps a statement at 100 bound
  // parameters, which a single multi-row insert passes at ten people.
  await db.batch([
    db.insert(editions).values(edition),
    ...rows.map((row) => db.insert(participations).values(row)),
  ]);
  await recordEvent(db, {
    type: 'edition_created',
    groupId: group.id,
    editionId: edition.id,
    actor: user.role,
    meta: { label: edition.label, participants: rows.length },
  });
  setResponseStatus(event, 201);
  return { edition: publicEdition(edition, rows.length) };
});
