import type { H3Event } from 'h3';
import { useDb, type Db } from '#server/database/client';
import {
  familyOf,
  findHeldList,
  peopleOfLists,
  type FamilyMember,
} from '#server/database/lists';
import type { GiftListRow } from '#server/database/schema';
import { requireAccount } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { nowIso } from '#server/http/context';
import {
  ageOn,
  cardSentence,
  ideaView,
  listStatus,
  noteOf,
  type CardSentence,
  type Claim,
  type IdeaView,
  type ListStatus,
} from '#server/utils/lists';

// The shell of the gift lists (README 22.19): who may touch a list, and
// what the screens receive.

/** Today, as the lists count days. */
export const todayIso = (): string => nowIso().slice(0, 10);

/**
 * The logged-in account and a list it holds; 404 for any other list, a
 * draft included, so that nobody learns it exists.
 * @param event - The request, with the list's id in its path.
 * @returns The database, the account and the list.
 */
export const requireHeldList = async (event: H3Event) => {
  const user = await requireAccount(event);
  const db = useDb(event);
  const list = await findHeldList(
    db,
    user.accountId,
    getRouterParam(event, 'id') ?? '',
  );
  if (!list) throw notFound();
  return { db, user, list };
};

/** A person of the family as a line shows them, with their age. */
export type MemberView = FamilyMember & { age: number | null };

const memberView = (member: FamilyMember, today: string): MemberView => ({
  ...member,
  age: member.birthDate ? ageOn(member.birthDate, today) : null,
});

/** The document of a list, as its holder edits it. */
export type ListDocument = {
  list: {
    id: string;
    icon: { emoji: string; color: string };
    title: string;
    eventDate: string | null;
    note: ReturnType<typeof noteOf>;
    status: ListStatus;
    shareToken: string | null;
  };
  people: {
    id: string;
    member: MemberView;
    ideas: { id: string; text: string; url: string | null; view: IdeaView }[];
  }[];
  /** The gifts planned. */
  planned: number;
  /** The people of the family not on the list yet. */
  family: MemberView[];
};

/**
 * The document of a list for its holder.
 * @param db - The database.
 * @param list - The list.
 * @param claimsOf - Who gives each idea (lot 22), by idea.
 * @returns What the screen shows.
 */
export const listDocument = async (
  db: Db,
  list: GiftListRow,
  claimsOf: (ideaId: string) => readonly Claim[] = () => [],
): Promise<ListDocument> => {
  const today = todayIso();
  const people = (await peopleOfLists(db, [list.id])).get(list.id) ?? [];
  const onList = new Set(people.map((p) => p.member.id));
  const viewer = { accountId: list.accountId, holds: true };
  return {
    list: {
      id: list.id,
      icon: { emoji: list.iconEmoji, color: list.iconColor },
      title: list.title,
      eventDate: list.eventDate,
      note: noteOf(list.note, list.noteEdited),
      status: listStatus(list, today),
      shareToken: list.shareToken,
    },
    people: people.map((person) => ({
      id: person.id,
      member: memberView(person.member, today),
      ideas: person.ideas.map((idea) => ({
        id: idea.id,
        text: idea.text,
        url: idea.url,
        view: ideaView(claimsOf(idea.id), viewer),
      })),
    })),
    planned: people
      .flatMap((p) => p.ideas)
      .filter((idea) => claimsOf(idea.id).length > 0).length,
    family: (await familyOf(db, list.accountId))
      .filter((member) => !onList.has(member.id))
      .map((member) => memberView(member, today)),
  };
};

/** A card of the « Listes » tab. */
export type ListCard = {
  id: string;
  icon: { emoji: string; color: string };
  title: string;
  eventDate: string | null;
  status: ListStatus;
  createdAt: string;
  /** Null when I hold it; otherwise who does. */
  holder: { name: string; avatar: { emoji: string; color: string } } | null;
  people: { firstName: string; avatar: { emoji: string; color: string } }[];
  sentence: CardSentence;
  /** For the holder: the people without an idea yet. */
  noIdeas: string[];
  /** The gifts planned, for a past list. */
  planned: number;
  /** Those I gave, for a past list. */
  mine: number;
  newIdeas: number;
};

/**
 * The cards of the lists an account holds.
 * @param db - The database.
 * @param lists - The lists.
 * @returns A card for each.
 */
export const heldCards = async (
  db: Db,
  lists: readonly GiftListRow[],
): Promise<ListCard[]> => {
  const today = todayIso();
  const people = await peopleOfLists(
    db,
    lists.map((l) => l.id),
  );
  return lists.map((list) => {
    const onList = people.get(list.id) ?? [];
    const planned = 0;
    return {
      id: list.id,
      icon: { emoji: list.iconEmoji, color: list.iconColor },
      title: list.title,
      eventDate: list.eventDate,
      status: listStatus(list, today),
      createdAt: list.createdAt,
      holder: null,
      people: onList.map((p) => ({
        firstName: p.member.firstName,
        avatar: p.member.avatar,
      })),
      sentence: cardSentence({ planned, mine: 0 }, true),
      noIdeas: onList
        .filter((p) => p.ideas.length === 0)
        .map((p) => p.member.firstName),
      planned,
      mine: 0,
      newIdeas: 0,
    };
  });
};
