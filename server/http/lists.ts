import type { H3Event } from 'h3';
import { useDb, type Db } from '#server/database/client';
import {
  claimsOfLists,
  giverOf,
  offListOfLists,
  type ClaimWithGiver,
} from '#server/database/claims';
import {
  familyOf,
  listCountsOfMembers,
  findHeldList,
  peopleOfLists,
  type FamilyMember,
  type ListPerson,
} from '#server/database/lists';
import { accounts, type GiftListRow } from '#server/database/schema';
import type { Avatar } from '#server/utils/avatars';
import { requireAccount } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { nowIso } from '#server/http/context';
import {
  offListView,
  newIdeasSince,
  type OffListView,
} from '#server/utils/claims';
import {
  ageOn,
  cardSentence,
  ideaView,
  listStatus,
  noteOf,
  type CardSentence,
  type ClaimMode,
  type IdeaView,
  type ListStatus,
} from '#server/utils/lists';
import { eq } from 'drizzle-orm';

// The shell of the gift lists (README 22.19): who may touch a list, and
// what the screens receive, for the one who holds it and for those who
// open its link.

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

/** My own way of giving an idea, for « Changer ». */
export type MyClaim = {
  mode: ClaimMode;
  anonymous: boolean;
  note: string | null;
  leads: boolean;
  closed: boolean;
};

/** An idea as a line shows it. */
export type IdeaLine = {
  id: string;
  text: string;
  url: string | null;
  view: IdeaView;
  /** Mine, when I give it. */
  mine: MyClaim | null;
  /** The words of each giver of a group, by name, for its sheet. */
  notes: { name: string; avatar: Avatar; note: string | null; me: boolean }[];
};

/** A person on a list, with their ideas and the gifts not on the list. */
export type PersonLine = {
  id: string;
  member: MemberView;
  ideas: IdeaLine[];
  offList: (OffListView & { id: string })[];
};

/** Who looks at a list. */
type Viewer = { accountId: string | null; holds: boolean };

/**
 * The people of a list with their ideas, as a viewer sees them.
 * @param people - The people of the list.
 * @param claims - Who gives each idea of the list.
 * @param offList - The gifts not on the list.
 * @param viewer - Who looks.
 * @returns The lines, and how many gifts are planned and mine.
 */
const linesOf = (
  people: readonly ListPerson[],
  claims: readonly ClaimWithGiver[],
  offList: Awaited<ReturnType<typeof offListOfLists>>,
  viewer: Viewer,
) => {
  const today = todayIso();
  const claimsOf = (ideaId: string) =>
    claims
      .filter((c) => c.ideaId === ideaId)
      .toSorted((a, b) => a.createdAt.localeCompare(b.createdAt));
  const lines: PersonLine[] = people.map((person) => ({
    id: person.id,
    member: memberView(person.member, today),
    ideas: person.ideas.map((idea) => {
      const on = claimsOf(idea.id);
      const mine = on.find((c) => c.accountId === viewer.accountId);
      return {
        id: idea.id,
        text: idea.text,
        url: idea.url,
        view: ideaView(on, viewer),
        mine: mine
          ? {
              mode: mine.mode,
              anonymous: mine.anonymous,
              note: mine.note,
              leads: on[0]?.accountId === viewer.accountId,
              closed: on[0]?.closed ?? false,
            }
          : null,
        notes:
          on[0]?.mode === 'group'
            ? on.map((c) => ({
                name: c.name,
                avatar: c.avatar,
                note: c.note,
                me: c.accountId === viewer.accountId,
              }))
            : [],
      };
    }),
    offList: offList
      .filter((gift) => gift.listPersonId === person.id)
      .map((gift) => ({ id: gift.id, ...offListView(gift, viewer) })),
  }));
  const ideaIds = new Set(people.flatMap((p) => p.ideas.map((i) => i.id)));
  const onList = claims.filter((c) => ideaIds.has(c.ideaId));
  const planned = new Set(onList.map((c) => c.ideaId)).size + offList.length;
  const mine =
    new Set(
      onList
        .filter((c) => c.accountId === viewer.accountId)
        .map((c) => c.ideaId),
    ).size + offList.filter((g) => g.accountId === viewer.accountId).length;
  return { lines, planned, mine };
};

/** The head of a list, the same for everyone. */
const headOf = (list: GiftListRow) => ({
  id: list.id,
  icon: { emoji: list.iconEmoji, color: list.iconColor },
  title: list.title,
  eventDate: list.eventDate,
  note: noteOf(list.note, list.noteEdited),
  status: listStatus(list, todayIso()),
});

/** The document of a list, as its holder edits it. */
export type ListDocument = {
  list: ReturnType<typeof headOf> & { shareToken: string | null };
  people: PersonLine[];
  /** The gifts planned. */
  planned: number;
  /** Those the holder gives. */
  mine: number;
  /**
   * My people not on the list yet, each with on how many of my lists
   * they are: on none, they can be deleted from here.
   */
  family: (MemberView & { lists: number })[];
};

/**
 * The document of a list for its holder.
 * @param db - The database.
 * @param list - The list.
 * @returns What the screen shows.
 */
