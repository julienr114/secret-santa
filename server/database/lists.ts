import { and, asc, desc, eq, gt, inArray, isNull, ne, or } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  familyMembers,
  giftClaims,
  giftListHolders,
  giftListIdeas,
  giftListInvites,
  giftListVisits,
  giftOffList,
  giftListPeople,
  giftLists,
  type FamilyMemberRow,
  type GiftListRow,
} from './schema';
import { newId, nowIso } from '#server/http/context';
import {
  createOwnParty,
  deleteListPartyStatements,
  joinOwnParty,
  renameOwnParty,
} from './listParties';
import { avatarOf, type Avatar } from '#server/utils/avatars';
import type { HolderLevel } from '#server/utils/listAccess';
import {
  carriedIdeas,
  resumedList,
  type ResumablePerson,
} from '#server/utils/lists';

// Gift lists (README 22.19, lot 21). Every query filters on the account
// that holds the list: no route gives a list in draft to another account.

/** A person of my family, as the screens show them. */
export type FamilyMember = {
  id: string;
  firstName: string;
  avatar: Avatar;
  /** The holder themself: « Moi ». */
  isSelf: boolean;
  /** Nobody: what carries the ideas of a list without people. */
  placeholder: boolean;
  birthDate: string | null;
  clothingSize: string | null;
  shoeSize: string | null;
  answers: Record<string, string | null>;
  texts: Record<string, string | null>;
  /** Whose people they are among. Never sent to a screen. */
  ownerId: string;
  /** The address given for their own account, or null. */
  email: string | null;
  /**
   * The account this person is: the owner's for « Moi », the one their
   * address belongs to once linked, null for someone without an account.
   */
  accountId: string | null;
};

/**
 * A person of my family, from their row.
 * @param row - The row.
 * @returns The person.
 */
export const memberOf = (row: FamilyMemberRow): FamilyMember => ({
  id: row.id,
  firstName: row.firstName,
  avatar: avatarOf({
    id: row.id,
    avatarEmoji: row.avatarEmoji,
    avatarColor: row.avatarColor,
  }),
  isSelf: row.isSelf,
  placeholder: row.placeholder,
  birthDate: row.birthDate,
  clothingSize: row.clothingSize,
  shoeSize: row.shoeSize,
  answers: row.answers ?? {},
  texts: row.texts ?? {},
  ownerId: row.accountId,
  email: row.email,
  accountId: row.isSelf ? row.accountId : row.linkedAccountId,
});

/**
 * Puts the holder in their own family, from their profile, the first
 * time (« Moi », README 22.19): nothing until they have a first name.
 * Its icon is the account's, and follows it.
 * @param db - The database.
 * @param accountId - The account.
 * @returns Once done.
 */
export const ensureSelf = async (db: Db, accountId: string) => {
  const self = await db
    .select()
    .from(familyMembers)
    .where(
      and(
        eq(familyMembers.accountId, accountId),
        eq(familyMembers.isSelf, true),
      ),
    )
    .get();
  const account = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .get();
  if (!account) return;
  const avatar = avatarOf(account);
  if (self) {
    // An icon chosen before the two were tied: the account's wins.
    if (
      self.avatarEmoji !== avatar.emoji ||
      self.avatarColor !== avatar.color
    ) {
      await db
        .update(familyMembers)
        .set({ avatarEmoji: avatar.emoji, avatarColor: avatar.color })
        .where(eq(familyMembers.id, self.id));
    }
    return;
  }
  if (!account.firstName) return;
  await db.insert(familyMembers).values({
    id: newId(),
    accountId,
    firstName: account.firstName,
    avatarEmoji: avatar.emoji,
    avatarColor: avatar.color,
    isSelf: true,
    createdAt: nowIso(),
  });
};

/**
 * The icon of an account and of its « Moi » are one (decided by Julien,
 * 19 November 2026): changed from « Mon compte » or from a list, both
 * rows take it.
 * @param db - The database.
 * @param accountId - The account.
 * @param avatar - The icon chosen; a part left out stays as it is.
 * @param avatar.emoji - Its emoji.
 * @param avatar.color - Its colour.
 * @returns Once both are saved.
 */
export const setSelfAvatar = (
  db: Db,
  accountId: string,
  avatar: { emoji?: string; color?: string },
) => {
  const patch = {
    ...(avatar.emoji === undefined ? {} : { avatarEmoji: avatar.emoji }),
    ...(avatar.color === undefined ? {} : { avatarColor: avatar.color }),
  };
  return db.batch([
    db.update(accounts).set(patch).where(eq(accounts.id, accountId)),
    db
      .update(familyMembers)
      .set(patch)
      .where(
        or(
          and(
            eq(familyMembers.accountId, accountId),
            eq(familyMembers.isSelf, true),
          ),
          // Where others linked this account to one of their people.
          eq(familyMembers.linkedAccountId, accountId),
        ),
      ),
  ]);
};

