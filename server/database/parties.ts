import { and, asc, count, desc, eq, inArray } from 'drizzle-orm';
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
import { createOwnParty } from './listParties';
import { newId } from '#server/http/context';
import { decrypt } from '#server/utils/crypto';
import { avatarOf, type Avatar } from '#server/utils/avatars';
import { freeSlug, slugify } from '#server/utils/auth';
import {
  checkPartySize,
  leavingLists,
  takenPeople,
  usualDateOf,
  type PartyInput,
} from '#server/utils/parties';
import type { PartyCategory } from '#shared/utils/categories';
import { unwrap } from '#server/http/errors';

// The party (docs/spec/v3/fete.md, ticket 104): its page, its creation
// with people taken from other parties, leaving it.

/** How many icons the line of the members shows. */
const MEMBER_ICONS = 5;

export type PartyPage = {
  party: {
    slug: string;
    name: string;
    category: PartyCategory;
    iconEmoji: string | null;
    recurring: boolean;
    usualDate: string | null;
  };
  /** The year of the party now, the latest one. */
  year: { year: number; date: string | null } | null;
  role: 'organiser' | 'member';
  members: { count: number; avatars: Avatar[] };
  /** The Secret Santas of the year I organise or take part in. */
  secretSantas: { id: string; year: number; to: string | null }[];
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
    to: string | null;
  }[];
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
  const [[year], people, santas, shares, made] = await Promise.all([
    db
      .select({
        id: partyYears.id,
        year: partyYears.year,
        date: partyYears.date,
      })
      .from(partyYears)
      .where(eq(partyYears.partyId, party.id))
      .orderBy(desc(partyYears.year))
      .limit(1),
    db
      .select()
      .from(persons)
      .where(eq(persons.partyId, party.id))
      .orderBy(asc(persons.createdAt)),
    db
      .select({
        id: secretSantas.id,
        status: secretSantas.status,
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
      })
      .from(giftLists)
      .where(eq(giftLists.partyId, party.id))
      .orderBy(asc(giftLists.createdAt)),
  ]);
  // One row per list: shared here, else made for here.
  const links = [
    ...shares,
    ...made
      .filter((list) => !shares.some((row) => row.id === list.id))
      .map((list) => ({ ...list, visibility: 'made' as const })),
  ];
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
  return {
    party: {
      slug: party.slug,
      name: party.name,
      category: party.category,
      iconEmoji: party.iconEmoji,
      recurring: party.recurring,
      usualDate: party.usualDate,
    },
    year: year ? { year: year.year, date: year.date } : null,
    role,
    members: {
      count: people.length,
      avatars: people.slice(0, MEMBER_ICONS).map(avatarOf),
    },
    secretSantas: ofYear
      .filter((santa) => role === 'organiser' || paths.has(santa.id))
      .map((santa) => ({
        id: santa.id,
        year: santa.year,
        to:
          role === 'organiser'
            ? `/admin/${party.slug}/editions/${santa.id}`
            : (paths.get(santa.id) ?? null),
      })),
    canAddSecretSanta: role === 'organiser',
    lists: links
      .filter((list) => list.visibility === 'party' || held.has(list.id))
      .map((list) => {
        const owner = owners.get(list.accountId);
        const person = people.find((p) => p.email === owner?.email);
        return {
          id: list.id,
          mine: held.has(list.id),
          owner: person
            ? { firstName: person.firstName, avatar: avatarOf(person) }
            : null,
          to: held.has(list.id)
            ? `/listes/${list.id}`
            : `/l/${list.shareToken}?depuis=${party.slug}`,
        };
      }),
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
 * Creates a party: me as its organiser and first member, the people taken
 * from parties I organise (once each), and its year.
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
  const offered = await partiesToTakeFrom(db, account);
  const chosen = takenPeople(
    offered.people.filter((person) => input.memberIds.includes(person.id)),
    account.email,
  );
  unwrap(checkPartySize(chosen.length + 1));
  const rows = await db
    .select()
    .from(persons)
    .where(
      inArray(persons.id, chosen.length === 0 ? [''] : chosen.map((p) => p.id)),
    );
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
    // One statement per person: D1 caps the parameters of a statement.
    ...rows.map((person) =>
      db.insert(persons).values({
        id: newId(),
        partyId: id,
        firstName: person.firstName,
        lastName: person.lastName,
        email: person.email,
        language: person.language,
        avatarEmoji: person.avatarEmoji,
        avatarColor: person.avatarColor,
        active: true,
        createdAt: now,
      }),
    ),
  ]);
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
