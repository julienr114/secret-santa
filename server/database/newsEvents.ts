import { and, asc, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  giftClaims,
  giftListHolders,
  giftListIdeas,
  giftListParties,
  giftLists,
  participations,
  persons,
  secretSantas,
} from './schema';
import { findGiverParticipationId } from './draw';
import {
  accountsOfEmails,
  addNews,
  memberAccounts,
  newsFor,
  organiserAccounts,
  quietly,
} from './news';
import type { NewNews } from '#shared/utils/news';

// Where the news come from (ticket 120, the inventory in
// docs/travail/questions.md): one function per thing that happens, for
// the accounts it concerns only. Each is quiet: a news that cannot be
// written never stops the gesture that made it. None writes a result of
// a draw, nor who asks for ideas: the one a giver is found for gets a
// news about their own Secret Santa, never about the one they drew.

/** `inArray` with nothing in it still makes a valid query. */
const anyOf = (ids: readonly string[]) => (ids.length === 0 ? [''] : [...ids]);

/**
 * Tells everyone who takes part in a Secret Santa: the draw is made, the
 * draw is revealed, the palmarès is out.
 * @param db - The database.
 * @param input - The Secret Santa, its event and what happened.
 * @param input.secretSantaId - The Secret Santa.
 * @param input.partyId - Its event.
 * @param input.kind - What happened.
 * @param now - Now (ISO).
 * @returns Once written.
 */
export const tellParticipants = (
  db: Db,
  input: {
    secretSantaId: string;
    partyId: string;
    kind: 'envelope' | 'revealed' | 'palmares';
  },
  now: string,
) =>
  quietly(async () => {
    const rows = await db
      .select({ email: persons.email })
      .from(participations)
      .innerJoin(persons, eq(persons.id, participations.personId))
      .where(eq(participations.secretSantaId, input.secretSantaId));
    const ids = await accountsOfEmails(
      db,
      rows.map((row) => row.email),
    );
    await addNews(
      db,
      newsFor([...ids.values()], {
        kind: input.kind,
        targetId: input.secretSantaId,
        partyId: input.partyId,
      }),
      now,
    );
  });

/**
 * Tells the organisers of an event: the day is near and some have not
 * looked, everyone has looked, someone joined.
 * @param db - The database.
 * @param input - The event, what happened, where, and who joined.
 * @param input.partyId - The event.
 * @param input.kind - What happened.
 * @param input.targetId - The Secret Santa, or the event itself.
 * @param input.name - The first name of who joined.
 * @param now - Now (ISO).
 * @returns Once written.
 */
export const tellOrganisers = (
  db: Db,
  input: {
    partyId: string;
    kind: 'reminder' | 'all_viewed' | 'joined';
    targetId: string;
    name?: string | null;
  },
  now: string,
) =>
  quietly(async () =>
    addNews(
      db,
      newsFor(await organiserAccounts(db, input.partyId), {
        kind: input.kind,
        targetId: input.targetId,
        partyId: input.partyId,
        name: input.name ?? null,
      }),
      now,
    ),
  );

/**
 * « Quelqu'un te demande des idées » (ticket 107): for the one asked,
 * about their own Secret Santa, without who asks.
 * @param db - The database.
 * @param input - The participation asked, its Secret Santa and event.
 * @param input.participationId - The one asked.
 * @param input.secretSantaId - The Secret Santa.
 * @param input.partyId - Its event.
 * @param now - Now (ISO).
 * @returns Once written.
 */
export const tellAsked = (
  db: Db,
  input: { participationId: string; secretSantaId: string; partyId: string },
  now: string,
) =>
  quietly(async () => {
    const [row] = await db
      .select({ email: persons.email })
      .from(participations)
      .innerJoin(persons, eq(persons.id, participations.personId))
      .where(eq(participations.id, input.participationId))
      .limit(1);
    const ids = await accountsOfEmails(db, [row?.email ?? null]);
    await addNews(
      db,
      newsFor([...ids.values()], {
        kind: 'hint_request',
        targetId: input.secretSantaId,
        partyId: input.partyId,
      }),
      now,
    );
  });

