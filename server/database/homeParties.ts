import { and, asc, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  familyMembers,
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
} from './schema';
import { decrypt } from '#server/utils/crypto';
import type { PartyCategory } from '#shared/utils/categories';

// The home of the V3 (docs/spec/v3/accueil-et-creation.md, ticket 103):
// the parties I am a member or an organiser of, each with its Secret
// Santas and the lists of its members, as the page of a party shows them
// (ticket 104); and my people, for the birthdays to come. A few queries
// for all the parties at once: D1 caps the queries of one request. Never
// a result of a draw.

export type HomeParty = {
  slug: string;
  name: string;
  category: PartyCategory;
  iconEmoji: string | null;
  /** The date of its latest year, its usual day, whether it comes back. */
  yearDate: string | null;
  usualDate: string | null;
  recurring: boolean;
  /** The Secret Santas of its latest year I take part in or organise. */
  secretSantas: { id: string; label: string; to: string | null }[];
  /** Its lists I may see: in the party for all its members, or mine. */
  lists: {
    id: string;
    mine: boolean;
    ownerName: string | null;
    to: string | null;
  }[];
};

export type HomeData = {
  parties: HomeParty[];
  people: {
    id: string;
    firstName: string;
    birthDate: string | null;
    isSelf: boolean;
  }[];
};

/** `inArray` with nothing in it still makes a valid query. */
const anyOf = (ids: string[]) => (ids.length === 0 ? [''] : ids);

/**
 * What the home of an account shows.
 * @param db - The database.
 * @param account - Me.
 * @param dataKey - The key of the personal links.
 * @returns My parties and my people.
 */
export const loadHome = async (
  db: Db,
  account: AccountRow,
  dataKey: CryptoKey,
): Promise<HomeData> => {
  const [mine, organised, people] = await Promise.all([
    db
      .select({ id: persons.id, partyId: persons.partyId })
      .from(persons)
      .where(eq(persons.email, account.email)),
    db
      .select({ partyId: partyOrganisers.partyId })
      .from(partyOrganisers)
      .where(eq(partyOrganisers.accountId, account.id)),
    db
      .select({
        id: familyMembers.id,
        firstName: familyMembers.firstName,
        birthDate: familyMembers.birthDate,
        isSelf: familyMembers.isSelf,
      })
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.accountId, account.id),
          eq(familyMembers.placeholder, false),
        ),
      ),
  ]);
  const organises = new Set(organised.map((row) => row.partyId));
  const ids = [...new Set([...mine.map((row) => row.partyId), ...organises])];
  if (ids.length === 0) return { parties: [], people };

  const [rows, years, santas, links] = await Promise.all([
    db.select().from(parties).where(inArray(parties.id, ids)),
    db
      .select({
        id: partyYears.id,
        partyId: partyYears.partyId,
        year: partyYears.year,
        date: partyYears.date,
      })
      .from(partyYears)
      .where(inArray(partyYears.partyId, ids)),
    db
      .select({
        id: secretSantas.id,
        partyId: secretSantas.partyId,
        yearId: secretSantas.yearId,
        label: secretSantas.label,
      })
      .from(secretSantas)
      .where(inArray(secretSantas.partyId, ids))
      .orderBy(asc(secretSantas.createdAt)),
    db
      .select({
        id: giftLists.id,
        partyId: giftListParties.partyId,
        accountId: giftLists.accountId,
        shareToken: giftLists.shareToken,
        visibility: giftListParties.visibility,
      })
      .from(giftListParties)
      .innerJoin(giftLists, eq(giftLists.id, giftListParties.listId))
      .where(inArray(giftListParties.partyId, ids))
      .orderBy(asc(giftListParties.createdAt)),
  ]);
  const listIds = [...new Set(links.map((list) => list.id))];
  const ownerIds = [...new Set(links.map((list) => list.accountId))];
  const [held, owners, taking] = await Promise.all([
    db
      .select({ listId: giftListHolders.listId })
      .from(giftListHolders)
      .where(
        and(
          eq(giftListHolders.accountId, account.id),
          inArray(giftListHolders.listId, anyOf(listIds)),
        ),
      ),
    db
      .select({
        id: accounts.id,
        email: accounts.email,
        firstName: accounts.firstName,
      })
      .from(accounts)
      .where(inArray(accounts.id, anyOf(ownerIds))),
    db
      .select({
        secretSantaId: participations.secretSantaId,
        tokenEnc: participations.tokenEnc,
        tokenIv: participations.tokenIv,
      })
      .from(participations)
      .where(
        inArray(participations.personId, anyOf(mine.map((row) => row.id))),
      ),
  ]);
  const ownerEmails = owners.map((owner) => owner.email);
  const ownerPeople = await db
    .select({
      partyId: persons.partyId,
      email: persons.email,
      firstName: persons.firstName,
    })
    .from(persons)
    .where(
      and(
        inArray(persons.partyId, ids),
        inArray(persons.email, anyOf(ownerEmails)),
      ),
    );
  const myLists = new Set(held.map((row) => row.listId));
  const paths = new Map(
    await Promise.all(
      taking.map(async (row) => {
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
    people,
    parties: rows.map((party) => {
      const latest = years
        .filter((year) => year.partyId === party.id)
        .toSorted((a, b) => b.year - a.year)[0];
      const organiser = organises.has(party.id);
      return {
        slug: party.slug,
        name: party.name,
        category: party.category,
        iconEmoji: party.iconEmoji,
        yearDate: latest?.date ?? null,
        usualDate: party.usualDate,
        recurring: party.recurring,
        secretSantas: santas
          .filter(
            (santa) =>
              santa.partyId === party.id &&
              santa.yearId === latest?.id &&
              (organiser || paths.has(santa.id)),
          )
          .map((santa) => ({
            id: santa.id,
            label: santa.label,
            // My own page first; the organiser's otherwise.
            to:
              paths.get(santa.id) ??
              (organiser ? `/admin/${party.slug}/editions/${santa.id}` : null),
          })),
        lists: links
          .filter(
            (list) =>
              list.partyId === party.id &&
              (list.visibility === 'party' || myLists.has(list.id)),
          )
          .map((list) => {
            const owner = owners.find((row) => row.id === list.accountId);
            const person = ownerPeople.find(
              (row) => row.partyId === party.id && row.email === owner?.email,
            );
            return {
              id: list.id,
              mine: myLists.has(list.id),
              ownerName: person?.firstName ?? owner?.firstName ?? null,
              to: myLists.has(list.id)
                ? `/listes/${list.id}`
                : list.shareToken
                  ? `/l/${list.shareToken}`
                  : null,
            };
          }),
      };
    }),
  };
};
