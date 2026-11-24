import { and, asc, count, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  giftListHolders,
  giftListParties,
  giftLists,
  participations,
  parties,
  partyOrganisers,
  partyYears,
  persons,
  secretSantas,
  type AccountRow,
  type PartyRow,
  type PersonRow,
} from './schema';
import { insertPersonFromAccount } from './people';
import { loadYears, timelineOf } from './years';
import { loadPastLines, type PastYearLine } from './pastYears';
import { loadForWhom } from './forWhom';
import { gamePath, listKey, loadLines } from './lines';
import { createOwnParty } from './listParties';
import { newId, nowIso } from '#server/http/context';
import { decrypt } from '#server/utils/crypto';
import { avatarOf, type Avatar } from '#server/utils/avatars';
import { freeSlug, slugify } from '#server/utils/auth';
import {
  forMemberOf,
  leavingLists,
  usualDateOf,
  type PartyInput,
} from '#server/utils/parties';
import type { PartyCategory } from '#shared/utils/categories';
import type { ForWhom } from '#shared/utils/forWhom';
import type { LinePart, LineText } from '#shared/utils/lines';
import { listYear } from '#shared/utils/years';

// The party (docs/spec/v3/fete.md, ticket 104): its page, its creation
// with people taken from other parties, leaving it.

/** How many icons the line of the members shows. */
const MEMBER_ICONS = 5;

export type PartyPage = {
  party: {
    id: string;
    slug: string;
    name: string;
    category: PartyCategory;
    iconEmoji: string | null;
    recurring: boolean;
    usualDate: string | null;
    /** A birthday: whom it is for, their age the year shown (ticket 118). */
    forWhom: ForWhom | null;
  };
  /**
   * The year of the party now (ticket 108): the one the home shows, else,
   * for an event over for good, its last one.
   */
  year: { year: number; date: string | null } | null;
  /** « Les années passées », the latest first, with what I did there. */
  pastYears: PastYearLine[];
  role: 'organiser' | 'member';
  members: { count: number; avatars: Avatar[] };
  /**
   * The Secret Santas of the year I organise or take part in, with their
   * text: the organiser's for an organiser, mine otherwise (lignes.md).
   */
  secretSantas: {
    id: string;
    year: number;
    label: string;
    to: string | null;
    line: LineText | null;
    game: { line: LineText; to: string } | null;
  }[];
  /**
   * May organise one more: any organiser, the limit of the account being
   * told on the form (ticket 105).
   */
  canAddSecretSanta: boolean;
  /** The lists of the party I may see: public in it, or mine. */
  lists: {
    id: string;
    mine: boolean;
    owner: { firstName: string; avatar: Avatar } | null;
    title: LinePart;
    line: LineText | null;
    to: string | null;
  }[];
  /**
   * « Quitter » (fete.md): whether one of my lists here is in no other
   * event; null without a list of mine here.
   */
  myListsAlone: boolean | null;
};

/**
 * Everything the page of a party shows to me.
 * @param db - The database.
 * @param input - The party, my account, my role, my person, the key.
 * @returns The page.
 */
