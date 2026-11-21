// Ticking a gift list (README 22.19, lot 22): who gives what. Each account
// gives an idea alone, or with others; the one who proposed a gift given
// by several leads it and may close it; when they leave, the next one
// does; alone, the line becomes free again. Pure: the routes only apply
// what these functions decide.
import { fail, ok, type Result } from './result';
import type { Avatar } from './avatars';
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

/**
 * Whether someone may take a tick off (Correction 25, README 22.19):
 * those who hold the list, anyone's, an anonymous one included; anybody
 * else, their own only.
 * @param viewer - Who asks.
 * @param viewer.accountId - Their account, or null without one.
 * @param viewer.holds - Whether they hold the list.
 * @param claim - The tick.
 * @param claim.accountId - Whose it is.
 * @returns True when they may.
 */
export const mayRemoveClaim = (
  viewer: { accountId: string | null; holds: boolean },
  claim: { accountId: string },
): boolean =>
  viewer.accountId !== null &&
  (viewer.holds || claim.accountId === viewer.accountId);

/** A tick of someone else, as those who hold the list may take it off. */
export type RemovableClaim = {
  /** What names it to the server: says nothing of whose it is. */
  id: string;
  /** Their first name; null for an anonymous one. */
  by: string | null;
  /** When it was ticked; null for an anonymous one: no hint. */
  at: string | null;
};

/**
 * The ticks of an idea that the one looking may take off for someone:
 * every one but their own, for those who hold the list; none for the
 * others. An anonymous tick keeps its secret: neither name nor date.
 * @param claims - Who gives the idea, the first first.
 * @param viewer - Who looks.
 * @param viewer.accountId - Their account, or null.
 * @param viewer.holds - Whether they hold the list.
 * @returns What a line offers to take off.
 */
export const removableClaims = (
  claims: readonly (ClaimRow & { id: string; name: string })[],
  viewer: { accountId: string | null; holds: boolean },
): RemovableClaim[] =>
  viewer.holds
    ? claims
        .filter((claim) => claim.accountId !== viewer.accountId)
        .map((claim) => ({
          id: claim.id,
          by: claim.anonymous ? null : claim.name,
          at: claim.anonymous ? null : claim.createdAt,
        }))
    : [];

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

// « Cocher pour quelqu'un » (21 November 2026): those who hold a list say
// who gives an idea, in the sheet « Qui l'offre ? »: someone the app
// knows (the tick is theirs), a first name written, or a first name with
// an address (the tick waits for that account). Nobody is told.

/**
 * What names a giver in the sheet: `a:` and an account, `g:` and a first
 * name written on the list. Never the key of an anonymous tick.
 */
export type GiverKey = `a:${string}` | `g:${string}`;

/** The key of an account. */
export const accountKey = (accountId: string): GiverKey => `a:${accountId}`;

/** The key of a first name written on the list. */
export const writtenKey = (giverId: string): GiverKey => `g:${giverId}`;

/** A tick as the sheet reads it: whose, and who noted it. */
export type WhoClaim = ClaimRow & {
  id: string;
  key: GiverKey;
  name: string;
  /** Null for a first name written. */
  avatar?: Avatar | null;
  /** The account that noted it for someone; null when ticked by its giver. */
  notedBy: string | null;
  /** Their first name. */
  notedByName: string | null;
};

/** Where the sheet starts from, for an idea someone gives. */
export type IdeaWho = {
  /** Who gives it now, the one who leads first. */
  keys: GiverKey[];
  mode: 'alone' | 'group';
  closed: boolean;
  /**
   * « Coché par Mamie », « Noté par toi », « Proposé par Mamie »: by
   * null for the one looking.
   */
  trace: {
    kind: 'ticked' | 'noted' | 'proposed';
    by: string | null;
    at: string;
  };
};

/**
 * Whether the sheet « Qui l'offre ? » opens on an idea, and from what
 * (21 November 2026). For those who hold the list only. A tick nobody
 * may name (anonymous) does not change: nobody knows whose it is, so the
 * idea has nothing to start from, and nothing of it is said.
 * @param claims - Who gives the idea.
 * @param viewer - Who looks.
 * @param viewer.accountId - Their account, or null.
 * @param viewer.holds - Whether they hold the list.
 * @returns Where the sheet starts from; null when it does not open.
 */
export const ideaWho = (
  claims: readonly WhoClaim[],
  viewer: { accountId: string | null; holds: boolean },
): IdeaWho | null => {
  if (!viewer.holds || claims.length === 0) return null;
  if (claims.some((claim) => claim.anonymous)) return null;
  const on = ordered(claims);
  const leader = on[0]!;
  const noted = leader.notedBy !== null;
  return {
    keys: on.map((claim) => claim.key),
    mode: leader.mode,
    closed: leader.mode === 'group' && leader.closed,
    trace: {
      kind: noted ? 'noted' : leader.mode === 'group' ? 'proposed' : 'ticked',
      by: noted
        ? leader.notedBy === viewer.accountId
          ? null
          : leader.notedByName
        : leader.key === accountKey(viewer.accountId ?? '')
          ? null
          : leader.name,
      at: leader.createdAt,
    },
  };
};

/** Someone the sheet offers, as it names them. */
export type Candidate = {
  key: GiverKey;
  name: string;
  /** Null for a first name written: no icon of its own. */
  avatar: Avatar | null;
  /** The one looking (« Moi »), one who holds the list with them, one who ticked, or a first name written. */
  kind: 'me' | 'holder' | 'ticker' | 'written';
  /** For a first name written: its address, or null. */
  email: string | null;
};

