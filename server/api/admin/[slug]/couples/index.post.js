import { couples } from '../../../../database/schema.js';
import {
  findPerson,
  listCouples,
  listPeople,
} from '../../../../database/people.js';
import { recordEvent } from '../../../../database/audit.js';
import { requireGroupAccess } from '../../../../http/auth.js';
import { notFound } from '../../../../http/errors.js';
import { newId, nowIso } from '../../../../http/context.js';
import { validatedBody } from '../../../../http/validate.js';
import {
  activeCoupleOf,
  coupleInputSchema,
  displayName,
} from '../../../../utils/people.js';

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
