import { eq } from 'drizzle-orm';
import { editions, participations } from '../../../../database/schema.js';
import {
  listEditions,
  newParticipation,
  publicEdition,
} from '../../../../database/editions.js';
import { listPeople } from '../../../../database/people.js';
import { recordEvent } from '../../../../database/audit.js';
import { requireGroupAccess } from '../../../../http/auth.js';
import { dataKeyOf, newId, nowIso } from '../../../../http/context.js';
import { validatedBody } from '../../../../http/validate.js';
import {
  editionInputSchema,
  previousEdition,
} from '../../../../utils/editions.js';

// Creates a draft edition. Its participants start as those of the previous
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
  const edition = {
    id: newId(),
    groupId: group.id,
    label: body.label,
    year: body.year,
    status: 'draft',
    rulesOverride: null,
    rulesSnapshot: null,
    drawnAt: null,
    closedAt: null,
    createdAt: nowIso(),
  };
  const rows = await Promise.all(
    people.map((p) =>
      newParticipation({ editionId: edition.id, personId: p.id }, dataKey),
    ),
  );
  await db.batch([
    db.insert(editions).values(edition),
    ...(rows.length > 0 ? [db.insert(participations).values(rows)] : []),
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
