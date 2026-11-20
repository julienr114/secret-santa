import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import {
  accounts,
  assignments,
  editions,
  familyMembers,
  giftListHolders,
  giftListPeople,
  giftListVisits,
  groups,
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
  const byAddress = await listParticipationsByEmail(db, mine.email);
  const byLink = mine.participationId
    ? await db
        .select({
          participation: participations,
          edition: editions,
          person: persons,
          groupName: groups.name,
          groupRules: groups.rules,
        })
        .from(participations)
        .innerJoin(persons, eq(persons.id, participations.personId))
        .innerJoin(editions, eq(editions.id, participations.editionId))
        .innerJoin(groups, eq(groups.id, editions.groupId))
        .where(eq(participations.id, mine.participationId))
    : [];
  const secret = [...byAddress, ...byLink].filter((row) => {
    const rules = mergeRules(row.groupRules, row.edition.rulesOverride);
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
  const receiverIds = (
    await Promise.all(
      secret.map(async (row) => {
        const assignment = await db
          .select()
          .from(assignments)
          .where(
            and(
              eq(assignments.editionId, row.edition.id),
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
