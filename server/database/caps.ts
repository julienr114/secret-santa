import { and, eq, gte, sql } from 'drizzle-orm';
import type { Db } from './client';
import {
  auditLog,
  familyMembers,
  giftListHolders,
  giftListIdeas,
  giftListPeople,
  giftOffList,
} from './schema';

// How many rows there are already, for the caps of lot 38 A
// (`server/utils/limits.ts`).

const one = async (query: Promise<{ n: number }[]>): Promise<number> =>
  (await query)[0]?.n ?? 0;
const n = { n: sql<number>`count(*)` };

/** The lists an account holds. */
export const countLists = (db: Db, accountId: string) =>
  one(
    db
      .select(n)
      .from(giftListHolders)
      .where(eq(giftListHolders.accountId, accountId)),
  );

/** The people on a list. */
export const countPeople = (db: Db, listId: string) =>
  one(
    db.select(n).from(giftListPeople).where(eq(giftListPeople.listId, listId)),
  );

/** The ideas of a list, everyone together. */
export const countIdeas = (db: Db, listId: string) =>
  one(db.select(n).from(giftListIdeas).where(eq(giftListIdeas.listId, listId)));

/** The gifts not on the list an account said, on one list. */
export const countOffList = (db: Db, listId: string, accountId: string) =>
  one(
    db
      .select(n)
      .from(giftOffList)
      .where(
        and(
          eq(giftOffList.listId, listId),
          eq(giftOffList.accountId, accountId),
        ),
      ),
  );

/** « Mes proches » of an account. */
export const countFamily = (db: Db, accountId: string) =>
  one(
    db
      .select(n)
      .from(familyMembers)
      .where(eq(familyMembers.accountId, accountId)),
  );

/** The lines written in the journal of a group since a moment. */
export const countJournal = (db: Db, groupId: string, since: string) =>
  one(
    db
      .select(n)
      .from(auditLog)
      .where(
        and(eq(auditLog.groupId, groupId), gte(auditLog.createdAt, since)),
      ),
  );
