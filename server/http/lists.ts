import type { H3Event } from 'h3';
import { eq } from 'drizzle-orm';
import { useDb, type Db } from '#server/database/client';
import {
  claimsOfLists,
  giverOf,
  linkWrittenGiversOf,
  offListOfLists,
  writtenGiversOf,
  type ClaimWithGiver,
} from '#server/database/claims';
import {
  acceptInvites,
  familyOf,
  findHolding,
  findList,
  holdersOfLists,
  invitesForEmail,
  linkMembersOf,
  listsHeldBy,
  listCountsOfMembers,
  peopleOfLists,
  type FamilyMember,
  type ListHolder,
  type ListPerson,
} from '#server/database/lists';
import { giftLists, parties, type GiftListRow } from '#server/database/schema';
import type { PartyCategory } from '#shared/utils/categories';
import { listYear, pastBand, type PastBand } from '#shared/utils/years';
import { loadYears, timelineOf } from '#server/database/years';
import { avatarOf, type Avatar } from '#server/utils/avatars';
import { findAccountById } from '#server/database/accounts';
import {
  linkChoicesOf,
  santaLinesOf,
  type LinkChoice,
  type SantaLine,
} from '#server/database/drawLists';
import {
  accountsWhereShared,
  membersSeeing,
  memberWhereShared,
  sharedEventsOf,
} from '#server/database/listSharing';
import { listStage, type ListStage } from '#server/utils/listSharing';
import { requireAccount } from '#server/http/auth';
import { notFound } from '#server/http/errors';
import { nowIso } from '#server/http/context';
import {
  ideaWho,
  listCandidates,
  offListView,
  newIdeasSince,
  removableClaims,
  type Candidate,
  type IdeaWho,
  type OffListView,
  type RemovableClaim,
} from '#server/utils/claims';
import {
  ageOn,
  cardSentence,
  ideaView,
  isSingleList,
  listStatus,
  noteOf,
  type CardSentence,
  type ClaimMode,
  type IdeaView,
  type ListStatus,
} from '#server/utils/lists';
import {
  canWriteIdeas,
  holderMay,
  invitesAccepted,
  listArrival,
  listRole,
  seesGivers,
  type HolderLevel,
  type ListRole,
  type MANAGING,
} from '#server/utils/listAccess';

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
  const id = getRouterParam(event, 'id') ?? '';
  const held = await findHolding(db, user.accountId, id);
  if (held) return { db, user, ...held };
  // Invited to hold it, and coming logged in with that address: an
  // invitation still waiting is accepted by coming.
  await settleArrivals(db, user.accountId);
  const late = await findHolding(db, user.accountId, id);
  if (!late) throw notFound();
  return { db, user, ...late };
};

/**
 * The same, for what only « Gère la liste » does (lot 25 bis): sharing,
 * inviting, changing a level, deleting the list. « Aide à écrire » gets
 * a 403: they know the list exists.
 * @param event - The request, with the list's id in its path.
 * @param action - What is asked.
 * @returns The database, the account and the list.
 */
export const requireManagedList = async (
  event: H3Event,
  action: (typeof MANAGING)[number],
) => {
  const held = await requireHeldList(event);
  if (!holderMay(held.level, action)) {
    throw createError({ statusCode: 403, statusMessage: 'not_manager' });
  }
  return held;
};

/**
 * What waits for an account when it comes (lot 25): the invitations to
 * hold a list sent to its address become lists it holds, and the people
 * others gave its address for become that account.
 * @param db - The database.
 * @param accountId - The account.
 * @returns Once done.
 */
export const settleArrivals = async (db: Db, accountId: string) => {
  const account = await findAccountById(db, accountId);
  if (!account) return;
  await linkMembersOf(db, account);
  // A tick noted for its address by those who hold a list becomes its own
  // (« Cocher pour quelqu'un »).
  await linkWrittenGiversOf(db, account);
  const waiting = await invitesForEmail(db, account.email);
  if (waiting.length === 0) return;
  const held = await listsHeldBy(db, accountId);
  const now = nowIso();
  await acceptInvites(
    db,
    accountId,
    invitesAccepted(
      waiting,
      { email: account.email, heldListIds: held.map((list) => list.id) },
      now,
    ),
    now,
  );
};