/** The people of my family, oldest first, myself among them. */
export const familyOf = async (
  db: Db,
  accountId: string,
): Promise<FamilyMember[]> => {
  await ensureSelf(db, accountId);
  return (
    await db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.accountId, accountId),
          eq(familyMembers.placeholder, false),
        ),
      )
      .orderBy(asc(familyMembers.createdAt))
  ).map(memberOf);
};

/** One person of my family, or null when not mine. */
export const findMember = async (
  db: Db,
  accountId: string,
  id: string,
): Promise<FamilyMemberRow | null> =>
  (await db
    .select()
    .from(familyMembers)
    .where(
      and(
        eq(familyMembers.id, id),
        eq(familyMembers.accountId, accountId),
        eq(familyMembers.placeholder, false),
      ),
    )
    .get()) ?? null;

/**
 * What carries the ideas of « une liste sans personne » (lot 27 bis): a
 * person who is nobody, one per account, made the first time and never
 * shown among anyone's people. A part of a list needs a person in the
 * base; this one stands for none.
 * @param db - The database.
 * @param accountId - The account the list belongs to.
 * @returns Its id.
 */
export const ensurePlaceholder = async (
  db: Db,
  accountId: string,
): Promise<string> => {
  const found = await db
    .select({ id: familyMembers.id })
    .from(familyMembers)
    .where(
      and(
        eq(familyMembers.accountId, accountId),
        eq(familyMembers.placeholder, true),
      ),
    )
    .get();
  if (found) return found.id;
  const id = newId();
  await db.insert(familyMembers).values({
    id,
    accountId,
    firstName: '',
    avatarEmoji: '🎁',
    avatarColor: 'brick',
    placeholder: true,
    createdAt: nowIso(),
  });
  return id;
};

/**
 * Makes a list « sans personne »: its ideas one under the other, in one
 * hidden part. An empty list gets that part; a list with one person
 * keeps their ideas, which become the list's.
 * @param db - The database.
 * @param list - The list.
 * @param part - The place of its only person, or null when it is empty.
 * @returns Once done.
 */
export const makeListSingle = async (
  db: Db,
  list: GiftListRow,
  part: string | null,
) => {
  const memberId = await ensurePlaceholder(db, list.accountId);
  await (part
    ? db
        .update(giftListPeople)
        .set({ memberId })
        .where(eq(giftListPeople.id, part))
    : db
        .insert(giftListPeople)
        .values({ id: newId(), listId: list.id, memberId, position: 0 }));
};

/**
 * Gives the hidden part of a list without people to a person: the list
 * is then by person, and the ideas already written are theirs.
 * @param db - The database.
 * @param part - The hidden part.
 * @param memberId - The person.
 * @returns Once done.
 */
export const givePartTo = (db: Db, part: string, memberId: string) =>
  db
    .update(giftListPeople)
    .set({ memberId })
    .where(eq(giftListPeople.id, part));

/**
 * On how many lists each of my people is.
 * @param db - The database.
 * @param accountId - The account.
 * @returns The count by person; none for someone on no list.
 */
export const listCountsOfMembers = async (
  db: Db,
  accountId: string,
): Promise<Map<string, number>> => {
  const rows = await db
    .select({ memberId: giftListPeople.memberId })
    .from(giftListPeople)
    .innerJoin(familyMembers, eq(familyMembers.id, giftListPeople.memberId))
    .where(eq(familyMembers.accountId, accountId));
  return rows.reduce(
    (counts, { memberId }) =>
      new Map([...counts, [memberId, (counts.get(memberId) ?? 0) + 1]]),
    new Map<string, number>(),
  );
};

/**
 * Where one of my people is, on every list they were put on, with what
 * deleting them would take: their ideas there, the gifts off the list,
 * and which ideas someone ticked.
 * @param db - The database.
 * @param memberId - The person.
 * @returns Their places, and the ideas ticked.
 */
