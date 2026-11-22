import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { findAccountById } from '#server/database/accounts';
import { tellEntered } from '#server/database/newsEvents';
import { persons } from '#server/database/schema';
import { nowIso } from '#server/http/context';
import { letIn, takenFromMyEvents } from '#server/http/entries';
import { requireListInvite } from '#server/http/listMembers';
import { validatedBody } from '#server/http/validate';

// « Reprendre ceux d'un autre événement » for a list (V3ListeInviter,
// V3FeteMembresReprendre, ticket 117): those I tick in the events I
// organise become members of the list's event, by the list. Those with an
// account read « Camille a partagé sa liste avec toi ». Nobody already
// there by their address is taken twice.
const bodySchema = z.object({
  personIds: z.array(z.string().min(1)).min(1).max(30),
});

export default defineEventHandler(async (event) => {
  const { db, user, list, party } = await requireListInvite(event);
  const { personIds } = await validatedBody(event, bodySchema);
  const members = await db
    .select({ email: persons.email })
    .from(persons)
    .where(and(eq(persons.partyId, party.id), eq(persons.active, true)));
  const newcomers = await takenFromMyEvents(db, user.accountId, {
    personIds,
    partyId: party.id,
    inAlready: members.flatMap((row) => (row.email ? [row.email] : [])),
  });
  const now = nowIso();
  const added = await letIn(db, {
    partyId: party.id,
    newcomers,
    via: { listId: list.id },
    now,
  });
  const me = await findAccountById(db, user.accountId);
  await tellEntered(
    db,
    {
      kind: 'list_shared',
      targetId: list.id,
      partyId: party.id,
      emails: newcomers.map((newcomer) => newcomer.email),
      by: { accountId: user.accountId, name: me?.firstName ?? null },
    },
    now,
  );
  setResponseStatus(event, 201);
  return { count: added.length };
});