/**
 * An invitation to hold a list, for the account of that address if it
 * has one.
 * @param db - The database.
 * @param input - The list, the address, the first name of who invites.
 * @param input.listId - The list.
 * @param input.email - The address invited.
 * @param input.by - Who invites.
 * @param now - Now (ISO).
 * @returns Once written.
 */
export const tellInvited = (
  db: Db,
  input: { listId: string; email: string; by: string | null },
  now: string,
) =>
  quietly(async () => {
    const ids = await accountsOfEmails(db, [input.email]);
    await addNews(
      db,
      newsFor([...ids.values()], {
        kind: 'list_invite',
        targetId: input.listId,
        partyId: null,
        name: input.by,
      }),
      now,
    );
  });

/** The accounts that hold a list. */
const holdersOf = async (db: Db, listId: string) =>
  (
    await db
      .select({ accountId: giftListHolders.accountId })
      .from(giftListHolders)
      .where(eq(giftListHolders.listId, listId))
  ).map((row) => row.accountId);

/**
 * Someone ticked a gift on a list: those who hold it are told, but who
 * ticked.
 * @param db - The database.
 * @param input - The list and who ticked.
 * @param input.listId - The list.
 * @param input.by - Who ticked.
 * @param now - Now (ISO).
 * @returns Once written.
 */
export const tellTicked = (
  db: Db,
  input: { listId: string; by: string },
  now: string,
) =>
  quietly(async () => {
    const holders = (await holdersOf(db, input.listId)).filter(
      (id) => id !== input.by,
    );
    await addNews(
      db,
      newsFor(holders, {
        kind: 'ticked',
        targetId: input.listId,
        partyId: null,
      }),
      now,
    );
  });

/**
 * Someone joined a gift given by several: the one who leads it is told,
 * with the gift.
 * @param db - The database.
 * @param input - The list, the idea, who joined.
 * @param input.listId - The list.
 * @param input.ideaId - The gift.
 * @param input.by - Who joined.
 * @param now - Now (ISO).
 * @returns Once written.
 */
export const tellJoinedGift = (
  db: Db,
  input: { listId: string; ideaId: string; by: string },
  now: string,
) =>
  quietly(async () => {
    const [[leader], [idea], [joiner]] = await Promise.all([
      db
        .select({ accountId: giftClaims.accountId })
        .from(giftClaims)
        .where(eq(giftClaims.ideaId, input.ideaId))
        .orderBy(asc(giftClaims.createdAt))
        .limit(1),
      db
        .select({ text: giftListIdeas.text })
        .from(giftListIdeas)
        .where(eq(giftListIdeas.id, input.ideaId))
        .limit(1),
      db
        .select({ firstName: accounts.firstName })
        .from(accounts)
        .where(eq(accounts.id, input.by))
        .limit(1),
    ]);
    if (!leader || leader.accountId === input.by) return;
    await addNews(
      db,
      newsFor([leader.accountId], {
        kind: 'joined_gift',
        targetId: input.listId,
        partyId: null,
        name: joiner?.firstName ?? null,
        detail: idea?.text ?? null,
      }),
      now,
    );
  });

/**
 * New ideas on a list: those who may open it are told (the members of
 * the events it is shared in with everyone, and those who ticked on it);
 * whoever drew one who holds it, in a Secret Santa of these events, is
 * told about their own Secret Santa instead (« De nouvelles idées
 * t'attendent »). Its holders and the author are not told. A draft tells
 * nobody.
 * @param db - The database.
 * @param input - The list, who wrote, the key of the draws.
 * @param input.listId - The list.
 * @param input.by - Who wrote.
 * @param input.dataKey - The key of the draws.
 * @param now - Now (ISO).
 * @returns Once written.
 */
