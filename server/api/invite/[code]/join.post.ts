import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { findAccountById } from '#server/database/accounts';
import {
  findParticipationOf,
  findPersonByGroupEmail,
  joinSecretSanta,
  participantCount,
} from '#server/database/invite';
import { checkParticipantCount } from '#server/utils/editions';
import { personalPath } from '#server/database/participations';
import { tellOrganisers } from '#server/database/newsEvents';
import {
  countActiveMembers,
  insertPersonFromAccount,
} from '#server/database/people';
import { requireInvite } from '#server/http/invite';
import { accounts, persons, secretSantas } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { dataKeyOf, newId, nowIso } from '#server/http/context';
import { mergeRules } from '#server/utils/rules';
import { unwrap } from '#server/http/errors';
import { validatedBody } from '#server/http/validate';
import { canSignUp, linkPlaces } from '#server/utils/invite';
import { nameSchema } from '#server/utils/people';

// Signs up to a Secret Santa by its invitation link, as the logged-in
// account (ticket 116): it takes part in this Secret Santa, and becomes a
// member of its event when it was not (a person copied from its profile,
// or its own, if the organiser already added that address). Only while
// the draw has not taken place. The first name given here names the
// person, and completes the profile when it has none. Each newcomer to the
// event takes one place of the link, never past the 30 members of an
// event; a member takes none, and signing up twice changes nothing. The
// organisers are told, by email unless this Secret Santa turned it off.
// The answer gives the way to the person's page.
const bodySchema = z.object({ firstName: nameSchema });

export default defineEventHandler(async (event) => {
  const user = await requireAccount(event);
  const { db, group, santa, santaName } = await requireInvite(event);
  const { firstName } = await validatedBody(event, bodySchema);
  const found = await findAccountById(db, user.accountId);
  if (!found) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  const existing = await findPersonByGroupEmail(db, group.id, found.email);
  const member = Boolean(existing?.active);
  const dataKey = await dataKeyOf(event);
  const already =
    existing && member
      ? await findParticipationOf(db, santa.id, existing.id)
      : null;
  if (already) {
    return { ok: true, path: await personalPath(already, dataKey) };
  }
  const now = nowIso();
  unwrap(
    canSignUp(
      {
        status: santa.status,
        until: santa.inviteUntil,
        places: linkPlaces(
          santa.invitePlaces,
          await countActiveMembers(db, group.id),
        ),
        member,
      },
      now.slice(0, 10),
    ),
  );
  unwrap(checkParticipantCount((await participantCount(db, santa.id)) + 1));
  if (!found.firstName) {
    await db
      .update(accounts)
      .set({ firstName })
      .where(eq(accounts.id, found.id));
  }
  const personId = existing?.id ?? newId();
  if (existing && !member) {
    await db
      .update(persons)
      .set({ active: true })
      .where(eq(persons.id, existing.id));
  } else if (!existing) {
    await insertPersonFromAccount(db, {
      groupId: group.id,
      account: { ...found, firstName },
      now,
      id: personId,
    });
  }
  const participation = await joinSecretSanta(db, {
    santa,
    personId,
    dataKey,
  });
  const path = participation
    ? await personalPath(participation, dataKey)
    : null;
  if (!member) {
    await db
      .update(secretSantas)
      .set({ invitePlaces: (santa.invitePlaces ?? 1) - 1 })
      .where(eq(secretSantas.id, santa.id));
  }
  // In the app, and by email as each organiser chose (ticket 121), if
  // the Secret Santa wants it.
  const rules = mergeRules(santa.rules);
  await tellOrganisers(
    db,
    {
      partyId: group.id,
      kind: 'joined',
      targetId: group.id,
      name: firstName,
      detail: santaName,
      mailable: rules.ok && rules.value.notifyJoined,
    },
    now,
  );
  setResponseStatus(event, 201);
  return { ok: true, path };
});
