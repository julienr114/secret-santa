import { couples } from '#server/database/schema';
import { findPerson, listCouples, listPeople } from '#server/database/people';
import { recordEvent } from '#server/database/audit';
import { requireGroupAccess } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { newId, nowIso } from '#server/http/context';
import { validatedBody } from '#server/http/validate';
import {
  activeCoupleOf,
  coupleInputSchema,
  displayName,
} from '#server/utils/people';

export default defineEventHandler(async (event) => {
  const { user, group, db } = await requireGroupAccess(event);
  const { personAId, personBId } = await validatedBody(
    event,
    coupleInputSchema,
  );
  const [a, b] = await Promise.all([
    findPerson(db, group.id, personAId),
    findPerson(db, group.id, personBId),
  ]);
  if (!a || !b) throw notFound('person_not_found');
  const existing = await listCouples(db, group.id);
  if (activeCoupleOf(existing, a.id) || activeCoupleOf(existing, b.id)) {
    throw createError({ statusCode: 409, statusMessage: 'already_in_couple' });
  }
  const couple = {
    id: newId(),
    groupId: group.id,
    personAId: a.id,
    personBId: b.id,
    active: true,
    createdAt: nowIso(),
    endedAt: null,
  };
  await db.insert(couples).values(couple);
  const people = await listPeople(db, group.id);
  await recordEvent(db, {
    type: 'couple_changed',
    groupId: group.id,
    personId: a.id,
    actor: user.role,
    meta: { partnerName: displayName(b, people) },
  });
  setResponseStatus(event, 201);
  return { couple };
});