export const placesOfMember = async (db: Db, memberId: string) => {
  const rows = await db
    .select({ person: giftListPeople, list: giftLists })
    .from(giftListPeople)
    .innerJoin(giftLists, eq(giftLists.id, giftListPeople.listId))
    .where(eq(giftListPeople.memberId, memberId))
    .orderBy(desc(giftLists.createdAt));
  const personIds = rows.map((row) => row.person.id);
  if (personIds.length === 0) {
    return { places: [], claimed: new Set<string>() };
  }
  const ideas = await db
    .select({
      id: giftListIdeas.id,
      listPersonId: giftListIdeas.listPersonId,
    })
    .from(giftListIdeas)
    .where(inArray(giftListIdeas.listPersonId, personIds));
  const offList = await db
    .select({ listPersonId: giftOffList.listPersonId })
    .from(giftOffList)
    .where(inArray(giftOffList.listPersonId, personIds));
  const ideaIds = ideas.map((idea) => idea.id);
  const claims =
    ideaIds.length === 0
      ? []
      : await db
          .select({ ideaId: giftClaims.ideaId })
          .from(giftClaims)
          .where(inArray(giftClaims.ideaId, ideaIds));
  return {
    places: rows.map(({ person, list }) => ({
      personId: person.id,
      list: { id: list.id, title: list.title },
      ideaIds: ideas
        .filter((idea) => idea.listPersonId === person.id)
        .map((idea) => idea.id),
      offList: offList.filter((gift) => gift.listPersonId === person.id).length,
    })),
    claimed: new Set(claims.map((claim) => claim.ideaId)),
  };
};

/**
 * Deletes a person of my family for good: their page and tastes, their
 * places on my lists, their ideas there and what was ticked.
 * @param db - The database.
 * @param memberId - The person.
 * @param places - Where they are, from `placesOfMember`.
 * @returns Once done.
 */
export const deleteMember = (
  db: Db,
  memberId: string,
  places: readonly { personId: string; ideaIds: readonly string[] }[],
) => {
  const personIds = places.map((place) => place.personId);
  const ideaIds = places.flatMap((place) => place.ideaIds);
  const gone = db.delete(familyMembers).where(eq(familyMembers.id, memberId));
  if (personIds.length === 0) return db.batch([gone]);
  return db.batch([
    db.delete(giftClaims).where(inArray(giftClaims.ideaId, ideaIds)),
    db.delete(giftOffList).where(inArray(giftOffList.listPersonId, personIds)),
    db
      .delete(giftListIdeas)
      .where(inArray(giftListIdeas.listPersonId, personIds)),
    db.delete(giftListPeople).where(inArray(giftListPeople.id, personIds)),
    gone,
  ]);
};

/** Adds a person to my family. */
export const createMember = async (
  db: Db,
  accountId: string,
  member: { firstName: string; avatar: Avatar },
): Promise<string> => {
  const id = newId();
  await db.insert(familyMembers).values({
    id,
    accountId,
    firstName: member.firstName,
    avatarEmoji: member.avatar.emoji,
    avatarColor: member.avatar.color,
    createdAt: nowIso(),
  });
  return id;
};

/** The lists an account holds, alone or with others. */
export const listsHeldBy = async (
  db: Db,
  accountId: string,
): Promise<GiftListRow[]> =>
  (
    await db
      .select({ list: giftLists })
      .from(giftListHolders)
      .innerJoin(giftLists, eq(giftLists.id, giftListHolders.listId))
      .where(eq(giftListHolders.accountId, accountId))
      .orderBy(desc(giftLists.createdAt))
  ).map((row) => row.list);

/** A list by its id, whoever holds it, or null. */
export const findList = async (
  db: Db,
  id: string,
): Promise<GiftListRow | null> =>
  (await db.select().from(giftLists).where(eq(giftLists.id, id)).get()) ?? null;

/** A list the account holds, with the level it holds it at, or null. */
export const findHolding = async (
  db: Db,
  accountId: string,
  id: string,
): Promise<{ list: GiftListRow; level: HolderLevel } | null> =>
  (await db
    .select({ list: giftLists, level: giftListHolders.level })
    .from(giftListHolders)
    .innerJoin(giftLists, eq(giftLists.id, giftListHolders.listId))
    .where(
      and(
        eq(giftListHolders.listId, id),
        eq(giftListHolders.accountId, accountId),
      ),
    )
    .get()) ?? null;

/** A list the account holds, or null. */
export const findHeldList = async (
  db: Db,
  accountId: string,
  id: string,
): Promise<GiftListRow | null> =>
  (await findHolding(db, accountId, id))?.list ?? null;

/** A shared list, by its link. */
export const findListByToken = async (
  db: Db,
  token: string,
): Promise<GiftListRow | null> =>
  (await db
    .select()
    .from(giftLists)
    .where(eq(giftLists.shareToken, token))
    .get()) ?? null;

/** A person on a list, with who they are and their ideas. */
export type ListPerson = {
  id: string;
  member: FamilyMember;
  ideas: {
    id: string;
    text: string;
    url: string | null;
    position: number;
    createdAt: string;
    /** Taken from an old list (lot 27), and not changed since. */
    carried: boolean;
  }[];
};

/**
 * The people of some lists, in their order, each with their ideas.
 * @param db - The database.
 * @param listIds - The lists.
 * @returns The people of each list, by list.
 */