/** Who looks at a list, and what they are to it. */
export type Viewer = { accountId: string | null; role: ListRole };

/**
 * A person as a screen shows them. What says whose people they are among
 * and which account they are stays here: the screen only learns whether
 * they are the one looking (`isSelf`, « Moi », « C'est toi ») and whether
 * they have an account of their own (`linked`). Their address is for
 * those who hold the list only.
 */
export type MemberView = Omit<
  FamilyMember,
  'ownerId' | 'email' | 'accountId' | 'isSelf' | 'placeholder'
> & {
  age: number | null;
  /** The one looking. */
  isSelf: boolean;
  /** Has an account of their own: they choose their name and icon. */
  linked: boolean;
  /** Among the people of the one looking: theirs to link, or to delete. */
  own: boolean;
  /** The address given for their account; holders only. */
  email?: string | null;
};

/**
 * A person as a viewer sees them.
 * @param member - The person.
 * @param today - Today (YYYY-MM-DD), for their age.
 * @param viewer - Who looks.
 * @returns What the screen receives.
 */
export const memberView = (
  member: FamilyMember,
  today: string,
  viewer: Viewer,
): MemberView => {
  const {
    ownerId,
    email,
    accountId,
    isSelf: _own,
    placeholder: _nobody,
    ...rest
  } = member;
  return {
    ...rest,
    age: member.birthDate ? ageOn(member.birthDate, today) : null,
    isSelf: accountId !== null && accountId === viewer.accountId,
    linked: accountId !== null,
    own: ownerId === viewer.accountId,
    ...(viewer.role === 'holder' || ownerId === viewer.accountId
      ? { email }
      : {}),
  };
};

/** One of those who hold a list, as the others see them. */
export type HolderView = {
  accountId: string;
  name: string;
  avatar: Avatar;
  me: boolean;
  level: HolderLevel;
};

/**
 * One of those who hold a list, for a screen.
 * @param holder - Their account.
 * @param accountId - The account looking, or null.
 * @returns Their name, their icon, and whether they are the one looking.
 */
