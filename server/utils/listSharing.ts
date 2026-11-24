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

/**
 * Whether the link of a list lets anyone in (ticket 157): shared with an
 * event at least, or open to everyone. Only then does its bar show the
 * address and « Copier le lien », and « Changer de lien »; a draft, or a
 * list only those who drew me see, has neither.
 * @param stage - The stage of its sharing.
 * @returns Whether the link lets someone in.
 */
export const linkLetsIn = (stage: ListStage): boolean =>
  stage === 'parties' || stage === 'public';

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

/** An event as « Qui voit ta liste ? » knows it (ticket 139). */
export type SharingState = {
  id: string;
  /** All its members see the list. */
  shared: boolean;
  /** « Celui qui m'a tiré » is there. */
  giver: boolean;
  /** I take part there in a Secret Santa not closed. */
  drawn: boolean;
};

/** What is saved at each gesture: the events, « Celui qui m'a tiré », public. */
export type SharingAsk = {
  parties: string[];
  givers: string[];
  isPublic: boolean;
};

/**
 * The sharing as it stands, to save with one change.
 * @param options - The events offered, with how the list is shared there.
 * @param isPublic - « Tout le monde ».
 * @returns What to save.
 */
export const sharingAsk = (
  options: readonly SharingState[],
  isPublic: boolean,
): SharingAsk => ({
  parties: options.filter((o) => o.shared).map((o) => o.id),
  givers: options.filter((o) => o.giver).map((o) => o.id),
  isPublic,
});

/**
 * What « Qui je veux » shows (docs/spec/v3/listes.md, ticket 139): a
 * line per event the list is shared in, a line « Celui qui m'a tiré » per
 * event where it is there; behind « Ajouter », the other events, « Celui
 * qui m'a tiré » (where I take part in a Secret Santa and it is not yet
 * there, when I am on the list) and « Quelqu'un d'autre » (when it is
 * shared with all the members of its own event). « Ajouter » is open
 * while nobody sees it.
 * @param options - The events offered.
 * @param list - What the list says.
 * @param list.onList - I am one of its people.
 * @param list.invite - Shared with all the members of its own event.
 * @returns The lines and the pills.
 */
export const sharingView = <T extends SharingState>(
  options: readonly T[],
  list: { onList: boolean; invite: boolean },
) => {
  const events = options.filter((o) => o.shared);
  const givers = options.filter((o) => o.giver);
  return {
    events,
    givers,
    /** The events where « Celui qui m'a tiré » may be added. */
    addGiver: list.onList
      ? options.filter((o) => o.drawn && !o.giver).map((o) => o.id)
      : [],
    addEvents: options.filter((o) => !o.shared),
    someoneElse: list.invite,
    nobody: events.length === 0 && givers.length === 0,
  };
};