export const peopleOfLists = async (
  db: Db,
  listIds: readonly string[],
): Promise<Map<string, ListPerson[]>> => {
  const byList = new Map<string, ListPerson[]>(listIds.map((id) => [id, []]));
  if (listIds.length === 0) return byList;
  const people = await db
    .select({ person: giftListPeople, member: familyMembers })
    .from(giftListPeople)
    .innerJoin(familyMembers, eq(familyMembers.id, giftListPeople.memberId))
    .where(inArray(giftListPeople.listId, [...listIds]))
    .orderBy(asc(giftListPeople.position));
  const ideas = await db
    .select()
    .from(giftListIdeas)
    .where(inArray(giftListIdeas.listId, [...listIds]))
    .orderBy(asc(giftListIdeas.position), asc(giftListIdeas.createdAt));
  for (const { person, member } of people) {
    byList.get(person.listId)?.push({
      id: person.id,
      member: memberOf(member),
      ideas: ideas
        .filter((idea) => idea.listPersonId === person.id)
        .map(({ id, text, url, position, createdAt, carriedFrom }) => ({
          id,
          text,
          url,
          position,
          createdAt,
          carried: carriedFrom !== null,
        })),
    });
  }
  return byList;
};

/** Creates a list, maybe with its first person. */
export const createList = async (
  db: Db,
  accountId: string,
  list: {
    icon: { emoji: string; color: string };
    title: string;
    eventDate: string | null;
    /** The event it is made for (ticket 106), if any. */
    partyId?: string;
  },
): Promise<string> => {
  const id = newId();
  const now = nowIso();
  await db.batch([
    db.insert(giftLists).values({
      id,
      accountId,
      iconEmoji: list.icon.emoji,
      iconColor: list.icon.color,
      title: list.title,
      eventDate: list.eventDate,
      // Its link from the start, and its occasion: the event it is made
      // for, else its own (ticket 106).
      shareToken: newId(),
      partyId: list.partyId ?? id,
      createdAt: now,
      updatedAt: now,
    }),
    // Whoever creates a list holds it, like those invited later.
    db
      .insert(giftListHolders)
      .values({ id: newId(), listId: id, accountId, createdAt: now }),
  ]);
  // A list made for an event is a draft in it, shared nowhere yet;
  // without one, it has a party of its own, as on the screens of before.
  if (list.partyId) return id;
  await createOwnParty(
    db,
    {
      id,
      accountId,
      title: list.title,
      iconEmoji: list.icon.emoji,
      iconColor: list.icon.color,
      eventDate: list.eventDate,
    },
    now,
  );
  return id;
};

/** Changes what a list says of itself. */
export const updateList = (
  db: Db,
  id: string,
  patch: Partial<
    Pick<
      GiftListRow,
      | 'title'
      | 'eventDate'
      | 'note'
      | 'noteEdited'
      | 'iconEmoji'
      | 'iconColor'
      | 'shareToken'
      | 'sharedAt'
    >
  >,
) =>
  Promise.all([
    db
      .update(giftLists)
      .set({ ...patch, updatedAt: nowIso() })
      .where(eq(giftLists.id, id)),
    renameOwnParty(db, id, patch),
  ]);

/** Deletes a list with its people and ideas, out of every party. */
export const deleteList = (db: Db, id: string) =>
  db.batch([
    ...deleteListPartyStatements(db, id),
    db.delete(giftClaims).where(eq(giftClaims.listId, id)),
    db.delete(giftOffList).where(eq(giftOffList.listId, id)),
    db.delete(giftListVisits).where(eq(giftListVisits.listId, id)),
    db.delete(giftListIdeas).where(eq(giftListIdeas.listId, id)),
    db.delete(giftListPeople).where(eq(giftListPeople.listId, id)),
    db.delete(giftListInvites).where(eq(giftListInvites.listId, id)),
    db.delete(giftListHolders).where(eq(giftListHolders.listId, id)),
    db.delete(giftLists).where(eq(giftLists.id, id)),
  ]);

/**
 * Adds a person of my family to a list, last, with their ideas of their
 * last list that nobody gave (README 22.19).
 * @param db - The database.
 * @param list - The list.
 * @param memberId - The person.
 * @returns The id of their place on the list.
 */
