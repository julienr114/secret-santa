// Who may do what on a gift list (lots 25 and 25 bis, README 22.20). A
// list is held by several accounts, at one of two levels that differ by
// what they manage, never by what they see; a person on it may be linked
// to their own account; everyone else is a guest who came by the link.

/** What an account is to a list. */
export type ListRole = 'holder' | 'linked' | 'guest';

/**
 * What an account is to a list. Holding it wins over figuring on it:
 * someone who holds a list and is on it sees everything.
 * @param list - Who holds the list, and the accounts of those on it.
 * @param list.holderIds - The accounts that hold it.
 * @param list.linkedIds - The accounts linked to a person on it.
 * @param accountId - The account, or null without a session.
 * @returns Holder, linked person, or guest.
 */
export const listRole = (
  list: { holderIds: readonly string[]; linkedIds: readonly string[] },
  accountId: string | null,
): ListRole => {
  if (accountId === null) return 'guest';
  if (list.holderIds.includes(accountId)) return 'holder';
  return list.linkedIds.includes(accountId) ? 'linked' : 'guest';
};

/**
 * Whether an account may write, correct and delete the ideas of a person
 * on a list: those who hold it, for everyone; a linked person, for
 * themself only; a guest, never.
 * @param role - What the account is to the list.
 * @param section - The person whose ideas they are.
 * @param section.linkedAccountId - The account that person is linked to.
 * @param accountId - The account, or null without a session.
 * @returns True when they may.
 */
export const canWriteIdeas = (
  role: ListRole,
  section: { linkedAccountId: string | null },
  accountId: string | null,
): boolean =>
  role === 'holder' ||
  (role === 'linked' &&
    accountId !== null &&
    section.linkedAccountId === accountId);

/**
 * Whether an account reads the first names of those who give: only those
 * who hold the list. A linked person does not, their own gifts included.
 * @param role - What the account is to the list.
 * @returns True for a holder.
 */
export const seesGivers = (role: ListRole): boolean => role === 'holder';

/** The level of someone who holds a list. */
export const HOLDER_LEVELS = ['manage', 'write'] as const;
/**
 * « Gère la liste » does everything; « Aide à écrire » writes everywhere
 * and sees who gives what, but manages nothing.
 */
export type HolderLevel = (typeof HOLDER_LEVELS)[number];

/** What only « Gère la liste » does. */
export const MANAGING = [
  'share',
  'invite',
  'changeLevel',
  'removeHolder',
  'deleteList',
] as const;
/** What both levels do, on the whole list. */
export const WRITING = [
  'writeIdeas',
  'writePeople',
  'reorder',
  'tick',
  'seeGivers',
  'untickForSomeone',
] as const;
export type HolderAction = (typeof MANAGING)[number] | (typeof WRITING)[number];

/**
 * Whether a level may do something on a list it holds.
 * @param level - The level of the one who asks.
 * @param action - What they ask.
 * @returns True when they may.
 */
export const holderMay = (level: HolderLevel, action: HolderAction): boolean =>
  level === 'manage' || (WRITING as readonly string[]).includes(action);

type Held = { accountId: string; level: HolderLevel };
const managers = (holders: readonly Held[]) =>
  holders.filter((holder) => holder.level === 'manage');
/** The only one who manages: the list cannot be left without them. */
const isLastManager = (holders: readonly Held[], accountId: string) => {
  const managing = managers(holders);
  return managing.length === 1 && managing[0]?.accountId === accountId;
};

/** Why a level cannot be changed. */
export type LevelChangeRefusal = 'forbidden' | 'unknown' | 'last_manager';

/**
 * Whether someone may change the level of one of those who hold a list:
 * only those who manage it, and the last one who manages stays so.
 * @param holders - Those who hold the list, with their level.
 * @param actorId - Who asks.
 * @param targetId - Whose level changes.
 * @param level - The level asked.
 * @returns Null when they may, otherwise why not.
 */
export const levelChangeRefusal = (
  holders: readonly Held[],
  actorId: string,
  targetId: string,
  level: HolderLevel,
): LevelChangeRefusal | null => {
  const actor = holders.find((holder) => holder.accountId === actorId);
  if (!actor || !holderMay(actor.level, 'changeLevel')) return 'forbidden';
  if (!holders.some((holder) => holder.accountId === targetId)) {
    return 'unknown';
  }
  return level === 'write' && isLastManager(holders, targetId)
    ? 'last_manager'
    : null;
};

/** Why someone cannot be taken off those who hold a list. */
export type HolderRemovalRefusal = 'forbidden' | 'unknown' | 'last';

