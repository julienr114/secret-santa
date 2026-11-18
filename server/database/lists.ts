import { and, asc, desc, eq, inArray, ne } from 'drizzle-orm';
import type { Db } from './client';
import {
  familyMembers,
  giftListIdeas,
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
  birthDate: row.birthDate,
  clothingSize: row.clothingSize,
  shoeSize: row.shoeSize,
  answers: row.answers ?? {},
  texts: row.texts ?? {},
});

/** The people of my family, oldest first. */
export const familyOf = async (
  db: Db,
  accountId: string,
): Promise<FamilyMember[]> =>
  (
    await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.accountId, accountId))
      .orderBy(asc(familyMembers.createdAt))
  ).map(memberOf);

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
  ideas: { id: string; text: string; url: string | null; position: number }[];
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
        .map(({ id, text, url, position }) => ({ id, text, url, position })),
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
 * @param plannedIdeaIds - The ideas somebody gives, on any list.
 * @returns The id of their place on the list.
 */
export const addPersonToList = async (
  db: Db,
  list: GiftListRow,
  memberId: string,
  plannedIdeaIds: ReadonlySet<string> = new Set(),
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
export const removePersonFromList = (db: Db, listId: string, id: string) =>
  db.batch([
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
