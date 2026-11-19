// Ticking a gift list (README 22.19, lot 22): who gives what. Each account
// gives an idea alone, or with others; the one who proposed a gift given
// by several leads it and may close it; when they leave, the next one
// does; alone, the line becomes free again. Pure: the routes only apply
// what these functions decide.
import { fail, ok, type Result } from './result';
import type { ClaimMode } from './lists';

/** What is stored of one account giving one idea. */
export type ClaimRow = {
  accountId: string;
  mode: ClaimMode;
  anonymous: boolean;
  note: string | null;
  closed: boolean;
  createdAt: string;
};

/** The claims of an idea, the one who leads first. */
export const ordered = <T extends { createdAt: string }>(
  claims: readonly T[],
): T[] => claims.toSorted((a, b) => a.createdAt.localeCompare(b.createdAt));

/**
 * Whether an account may tick an idea: not one somebody already gives
 * alone or in a closed group. Nobody is kept from their own ideas: the
 * holder ticks one of their « Moi » too (README 22.19).
 * @param claims - Who gives it now.
 * @param accountId - Who asks.
 * @returns What ticking does: give it alone, or join the group.
 */
export const canTick = (
  claims: readonly ClaimRow[],
  accountId: string,
): Result<'alone' | 'join'> => {
  if (claims.some((c) => c.accountId === accountId)) return fail('conflict');
  const leader = ordered(claims)[0];
  if (!leader) return ok('alone');
  if (leader.mode === 'group' && !leader.closed) return ok('join');
  return fail('taken');
};

/** A change of one's own way of giving (« Changer »). */
export type ClaimChange = {
  mode?: ClaimMode;
  anonymous?: boolean;
  note?: string | null;
  closed?: boolean;
};

/**
 * Whether a change of one's own claim is allowed: alone and with others
 * only switch while nobody else is on it, and only the one who leads a
 * group may close it.
 * @param claims - Who gives the idea now.
 * @param accountId - Who asks.
 * @param change - What changes.
 * @returns The change, or why not.
 */
export const canChange = (
  claims: readonly ClaimRow[],
  accountId: string,
  change: ClaimChange,
): Result<ClaimChange> => {
  const mine = claims.find((c) => c.accountId === accountId);
  if (!mine) return fail('not_found');
  const others = claims.filter((c) => c.accountId !== accountId);
  if (change.mode && change.mode !== mine.mode && others.length > 0) {
    return fail('conflict');
  }
  const leads = ordered(claims)[0]?.accountId === accountId;
  if (change.closed !== undefined && !(leads && mine.mode === 'group')) {
    return fail('forbidden');
  }
  return ok(change);
};

/**
 * Who leads a group once someone leaves: the next one, or nobody (the
 * line is free again).
 * @param claims - Who gives the idea now.
 * @param accountId - Who leaves.
 * @returns The account that leads after, or null.
 */
export const leaderAfterLeaving = (
  claims: readonly ClaimRow[],
  accountId: string,
): string | null =>
  ordered(claims).find((c) => c.accountId !== accountId)?.accountId ?? null;

/** A gift not on the list, as a viewer sees it. */
export type OffListView =
  | { kind: 'mine'; text: string }
  | { kind: 'holder'; text: string; by: string | null }
  | { kind: 'surprise' };

/**
 * What a viewer sees of a gift not on the list (README 22.19): its giver
 * their words, the holder the words and who (« Anonyme » when asked), the
 * others only that a surprise is planned.
 * @param gift - The gift.
 * @param gift.accountId - Who gives it.
 * @param gift.text - Their two words.
 * @param gift.anonymous - Hidden from the holder.
 * @param gift.name - Their first name.
 * @param viewer - Who looks.
 * @param viewer.accountId - Their account, or null.
 * @param viewer.holds - Whether they hold the list.
 * @returns What shows.
 */
export const offListView = (
  gift: { accountId: string; text: string; anonymous: boolean; name: string },
  viewer: { accountId: string | null; holds: boolean },
): OffListView => {
  if (gift.accountId === viewer.accountId) {
    return { kind: 'mine', text: gift.text };
  }
  if (viewer.holds) {
    return {
      kind: 'holder',
      text: gift.text,
      by: gift.anonymous ? null : gift.name,
    };
  }
  return { kind: 'surprise' };
};

/**
 * The ideas written since a visit: what the badge of a card counts.
 * @param ideas - When each idea was written.
 * @param lastSeenAt - The last visit, or null for none.
 * @returns How many are new; none before a first visit.
 */
export const newIdeasSince = (
  ideas: readonly { createdAt: string }[],
  lastSeenAt: string | null,
): number =>
  lastSeenAt ? ideas.filter((idea) => idea.createdAt > lastSeenAt).length : 0;
