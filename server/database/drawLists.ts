import { and, asc, eq, inArray, ne, or } from 'drizzle-orm';
import type { Db } from './client';
import {
  familyMembers,
  giftListHolders,
  giftListParties,
  giftListPeople,
  giftLists,
  participations,
  parties,
  persons,
  secretSantas,
  type PartyRow,
} from './schema';
import { createList, ensureSelf, forgetCarried } from './lists';
import { currentYearOf, linkedListsOf, occasionDate } from './listSharing';
import { personalPath } from './participations';
import { newId } from '#server/http/context';
import { invitePlace } from '#server/utils/invite';
import { listIconOfParty } from '#server/utils/lists';
import { subjectSantaName } from '#server/utils/messages';
import { partyEmoji, type PartyCategory } from '#shared/utils/categories';
import { listYear } from '#shared/utils/years';

// What is tied to a Secret Santa is me, in a list (docs/spec/v3/listes.md,
// « Depuis mon Secret Santa », decision of 22 November 2026, ticket 136).
// Me on a list: my « Moi », or a person of someone else's family linked
// to my account. Nothing to store: it follows from the account.

/**
 * My « Moi », made from my profile if needed.
 * @param db - The database.
 * @param accountId - My account.
 * @returns Its id, or null before I have a first name.
 */
const selfOf = async (db: Db, accountId: string): Promise<string | null> => {
  await ensureSelf(db, accountId);
  const [self] = await db
    .select({ id: familyMembers.id })
    .from(familyMembers)
    .where(
      and(
        eq(familyMembers.accountId, accountId),
        eq(familyMembers.isSelf, true),
      ),
    )
    .limit(1);
  return self?.id ?? null;
};

/**
 * A new list from my Secret Santa (V3ListeSecretNouvelle): made for its
 * event, with its date and icon, and me on it already, first.
 * Without the ideas of my last list: « Repartir d'une liste » offers
 * them (Q-032).
 * @param db - The database.
 * @param accountId - My account.
 * @param party - The event of the draw.
 * @param title - Its name, « Idées pour le Secret Santa » (ticket 148:
 * `drawListTitle`).
 * @returns The list, and my place on it (null before I have a first name).
 */
export const newListForDraw = async (
  db: Db,
  accountId: string,
  party: PartyRow,
  title: string,
): Promise<{ id: string; selfPersonId: string | null }> => {
  const id = await createList(db, accountId, {
    icon: listIconOfParty(
      { emoji: partyEmoji(party), color: party.iconColor },
      (n) => crypto.getRandomValues(new Uint32Array(1))[0]! % n,
    ),
    title,
    eventDate: await occasionDate(db, party),
    partyId: party.id,
  });
  const self = await selfOf(db, accountId);
  if (!self) return { id, selfPersonId: null };
  const selfPersonId = newId();
  await db
    .insert(giftListPeople)
    .values({ id: selfPersonId, listId: id, memberId: self, position: 0 });
  return { id, selfPersonId };
};

/** A list « Quelle liste pour ton Secret Santa ? » offers. */
export type DrawListRow = {
  id: string;
  title: string;
  updatedAt: string;
  /** Its occasion and the events it is shared in, by name. */
  events: { id: string; name: string; category: PartyCategory }[];
  /** Those it is made for, « me » among them. */
  people: { name: string; me: boolean }[];
};

/**
 * The lists « Quelle liste pour ton Secret Santa ? » offers: those I
 * manage, of the year of the event, where I figure. A list I hold
 * without figuring on it is not offered; one I only help to write
 * neither, since its sharing is not mine to change.
 * @param db - The database.
 * @param accountId - My account.
 * @param partyId - The event of the draw.
 * @returns The lists, each with its events and its people.
 */