export const addPersonToList = async (
  db: Db,
  list: GiftListRow,
  memberId: string,
): Promise<string> => {
  const current = await db
    .select({ position: giftListPeople.position })
    .from(giftListPeople)
    .where(eq(giftListPeople.listId, list.id));
  const position = Math.max(-1, ...current.map((p) => p.position)) + 1;
  // Their last place on another list.
  const last = await db
    .select({ id: giftListPeople.id })
    .from(giftListPeople)
    .innerJoin(giftLists, eq(giftLists.id, giftListPeople.listId))
    .where(
      and(eq(giftListPeople.memberId, memberId), ne(giftLists.id, list.id)),
    )
    .orderBy(desc(giftLists.createdAt))
    .get();
  const previous = last
    ? await db
        .select()
        .from(giftListIdeas)
        .where(eq(giftListIdeas.listPersonId, last.id))
    : [];
  const plannedIdeaIds = new Set(
    previous.length > 0
      ? (
          await db
            .select({ ideaId: giftClaims.ideaId })
            .from(giftClaims)
            .where(
              inArray(
                giftClaims.ideaId,
                previous.map((idea) => idea.id),
              ),
            )
        ).map((claim) => claim.ideaId)
      : [],
  );
  const carried = carriedIdeas(
    previous.map((idea) => ({
      text: idea.text,
      url: idea.url,
      position: idea.position,
      planned: plannedIdeaIds.has(idea.id),
    })),
  );
  const id = newId();
  const now = nowIso();
  await db.batch([
    db
      .insert(giftListPeople)
      .values({ id, listId: list.id, memberId, position }),
    ...carried.map((idea, index) =>
      db.insert(giftListIdeas).values({
        id: newId(),
        listId: list.id,
        listPersonId: id,
        text: idea.text,
        url: idea.url,
        position: index,
        createdAt: now,
      }),
    ),
  ]);
  return id;
};

/**
 * The people of some lists with their ideas, each said planned or not,
 * as taking a list up again reads them (lot 27). Three queries whatever
 * the number of lists.
 * @param db - The database.
 * @param listIds - The lists.
 * @returns The people of each list, by list.
 */
export const resumableOfLists = async (
  db: Db,
  listIds: readonly string[],
): Promise<Map<string, ResumablePerson[]>> => {
  const byList = new Map<string, ResumablePerson[]>(
    listIds.map((id) => [id, []]),
  );
  if (listIds.length === 0) return byList;
  const people = await db
    .select({
      id: giftListPeople.id,
      listId: giftListPeople.listId,
      memberId: giftListPeople.memberId,
      position: giftListPeople.position,
      placeholder: familyMembers.placeholder,
    })
    .from(giftListPeople)
    .innerJoin(familyMembers, eq(familyMembers.id, giftListPeople.memberId))
    .where(inArray(giftListPeople.listId, [...listIds]));
  const ideas = await db
    .select()
    .from(giftListIdeas)
    .where(inArray(giftListIdeas.listId, [...listIds]));
  const planned = new Set(
    (
      await db
        .select({ ideaId: giftClaims.ideaId })
        .from(giftClaims)
        .where(inArray(giftClaims.listId, [...listIds]))
    ).map((claim) => claim.ideaId),
  );
  for (const person of people) {
    byList.get(person.listId)?.push({
      memberId: person.memberId,
      position: person.position,
      placeholder: person.placeholder,
      ideas: ideas
        .filter((idea) => idea.listPersonId === person.id)
        .map((idea) => ({
          text: idea.text,
          url: idea.url,
          position: idea.position,
          planned: planned.has(idea.id),
        })),
    });
  }
  return byList;
};

/**
 * Starts an empty draft from an old list (lot 27, README 22.20): its
 * icon, its word, its people and the ideas nobody ticked, each marked
 * as taken from that list. The old list does not change.
 * @param db - The database.
 * @param list - The new list, an empty draft.
 * @param source - The old list.
 * @returns Once written.
 */
export const resumeList = async (
  db: Db,
  list: GiftListRow,
  source: GiftListRow,
) => {
  const taken = resumedList({
    icon: { emoji: source.iconEmoji, color: source.iconColor },
    note: source.note,
    noteEdited: source.noteEdited,
    people: (await resumableOfLists(db, [source.id])).get(source.id) ?? [],
  });
  const now = nowIso();
  const rows = taken.people.map((person, position) => ({
    id: newId(),
    position,
    ...person,
  }));
  await db.batch([
    db
      .update(giftLists)
      .set({
        iconEmoji: taken.icon.emoji,
        iconColor: taken.icon.color,
        note: taken.note,
        noteEdited: taken.noteEdited,
        carriedFrom: source.id,
        updatedAt: now,
      })
      .where(eq(giftLists.id, list.id)),
    ...rows.map((person) =>
      db.insert(giftListPeople).values({
        id: person.id,
        listId: list.id,
        memberId: person.memberId,
        position: person.position,
      }),
    ),
    ...rows.flatMap((person) =>
      person.ideas.map((idea, index) =>
        db.insert(giftListIdeas).values({
          id: newId(),
          listId: list.id,
          listPersonId: person.id,
          text: idea.text,
          url: idea.url,
          position: index,
          carriedFrom: source.id,
          createdAt: now,
        }),
      ),
    ),
  ]);
};

