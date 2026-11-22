import { requireEdition } from '#server/http/edition';
import { addToSanta } from '#server/http/entries';
import { dataKeyOf, nowIso } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { findPersonByGroupEmail } from '#server/database/invite';
import { canEditParticipants } from '#server/utils/editions';
import {
  canUseEmail,
  personInputSchema,
  publicPerson,
} from '#server/utils/people';
import { findPerson } from '#server/database/people';

// « Créer une personne » (docs/spec/v3/secret-santa.md, « Choisir les
// participants »): someone new joins the event and this Secret Santa at
// once, never the event alone (ticket 117). One address, one person of
// the event; up to its 30 members.
export default defineEventHandler(async (event) => {
  const { user, group, db, edition } = await requireEdition(event);
  if (!canEditParticipants(edition.status)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'participants_locked',
    });
  }
  const body = await validatedBody(event, personInputSchema);
  unwrap(
    canUseEmail(
      body.email,
      body.email
        ? await findPersonByGroupEmail(db, group.id, body.email)
        : null,
    ),
  );
  const [personId] = await addToSanta(db, {
    santa: edition,
    newcomers: [body],
    by: user,
    dataKey: await dataKeyOf(event),
    now: nowIso(),
  });
  const person = await findPerson(db, group.id, personId);
  if (!person) throw createError({ statusCode: 500 });
  setResponseStatus(event, 201);
  return { person: publicPerson(person) };
});
