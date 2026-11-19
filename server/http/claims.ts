import { and, eq } from 'drizzle-orm';
import type { Db } from '#server/database/client';
import { claimIfFree, claimsOfLists, joinClaim } from '#server/database/claims';
import { findIdea } from '#server/database/lists';
import { familyMembers, giftListPeople } from '#server/database/schema';
import { notFound, unwrap } from '#server/http/errors';
import { canTick } from '#server/utils/claims';

/**
 * Ticks an idea of a list for an account (README 22.19): alone, or joining
 * a gift given by several. Two accounts never give the same idea alone:
 * the second one hears « c'est déjà pris » (409). The holder never ticks
 * the ideas meant for them.
 * @param db - The database.
 * @param list - The list, and who holds it.
 * @param list.id - Its id.
 * @param list.accountId - The account that holds it.
 * @param accountId - Who ticks.
 * @param how - The idea, and how it is given.
 * @param how.ideaId - The idea.
 * @param how.mode - Alone or with others.
 * @param how.anonymous - Whether the holder is not told who gives it.
 * @param how.note - The word for the others of a group.
 * @returns Whether a group was joined.
 */
export const tickIdea = async (
  db: Db,
  list: { id: string; accountId: string },
  accountId: string,
  how: {
    ideaId: string;
    mode: 'alone' | 'group';
    anonymous: boolean;
    note: string | null;
  },
): Promise<boolean> => {
  const idea = await findIdea(db, list.id, how.ideaId);
  if (!idea) throw notFound();
  const forSelf = await db
    .select({ isSelf: familyMembers.isSelf })
    .from(giftListPeople)
    .innerJoin(familyMembers, eq(familyMembers.id, giftListPeople.memberId))
    .where(
      and(
        eq(giftListPeople.id, idea.listPersonId),
        eq(familyMembers.isSelf, true),
      ),
    )
    .get();
  const claims = (await claimsOfLists(db, [list.id])).filter(
    (c) => c.ideaId === idea.id,
  );
  const result = unwrap(
    canTick(
      claims,
      accountId,
      Boolean(forSelf) && list.accountId === accountId,
    ),
  );
  if (result === 'join') {
    await joinClaim(db, {
      listId: list.id,
      ideaId: idea.id,
      accountId,
      note: how.note,
    });
    return true;
  }
  const written = await claimIfFree(db, {
    listId: list.id,
    ideaId: idea.id,
    accountId,
    mode: how.mode,
    anonymous: how.mode === 'alone' && how.anonymous,
    note: how.note,
  });
  if (!written) throw createError({ statusCode: 409, statusMessage: 'taken' });
  return false;
};