export const listDocument = async (
  db: Db,
  list: GiftListRow,
): Promise<ListDocument> => {
  const people = (await peopleOfLists(db, [list.id])).get(list.id) ?? [];
  const onList = new Set(people.map((p) => p.member.id));
  const { lines, planned, mine } = linesOf(
    people,
    await claimsOfLists(db, [list.id]),
    await offListOfLists(db, [list.id]),
    { accountId: list.accountId, holds: true },
  );
  const today = todayIso();
  const counts = await listCountsOfMembers(db, list.accountId);
  return {
    list: { ...headOf(list), shareToken: list.shareToken },
    people: lines,
    planned,
    mine,
    family: (await familyOf(db, list.accountId))
      .filter((member) => !onList.has(member.id))
      .map((member) => ({
        ...memberView(member, today),
        lists: counts.get(member.id) ?? 0,
      })),
  };
};

/** A list as those who open its link see it. */
export type VisitorDocument = {
  list: ReturnType<typeof headOf>;
  holder: { name: string; avatar: Avatar };
  people: PersonLine[];
  /** Whether I hold it (then I see who gives what). */
  holds: boolean;
  /** Whether I am logged in. */
  loggedIn: boolean;
  mine: number;
};

/**
 * A shared list for whoever opens its link, logged in or not.
 * @param db - The database.
 * @param list - The list.
 * @param accountId - The account looking, or null.
 * @returns What the page shows.
 */
export const visitorDocument = async (
  db: Db,
  list: GiftListRow,
  accountId: string | null,
): Promise<VisitorDocument> => {
  const holder = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, list.accountId))
    .get();
  const holds = accountId === list.accountId;
  const people = (await peopleOfLists(db, [list.id])).get(list.id) ?? [];
  const { lines, mine } = linesOf(
    people,
    await claimsOfLists(db, [list.id]),
    await offListOfLists(db, [list.id]),
    { accountId, holds },
  );
  return {
    list: headOf(list),
    holder: holder
      ? giverOf(holder)
      : { name: '', avatar: { emoji: '🎁', color: 'brick' } },
    // The age is enough: the exact birth date stays with the holder.
    people: holds
      ? lines
      : lines.map((line) => ({
          ...line,
          member: { ...line.member, birthDate: null },
        })),
    holds,
    loggedIn: accountId !== null,
    mine,
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
  /** Null when I hold it; otherwise who does, and the link to open. */
  holder: { name: string; avatar: Avatar; token: string } | null;
  people: { firstName: string; avatar: Avatar }[];
  sentence: CardSentence;
  /** For the holder: the people without an idea yet. */
  noIdeas: string[];
  /** The gifts planned, for a past list. */
  planned: number;
  /** Those I give. */
  mine: number;
  newIdeas: number;
};

/**
 * The cards of the « Listes » tab: the lists an account holds and those it
 * opened while logged in, mixed.
 * @param db - The database.
 * @param accountId - The account.
 * @param held - The lists it holds.
 * @param visited - The shared lists it opened, with its last visit.
 * @returns A card for each.
 */
export const listCards = async (
  db: Db,
  accountId: string,
  held: readonly GiftListRow[],
  visited: readonly { list: GiftListRow; lastSeenAt: string }[],
): Promise<ListCard[]> => {
  const others = visited.filter(
    // A list no longer shared leaves the lists of those who opened it,
    // and comes back with its sharing.
    (v) => v.list.accountId !== accountId && v.list.sharedAt,
  );
  const all = [...held, ...others.map((v) => v.list)];
  const ids = all.map((l) => l.id);
  const people = await peopleOfLists(db, ids);
  const claims = await claimsOfLists(db, ids);
  const offList = await offListOfLists(db, ids);
  const holderIds = [...new Set(others.map((v) => v.list.accountId))];
  const holders = new Map(
    (
      await Promise.all(
        holderIds.map((id) =>
          db.select().from(accounts).where(eq(accounts.id, id)).get(),
        ),
      )
    )
      .filter((a) => a !== undefined)
      .map((a) => [a.id, giverOf(a)]),
  );
  const today = todayIso();
  return all.map((list) => {
    const holds = list.accountId === accountId;
    const onList = people.get(list.id) ?? [];
    const { planned, mine } = linesOf(
      onList,
      claims,
      offList.filter((g) => g.listId === list.id),
      { accountId, holds },
    );
    const visit = others.find((v) => v.list.id === list.id);
    const holder = holders.get(list.accountId);
    return {
      id: list.id,
      icon: { emoji: list.iconEmoji, color: list.iconColor },
      title: list.title,
      eventDate: list.eventDate,
      status: listStatus(list, today),
      createdAt: list.createdAt,
      holder:
        holds || !holder ? null : { ...holder, token: list.shareToken ?? '' },
      people: onList.map((p) => ({
        firstName: p.member.firstName,
        avatar: p.member.avatar,
      })),
      sentence: cardSentence({ planned, mine }, holds),
      noIdeas: holds
        ? onList
            .filter((p) => p.ideas.length === 0)
            .map((p) => p.member.firstName)
        : [],
      planned,
      mine,
      newIdeas: visit
        ? newIdeasSince(
            onList.flatMap((p) => p.ideas),
            visit.lastSeenAt,
          )
        : 0,
    };
  });
};
