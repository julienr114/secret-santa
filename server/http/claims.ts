import { anonymousRefusal } from '#server/utils/anonymous';
import type { Db } from '#server/database/client';
import {
  changeClaim,
  claimIfFree,
  claimsOfLists,
  joinClaim,
} from '#server/database/claims';
import { findIdea } from '#server/database/lists';
import { notFound, unwrap } from '#server/http/errors';
import { canChange, canTick, type ClaimChange } from '#server/utils/claims';

/**
 * Ticks an idea of a list for an account (README 22.19): alone, or joining
 * a gift given by several. Two accounts never give the same idea alone:
 * the second one hears « c'est déjà pris » (409). Nobody is kept from an
 * idea meant for them.
 * @param db - The database.
 * @param list - The list.
 * @param list.id - Its id.
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
  list: { id: string },
  accountId: string,
  how: {
    ideaId: string;
    mode: 'alone' | 'group';
    anonymous: boolean;
    note: string | null;
    /**
     * My « mode anonyme » is on (Correction 30): joining a gift given by
     * several, where my name would show, is refused.
     */
    anonymousMode?: boolean;
  },
): Promise<boolean> => {
  const idea = await findIdea(db, list.id, how.ideaId);
  if (!idea) throw notFound();
  const claims = (await claimsOfLists(db, [list.id])).filter(
    (c) => c.ideaId === idea.id,
  );
  const result = unwrap(canTick(claims, accountId));
  if (result === 'join') {
    if (anonymousRefusal(how.anonymousMode ?? false, { joins: true })) {
      throw createError({ statusCode: 409, statusMessage: 'anonymous_mode' });
    }
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

/**
 * « Changer » (README 22.19): one's own way of giving an idea, alone or
 * with others, the word for the others, « On est au complet » for the
 * one who leads.
 * @param db - The database.
 * @param listId - The list.
 * @param accountId - Who changes.
 * @param ideaId - The idea.
 * @param change - What changes.
 * @returns Once written.
 */
export const changeIdeaClaim = async (
  db: Db,
  listId: string,
  accountId: string,
  ideaId: string,
  change: ClaimChange,
) => {
  const claims = (await claimsOfLists(db, [listId])).filter(
    (c) => c.ideaId === ideaId,
  );
  await changeClaim(
    db,
    ideaId,
    accountId,
    unwrap(canChange(claims, accountId, change)),
  );
};