/**
 * The marks of a list taken up again go: at its first share, nothing
 * says any more where the list or its ideas came from.
 * @param db - The database.
 * @param listId - The list.
 * @returns Once erased.
 */
export const forgetCarried = (db: Db, listId: string) =>
  db.batch([
    db
      .update(giftLists)
      .set({ carriedFrom: null })
      .where(eq(giftLists.id, listId)),
    db
      .update(giftListIdeas)
      .set({ carriedFrom: null })
      .where(eq(giftListIdeas.listId, listId)),
  ]);

/** A person's place on a list, or null when not on it. */
export const findListPerson = async (db: Db, listId: string, id: string) =>
  (await db
    .select()
    .from(giftListPeople)
    .where(and(eq(giftListPeople.id, id), eq(giftListPeople.listId, listId)))
    .get()) ?? null;

/** Takes a person off a list, with their ideas there. */
export const removePersonFromList = async (
  db: Db,
  listId: string,
  id: string,
) => {
  const ideas = await db
    .select({ id: giftListIdeas.id })
    .from(giftListIdeas)
    .where(
      and(eq(giftListIdeas.listId, listId), eq(giftListIdeas.listPersonId, id)),
    );
  return db.batch([
    db.delete(giftClaims).where(
      inArray(
        giftClaims.ideaId,
        ideas.map((idea) => idea.id),
      ),
    ),
    db
      .delete(giftOffList)
      .where(
        and(eq(giftOffList.listId, listId), eq(giftOffList.listPersonId, id)),
      ),
    db
      .delete(giftListIdeas)
      .where(
        and(
          eq(giftListIdeas.listId, listId),
          eq(giftListIdeas.listPersonId, id),
        ),
      ),
    db
      .delete(giftListPeople)
      .where(and(eq(giftListPeople.listId, listId), eq(giftListPeople.id, id))),
  ]);
};

/** An idea of a list, or null. */
export const findIdea = async (db: Db, listId: string, id: string) =>
  (await db
    .select()
    .from(giftListIdeas)
    .where(and(eq(giftListIdeas.id, id), eq(giftListIdeas.listId, listId)))
    .get()) ?? null;

/**
 * Writes a new idea for a person, after another one or last.
 * @param db - The database.
 * @param listId - The list.
 * @param listPersonId - The person's place on it.
 * @param idea - The text and the link.
 * @param after - The idea it follows, or null for the end.
 * @returns The new idea's id.
 */
export const createIdea = async (
  db: Db,
  listId: string,
  listPersonId: string,
  idea: { text: string; url: string | null },
  after: string | null,
): Promise<string> => {
  const siblings = await db
    .select({ id: giftListIdeas.id, position: giftListIdeas.position })
    .from(giftListIdeas)
    .where(
      and(
        eq(giftListIdeas.listId, listId),
        eq(giftListIdeas.listPersonId, listPersonId),
      ),
    )
    .orderBy(asc(giftListIdeas.position), asc(giftListIdeas.createdAt));
  const at = after ? siblings.findIndex((s) => s.id === after) + 1 : 0;
  const order = [
    ...siblings.slice(0, at > 0 ? at : siblings.length).map((s) => s.id),
    '',
    ...siblings.slice(at > 0 ? at : siblings.length).map((s) => s.id),
  ];
  const id = newId();
  const now = nowIso();
  await db.batch([
    db.insert(giftListIdeas).values({
      id,
      listId,
      listPersonId,
      text: idea.text,
      url: idea.url,
      position: order.indexOf(''),
      createdAt: now,
    }),
    ...order
      .map((ideaId, position) => ({ ideaId, position }))
      .filter(({ ideaId }) => ideaId !== '')
      .map(({ ideaId, position }) =>
        db
          .update(giftListIdeas)
          .set({ position })
          .where(eq(giftListIdeas.id, ideaId)),
      ),
  ]);
  return id;
};

/** One of those who hold a list. */
export type ListHolder = {
  accountId: string;
  email: string;
  firstName: string | null;
  avatarEmoji: string | null;
  avatarColor: string | null;
  level: HolderLevel;
  createdAt: string;
};

/**
 * Those who hold some lists, the first to hold each first.
 * @param db - The database.
 * @param listIds - The lists.
 * @returns The holders of each list, by list.
 */