export const holderView = (
  holder: ListHolder,
  accountId: string | null,
): HolderView => ({
  accountId: holder.accountId,
  name: holder.firstName ?? holder.email.split('@')[0] ?? '',
  avatar: avatarOf({ id: holder.accountId, ...holder }),
  me: holder.accountId === accountId,
  level: holder.level,
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
  /** When it was written: new since my last visit or not (ticket 120). */
  createdAt: string;
  url: string | null;
  view: IdeaView;
  /** Mine, when I give it. */
  mine: MyClaim | null;
  /**
   * Taken from an old list and not changed since (lot 27): a mark for
   * those who hold the list only.
   */
  carried: boolean;
  /**
   * The ticks of others that the one looking may take off (those who
   * hold the list), each with the line as it would be without it.
   */
  claims: (RemovableClaim & { after: IdeaView })[];
  /** The words of each giver of a group, by name, for its sheet. */
  notes: {
    name: string;
    avatar: Avatar | null;
    note: string | null;
    me: boolean;
  }[];
  /**
   * Who gives it, for the sheet « Qui l'offre ? » of those who hold the
   * list; null when it does not open (free, or an anonymous tick).
   */
  who: IdeaWho | null;
};

/** A person on a list, with their ideas and the gifts not on the list. */
export type PersonLine = {
  id: string;
  member: MemberView;
  ideas: IdeaLine[];
  offList: (OffListView & { id: string })[];
  /** Whether the one looking may write, correct and delete these ideas. */
  mine: boolean;
};

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
  // What the pure rules of the claims ask: whether the names show.
  const sees = { accountId: viewer.accountId, holds: seesGivers(viewer.role) };
  const claimsOf = (ideaId: string) =>
    claims
      .filter((c) => c.ideaId === ideaId)
      .toSorted((a, b) => a.createdAt.localeCompare(b.createdAt));
  const lines: PersonLine[] = people.map((person) => ({
    id: person.id,
    member: memberView(person.member, today, viewer),
    mine: canWriteIdeas(
      viewer.role,
      { linkedAccountId: person.member.accountId },
      viewer.accountId,
    ),
    ideas: person.ideas.map((idea) => {
      const on = claimsOf(idea.id);
      const mine = on.find((c) => c.accountId === viewer.accountId);
      return {
        id: idea.id,
        text: idea.text,
        createdAt: idea.createdAt,
        url: idea.url,
        view: ideaView(on, sees),
        who: ideaWho(on, sees),
        carried: sees.holds && idea.carried,
        mine: mine
          ? {
              mode: mine.mode,
              anonymous: mine.anonymous,
              note: mine.note,
              leads: on[0]?.accountId === viewer.accountId,
              closed: on[0]?.closed ?? false,
            }
          : null,
        // What those who hold the list may take off for someone, each
        // with the line as it would be without it.
        claims: removableClaims(on, sees).map((claim) => ({
          ...claim,
          after: ideaView(
            on.filter((c) => c.id !== claim.id),
            sees,
          ),
        })),
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
      .map((gift) => ({ id: gift.id, ...offListView(gift, sees) })),
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

/** The document of a list, as those who hold it edit it. */
export type ListDocument = {
  list: ReturnType<typeof headOf> & { shareToken: string | null };
  people: PersonLine[];
  /**
   * « Une liste sans personne » (lot 27 bis): its ideas one under the
   * other, in its only part, which shows no person.
   */
  single: boolean;
  /** The gifts planned. */
  planned: number;
  /** Those the one looking gives. */
  mine: number;
  /**
   * My people not on the list yet, each with on how many lists they
   * are: on none, they can be deleted from here.
   */
  family: (MemberView & { lists: number })[];
  /** Those who hold the list, the one looking among them. */
  holders: HolderView[];
  /** The one looking manages the list: shares, invites, deletes. */
  manages: boolean;
  /** What its top bar says of its sharing (ticket 106). */
  sharing: SharingSummary;
  /**
   * The list it was taken from, while it is a draft: its title, or, taken from the year before
   * of the same event (ticket 108), that year (« Reprise de Noël 2026 »).
   */
  resumedFrom: {
    title: string;
    year: { category: PartyCategory; year: number } | null;
  } | null;
  /** The band of a list of a year over (ticket 119), or null. */
  past: PastListBand | null;
  /**
   * « Secret Santa · Famille Camille » under my own name (tickets 136,
   * 148, V3ListeSecret): one per Secret Santa where I take part whose
   * event the list is linked to, each leading to my page there.
   */
  santas: SantaLine[];
  /**
   * What « Lier à mon Secret Santa » offers under my name (ticket 148),
   * for one who manages the list and figures on it: empty otherwise.
   */
  linkable: LinkChoice[];
  /**
   * Who the sheet « Qui l'offre ? » offers (« Cocher pour quelqu'un »):
   * me, those who hold the list with me, those who ticked on it without
   * being anonymous, the first names written on it.
   */
  candidates: Candidate[];
};

/**
 * The document of a list for one of those who hold it.
 * @param db - The database.
 * @param list - The list.
 * @param accountId - The holder looking.
 * @returns What the screen shows.
 */
/** The stage of a list's sharing, as its top bar says it. */
export type SharingSummary = {
  stage: ListStage;
  /** The events it is shared in, all members or the one who drew. */
  events: string[];
  /** How many members of these events see it, its holders aside. */
  members: number;
};

/**
 * What the top bar of a list says of its sharing (docs/spec/v3/listes.md,
 * « La barre du haut d'une liste »).
 * @param db - The database.
 * @param list - The list.
 * @param holders - Those who hold it.
 * @returns The stage, the events and how many see it.
 */
const sharingSummary = async (
  db: Db,
  list: GiftListRow,
  holders: readonly { email: string }[],
): Promise<SharingSummary> => {
  const events = await sharedEventsOf(db, list.id);
  const all = events.filter((row) => row.visibility === 'party');
  const stage = listStage({
    isPublic: list.sharedAt !== null,
    parties: all.length,
    givers: events.length - all.length,
  });
  return {
    stage,
    events: (stage === 'giver' ? events : all).map((row) => row.name),
    members: await membersSeeing(
      db,
      all.map((row) => row.id),
      holders.map((holder) => holder.email),
    ),
  };
};

/**
 * Where a list taken up again comes from: the old list's title, and its
 * year when it was a year before of the same event (ticket 108).
 * @param db - The database.
 * @param list - The new list.
 * @param sourceId - The old one.
 * @returns What the note of the document says.
 */
const resumedFromOf = async (
  db: Db,
  list: GiftListRow,
  sourceId: string,
): Promise<ListDocument['resumedFrom']> => {
  const source = await findList(db, sourceId);
  if (!source) return { title: '', year: null };
  const sameEvent = source.partyId !== null && source.partyId === list.partyId;
  const [party] = sameEvent
    ? await db
        .select({ category: parties.category })
        .from(parties)
        .where(eq(parties.id, source.partyId ?? ''))
        .limit(1)
    : [];
  return {
    title: source.title,
    year: party ? { category: party.category, year: listYear(source) } : null,
  };
};

/** The band of a list of a year over, with the category of its event. */
export type PastListBand = PastBand & { category: PartyCategory };

/**
 * The band of a list of a year over (docs/spec/v3/listes.md, « Une liste
 * d'une année passée », ticket 119), for whoever opens it: its year, and
 * the list of this year taken from it when I may open it (I hold it: its
 * document; it is public, or shared in an event I am a member of: its
 * link).
 * @param db - The database.
 * @param list - The list.
 * @param accountId - The one looking, or null without a session.
 * @returns The band, or null for a list of this year.
 */
export const pastBandOf = async (
  db: Db,
  list: GiftListRow,
  accountId: string | null,
): Promise<PastListBand | null> => {
  if (!list.partyId) return null;
  const [party] = await db
    .select({
      id: parties.id,
      category: parties.category,
      recurring: parties.recurring,
      usualDate: parties.usualDate,
    })
    .from(parties)
    .where(eq(parties.id, list.partyId))
    .limit(1);
  if (!party) return null;
  const timeline = timelineOf(party, await loadYears(db, [party.id]));
  const current = timeline.current?.year;
  const taken = (
    await db.select().from(giftLists).where(eq(giftLists.carriedFrom, list.id))
  ).filter((one) => listYear(one) === current);
  const account =
    accountId && taken.length > 0 ? await findAccountById(db, accountId) : null;
  const where = async (one: GiftListRow): Promise<string | null> => {
    if (account && (await findHolding(db, account.id, one.id))) {
      return `/listes/${one.id}`;
    }
    const arrival = listArrival({
      loggedIn: account !== null,
      holder: false,
      isPublic: one.sharedAt !== null,
      member: account ? await memberWhereShared(db, one.id, account) : false,
      giver: false,
    });
    return arrival === 'open' && one.shareToken ? `/l/${one.shareToken}` : null;
  };
  const band = pastBand(
    timeline,
    list,
    await Promise.all(
      taken.map(async (one) => ({
        year: listYear(one),
        createdAt: one.createdAt,
        to: await where(one),
      })),
    ),
  );
  return band ? { ...band, category: party.category } : null;
};

export const listDocument = async (
  db: Db,
  list: GiftListRow,
  accountId: string,
  dataKey: CryptoKey,
): Promise<ListDocument> => {
  const viewer: Viewer = { accountId, role: 'holder' };
  const people = (await peopleOfLists(db, [list.id])).get(list.id) ?? [];
  const onList = new Set(people.map((p) => p.member.id));
  const claims = await claimsOfLists(db, [list.id]);
  const { lines, planned, mine } = linesOf(
    people,
    claims,
    await offListOfLists(db, [list.id]),
    viewer,
  );
  const today = todayIso();
  const counts = await listCountsOfMembers(db, accountId);
  const holders = (await holdersOfLists(db, [list.id])).get(list.id) ?? [];
  const manages = holders.some(
    (holder) => holder.accountId === accountId && holder.level === 'manage',
  );
  const sharing = await sharingSummary(db, list, holders);
  return {
    list: {
      ...headOf(list),
      // Every list has its link, which its holders copy at any time;
      // who gets in is decided on arrival (ticket 106).
      shareToken: list.shareToken,
    },
    sharing,
    people: lines,
    single: isSingleList(people),
    planned,
    mine,
    family: (await familyOf(db, accountId))
      .filter((member) => !onList.has(member.id))
      .map((member) => ({
        ...memberView(member, today, viewer),
        lists: counts.get(member.id) ?? 0,
      })),
    holders: holders.map((holder) => holderView(holder, accountId)),
    manages,
    // Kept once shared, to lead from the old list to this one (ticket
    // 119); the sentence of its marks goes at the first share.
    resumedFrom:
      list.carriedFrom && sharing.stage === 'draft'
        ? await resumedFromOf(db, list, list.carriedFrom)
        : null,
    past: await pastBandOf(db, list, accountId),
    ...(await mySantaLines(
      db,
      list.id,
      people,
      { id: accountId, manages },
      dataKey,
    )),
    candidates: await candidatesOf(db, list.id, accountId, holders, claims),
  };
};

/**
 * The Secret Santa under my name on a list, when I figure on it (tickets
 * 136, 148): those it is linked to, and those it may be linked to when I
 * manage it; none otherwise.
 * @param db - The database.
 * @param listId - The list.
 * @param people - Its people.
 * @param viewer - The holder looking.
 * @param viewer.id - Their account.
 * @param viewer.manages - Whether they manage the list.
 * @param dataKey - The key of the personal links.
 * @returns The pills and the choices of « Lier ».
 */
const mySantaLines = async (
  db: Db,
  listId: string,
  people: readonly ListPerson[],
  viewer: { id: string; manages: boolean },
  dataKey: CryptoKey,
): Promise<{ santas: SantaLine[]; linkable: LinkChoice[] }> => {
  const none = { santas: [], linkable: [] };
  if (!people.some((person) => person.member.accountId === viewer.id)) {
    return none;
  }
  const account = await findAccountById(db, viewer.id);
  if (!account) return none;
  return {
    santas: await santaLinesOf(db, listId, account, dataKey),
    linkable: viewer.manages ? await linkChoicesOf(db, listId, account) : [],
  };
};

/**
 * Who the sheet « Qui l'offre ? » offers on a list, for one who holds it.
 * @param db - The database.
 * @param listId - The list.
 * @param accountId - The one who holds it and looks.
 * @param holders - Those who hold it.
 * @param claims - Its ticks.
 * @returns Each one once, in the order of the sheet.
 */
export const candidatesOf = async (
  db: Db,
  listId: string,
  accountId: string,
  holders: readonly ListHolder[],
  claims: readonly ClaimWithGiver[],
): Promise<Candidate[]> => {
  const views = holders.map((holder) => holderView(holder, accountId));
  const me = views.find((holder) => holder.me);
  return listCandidates({
    viewer: {
      accountId,
      name: me?.name ?? '',
      avatar: me?.avatar ?? null,
    },
    holders: views,
    claims,
    // In the V3, the app knows the members of the events the list is
    // shared in too (ticket 098).
    members: (await accountsWhereShared(db, listId)).map((account) => ({
      accountId: account.id,
      ...giverOf(account),
    })),
    written: await writtenGiversOf(db, listId),
  });
};

/** A list as those who open its link see it. */
export type VisitorDocument = {
  list: ReturnType<typeof headOf>;
  holder: { name: string; avatar: Avatar };
  people: PersonLine[];
  /** A list without people: its ideas one under the other. */
  single: boolean;
  /** Whether I hold it (then I see who gives what). */
  holds: boolean;
  /** Whether I figure on it, linked to my account: I write my own ideas. */
  figures: boolean;
  /** Whether I am logged in. */
  loggedIn: boolean;
  /** The band of a list of a year over (ticket 119), or null. */
  past: PastListBand | null;
};

/**
 * What an account is to a list, from who holds it and who is on it.
 * @param db - The database.
 * @param list - The list.
 * @param accountId - The account looking, or null.
 * @returns Its role, with the holders and the people it was read from.
 */
export const roleOnList = async (
  db: Db,
  list: GiftListRow,
  accountId: string | null,
) => {
  const holders = (await holdersOfLists(db, [list.id])).get(list.id) ?? [];
  const people = (await peopleOfLists(db, [list.id])).get(list.id) ?? [];
  const role = listRole(
    {
      holderIds: holders.map((holder) => holder.accountId),
      linkedIds: people.flatMap((p) =>
        p.member.accountId ? [p.member.accountId] : [],
      ),
    },
    accountId,
  );
  return { role, holders, people };
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
  const { role, holders, people } = await roleOnList(db, list, accountId);
  const { lines } = linesOf(
    people,
    await claimsOfLists(db, [list.id]),
    await offListOfLists(db, [list.id]),
    { accountId, role },
  );
  const first = holders[0];
  /** My own section first, for whoever figures on the list. */
  const rank = (line: PersonLine) => (role === 'linked' && line.mine ? 0 : 1);
  return {
    list: headOf(list),
    holder: first
      ? holderView(first, accountId)
      : { name: '', avatar: { emoji: '🎁', color: 'brick' } },
    // The age is enough: the exact birth date stays with those who hold
    // the list.
    people: (role === 'holder'
      ? lines
      : lines.map((line) => ({
          ...line,
          member: { ...line.member, birthDate: null },
        }))
    ).toSorted((a, b) => rank(a) - rank(b)),
    single: isSingleList(people),
    holds: role === 'holder',
    figures: role === 'linked',
    loggedIn: accountId !== null,
    past: await pastBandOf(db, list, accountId),
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
  /** A list without people: nobody shows, yet it is not empty. */
  single: boolean;
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
  figuring: readonly GiftListRow[] = [],
): Promise<ListCard[]> => {
  const heldIds = new Set(held.map((list) => list.id));
  const visitedIds = new Set(visited.map((v) => v.list.id));
  const others = [
    ...visited,
    // A list I figure on is in my lists before I ever open it.
    ...figuring
      .filter((list) => !visitedIds.has(list.id))
      .map((list) => ({ list, lastSeenAt: nowIso() })),
  ].filter(
    // A list no longer shared leaves the lists of those who opened it,
    // and comes back with its sharing.
    (v) => !heldIds.has(v.list.id) && v.list.sharedAt,
  );
  const all = [...held, ...others.map((v) => v.list)];
  const ids = all.map((l) => l.id);
  const people = await peopleOfLists(db, ids);
  const claims = await claimsOfLists(db, ids);
  const offList = await offListOfLists(db, ids);
  const holders = await holdersOfLists(db, ids);
  const today = todayIso();
  return all.map((list) => {
    const holds = heldIds.has(list.id);
    const onList = people.get(list.id) ?? [];
    const { planned, mine } = linesOf(
      onList,
      claims,
      offList.filter((g) => g.listId === list.id),
      { accountId, role: holds ? 'holder' : 'guest' },
    );
    const visit = others.find((v) => v.list.id === list.id);
    const first = holders.get(list.id)?.[0];
    const holder = first ? holderView(first, accountId) : undefined;
    return {
      id: list.id,
      icon: { emoji: list.iconEmoji, color: list.iconColor },
      title: list.title,
      eventDate: list.eventDate,
      status: listStatus(list, today),
      createdAt: list.createdAt,
      holder:
        holds || !holder
          ? null
          : {
              name: holder.name,
              avatar: holder.avatar,
              token: list.shareToken ?? '',
            },
      // A list without people shows nobody.
      people: onList
        .filter((p) => !p.member.placeholder)
        .map((p) => ({
          firstName: p.member.firstName,
          avatar: p.member.avatar,
        })),
      single: isSingleList(onList),
      sentence: cardSentence({ planned, mine }, holds),
      noIdeas: holds
        ? onList
            .filter((p) => p.ideas.length === 0 && !p.member.placeholder)
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