export const listsIFigureOn = async (
  db: Db,
  accountId: string,
  partyId: string,
): Promise<DrawListRow[]> => {
  const current = await currentYearOf(db, partyId);
  const held = await db
    .selectDistinct({
      id: giftLists.id,
      title: giftLists.title,
      partyId: giftLists.partyId,
      eventDate: giftLists.eventDate,
      createdAt: giftLists.createdAt,
      updatedAt: giftLists.updatedAt,
    })
    .from(giftListHolders)
    .innerJoin(giftLists, eq(giftLists.id, giftListHolders.listId))
    .innerJoin(giftListPeople, eq(giftListPeople.listId, giftLists.id))
    .innerJoin(familyMembers, eq(familyMembers.id, giftListPeople.memberId))
    .where(
      and(
        eq(giftListHolders.accountId, accountId),
        eq(giftListHolders.level, 'manage'),
        or(
          and(
            eq(familyMembers.accountId, accountId),
            eq(familyMembers.isSelf, true),
          ),
          eq(familyMembers.linkedAccountId, accountId),
        ),
      ),
    );
  const lists = held.filter(
    (list) => !current || listYear(list) === current.year,
  );
  if (lists.length === 0) return [];
  const ids = lists.map((list) => list.id);
  const [shared, people] = await Promise.all([
    db
      .select({
        listId: giftListParties.listId,
        partyId: giftListParties.partyId,
      })
      .from(giftListParties)
      .where(inArray(giftListParties.listId, ids))
      .orderBy(asc(giftListParties.createdAt)),
    db
      .select({
        listId: giftListPeople.listId,
        name: familyMembers.firstName,
        ownerId: familyMembers.accountId,
        isSelf: familyMembers.isSelf,
        linkedAccountId: familyMembers.linkedAccountId,
        placeholder: familyMembers.placeholder,
      })
      .from(giftListPeople)
      .innerJoin(familyMembers, eq(familyMembers.id, giftListPeople.memberId))
      .where(inArray(giftListPeople.listId, ids))
      .orderBy(asc(giftListPeople.position)),
  ]);
  const partyIds = [
    ...new Set([
      ...lists.flatMap((list) => (list.partyId ? [list.partyId] : [])),
      ...shared.map((row) => row.partyId),
    ]),
  ];
  const events = partyIds.length
    ? await db
        .select({
          id: parties.id,
          name: parties.name,
          category: parties.category,
        })
        .from(parties)
        .where(and(inArray(parties.id, partyIds), eq(parties.fromList, false)))
    : [];
  return lists.map((list) => {
    const of = [
      ...new Set([
        ...(list.partyId ? [list.partyId] : []),
        ...shared
          .filter((row) => row.listId === list.id)
          .map((row) => row.partyId),
      ]),
    ];
    return {
      id: list.id,
      title: list.title,
      updatedAt: list.updatedAt,
      events: of.flatMap((id) => events.filter((event) => event.id === id)),
      people: people
        .filter((row) => row.listId === list.id && !row.placeholder)
        .map((row) => ({
          name: row.name,
          me: (row.isSelf ? row.ownerId : row.linkedAccountId) === accountId,
        })),
    };
  });
};

/**
 * Whether I am on a list (ticket 139): my « Moi », or a person of someone
 * else's family linked to my account. « Celui qui m'a tiré » is offered
 * only then.
 * @param db - The database.
 * @param listId - The list.
 * @param accountId - My account.
 * @returns True when I am one of its people.
 */
export const amOnList = async (
  db: Db,
  listId: string,
  accountId: string,
): Promise<boolean> => {
  const [found] = await db
    .select({ id: giftListPeople.id })
    .from(giftListPeople)
    .innerJoin(familyMembers, eq(familyMembers.id, giftListPeople.memberId))
    .where(
      and(
        eq(giftListPeople.listId, listId),
        or(
          and(
            eq(familyMembers.accountId, accountId),
            eq(familyMembers.isSelf, true),
          ),
          eq(familyMembers.linkedAccountId, accountId),
        ),
      ),
    )
    .limit(1);
  return Boolean(found);
};

/**
 * Gives a list I hold to the one who draws me (« Celui qui m'a tiré »,
 * ticket 136): one more stage of its sharing for the event, nothing taken
 * from it. Shared with all the members already, it stays so, with the
 * line « Celui qui m'a tiré » too (ticket 139). The marks
 * of a list taken up again go, as at any first share.
 * @param db - The database.
 * @param listId - The list.
 * @param partyId - The event of the draw.
 * @param now - ISO date.
 * @returns Once saved.
 */
