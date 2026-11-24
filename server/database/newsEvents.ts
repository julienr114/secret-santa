import { and, asc, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  news,
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
import { followersOf, listPersonName } from './follows';
import { guessesOpen } from '#server/utils/guesses';
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
 * draw is revealed, the palmarès is out, « Devine qui » opens.
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
    kind: 'envelope' | 'revealed' | 'palmares' | 'game_open';
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
 * « Devine qui » is open, the draw made (ticket 142): « À toi de jouer »
 * gets its news, as its line gets its dot. Nothing when the game is not
 * on.
 * @param db - The database.
 * @param input - The Secret Santa and its event.
 * @param input.secretSantaId - The Secret Santa.
 * @param input.partyId - Its event.
 * @param now - Now (ISO).
 * @returns Once written.
 */
export const tellGameOpen = async (
  db: Db,
  input: { secretSantaId: string; partyId: string },
  now: string,
) => {
  const [edition] = await db
    .select()
    .from(secretSantas)
    .where(eq(secretSantas.id, input.secretSantaId))
    .limit(1);
  if (!edition || !guessesOpen(edition, now)) return;
  await tellParticipants(db, { ...input, kind: 'game_open' }, now);
};

/**
 * The game turned off: its « À toi de jouer » goes.
 * @param db - The database.
 * @param secretSantaId - The Secret Santa.
 * @returns Once deleted.
 */
export const forgetGameOpen = (db: Db, secretSantaId: string) =>
  quietly(async () => {
    await db
      .delete(news)
      .where(and(eq(news.kind, 'game_open'), eq(news.targetId, secretSantaId)));
  });

/**
 * Tells the organisers of an event: the day is near and some have not
 * looked, everyone has looked, someone joined.
 * @param db - The database.
 * @param input - The event, what happened, where, and who joined.
 * @param input.partyId - The event.
 * @param input.kind - What happened.
 * @param input.targetId - The Secret Santa, or the event itself.
 * @param input.name - The first name of who signed up by the link.
 * @param input.detail - The Secret Santa they signed up to, when the
 *   event has several the same year (ticket 116).
 * @param input.mailable - Whether it may go by email: the setting of the
 *   Secret Santa for its kind (ticket 121).
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
    detail?: string | null;
    mailable?: boolean;
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
        detail: input.detail ?? null,
        mailable: input.mailable ?? true,
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

/**
 * Someone came into an event by a Secret Santa or a list because another
 * put them there (ticket 117): « Camille t'ajoute au Secret Santa »,
 * « Camille a partagé sa liste avec toi ». Only for the addresses that
 * have an account, never for the one who did it.
 * @param db - The database.
 * @param input - What happened, where, to whom, and by whom.
 * @param input.kind - Added to a Secret Santa, or a list shared.
 * @param input.targetId - The Secret Santa, or the list.
 * @param input.partyId - The event.
 * @param input.emails - The addresses of those put there.
 * @param input.by - Who put them there: their account and first name.
 * @param now - Now (ISO).
 * @returns Once written.
 */
export const tellEntered = (
  db: Db,
  input: {
    kind: 'santa_added' | 'list_shared';
    targetId: string;
    partyId: string;
    emails: readonly (string | null)[];
    by: { accountId: string; name: string | null };
  },
  now: string,
) =>
  quietly(async () => {
    const ids = await accountsOfEmails(db, input.emails);
    await addNews(
      db,
      newsFor(
        [...ids.values()].filter((id) => id !== input.by.accountId),
        {
          kind: input.kind,
          targetId: input.targetId,
          partyId: input.partyId,
          name: input.by.name,
        },
      ),
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
 * nobody. Those who follow the list, or the person the idea is for, are
 * told by a news of their own, that goes by email (ticket 122) : « 3
 * nouvelles idées pour Léo », grouped by person and by day.
 * @param db - The database.
 * @param input - The list, the person, who wrote, the key of the draws.
 * @param input.listId - The list.
 * @param input.listPersonId - The person the idea is for.
 * @param input.by - Who wrote.
 * @param input.dataKey - The key of the draws.
 * @param now - Now (ISO).
 * @returns Once written.
 */
export const tellNewIdeas = (
  db: Db,
  input: {
    listId: string;
    listPersonId: string | null;
    by: string;
    dataKey: CryptoKey;
  },
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
    const giverAccountIds = new Set(giverNews.map((one) => one.accountId));
    const [followers, personName] = await Promise.all([
      followersOf(db, {
        listId: input.listId,
        happened: { kind: 'idea', listPersonId: input.listPersonId },
        by: input.by,
      }),
      listPersonName(db, input.listPersonId),
    ]);
    const told = new Set([
      input.by,
      ...holders.map((holder) => holder.accountId),
      // A follower has the news of what they follow, not this one too.
      ...followers,
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
    // The one who drew a holder reads the list like any member too, so
    // that its line has its dot as everyone's (ticket 142); their news of
    // the list names nobody, beside « De nouvelles idées t'attendent ».
    await addNews(
      db,
      [
        ...newsFor(
          readers.filter((id) => !giverAccountIds.has(id)),
          {
            kind: 'new_ideas',
            targetId: input.listId,
            partyId: null,
            name: author?.firstName ?? null,
          },
        ),
        ...newsFor(
          readers.filter((id) => giverAccountIds.has(id)),
          { kind: 'new_ideas', targetId: input.listId, partyId: null },
        ),
        ...newsFor(followers, {
          kind: 'followed_ideas',
          targetId: input.listId,
          partyId: null,
          name: personName,
        }),
        ...giverNews,
      ],
      now,
    );
  });

/**
 * A person added to a list (ticket 122): those who follow the whole list
 * are told, « Zoé est sur la liste ».
 * @param db - The database.
 * @param input - The list, the person, who added them.
 * @param input.listId - The list.
 * @param input.listPersonId - The person on the list.
 * @param input.by - Who added them.
 * @param now - Now (ISO).
 * @returns Once written.
 */
export const tellPersonAdded = (
  db: Db,
  input: { listId: string; listPersonId: string; by: string },
  now: string,
) =>
  quietly(async () => {
    const [followers, name] = await Promise.all([
      followersOf(db, {
        listId: input.listId,
        happened: { kind: 'person' },
        by: input.by,
      }),
      listPersonName(db, input.listPersonId),
    ]);
    if (!name) return;
    await addNews(
      db,
      newsFor(followers, {
        kind: 'followed_person',
        targetId: input.listId,
        partyId: null,
        name,
      }),
      now,
    );
  });
