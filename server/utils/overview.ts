import { currentEdition } from './editions';

// What the super-admin's lists say of each group and each account (lot
// 11 of the redesign): how many members, where the draw in progress
// stands, and which groups an account organises or takes part in. Pure:
// the rows come from server/database/overview.ts and quota.ts.

/** Where the draw in progress of a group stands, or none. */
export type GroupDraw = {
  status: 'preparing' | 'drawn';
  participants: number;
  /** How many have opened their result. */
  viewed: number;
} | null;

/** What a line of the admin says of a group. */
export type GroupOverview = { members: number; draw: GroupDraw };

/** An edition, as the overview needs it. */
export type OverviewEdition = {
  id: string;
  groupId: string;
  year: number;
  status: string;
  createdAt: string;
};

/**
 * The overview of every group.
 * @param groupIds - The groups.
 * @param members - Active people, by group.
 * @param editions - Editions of every group.
 * @param counts - Participants and results opened, by edition.
 * @returns The overview of each group, by its id.
 */
export const groupOverviews = (
  groupIds: string[],
  members: Record<string, number>,
  editions: OverviewEdition[],
  counts: Record<string, { participants: number; viewed: number }>,
): Record<string, GroupOverview> =>
  Object.fromEntries(
    groupIds.map((groupId) => {
      const edition = currentEdition(
        editions.filter((e) => e.groupId === groupId),
      );
      const draw: GroupDraw =
        edition &&
        (edition.status === 'preparing' || edition.status === 'drawn')
          ? {
              status: edition.status,
              participants: counts[edition.id]?.participants ?? 0,
              viewed: counts[edition.id]?.viewed ?? 0,
            }
          : null;
      return [groupId, { members: members[groupId] ?? 0, draw }];
    }),
  );

/** A group of an account, and what the account is in it. */
export type AccountGroup = {
  id: string;
  slug: string;
  name: string;
  role: 'organizer' | 'participant';
};

/**
 * Sorts group rows by account: the groups it organises, then those it
 * only takes part in, each once.
 * @param organized - Groups organised, by account.
 * @param joined - Groups where a person carries the account's address.
 * @returns The groups of each account, by account id.
 */
export const groupsByAccount = (
  organized: (Omit<AccountGroup, 'role'> & { accountId: string })[],
  joined: (Omit<AccountGroup, 'role'> & { accountId: string })[],
): Record<string, AccountGroup[]> =>
  [
    ...organized.map((row) => ({ ...row, role: 'organizer' as const })),
    ...joined.map((row) => ({ ...row, role: 'participant' as const })),
  ].reduce<Record<string, AccountGroup[]>>(
    (acc, { accountId, ...group }) =>
      (acc[accountId] ?? []).some((g) => g.id === group.id)
        ? acc
        : { ...acc, [accountId]: [...(acc[accountId] ?? []), group] },
    {},
  );