export const giveListToDraw = async (
  db: Db,
  listId: string,
  partyId: string,
  now: string,
) => {
  await db.batch([
    db
      .insert(giftListParties)
      .values({
        id: newId(),
        listId,
        partyId,
        visibility: 'giver',
        giver: true,
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: [giftListParties.listId, giftListParties.partyId],
        set: { giver: true },
      }),
    db
      .update(giftLists)
      .set({ updatedAt: now })
      .where(eq(giftLists.id, listId)),
  ]);
  await forgetCarried(db, listId);
};

/**
 * Unlinks a list from the Secret Santa of an event (ticket 148): the one
 * who drew me no longer sees it by this way. Shared with all the members
 * of the event, it stays so; otherwise the event leaves its sharing.
 * Nothing else changes: its ideas, its ticks. The cross of « Celui qui
 * m'a tiré » in « Qui voit ta liste ? » does the same.
 * @param db - The database.
 * @param listId - The list.
 * @param partyId - The event of the Secret Santa.
 * @returns Once saved.
 */
export const unlinkDraw = async (db: Db, listId: string, partyId: string) => {
  const where = and(
    eq(giftListParties.listId, listId),
    eq(giftListParties.partyId, partyId),
  );
  await db.batch([
    db
      .delete(giftListParties)
      .where(and(where, eq(giftListParties.visibility, 'giver'))),
    db.update(giftListParties).set({ giver: false }).where(where),
  ]);
};

/**
 * Links a list I hold to the Secret Santa of an event (ticket 148). A
 * Secret Santa has only one list: linked elsewhere, it moves here.
 * @param db - The database.
 * @param accountId - My account.
 * @param listId - The list.
 * @param partyId - The event of the Secret Santa.
 * @param now - ISO date.
 * @returns Once saved.
 */
export const linkDraw = async (
  db: Db,
  accountId: string,
  listId: string,
  partyId: string,
  now: string,
) => {
  await unlinkElsewhere(db, accountId, listId, partyId);
  await giveListToDraw(db, listId, partyId, now);
};

/**
 * Unlinks from the Secret Santa of an event the other lists I hold: a
 * Secret Santa has only one list (ticket 148).
 * @param db - The database.
 * @param accountId - My account.
 * @param listId - The list it is linked to now.
 * @param partyId - The event of the Secret Santa.
 * @returns Once saved.
 */
export const unlinkElsewhere = async (
  db: Db,
  accountId: string,
  listId: string,
  partyId: string,
) => {
  const others = (await linkedListsOf(db, accountId, partyId)).filter(
    (list) => list.id !== listId,
  );
  for (const other of others) await unlinkDraw(db, other.id, partyId);
};

/** A Secret Santa « Lier à mon Secret Santa » offers (ticket 148). */
export type LinkChoice = {
  partyId: string;
  /** The event, with the Secret Santa between brackets when it has several. */
  name: string;
  /** The list it is linked to now, by name, or null. */
  linkedTo: string | null;
};

/**
 * What « Lier à mon Secret Santa » offers on a list I hold and figure on
 * (V3ListeSecretLier): my Secret Santa of their current year whose draw is
 * done, not linked to this list, each with the list it is linked to.
 * Never who drew me.
 * @param db - The database.
 * @param listId - The list.
 * @param account - Me.
 * @param account.id - My account.
 * @param account.email - My address, as the participants carry it.
 * @returns The choices, by name.
 */
