// Who may do what on a gift list (lot 25, README 22.20). A list is held
// by several accounts, all equal; a person on it may be linked to their
// own account; everyone else is a guest who came by the link.

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

/** Why an address cannot be invited to hold a list. */
export type InviteRefusal = 'holder' | 'invited';

/**
 * Whether an address may be invited to hold a list.
 * @param email - The address, lower case.
 * @param list - Who is there already.
 * @param list.holderEmails - The addresses of those who hold it.
 * @param list.invitedEmails - The addresses already invited.
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
 * address, for lists it does not hold yet.
 * @param invites - The invitations waiting.
 * @param account - The account that logs in.
 * @param account.email - Its address, lower case.
 * @param account.heldListIds - The lists it holds already.
 * @returns The invitations that become its lists.
 */
export const invitesAccepted = <T extends { email: string; listId: string }>(
  invites: readonly T[],
  account: { email: string; heldListIds: readonly string[] },
): T[] =>
  invites.filter(
    (invite) =>
      invite.email === account.email &&
      !account.heldListIds.includes(invite.listId),
  );

/** Why someone cannot be taken off those who hold a list. */
export type HolderRemovalRefusal = 'last' | 'unknown';

/**
 * Whether one of those who hold a list may be taken off, by another or by
 * themself: anyone, but the last one, who cannot leave the list to
 * nobody.
 * @param holderIds - The accounts that hold the list.
 * @param targetId - Who is taken off.
 * @returns Null when they may, otherwise why not.
 */
export const holderRemovalRefusal = (
  holderIds: readonly string[],
  targetId: string,
): HolderRemovalRefusal | null => {
  if (!holderIds.includes(targetId)) return 'unknown';
  return holderIds.length === 1 ? 'last' : null;
};
