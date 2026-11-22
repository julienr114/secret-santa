import { and, count, eq, inArray } from 'drizzle-orm';
import type { Db } from '#server/database/client';
import { findAccountById } from '#server/database/accounts';
import { recordEvent } from '#server/database/audit';
import { newParticipation } from '#server/database/editions';
import { enterParty, type Newcomer, type Via } from '#server/database/members';
import { tellEntered } from '#server/database/newsEvents';
import { partiesToTakeFrom } from '#server/database/parties';
import { countActiveMembers } from '#server/database/people';
import {
  participations,
  persons,
  type SecretSantaRow,
} from '#server/database/schema';
import type { AdminUser } from '#server/utils/auth';
import { checkParticipantCount } from '#server/utils/editions';
import { checkPartySize } from '#server/utils/parties';
import { placesTaken, takenOnce } from '#shared/utils/members';
import { unwrap } from './errors';

// Making people members of an event, always by one of its Secret Santa or
// one of its lists (ticket 117): « Créer une personne » and « Reprendre
// ceux d'un autre événement » for a Secret Santa; « Par son adresse
// email » and « Reprendre ceux d'un autre événement » for a list. The 30
// places are checked once for all of them, before anyone comes in.

/**
 * The addresses of the members still in an event.
 * @param db - The database.
 * @param partyId - The event.
 * @returns Their addresses.
 */
const memberEmails = async (db: Db, partyId: string) =>
  (
    await db
      .select({ email: persons.email })
      .from(persons)
      .where(and(eq(persons.partyId, partyId), eq(persons.active, true)))
  ).flatMap((row) => (row.email ? [row.email] : []));

/**
 * Lets newcomers in, by one place, if the event has room for them all.
 * @param db - The database.
 * @param input - The event, who comes in, by where, and when.
 * @param input.partyId - The event.
 * @param input.newcomers - Who comes in.
 * @param input.via - The Secret Santa or the list.
 * @param input.now - ISO date.
 * @returns Their persons, in their order.
 */
export const letIn = async (
  db: Db,
  {
    partyId,
    newcomers,
    via,
    now,
  }: {
    partyId: string;
    newcomers: readonly Newcomer[];
    via: Via;
    now: string;
  },
): Promise<string[]> => {
  unwrap(
    checkPartySize(
      (await countActiveMembers(db, partyId)) +
        placesTaken(newcomers, await memberEmails(db, partyId)),
    ),
  );
  // One after the other: two newcomers must not take the same icon.
  return newcomers.reduce<Promise<string[]>>(
    async (done, newcomer) => [
      ...(await done),
      (await enterParty(db, { partyId, newcomer, via, now })).personId,
    ],
    Promise.resolve([]),
  );
};

/**
 * Those I may take from my other events (« Qui reprendre ? »), ticked,
 * once each address, none already in by that address.
 * @param db - The database.
 * @param accountId - Me.
 * @param input - Those ticked, the event they go to, and the addresses
 *   already there.
 * @param input.personIds - Those ticked.
 * @param input.partyId - The event they go to: never taken from.
 * @param input.inAlready - The addresses already there.
 * @returns Them, as newcomers.
 */
export const takenFromMyEvents = async (
  db: Db,
  accountId: string,
  input: {
    personIds: readonly string[];
    partyId: string;
    inAlready: readonly string[];
  },
): Promise<Newcomer[]> => {
  const account = await findAccountById(db, accountId);
  if (!account) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' });
  }
  const offered = (await partiesToTakeFrom(db, account)).people.filter(
    (person) =>
      person.partyId !== input.partyId && input.personIds.includes(person.id),
  );
  const rows = await db
    .select()
    .from(persons)
    .where(
      inArray(
        persons.id,
        offered.length === 0 ? [''] : offered.map((person) => person.id),
      ),
    );
  const ticked = input.personIds.flatMap((id) => {
    const row = rows.find((one) => one.id === id);
    return row ? [row] : [];
  });
  return takenOnce(ticked, input.inAlready).map((row) => ({
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    language: row.language,
    avatarEmoji: row.avatarEmoji,
    avatarColor: row.avatarColor,
  }));
};

/**
 * Puts newcomers in a Secret Santa being prepared: members of its event
 * by it, then participants. Those with an account are told « Camille
 * t'ajoute au Secret Santa ».
 * @param db - The database.
 * @param input - The Secret Santa, who comes in, who adds them, the key
 *   of the links, and when.
 * @returns Their persons.
 */
export const addToSanta = async (
  db: Db,
  input: {
    santa: SecretSantaRow;
    newcomers: readonly Newcomer[];
    by: AdminUser;
    dataKey: CryptoKey;
    now: string;
  },
): Promise<string[]> => {
  const { santa, newcomers, dataKey, now } = input;
  const [size] = await db
    .select({ n: count() })
    .from(participations)
    .where(eq(participations.secretSantaId, santa.id));
  unwrap(checkParticipantCount((size?.n ?? 0) + newcomers.length));
  const personIds = await letIn(db, {
    partyId: santa.partyId,
    newcomers,
    via: { secretSantaId: santa.id },
    now,
  });
  const taking = new Set(
    (
      await db
        .select({ personId: participations.personId })
        .from(participations)
        .where(eq(participations.secretSantaId, santa.id))
    ).map((row) => row.personId),
  );
  const fresh = [...new Set(personIds)].filter((id) => !taking.has(id));
  const rows = await Promise.all(
    fresh.map((personId) =>
      newParticipation({ secretSantaId: santa.id, personId }, dataKey),
    ),
  );
  if (rows.length > 0) {
    await db.batch([
      db.insert(participations).values(rows[0]!),
      ...rows.slice(1).map((row) => db.insert(participations).values(row)),
    ]);
  }
  await Promise.all(
    fresh.map((personId) =>
      recordEvent(db, {
        type: 'participant_added',
        groupId: santa.partyId,
        editionId: santa.id,
        personId,
        actor: input.by.role,
      }),
    ),
  );
  const me = await findAccountById(db, input.by.accountId);
  await tellEntered(
    db,
    {
      kind: 'santa_added',
      targetId: santa.id,
      partyId: santa.partyId,
      emails: newcomers.map((newcomer) => newcomer.email),
      by: { accountId: input.by.accountId, name: me?.firstName ?? null },
    },
    now,
  );
  return personIds;
};