export const linkChoicesOf = async (
  db: Db,
  listId: string,
  account: { id: string; email: string },
): Promise<LinkChoice[]> => {
  const rows = await db
    .select({
      partyId: parties.id,
      partyName: parties.name,
      yearId: secretSantas.yearId,
      label: secretSantas.label,
    })
    .from(secretSantas)
    .innerJoin(parties, eq(parties.id, secretSantas.partyId))
    .innerJoin(
      participations,
      eq(participations.secretSantaId, secretSantas.id),
    )
    .innerJoin(persons, eq(persons.id, participations.personId))
    .where(
      and(eq(persons.email, account.email), eq(secretSantas.status, 'drawn')),
    );
  if (rows.length === 0) return [];
  const siblings = await db
    .select({ yearId: secretSantas.yearId })
    .from(secretSantas)
    .where(
      inArray(secretSantas.yearId, [...new Set(rows.map((row) => row.yearId))]),
    );
  const choices = await Promise.all(
    rows.map(async (row): Promise<LinkChoice | null> => {
      const current = await currentYearOf(db, row.partyId);
      if (current && current.id !== row.yearId) return null;
      const linked = await linkedListsOf(db, account.id, row.partyId);
      if (linked.some((list) => list.id === listId)) return null;
      const other = linked.find(
        (list) => !current || listYear(list) >= current.year,
      );
      return {
        partyId: row.partyId,
        name: invitePlace(
          row.partyName,
          subjectSantaName(
            row.label,
            siblings.filter((one) => one.yearId === row.yearId).length,
          ),
        ),
        linkedTo: other ? other.title : null,
      };
    }),
  );
  return choices
    .filter((choice): choice is LinkChoice => choice !== null)
    .filter(
      (choice, at, all) =>
        all.findIndex((one) => one.partyId === choice.partyId) === at,
    )
    .toSorted((a, b) => a.name.localeCompare(b.name));
};

/** « Secret Santa · Famille Camille » under my name on a list. */
export type SantaLine = {
  /** The event of the Secret Santa: what the link is about. */
  partyId: string;
  /** Its category, for the tile of the sheet of the link. */
  category: PartyCategory;
  /** The event, with the Secret Santa between brackets when it has several. */
  name: string;
  /** My page in it. */
  path: string;
  /** The emoji of its event, at the head of the pill (ticket 147). */
  emoji: string | null;
};

/**
 * The Secret Santa under my name on a list (V3ListeSecret): one pill per
 * Secret Santa not closed where I take part, whose event the list is
 * linked to (« Celui qui m'a tiré », ticket 148: shared with all its
 * members only, it is not). Each leads to my page there. For those who
 * hold the list, under their own name only.
 * @param db - The database.
 * @param listId - The list.
 * @param account - Me.
 * @param account.email - My address, as the participants carry it.
 * @param dataKey - The key of the personal links.
 * @returns The lines, by name.
 */
export const santaLinesOf = async (
  db: Db,
  listId: string,
  account: { email: string },
  dataKey: CryptoKey,
): Promise<SantaLine[]> => {
  const rows = await db
    .select({
      partyId: parties.id,
      partyName: parties.name,
      category: parties.category,
      iconEmoji: parties.iconEmoji,
      santaId: secretSantas.id,
      yearId: secretSantas.yearId,
      label: secretSantas.label,
      tokenEnc: participations.tokenEnc,
      tokenIv: participations.tokenIv,
    })
    .from(giftListParties)
    .innerJoin(parties, eq(parties.id, giftListParties.partyId))
    .innerJoin(secretSantas, eq(secretSantas.partyId, parties.id))
    .innerJoin(
      participations,
      eq(participations.secretSantaId, secretSantas.id),
    )
    .innerJoin(persons, eq(persons.id, participations.personId))
    .where(
      and(
        eq(giftListParties.listId, listId),
        eq(giftListParties.giver, true),
        eq(persons.email, account.email),
        ne(secretSantas.status, 'closed'),
      ),
    );
  if (rows.length === 0) return [];
  const siblings = await db
    .select({ id: secretSantas.id, yearId: secretSantas.yearId })
    .from(secretSantas)
    .where(
      inArray(secretSantas.yearId, [...new Set(rows.map((row) => row.yearId))]),
    );
  const lines = await Promise.all(
    rows.map(async (row) => ({
      partyId: row.partyId,
      category: row.category,
      name: invitePlace(
        row.partyName,
        subjectSantaName(
          row.label,
          siblings.filter((one) => one.yearId === row.yearId).length,
        ),
      ),
      path: await personalPath(row, dataKey),
      emoji: partyEmoji(row),
    })),
  );
  return lines.toSorted((a, b) => a.name.localeCompare(b.name));
};
