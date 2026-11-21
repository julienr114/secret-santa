import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  assignments,
  secretSantas,
  familyMembers,
  giftListHolders,
  giftListPeople,
  giftListVisits,
  parties,
  participations,
  persons,
} from './schema';
import { listParticipationsByEmail } from './home';
import type { ModeRow } from '#server/utils/anonymous';
import { drawStillSecret } from '#server/utils/anonymous';
import { decrypt } from '#server/utils/crypto';
import { mergeRules } from '#server/utils/rules';
import { nowIso } from '#server/http/context';

// « Mode anonyme » (lot 27 ter): my setting on a list, kept with my
// visits of it, and the only place where a draw is read for a gift list.

/** My mode on a list, as it is kept. */
export const findMode = async (
  db: Db,
  listId: string,
  accountId: string,
): Promise<ModeRow> => {
  const row = await db
    .select({
      anonymous: giftListVisits.anonymous,
      notice: giftListVisits.anonymousNotice,
    })
    .from(giftListVisits)
    .where(
      and(
        eq(giftListVisits.listId, listId),
        eq(giftListVisits.accountId, accountId),
      ),
    )
    .get();
  return { anonymous: row?.anonymous ?? null, notice: row?.notice ?? null };
};

/** Keeps my mode on a list. */
export const saveMode = (
  db: Db,
  listId: string,
  accountId: string,
  mode: ModeRow,
) =>
  db
    .insert(giftListVisits)
    .values({
      listId,
      accountId,
      lastSeenAt: nowIso(),
      anonymous: mode.anonymous,
      anonymousNotice: mode.notice,
    })
    .onConflictDoUpdate({
      target: [giftListVisits.listId, giftListVisits.accountId],
      set: { anonymous: mode.anonymous, anonymousNotice: mode.notice },
    });

/**
 * The addresses of those a gift list is about: the accounts that hold
 * it, and the accounts of the people who figure on it.
 * @param db - The database.
 * @param listId - The list.
 * @returns Their addresses, lower case as accounts keep them.
 */
const addressesOnList = async (db: Db, listId: string): Promise<string[]> => {
  const holders = await db
    .select({ email: accounts.email })
    .from(giftListHolders)
    .innerJoin(accounts, eq(accounts.id, giftListHolders.accountId))
    .where(eq(giftListHolders.listId, listId));
  const linked = await db
    .select({ email: accounts.email })
    .from(giftListPeople)
    .innerJoin(familyMembers, eq(familyMembers.id, giftListPeople.memberId))
    .innerJoin(accounts, eq(accounts.id, familyMembers.linkedAccountId))
    .where(eq(giftListPeople.listId, listId));
  return [...holders, ...linked].map((row) => row.email);
};

/**
 * My participations: by my address, and the one my link vouched for.
 * @param db - The database.
 * @param mine - My address, and a participation my link vouched for.
 * @param mine.email - The address of the account looking.
 * @param mine.participationId - A participation its link vouched for.
 * @returns The participations, with their Secret Santa and person.
 */
const myParticipations = async (
  db: Db,
  mine: { email: string; participationId: string | null },
) => {
  const byAddress = await listParticipationsByEmail(db, mine.email);
  const byLink = mine.participationId
    ? await db
        .select({
          participation: participations,
          edition: secretSantas,
          person: persons,
          groupName: parties.name,
        })
        .from(participations)
        .innerJoin(persons, eq(persons.id, participations.personId))
        .innerJoin(
          secretSantas,
          eq(secretSantas.id, participations.secretSantaId),
        )
        .innerJoin(parties, eq(parties.id, secretSantas.partyId))
        .where(eq(participations.id, mine.participationId))
    : [];
  return [...byAddress, ...byLink];
};

/**
 * The people these participations draw, decrypted here and never sent.
 * @param db - The database.
 * @param rows - The participations.
 * @param dataKey - The key of the draws.
 * @returns The ids of the people drawn.
 */
