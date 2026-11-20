import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { findAccountById } from '#server/database/accounts';
import {
  findPersonByGroupEmail,
  joinDrawInPreparation,
} from '#server/database/invite';
import { personalPath } from '#server/database/participations';
import { insertPersonFromAccount } from '#server/database/people';
import { requireInvite } from '#server/http/invite';
import { accounts, parties, persons } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { appUrl, dataKeyOf, newId, nowIso } from '#server/http/context';
import { notifyOrganizers } from '#server/http/notify';
import { buildJoinedEmail } from '#server/utils/notifications';
import { mergeRules } from '#server/utils/rules';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { canJoinGroup } from '#server/utils/invite';
import { nameSchema } from '#server/utils/people';

// Joins a group by its invitation link, as the logged-in account: it
// becomes a person of the group, copied from its profile (or its own, if
// the organiser already added that address), and a participant of the
// draw being prepared, if any (decided on 17 November 2026; a draw already
// done is left alone). The first name given here names the person, and
// completes the profile when it has none. Each newcomer takes one place
// of the link; joining twice changes nothing. The organisers are told by
// email, unless the group turned it off. The answer gives the way to the
// draw when the person is in it.
const bodySchema = z.object({ firstName: nameSchema });

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { db, group, edition } = await requireInvite(event);
  const { firstName } = await validatedBody(event, bodySchema);
  const found = await findAccountById(db, user.accountId);
  if (!found) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  const existing = await findPersonByGroupEmail(db, group.id, found.email);
  const dataKey = await dataKeyOf(event);
  /**
   * The way to the person's draw, once they are in it.
   * @param personId - The person.
   * @returns Their personal page, or null.
   */
  const pathOf = async (personId: string) => {
    const participation = await joinDrawInPreparation(db, {
      edition,
      personId,
      dataKey,
    });
    return participation ? await personalPath(participation, dataKey) : null;
  };
  if (existing?.active) return { ok: true, path: await pathOf(existing.id) };
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
  const personId = existing?.id ?? newId();
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
      id: personId,
    });
  }
  const path = await pathOf(personId);
  await db
    .update(parties)
    .set({ invitePlaces: (group.invitePlaces ?? 1) - 1 })
    .where(eq(parties.id, group.id));
  const rules = mergeRules(group.rules);
  if (rules.ok && rules.value.notifyJoined) {
    await notifyOrganizers({ db, event }, group.id, (locale) =>
      buildJoinedEmail(
        {
          groupName: group.name,
          firstName,
          link: appUrl(event, `/admin/${group.slug}/personnes`),
        },
        locale,
      ),
    );
  }
  setResponseStatus(event, 201);
  return { ok: true, path };
});
