import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from './client';
import { familyMembers, type PartyRow } from './schema';
import {
  forWhomOf,
  type ForWhom,
  type ForWhomMember,
} from '#shared/utils/forWhom';

// Whom a birthday is for (ticket 118): the people the events point at,
// read in one query. A person deleted is simply not found.

/**
 * The people some events are made for.
 * @param db - The database.
 * @param events - The events.
 * @returns A function giving, for an event, a year and an account, whom it
 *   is for as that account reads it.
 */
export const loadForWhom = async (
  db: Db,
  events: readonly Pick<PartyRow, 'forMemberId'>[],
) => {
  const ids = [...new Set(events.flatMap((event) => event.forMemberId ?? []))];
  const rows: ForWhomMember[] =
    ids.length === 0
      ? []
      : await db
          .select({
            id: familyMembers.id,
            accountId: familyMembers.accountId,
            firstName: familyMembers.firstName,
            birthDate: familyMembers.birthDate,
            isSelf: familyMembers.isSelf,
            linkedAccountId: familyMembers.linkedAccountId,
          })
          .from(familyMembers)
          .where(inArray(familyMembers.id, ids));
  return (
    event: Pick<PartyRow, 'forMemberId' | 'category'>,
    year: number | null,
    viewer: string,
  ): ForWhom | null =>
    forWhomOf({
      category: event.category,
      member: rows.find((row) => row.id === event.forMemberId),
      viewer,
      year,
    });
};

/**
 * Whether a person is one of my own (not « une liste sans personne »):
 * the only ones a birthday may be made for by me.
 * @param db - The database.
 * @param accountId - Me.
 * @param memberId - The person.
 * @returns True when mine.
 */
export const isMyMember = async (
  db: Db,
  accountId: string,
  memberId: string,
): Promise<boolean> => {
  const [row] = await db
    .select({ id: familyMembers.id })
    .from(familyMembers)
    .where(
      and(
        eq(familyMembers.id, memberId),
        eq(familyMembers.accountId, accountId),
        eq(familyMembers.placeholder, false),
      ),
    );
  return row !== undefined;
};