export const tellNewIdeas = (
  db: Db,
  input: { listId: string; by: string; dataKey: CryptoKey },
  now: string,
) =>
  quietly(async () => {
    const [[list], events, holders, claimers, [author]] = await Promise.all([
      db
        .select({ sharedAt: giftLists.sharedAt })
        .from(giftLists)
        .where(eq(giftLists.id, input.listId))
        .limit(1),
      db
        .select({
          partyId: giftListParties.partyId,
          visibility: giftListParties.visibility,
        })
        .from(giftListParties)
        .where(eq(giftListParties.listId, input.listId)),
      db
        .select({
          accountId: giftListHolders.accountId,
          email: accounts.email,
        })
        .from(giftListHolders)
        .innerJoin(accounts, eq(accounts.id, giftListHolders.accountId))
        .where(eq(giftListHolders.listId, input.listId)),
      db
        .selectDistinct({ accountId: giftClaims.accountId })
        .from(giftClaims)
        .where(eq(giftClaims.listId, input.listId)),
      db
        .select({ firstName: accounts.firstName })
        .from(accounts)
        .where(eq(accounts.id, input.by))
        .limit(1),
    ]);
    if (!list || (events.length === 0 && !list.sharedAt)) return;
    const partyIds = events.map((event) => event.partyId);
    // Who drew one who holds the list, in a Secret Santa drawn and not over.
    const [santas, holderPeople] = await Promise.all([
      db
        .select({ id: secretSantas.id, partyId: secretSantas.partyId })
        .from(secretSantas)
        .where(
          and(
            inArray(secretSantas.partyId, anyOf(partyIds)),
            eq(secretSantas.status, 'drawn'),
          ),
        ),
      db
        .select({
          id: persons.id,
          partyId: persons.partyId,
        })
        .from(persons)
        .where(
          and(
            inArray(persons.partyId, anyOf(partyIds)),
            inArray(
              persons.email,
              anyOf(holders.map((holder) => holder.email)),
            ),
          ),
        ),
    ]);
    const giverIds = (
      await Promise.all(
        santas.flatMap((santa) =>
          holderPeople
            .filter((person) => person.partyId === santa.partyId)
            .map(async (person) => {
              const giver = await findGiverParticipationId(
                db,
                santa.id,
                person.id,
                input.dataKey,
              );
              return giver ? { santa, giver } : null;
            }),
        ),
      )
    ).flatMap((found) => (found ? [found] : []));
    const givers = await db
      .select({ participationId: participations.id, email: persons.email })
      .from(participations)
      .innerJoin(persons, eq(persons.id, participations.personId))
      .where(
        inArray(participations.id, anyOf(giverIds.map((found) => found.giver))),
      );
    const giverAccounts = await accountsOfEmails(
      db,
      givers.map((giver) => giver.email),
    );
    const giverNews: NewNews[] = giverIds.flatMap(({ santa, giver }) => {
      const email = givers.find((row) => row.participationId === giver)?.email;
      const accountId = email ? giverAccounts.get(email.toLowerCase()) : null;
      return accountId
        ? [
            {
              accountId,
              kind: 'receiver_ideas',
              targetId: santa.id,
              partyId: santa.partyId,
              name: null,
              detail: null,
            },
          ]
        : [];
    });
    const told = new Set([
      input.by,
      ...holders.map((holder) => holder.accountId),
      ...giverNews.map((one) => one.accountId),
    ]);
    const readers = [
      ...(await memberAccounts(
        db,
        events
          .filter((event) => event.visibility === 'party')
          .map((event) => event.partyId),
      )),
      ...claimers.map((row) => row.accountId),
    ].filter((id) => !told.has(id));
    await addNews(
      db,
      [
        ...newsFor(readers, {
          kind: 'new_ideas',
          targetId: input.listId,
          partyId: null,
          name: author?.firstName ?? null,
        }),
        ...giverNews,
      ],
      now,
    );
  });