/**
 * Those the sheet offers for any idea of a list, in its order: « Moi »,
 * those who hold the list with me, those who ticked on it without being
 * anonymous, the first names written on it. Those who give the idea come
 * right after « Moi », on the screen (`sheetPeople`). An account that only
 * ticked anonymously is not offered: nothing says it ticked.
 * @param input - What the list knows.
 * @param input.viewer - The one looking, who holds the list.
 * @param input.holders - Those who hold the list, the one looking among them.
 * @param input.claims - The ticks of the list, of accounts and of names.
 * @param input.written - The first names written on the list.
 * @returns Each one once.
 */
export const listCandidates = (input: {
  viewer: { accountId: string; name: string; avatar: Avatar | null };
  holders: readonly { accountId: string; name: string; avatar: Avatar }[];
  claims: readonly WhoClaim[];
  written: readonly { id: string; name: string; email: string | null }[];
}): Candidate[] => {
  const me: Candidate = {
    key: accountKey(input.viewer.accountId),
    name: input.viewer.name,
    avatar: input.viewer.avatar,
    kind: 'me',
    email: null,
  };
  const holders = input.holders
    .filter((holder) => holder.accountId !== input.viewer.accountId)
    .map((holder): Candidate => ({
      key: accountKey(holder.accountId),
      name: holder.name,
      avatar: holder.avatar,
      kind: 'holder',
      email: null,
    }));
  const tickers = ordered(input.claims)
    .filter((claim) => !claim.anonymous && claim.key.startsWith('a:'))
    .map((claim): Candidate => ({
      key: claim.key,
      name: claim.name,
      avatar: claim.avatar ?? null,
      kind: 'ticker',
      email: null,
    }));
  const written = input.written.map((giver): Candidate => ({
    key: writtenKey(giver.id),
    name: giver.name,
    avatar: null,
    kind: 'written',
    email: giver.email,
  }));
  return [me, ...holders, ...tickers, ...written].filter(
    (candidate, index, all) =>
      all.findIndex((other) => other.key === candidate.key) === index,
  );
};

/** What « Enregistrer » writes, from who gives an idea now. */
export type GiversPlan = {
  /** The ticks that go, by their row. */
  remove: string[];
  /** The ticks that stay, by their row, the one who leads first. */
  keep: string[];
  /** Who comes in, in the order chosen, after those who stay. */
  add: GiverKey[];
  /** Who leads after: closes a gift given by several. */
  leader: GiverKey;
};

/**
 * What saving the sheet « Qui l'offre ? » does (21 November 2026). One
 * person: they give it alone. Several: a gift given by several, as today:
 * who stays keeps their place, who comes in comes after. Nobody is not
 * saved here: the idea is unticked, with « Annuler », as for someone else.
 * A tick nobody may name is never changed.
 * @param current - Who gives the idea now.
 * @param wanted - Who should, in the order chosen.
 * @param mode - One person, or several.
 * @returns What to write, or why not.
 */
export const giversPlan = (
  current: readonly WhoClaim[],
  wanted: readonly GiverKey[],
  mode: 'alone' | 'group',
): Result<GiversPlan> => {
  if (current.some((claim) => claim.anonymous)) return fail('anonymous');
  const chosen = wanted.filter((key, index) => wanted.indexOf(key) === index);
  if (chosen.length === 0) return fail('empty');
  if (mode === 'alone' && chosen.length > 1) return fail('several');
  const on = ordered(current);
  const keep = on.filter((claim) => chosen.includes(claim.key));
  const add = chosen.filter((key) => !on.some((claim) => claim.key === key));
  return ok({
    remove: on
      .filter((claim) => !chosen.includes(claim.key))
      .map((claim) => claim.id),
    keep: keep.map((claim) => claim.id),
    add,
    leader: keep[0]?.key ?? add[0]!,
  });
};

/**
 * Whether the sheet started from who gives the idea now: someone else
 * may have ticked or unticked meanwhile, and saving would undo it.
 * @param current - Who gives the idea now.
 * @param seen - Who the sheet showed as giving it.
 * @returns True when they are the same people.
 */
export const sameGivers = (
  current: readonly { key: GiverKey }[],
  seen: readonly string[],
): boolean =>
  current.length === seen.length &&
  current.every((claim) => seen.includes(claim.key));

/**
 * The first name already written on the list that one written again is:
 * the same name, whatever its capitals, and the same address or none.
 * @param written - The first names written on the list.
 * @param wanted - The one written now.
 * @param wanted.name - Its first name.
 * @param wanted.email - Its address, or null.
 * @returns The one it is, or undefined for a new one.
 */
export const sameWritten = <T extends { name: string; email: string | null }>(
  written: readonly T[],
  wanted: { name: string; email: string | null },
): T | undefined =>
  written.find(
    (giver) =>
      giver.name.trim().toLocaleLowerCase() ===
        wanted.name.trim().toLocaleLowerCase() &&
      (giver.email ?? null) === (wanted.email ?? null),
  );

/**
 * What a first name written with an address gives, once that account
 * comes (21 November 2026): each of its ticks becomes the account's, with
 * its place, its way and who noted it, unless the account already gives
 * that idea itself (then the one noted for it goes).
 * @param waiting - The ticks kept for the address.
 * @param given - The ideas the account already gives.
 * @returns The ticks that become the account's, and those that go.
 */
export const ticksToLink = <T extends { id: string; ideaId: string }>(
  waiting: readonly T[],
  given: ReadonlySet<string>,
): { take: T[]; drop: T[] } => ({
  take: waiting.filter(
    (claim, index) =>
      !given.has(claim.ideaId) &&
      waiting.findIndex((other) => other.ideaId === claim.ideaId) === index,
  ),
  drop: waiting.filter(
    (claim, index) =>
      given.has(claim.ideaId) ||
      waiting.findIndex((other) => other.ideaId === claim.ideaId) !== index,
  ),
});