export const loadPartyPage = async (
  db: Db,
  input: {
    party: PartyRow;
    account: AccountRow;
    role: 'organiser' | 'member';
    me: PersonRow | null;
    dataKey: CryptoKey;
  },
): Promise<PartyPage> => {
  const { party, account, role, me, dataKey } = input;
  const [years, people, santas, shares, made] = await Promise.all([
    loadYears(db, [party.id]),
    db
      .select()
      .from(persons)
      .where(eq(persons.partyId, party.id))
      .orderBy(asc(persons.createdAt)),
    db
      .select({
        id: secretSantas.id,
        status: secretSantas.status,
        label: secretSantas.label,
        yearId: secretSantas.yearId,
        year: partyYears.year,
      })
      .from(secretSantas)
      .innerJoin(partyYears, eq(partyYears.id, secretSantas.yearId))
      .where(eq(secretSantas.partyId, party.id))
      .orderBy(asc(secretSantas.createdAt)),
    db
      .select({
        id: giftLists.id,
        accountId: giftLists.accountId,
        shareToken: giftLists.shareToken,
        visibility: giftListParties.visibility,
        eventDate: giftLists.eventDate,
        createdAt: giftLists.createdAt,
      })
      .from(giftListParties)
      .innerJoin(giftLists, eq(giftLists.id, giftListParties.listId))
      .where(eq(giftListParties.partyId, party.id))
      .orderBy(asc(giftListParties.createdAt)),
    // The lists made for it (ticket 106): their holders see them here,
    // even as drafts.
    db
      .select({
        id: giftLists.id,
        accountId: giftLists.accountId,
        shareToken: giftLists.shareToken,
        eventDate: giftLists.eventDate,
        createdAt: giftLists.createdAt,
      })
      .from(giftLists)
      .where(eq(giftLists.partyId, party.id))
      .orderBy(asc(giftLists.createdAt)),
  ]);
  // The year the page shows; the years before are « Les années passées ».
  const timeline = timelineOf(party, years);
  const shownYear = timeline.current ?? timeline.past[0] ?? null;
  const year = years.find((row) => row.year === shownYear?.year);
  // One row per list of that year: shared here, else made for here.
  const links = [
    ...shares,
    ...made
      .filter((list) => !shares.some((row) => row.id === list.id))
      .map((list) => ({ ...list, visibility: 'made' as const })),
  ].filter((list) => !shownYear || listYear(list) >= shownYear.year);
  const held = new Set(
    links.length === 0
      ? []
      : (
          await db
            .select({ listId: giftListHolders.listId })
            .from(giftListHolders)
            .where(
              and(
                eq(giftListHolders.accountId, account.id),
                inArray(
                  giftListHolders.listId,
                  links.map((list) => list.id),
                ),
              ),
            )
        ).map((row) => row.listId),
  );
  const owners = new Map(
    links.length === 0
      ? []
      : (
          await db
            .select({
              id: accounts.id,
              email: accounts.email,
              firstName: accounts.firstName,
            })
            .from(accounts)
            .where(
              inArray(
                accounts.id,
                links.map((list) => list.accountId),
              ),
            )
        ).map((row) => [row.id, row]),
  );
  const ofYear = santas.filter((santa) => santa.yearId === year?.id);
  const mine =
    role === 'organiser' || !me
      ? []
      : await db
          .select({
            secretSantaId: participations.secretSantaId,
            tokenEnc: participations.tokenEnc,
            tokenIv: participations.tokenIv,
          })
          .from(participations)
          .where(
            and(
              eq(participations.personId, me.id),
              inArray(
                participations.secretSantaId,
                ofYear.length === 0 ? [''] : ofYear.map((santa) => santa.id),
              ),
            ),
          );
  const paths = new Map(
    await Promise.all(
      mine.map(async (row) => {
        const token = await decrypt(
          { enc: row.tokenEnc, iv: row.tokenIv },
          dataKey,
        );
        return [
          row.secretSantaId,
          token.ok ? `/p/${token.value}` : null,
        ] as const;
      }),
    ),
  );
  const santasShown = ofYear.filter(
    (santa) => role === 'organiser' || paths.has(santa.id),
  );
  const listsShown = links.filter(
    (list) => list.visibility === 'party' || held.has(list.id),
  );
  const [lines, elsewhere] = await Promise.all([
    loadLines(
      db,
      {
        accountId: account.id,
        persons: me ? [me.id] : [],
        santas: santasShown.map((santa) => ({
          id: santa.id,
          as: role === 'organiser' ? 'organiser' : 'participant',
        })),
        lists: listsShown.map((list) => ({ id: list.id, partyId: party.id })),
      },
      nowIso(),
    ),
    held.size === 0
      ? []
      : db
          .select({ listId: giftListParties.listId, n: count() })
          .from(giftListParties)
          .where(inArray(giftListParties.listId, [...held]))
          .groupBy(giftListParties.listId),
  ]);
  const mineHere = listsShown.filter((list) => held.has(list.id));
  const forWhom = await loadForWhom(db, [party]);
  return {
    party: {
      id: party.id,
      slug: party.slug,
      name: party.name,
      category: party.category,
      iconEmoji: party.iconEmoji,
      recurring: party.recurring,
      usualDate: party.usualDate,
      forWhom: forWhom(party, shownYear?.year ?? null, account.id),
    },
    year: shownYear,
    pastYears: await loadPastLines(db, {
      account,
      dataKey,
      parties: [party],
      except: shownYear
        ? { partyId: party.id, year: shownYear.year }
        : undefined,
    }),
    role,
    members: {
      count: people.length,
      avatars: people.slice(0, MEMBER_ICONS).map(avatarOf),
    },
    secretSantas: santasShown.map((santa) => {
      const path = paths.get(santa.id) ?? null;
      const line = lines.santas.get(santa.id);
      return {
        id: santa.id,
        year: santa.year,
        label: santa.label,
        to:
          role === 'organiser'
            ? `/admin/${party.slug}/editions/${santa.id}`
            : path,
        line: line?.line ?? null,
        game:
          line?.game && path
            ? { line: line.game, to: gamePath(path, line.game) }
            : null,
      };
    }),
    canAddSecretSanta: role === 'organiser',
    lists: listsShown.map((list) => {
      const owner = owners.get(list.accountId);
      const person = people.find((p) => p.email === owner?.email);
      const line = lines.lists.get(listKey(list.id, party.id));
      return {
        id: list.id,
        mine: held.has(list.id),
        owner: person
          ? { firstName: person.firstName, avatar: avatarOf(person) }
          : null,
        title: line?.title ?? { key: 'lines.list.mine' },
        line: line?.line ?? null,
        to: held.has(list.id)
          ? `/listes/${list.id}`
          : `/l/${list.shareToken}?depuis=${party.slug}`,
      };
    }),
    myListsAlone:
      mineHere.length === 0
        ? null
        : mineHere.some(
            (list) =>
              (elsewhere.find((row) => row.listId === list.id)?.n ?? 0) <= 1,
          ),
  };
};