/**
 * Whether one of those who hold a list may be taken off: by someone who
 * manages it, or by themself; the last one who manages cannot go, which
 * would leave the list to nobody.
 * @param holders - Those who hold the list, with their level.
 * @param actorId - Who asks.
 * @param targetId - Who is taken off.
 * @returns Null when they may, otherwise why not.
 */
export const holderRemovalRefusal = (
  holders: readonly Held[],
  actorId: string,
  targetId: string,
): HolderRemovalRefusal | null => {
  const actor = holders.find((holder) => holder.accountId === actorId);
  if (!actor) return 'forbidden';
  if (actorId !== targetId && !holderMay(actor.level, 'removeHolder')) {
    return 'forbidden';
  }
  if (!holders.some((holder) => holder.accountId === targetId)) {
    return 'unknown';
  }
  return isLastManager(holders, targetId) ? 'last' : null;
};

// --- Invitations (lot 25 bis) -------------------------------------------

/** An invitation and its link are good for 7 days, together. */
export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** A line expired, refused or accepted is forgotten after 30 days. */
export const INVITE_KEEP_MS = 30 * 24 * 60 * 60 * 1000;

/** What is kept of an invitation. */
export type InviteLike = {
  expiresAt: string;
  acceptedAt: string | null;
  declinedAt: string | null;
};
/** Where an invitation stands. */
export type InviteState = 'waiting' | 'accepted' | 'declined' | 'expired';

/**
 * Where an invitation stands. An answer given wins over the time that
 * passed since.
 * @param invite - The invitation.
 * @param now - ISO date.
 * @returns Waiting, accepted, refused or expired.
 */
export const inviteState = (invite: InviteLike, now: string): InviteState => {
  if (invite.acceptedAt) return 'accepted';
  if (invite.declinedAt) return 'declined';
  return Date.parse(now) >= Date.parse(invite.expiresAt)
    ? 'expired'
    : 'waiting';
};

/**
 * Whether the link of an invitation still acts: once, and within its 7
 * days. Accepting or refusing uses it up.
 * @param invite - The invitation.
 * @param now - ISO date.
 * @returns True while it can be accepted or refused.
 */
export const inviteLinkUsable = (invite: InviteLike, now: string): boolean =>
  inviteState(invite, now) === 'waiting';

/**
 * Whether a line is old enough to go by itself: 30 days after it
 * expired, was refused or was accepted. One still waiting stays.
 * @param invite - The invitation.
 * @param now - ISO date.
 * @returns True when it can be deleted.
 */
export const inviteForgotten = (invite: InviteLike, now: string): boolean => {
  const state = inviteState(invite, now);
  if (state === 'waiting') return false;
  const since =
    state === 'accepted'
      ? invite.acceptedAt
      : state === 'declined'
        ? invite.declinedAt
        : invite.expiresAt;
  return Date.parse(now) - Date.parse(since ?? now) >= INVITE_KEEP_MS;
};

/** Why an address cannot be invited to hold a list. */
export type InviteRefusal = 'holder' | 'invited';

/**
 * Whether an address may be invited to hold a list. An invitation
 * expired or refused does not count: inviting again replaces it.
 * @param email - The address, lower case.
 * @param list - Who is there already.
 * @param list.holderEmails - The addresses of those who hold it.
 * @param list.invitedEmails - The addresses with an invitation waiting.
 * @returns Null when it may, otherwise why not.
 */
export const inviteRefusal = (
  email: string,
  list: {
    holderEmails: readonly string[];
    invitedEmails: readonly string[];
  },
): InviteRefusal | null => {
  if (list.holderEmails.includes(email)) return 'holder';
  return list.invitedEmails.includes(email) ? 'invited' : null;
};

/**
 * The invitations an account accepts by logging in: those sent to its
 * address and still waiting, for lists it does not hold yet. An expired
 * or refused one opens nothing, even with the right address.
 * @param invites - The invitations sent to some addresses.
 * @param account - The account that logs in.
 * @param account.email - Its address, lower case.
 * @param account.heldListIds - The lists it holds already.
 * @param now - ISO date.
 * @returns The invitations that become its lists.
 */
export const invitesAccepted = <
  T extends InviteLike & { email: string; listId: string },
>(
  invites: readonly T[],
  account: { email: string; heldListIds: readonly string[] },
  now: string,
): T[] =>
  invites.filter(
    (invite) =>
      invite.email === account.email &&
      inviteState(invite, now) === 'waiting' &&
      !account.heldListIds.includes(invite.listId),
  );