export const holdersOfLists = async (
  db: Db,
  listIds: readonly string[],
): Promise<Map<string, ListHolder[]>> => {
  const byList = new Map<string, ListHolder[]>(listIds.map((id) => [id, []]));
  if (listIds.length === 0) return byList;
  const rows = await db
    .select({ holder: giftListHolders, account: accounts })
    .from(giftListHolders)
    .innerJoin(accounts, eq(accounts.id, giftListHolders.accountId))
    .where(inArray(giftListHolders.listId, [...listIds]))
    .orderBy(asc(giftListHolders.createdAt));
  for (const { holder, account } of rows) {
    byList.get(holder.listId)?.push({
      accountId: account.id,
      email: account.email,
      firstName: account.firstName,
      avatarEmoji: account.avatarEmoji,
      avatarColor: account.avatarColor,
      level: holder.level,
      createdAt: holder.createdAt,
    });
  }
  return byList;
};

/** The invitations to hold a list, whatever became of them, oldest first. */
export const invitesOfList = (db: Db, listId: string) =>
  db
    .select()
    .from(giftListInvites)
    .where(eq(giftListInvites.listId, listId))
    .orderBy(asc(giftListInvites.createdAt));

/**
 * Invites an address to hold a list, for 7 days. An older invitation of
 * the same address, expired, refused or accepted, is replaced.
 * @param db - The database.
 * @param invite - The list, the address, who invites, the level given,
 *   the hash of the token of its link and when it ends.
 * @returns Once written.
 */
export const addInvite = (
  db: Db,
  invite: {
    listId: string;
    email: string;
    invitedBy: string;
    level: HolderLevel;
    tokenHash: string;
    expiresAt: string;
  },
) =>
  db.batch([
    db
      .delete(giftListInvites)
      .where(
        and(
          eq(giftListInvites.listId, invite.listId),
          eq(giftListInvites.email, invite.email),
        ),
      ),
    db
      .insert(giftListInvites)
      .values({ id: newId(), ...invite, createdAt: nowIso() }),
  ]);

/**
 * « Renvoyer »: the same invitation, sent again, with a new link and 7
 * more days.
 * @param db - The database.
 * @param id - The invitation.
 * @param fresh - Who sends it, the hash of the new token, when it ends.
 * @returns Once written.
 */
export const renewInvite = (
  db: Db,
  id: string,
  fresh: { invitedBy: string; tokenHash: string; expiresAt: string },
) =>
  db
    .update(giftListInvites)
    .set({ ...fresh, createdAt: nowIso() })
    .where(eq(giftListInvites.id, id));

/** Cancels or erases an invitation. */
export const removeInvite = (db: Db, listId: string, id: string) =>
  db
    .delete(giftListInvites)
    .where(and(eq(giftListInvites.id, id), eq(giftListInvites.listId, listId)));

/** Deletes the lines old enough to go by themselves. */
export const forgetInvites = async (db: Db, ids: readonly string[]) => {
  if (ids.length === 0) return;
  await db.delete(giftListInvites).where(inArray(giftListInvites.id, [...ids]));
};

/** An invitation with its list and who sent it, by the hash of its token. */
export const findInviteByToken = async (db: Db, tokenHash: string) =>
  (await db
    .select({ invite: giftListInvites, list: giftLists, by: accounts })
    .from(giftListInvites)
    .innerJoin(giftLists, eq(giftLists.id, giftListInvites.listId))
    .innerJoin(accounts, eq(accounts.id, giftListInvites.invitedBy))
    .where(eq(giftListInvites.tokenHash, tokenHash))
    .get()) ?? null;

/** Still waiting: neither answered nor expired. */
const stillWaiting = (id: string, now: string) =>
  and(
    eq(giftListInvites.id, id),
    isNull(giftListInvites.acceptedAt),
    isNull(giftListInvites.declinedAt),
    gt(giftListInvites.expiresAt, now),
  );

/**
 * Accepts an invitation, once: the update only matches an invitation
 * still waiting, so two answers cannot both win. The account then holds
 * the list at the level given.
 * @param db - The database.
 * @param invite - The invitation.
 * @param accountId - The account that accepts.
 * @param now - ISO date.
 * @returns False when it was answered or expired meanwhile.
 */
export const acceptInvite = async (
  db: Db,
  invite: { id: string; listId: string; level: HolderLevel },
  accountId: string,
  now: string,
): Promise<boolean> => {
  const taken = await db
    .update(giftListInvites)
    .set({ acceptedAt: now })
    .where(stillWaiting(invite.id, now))
    .returning({ id: giftListInvites.id });
  if (taken.length === 0) return false;
  await db
    .insert(giftListHolders)
    .values({
      id: newId(),
      listId: invite.listId,
      accountId,
      level: invite.level,
      createdAt: now,
    })
    .onConflictDoNothing();
  await joinOwnParty(db, invite.listId, accountId, now);
  return true;
};

/**
 * « Non merci »: the invitation is refused, and its link has acted.
 * @param db - The database.
 * @param id - The invitation.
 * @param now - ISO date.
 * @returns False when it was answered or expired meanwhile.
 */