const receiverIdsOf = async (
  db: Db,
  rows: readonly { edition: { id: string }; person: { id: string } }[],
  dataKey: CryptoKey,
): Promise<string[]> =>
  (
    await Promise.all(
      rows.map(async (row) => {
        const assignment = await db
          .select()
          .from(assignments)
          .where(
            and(
              eq(assignments.secretSantaId, row.edition.id),
              eq(assignments.giverPersonId, row.person.id),
            ),
          )
          .get();
        if (!assignment) return null;
        const receiver = await decrypt(
          { enc: assignment.receiverEnc, iv: assignment.receiverIv },
          dataKey,
        );
        return receiver.ok ? receiver.value : null;
      }),
    )
  ).filter((id): id is string => id !== null);

/**
 * Whether I drew one of those who hold a list, in a Secret Santa of these
 * events (« Celui qui m'a tiré », ticket 107). The draw is decrypted here
 * and nothing but yes or no leaves: not who, not which draw.
 * @param db - The database.
 * @param listId - The list.
 * @param partyIds - The events where it is kept for the one who drew.
 * @param mine - My address, and a participation my link vouched for.
 * @param mine.email - The address of the account looking.
 * @param mine.participationId - A participation its link vouched for.
 * @param dataKey - The key of the draws.
 * @returns True when I drew one of its holders there.
 */
export const drewHolderWhere = async (
  db: Db,
  listId: string,
  partyIds: readonly string[],
  mine: { email: string; participationId: string | null },
  dataKey: CryptoKey,
): Promise<boolean> => {
  if (partyIds.length === 0) return false;
  const rows = (await myParticipations(db, mine)).filter(
    (row) =>
      partyIds.includes(row.edition.partyId) &&
      row.edition.status !== 'preparing',
  );
  if (rows.length === 0) return false;
  const receiverIds = await receiverIdsOf(db, rows, dataKey);
  if (receiverIds.length === 0) return false;
  const holders = new Set(
    (
      await db
        .select({ email: accounts.email })
        .from(giftListHolders)
        .innerJoin(accounts, eq(accounts.id, giftListHolders.accountId))
        .where(eq(giftListHolders.listId, listId))
    ).map((row) => row.email),
  );
  const receivers = await db
    .select({ email: persons.email })
    .from(persons)
    .where(inArray(persons.id, receiverIds));
  return receivers.some(
    (receiver) =>
      receiver.email !== null && holders.has(receiver.email.toLowerCase()),
  );
};

/**
 * Whether, in a draw still secret, one of these participations gives to
 * someone a gift list is about (who holds it, or figures on it with an
 * account). The draw is decrypted here, for the one who gives only, and
 * nothing but yes or no ever leaves: not who, not which draw.
 * @param db - The database.
 * @param listId - The list.
 * @param mine - Whose draws to read.
 * @param mine.email - The address of the account looking.
 * @param mine.participationId - A participation its link vouched for.
 * @param dataKey - The key of the draws.
 * @param today - Today (YYYY-MM-DD).
 * @returns True when the list should open in anonymous mode.
 */
export const givesToSomeoneOn = async (
  db: Db,
  listId: string,
  mine: { email: string; participationId: string | null },
  dataKey: CryptoKey,
  today: string,
): Promise<boolean> => {
  const secret = (await myParticipations(db, mine)).filter((row) => {
    const rules = mergeRules(row.edition.rules);
    return drawStillSecret(
      {
        status: row.edition.status,
        revealedAt: row.edition.revealedAt,
        eventDate: rules.ok ? rules.value.eventDate : '',
      },
      today,
    );
  });
  if (secret.length === 0) return false;
  const addresses = new Set(await addressesOnList(db, listId));
  if (addresses.size === 0) return false;
  const receiverIds = await receiverIdsOf(db, secret, dataKey);
  if (receiverIds.length === 0) return false;
  const receivers = await db
    .select({ email: persons.email })
    .from(persons)
    .where(inArray(persons.id, receiverIds));
  return receivers.some(
    (receiver) =>
      receiver.email !== null && addresses.has(receiver.email.toLowerCase()),
  );
};