/** A person of a party I organise, one I may take into a new one. */
export type TakenPerson = {
  id: string;
  partyId: string;
  firstName: string;
  email: string | null;
  avatar: Avatar;
};

/**
 * The parties I organise, with their people: what « Reprendre les
 * membres d'une autre fête » offers. Parties made for a list are left out.
 * @param db - The database.
 * @param account - Me.
 * @returns The parties, by name, and their people.
 */
export const partiesToTakeFrom = async (db: Db, account: AccountRow) => {
  const mine = await db
    .select({
      id: parties.id,
      name: parties.name,
      category: parties.category,
      iconEmoji: parties.iconEmoji,
    })
    .from(partyOrganisers)
    .innerJoin(parties, eq(parties.id, partyOrganisers.partyId))
    .where(
      and(
        eq(partyOrganisers.accountId, account.id),
        eq(parties.fromList, false),
      ),
    )
    .orderBy(asc(parties.name));
  const people =
    mine.length === 0
      ? []
      : await db
          .select()
          .from(persons)
          .where(
            inArray(
              persons.partyId,
              mine.map((party) => party.id),
            ),
          )
          .orderBy(asc(persons.firstName));
  return {
    parties: mine,
    people: people
      .filter((person) => person.email !== account.email)
      .map((person): TakenPerson => ({
        id: person.id,
        partyId: person.partyId,
        firstName: person.firstName,
        email: person.email,
        avatar: avatarOf(person),
      })),
  };
};