export const declineInvite = async (
  db: Db,
  id: string,
  now: string,
): Promise<boolean> =>
  (
    await db
      .update(giftListInvites)
      .set({ declinedAt: now })
      .where(stillWaiting(id, now))
      .returning({ id: giftListInvites.id })
  ).length > 0;

/** Takes an account off those who hold a list. */
export const removeHolder = (db: Db, listId: string, accountId: string) =>
  db
    .delete(giftListHolders)
    .where(
      and(
        eq(giftListHolders.listId, listId),
        eq(giftListHolders.accountId, accountId),
      ),
    );

/** Changes the level of one of those who hold a list. */
export const setHolderLevel = (
  db: Db,
  listId: string,
  accountId: string,
  level: HolderLevel,
) =>
  db
    .update(giftListHolders)
    .set({ level })
    .where(
      and(
        eq(giftListHolders.listId, listId),
        eq(giftListHolders.accountId, accountId),
      ),
    );

/** The invitations sent to an address, whatever became of them. */
export const invitesForEmail = (db: Db, email: string) =>
  db.select().from(giftListInvites).where(eq(giftListInvites.email, email));

/**
 * Accepts invitations by coming (lot 25): one by one, each only while it
 * still waits.
 * @param db - The database.
 * @param accountId - The account that accepts by coming.
 * @param invites - The invitations it accepts.
 * @param now - ISO date.
 * @returns Once done.
 */
export const acceptInvites = async (
  db: Db,
  accountId: string,
  invites: readonly { id: string; listId: string; level: HolderLevel }[],
  now: string,
) => {
  for (const invite of invites) await acceptInvite(db, invite, accountId, now);
};

/**
 * Links to an account the people others gave its address for, and gives
 * them its icon: they are that account from now on.
 * @param db - The database.
 * @param account - The account that comes.
 * @returns Once done.
 */
export const linkMembersOf = async (
  db: Db,
  account: {
    id: string;
    email: string;
    avatarEmoji: string | null;
    avatarColor: string | null;
  },
) => {
  const waiting = await db
    .select({ id: familyMembers.id })
    .from(familyMembers)
    .where(
      and(
        eq(familyMembers.email, account.email),
        isNull(familyMembers.linkedAccountId),
      ),
    );
  if (waiting.length === 0) return;
  const avatar = avatarOf(account);
  await db
    .update(familyMembers)
    .set({
      linkedAccountId: account.id,
      avatarEmoji: avatar.emoji,
      avatarColor: avatar.color,
    })
    .where(
      inArray(
        familyMembers.id,
        waiting.map((member) => member.id),
      ),
    );
};

/**
 * The shared lists an account figures on, as a person linked to it.
 * @param db - The database.
 * @param accountId - The account.
 * @returns The lists.
 */
export const listsFiguringOn = async (
  db: Db,
  accountId: string,
): Promise<GiftListRow[]> => {
  const rows = await db
    .select({ list: giftLists })
    .from(giftListPeople)
    .innerJoin(familyMembers, eq(familyMembers.id, giftListPeople.memberId))
    .innerJoin(giftLists, eq(giftLists.id, giftListPeople.listId))
    .where(eq(familyMembers.linkedAccountId, accountId));
  return [...new Map(rows.map((row) => [row.list.id, row.list])).values()];
};

/**
 * One of my people, or a person on a list I hold with whoever they
 * belong to: those who hold a list are equal, their page included.
 * @param db - The database.
 * @param accountId - The account.
 * @param id - The person.
 * @returns Their row, or null when out of reach.
 */
export const findReachableMember = async (
  db: Db,
  accountId: string,
  id: string,
): Promise<FamilyMemberRow | null> => {
  const row =
    (await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.id, id))
      .get()) ?? null;
  // Nobody has no page.
  if (row?.placeholder) return null;
  if (!row || row.accountId === accountId) return row;
  const shared = await db
    .select({ id: giftListPeople.id })
    .from(giftListPeople)
    .innerJoin(
      giftListHolders,
      eq(giftListHolders.listId, giftListPeople.listId),
    )
    .where(
      and(
        eq(giftListPeople.memberId, id),
        eq(giftListHolders.accountId, accountId),
      ),
    )
    .get();
  return shared ? row : null;
};

/**
 * Whether two accounts hold a list together.
 * @param db - The database.
 * @param one - An account.
 * @param other - Another.
 * @returns True when at least one list is held by both.
 */
export const holdTogether = async (
  db: Db,
  one: string,
  other: string,
): Promise<boolean> => {
  const mine = new Set((await listsHeldBy(db, one)).map((list) => list.id));
  return (await listsHeldBy(db, other)).some((list) => mine.has(list.id));
};
