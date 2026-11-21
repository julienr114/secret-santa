import { findAccountById } from '#server/database/accounts';
import { findPersonByGroupEmail } from '#server/database/invite';
import { createList } from '#server/database/lists';
import { myListFor, occasionDate } from '#server/database/listSharing';
import { persons } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { nowIso } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { requirePersonalLink } from '#server/http/personal';
import { canClaim } from '#server/utils/invite';
import { listIconOfParty } from '#server/utils/lists';
import { canUseEmail } from '#server/utils/people';
import { partyEmoji } from '#shared/utils/categories';
import { eq } from 'drizzle-orm';

// « Ma liste de cadeaux », from my Secret Santa (ticket 107, V3ListeQuiSecret):
// my list for the event, made at once and kept for the one who drew me,
// with no draft in between; or the one I already have there. Logged in
// with the person's address, or taking it when the person has none, as
// « Ajouter à mon compte » does.
export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { db, person, group } = await requirePersonalLink(event);
  const account = await findAccountById(db, user.accountId);
  if (!account) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  unwrap(canClaim(person.email, account.email));
  unwrap(
    canUseEmail(
      account.email,
      await findPersonByGroupEmail(db, person.partyId, account.email),
      person.id,
    ),
  );
  if (person.email !== account.email) {
    await db
      .update(persons)
      .set({ email: account.email })
      .where(eq(persons.id, person.id));
  }
  const id = await myListFor(
    db,
    account.id,
    group,
    async () =>
      createList(db, account.id, {
        icon: listIconOfParty(
          { emoji: partyEmoji(group), color: group.iconColor },
          (n) => crypto.getRandomValues(new Uint32Array(1))[0]! % n,
        ),
        title: group.name,
        eventDate: await occasionDate(db, group),
        partyId: group.id,
      }),
    nowIso(),
  );
  return { id };
});