/**
 * Creates a party: me as its organiser and first member, and its year.
 * Nobody else: one comes in by its Secret Santa or its lists (ticket 117).
 * @param db - The database.
 * @param account - Me.
 * @param input - What « Pour quelle occasion ? » gave.
 * @param now - ISO date.
 * @returns The address of the new party.
 */
export const createParty = async (
  db: Db,
  account: AccountRow,
  input: PartyInput,
  now: string,
): Promise<string> => {
  const wanted = slugify(input.name) || 'fete';
  const taken = (await db.select({ slug: parties.slug }).from(parties)).map(
    (row) => row.slug,
  );
  const slug = freeSlug(wanted, taken);
  const id = newId();
  await db.batch([
    db.insert(parties).values({
      id,
      slug,
      name: input.name,
      category: input.category,
      iconEmoji: null,
      iconColor: null,
      usualDate: usualDateOf(input.date),
      recurring: input.recurring,
      forMemberId: forMemberOf(input.category, input.forMemberId),
      fromList: false,
      rules: {},
      createdBy: account.id,
      createdAt: now,
    }),
    db.insert(partyYears).values({
      id: newId(),
      partyId: id,
      year: Number(input.date.slice(0, 4)),
      date: input.date,
      createdAt: now,
    }),
    db
      .insert(partyOrganisers)
      .values({ partyId: id, accountId: account.id, createdAt: now }),
  ]);
  // Its creator: the event exists with them alone (docs/spec/v3/
  // accueil-et-creation.md, « Une autre occasion »).
  await insertPersonFromAccount(db, { groupId: id, account, now });
  return slug;
};

/**
 * Leaves a party (fete.md, « Quitter »): my lists leave it, and one left
 * in no party gets its own; my ticks stay; I am no longer one of its
 * people, so I neither see it nor take part in its next Secret Santa. My
 * person stays for the draws already made, without my address.
 * @param db - The database.
 * @param input - The party, me and my person.
 * @param now - ISO date.
 * @returns Once done.
 */
export const leaveParty = async (
  db: Db,
  input: { party: PartyRow; account: AccountRow; me: PersonRow },
  now: string,
) => {
  const { party, account, me } = input;
  const mineHere = await db
    .select({ listId: giftListParties.listId })
    .from(giftListParties)
    .innerJoin(
      giftListHolders,
      eq(giftListHolders.listId, giftListParties.listId),
    )
    .where(
      and(
        eq(giftListParties.partyId, party.id),
        eq(giftListHolders.accountId, account.id),
      ),
    );
  const ids = mineHere.map((row) => row.listId);
  const counts =
    ids.length === 0
      ? []
      : await db
          .select({ listId: giftListParties.listId, n: count() })
          .from(giftListParties)
          .where(inArray(giftListParties.listId, ids))
          .groupBy(giftListParties.listId);
  const { out, alone } = leavingLists(
    counts.map((row) => ({ listId: row.listId, parties: row.n })),
  );
  await db.batch([
    db
      .update(persons)
      .set({ email: null, active: false })
      .where(eq(persons.id, me.id)),
    db
      .delete(giftListParties)
      .where(
        and(
          eq(giftListParties.partyId, party.id),
          inArray(giftListParties.listId, out.length === 0 ? [''] : out),
        ),
      ),
  ]);
  const lonely =
    alone.length === 0
      ? []
      : await db.select().from(giftLists).where(inArray(giftLists.id, alone));
  await lonely.reduce<Promise<void>>(
    (done, list) =>
      done.then(async () => {
        // A list kept apart has a party of its own, with its id.
        const [own] = await db
          .select({ id: parties.id })
          .from(parties)
          .where(eq(parties.id, list.id))
          .limit(1);
        if (own) {
          await db.insert(giftListParties).values({
            id: newId(),
            listId: list.id,
            partyId: own.id,
            visibility: 'party',
            createdAt: now,
          });
        } else {
          await createOwnParty(db, list, now);
        }
      }),
    Promise.resolve(),
  );
};
