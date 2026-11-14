import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { findAccountById } from '#server/database/accounts';
import { findPersonByGroupEmail } from '#server/database/invite';
import { insertPersonFromAccount } from '#server/database/people';
import { requireInvite } from '#server/http/invite';
import { accounts, groups, persons } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { nowIso } from '#server/http/context';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { canJoinGroup } from '#server/utils/invite';
import { nameSchema } from '#server/utils/people';

// Joins a group by its invitation link, as the logged-in account: it
// becomes a person of the group, copied from its profile (or its own, if
// the organiser already added that address). It joins the group, not a
// draw: the organiser adds it to the draw, and new draws take it in. The
// first name given here names the person, and completes the profile when
// it has none. Each newcomer takes
// one place of the link; joining twice changes nothing.
const bodySchema = z.object({ firstName: nameSchema });

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { db, group } = await requireInvite(event);
  const { firstName } = await validatedBody(event, bodySchema);
  const found = await findAccountById(db, user.accountId);
  if (!found) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  const existing = await findPersonByGroupEmail(db, group.id, found.email);
  if (existing?.active) return { ok: true };
  const now = nowIso();
  unwrap(
    canJoinGroup(
      { until: group.inviteUntil, places: group.invitePlaces ?? 0 },
      now.slice(0, 10),
    ),
  );
  if (!found.firstName) {
    await db
      .update(accounts)
      .set({ firstName })
      .where(eq(accounts.id, found.id));
  }
  if (existing) {
    await db
      .update(persons)
      .set({ active: true })
      .where(eq(persons.id, existing.id));
  } else {
    await insertPersonFromAccount(db, {
      groupId: group.id,
      account: { ...found, firstName },
      now,
    });
  }
  await db
    .update(groups)
    .set({ invitePlaces: (group.invitePlaces ?? 1) - 1 })
    .where(eq(groups.id, group.id));
  setResponseStatus(event, 201);
  return { ok: true };
});
