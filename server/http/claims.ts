import { anonymousRefusal } from '#server/utils/anonymous';
import type { Db } from '#server/database/client';
import {
  addWrittenGiver,
  changeClaim,
  claimIfFree,
  claimsOfLists,
  joinClaim,
  saveGivers,
  writtenGiversOf,
} from '#server/database/claims';
import { findIdea, holdersOfLists } from '#server/database/lists';
import { notFound, unwrap } from '#server/http/errors';
import { candidatesOf } from '#server/http/lists';
import {
  canChange,
  canTick,
  giversPlan,
  sameGivers,
  sameWritten,
  writtenKey,
  type ClaimChange,
  type GiverKey,
} from '#server/utils/claims';

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

/**
 * « Qui l'offre ? » (21 November 2026): saves who gives an idea, as one of
 * those who hold the list said. Refused on an anonymous tick, without a
 * word of whose it is (409 `anonymous`), and when someone ticked or
 * unticked since the sheet opened (409 `list_changed`). A first name
 * written again is the one already written; an address is kept as it is
 * written, and never looked up among the accounts: nothing tells whether
 * it has one. No email, no notice.
 * @param db - The database.
 * @param listId - The list.
 * @param accountId - The one who holds it.
 * @param ideaId - The idea.
 * @param body - Who gives it, from whom.
 * @param body.from - Who the sheet showed as giving it.
 * @param body.givers - Who should, in the order chosen.
 * @param body.mode - One person, or several.
 * @param body.closed - « On est au complet ».
 * @returns Once written.
 */
export const setIdeaGivers = async (
  db: Db,
  listId: string,
  accountId: string,
  ideaId: string,
  body: {
    from: readonly string[];
    givers: readonly (
      { key: string } | { name: string; email: string | null }
    )[];
    mode: 'alone' | 'group';
    closed: boolean;
  },
) => {
  const idea = await findIdea(db, listId, ideaId);
  if (!idea) throw notFound();
  const all = await claimsOfLists(db, [listId]);
  const current = all.filter((claim) => claim.ideaId === idea.id);
  if (current.some((claim) => claim.anonymous)) {
    throw createError({ statusCode: 409, statusMessage: 'anonymous' });
  }
  if (!sameGivers(current, body.from)) {
    throw createError({ statusCode: 409, statusMessage: 'list_changed' });
  }
  const holders = (await holdersOfLists(db, [listId])).get(listId) ?? [];
  const offered = new Set(
    (await candidatesOf(db, listId, accountId, holders, all)).map(
      (candidate) => candidate.key,
    ),
  );
  const written = await writtenGiversOf(db, listId);
  const keys: GiverKey[] = [];
  for (const giver of body.givers) {
    if ('key' in giver) {
      const key = giver.key as GiverKey;
      if (!offered.has(key)) throw notFound('giver_not_found');
      keys.push(key);
      continue;
    }
    const known = sameWritten(written, giver);
    keys.push(
      writtenKey(
        known?.id ??
          (await addWrittenGiver(db, {
            listId,
            name: giver.name,
            email: giver.email,
            addedBy: accountId,
          })),
      ),
    );
  }
  const plan = unwrap(giversPlan(current, keys, body.mode));
  await saveGivers(db, {
    listId,
    ideaId: idea.id,
    by: accountId,
    mode: body.mode,
    closed: body.closed,
    remove: plan.remove,
    keep: plan.keep.map((id) => ({
      id,
      key: current.find((claim) => claim.id === id)!.key,
    })),
    add: plan.add,
    leader: plan.leader,
  });
};
