import { and, asc, desc, eq, inArray, ne } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  familyMembers,
  giftClaims,
  giftListIdeas,
  giftListVisits,
  giftOffList,
  giftListPeople,
  giftLists,
  type FamilyMemberRow,
  type GiftListRow,
} from './schema';
import { newId, nowIso } from '#server/http/context';
import { avatarOf, type Avatar } from '#server/utils/avatars';
import { carriedIdeas } from '#server/utils/lists';

// Gift lists (README 22.19, lot 21). Every query filters on the account
// that holds the list: no route gives a list in draft to another account.

/** A person of my family, as the screens show them. */
export type FamilyMember = {
  id: string;
  firstName: string;
  avatar: Avatar;
  /** The holder themself: « Moi ». */
  isSelf: boolean;
  birthDate: string | null;
  clothingSize: string | null;
  shoeSize: string | null;
  answers: Record<string, string | null>;
  texts: Record<string, string | null>;
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
  birthDate: row.birthDate,
  clothingSize: row.clothingSize,
  shoeSize: row.shoeSize,
  answers: row.answers ?? {},
  texts: row.texts ?? {},
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
        and(
          eq(familyMembers.accountId, accountId),
          eq(familyMembers.isSelf, true),
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
      .where(eq(familyMembers.accountId, accountId))
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
      and(eq(familyMembers.id, id), eq(familyMembers.accountId, accountId)),
    )
    .get()) ?? null;

/**
 * On how many of my lists each person of my family is.
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
    .innerJoin(giftLists, eq(giftLists.id, giftListPeople.listId))
    .where(eq(giftLists.accountId, accountId));
  return rows.reduce(
    (counts, { memberId }) =>
      new Map([...counts, [memberId, (counts.get(memberId) ?? 0) + 1]]),
    new Map<string, number>(),
  );
};

/**
 * Where a person of my family is, on my lists, with what deleting them
 * would take: their ideas there, the gifts off the list, and which ideas
 * someone ticked.
 * @param db - The database.
 * @param accountId - The account.
 * @param memberId - The person.
 * @returns Their places, and the ideas ticked.
 */
export const placesOfMember = async (
  db: Db,
  accountId: string,
  memberId: string,
) => {
  const rows = await db
    .select({ person: giftListPeople, list: giftLists })
    .from(giftListPeople)
    .innerJoin(giftLists, eq(giftLists.id, giftListPeople.listId))
    .where(
      and(
        eq(giftListPeople.memberId, memberId),
        eq(giftLists.accountId, accountId),
      ),
    )
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

/** The lists an account holds. */
export const listsHeldBy = (db: Db, accountId: string) =>
  db
    .select()
    .from(giftLists)
    .where(eq(giftLists.accountId, accountId))
    .orderBy(desc(giftLists.createdAt));

/** A list the account holds, or null. */
export const findHeldList = async (
  db: Db,
  accountId: string,
  id: string,
): Promise<GiftListRow | null> =>
  (await db
    .select()
    .from(giftLists)
    .where(and(eq(giftLists.id, id), eq(giftLists.accountId, accountId)))
    .get()) ?? null;

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
        .map(({ id, text, url, position, createdAt }) => ({
          id,
          text,
          url,
          position,
          createdAt,
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
  },
): Promise<string> => {
  const id = newId();
  const now = nowIso();
  await db.insert(giftLists).values({
    id,
    accountId,
    iconEmoji: list.icon.emoji,
    iconColor: list.icon.color,
    title: list.title,
    eventDate: list.eventDate,
    createdAt: now,
    updatedAt: now,
  });
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
  db
    .update(giftLists)
    .set({ ...patch, updatedAt: nowIso() })
    .where(eq(giftLists.id, id));

/** Deletes a list with its people and ideas. */
export const deleteList = (db: Db, id: string) =>
  db.batch([
    db.delete(giftClaims).where(eq(giftClaims.listId, id)),
    db.delete(giftOffList).where(eq(giftOffList.listId, id)),
    db.delete(giftListVisits).where(eq(giftListVisits.listId, id)),
    db.delete(giftListIdeas).where(eq(giftListIdeas.listId, id)),
    db.delete(giftListPeople).where(eq(giftListPeople.listId, id)),
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
  // Their last place on another list of the same holder.
  const last = await db
    .select({ id: giftListPeople.id })
    .from(giftListPeople)
    .innerJoin(giftLists, eq(giftLists.id, giftListPeople.listId))
    .where(
      and(
        eq(giftListPeople.memberId, memberId),
        eq(giftLists.accountId, list.accountId),
        ne(giftLists.id, list.id),
      ),
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
