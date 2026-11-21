// The sharing of a list by stages (docs/spec/v3/listes.md, ticket 106).
// Pure.

/** What the top bar of a list says of its sharing. */
export type ListStage = 'draft' | 'giver' | 'parties' | 'public';

/**
 * The stage a list's top bar shows: the widest that applies.
 * @param list - What its sharing holds.
 * @param list.isPublic - Whether anyone with the link gets in.
 * @param list.parties - The events whose members all see it.
 * @param list.givers - The events where only the one who drew its holder
 * sees it.
 * @returns The stage.
 */
export const listStage = (list: {
  isPublic: boolean;
  parties: number;
  givers: number;
}): ListStage => {
  if (list.isPublic) return 'public';
  if (list.parties > 0) return 'parties';
  return list.givers > 0 ? 'giver' : 'draft';
};

/** Who gets in under a sharing: everyone, or these addresses and accounts. */
export type Audience = {
  isPublic: boolean;
  /** The addresses of the members of the events it is shared in. */
  emails: ReadonlySet<string>;
  /** The organisers of these events. */
  accountIds: ReadonlySet<string>;
};

/**
 * Whether someone gets in under a sharing, holders aside.
 * @param audience - The sharing.
 * @param account - Who.
 * @param account.id - Their account.
 * @param account.email - Their address.
 * @returns True when they get in.
 */
const reaches = (audience: Audience, account: { id: string; email: string }) =>
  audience.isPublic ||
  audience.emails.has(account.email) ||
  audience.accountIds.has(account.id);

/**
 * How many people who ticked a gift would lose the list with a narrower
 * sharing (« Resserrer le partage »): those who got in before and no longer
 * would. Holders never lose it.
 * @param claimers - Those who ticked or offered something on the list.
 * @param holderIds - Those who hold it.
 * @param before - The sharing as it stands.
 * @param after - The sharing asked for.
 * @returns How many would lose it.
 */
export const losingClaimers = (
  claimers: readonly { id: string; email: string }[],
  holderIds: readonly string[],
  before: Audience,
  after: Audience,
): number =>
  claimers.filter(
    (account) =>
      !holderIds.includes(account.id) &&
      reaches(before, account) &&
      !reaches(after, account),
  ).length;

/**
 * How many members of the events a list leaves would lose it: their
 * active members, once each, but its holders and those who keep another
 * way in.
 * @param members - The members of the events left: their address, or
 * their id without one.
 * @param holderEmails - The addresses of those who hold the list.
 * @param after - The sharing asked for.
 * @returns How many would lose it.
 */
export const losingMembers = (
  members: readonly { id: string; email: string | null }[],
  holderEmails: readonly string[],
  after: Audience,
): number =>
  new Set(
    members
      .filter(
        (member) =>
          !after.isPublic &&
          !(member.email && holderEmails.includes(member.email)) &&
          !(member.email && after.emails.has(member.email)),
      )
      .map((member) => member.email ?? member.id),
  ).size;
