// Following a list, or one person of it (ticket 122, README 22.22,
// « Suivre une liste, ou une seule personne », ListeSuivre): who is told
// of a new idea, or of a person added. Pure. Never those who hold the
// list, never on a list of a year over, never someone who may no longer
// open it (accueil-et-creation.md, « Hors de l'application »).

/** What an account follows on a list: one person, or the whole list. */
export type Follow = {
  accountId: string;
  /** The person of the list; null for the whole list. */
  listPersonId: string | null;
};

/** What happened on the list. */
export type FollowedEvent =
  { kind: 'idea'; listPersonId: string | null } | { kind: 'person' };

/**
 * The accounts to tell, once each: those who follow the whole list, and
 * for an idea, those who follow its person. A person added only tells
 * those who follow the whole list.
 * @param follows - What is followed on the list.
 * @param happened - A new idea (for whom), or a person added.
 * @param context - Who holds the list, who may still open it, who did
 *   it, whether the list is of a year over.
 * @param context.holders - The accounts that hold the list.
 * @param context.mayOpen - Whether an account may still open the list.
 * @param context.by - Who wrote the idea or added the person.
 * @param context.past - Whether the list is of a year over.
 * @returns Their accounts.
 */
export const followersToTell = (
  follows: readonly Follow[],
  happened: FollowedEvent,
  context: {
    holders: ReadonlySet<string>;
    mayOpen: (accountId: string) => boolean;
    by: string;
    past: boolean;
  },
): string[] => {
  if (context.past) return [];
  const told = follows.filter(
    (follow) =>
      follow.listPersonId === null ||
      (happened.kind === 'idea' &&
        happened.listPersonId !== null &&
        follow.listPersonId === happened.listPersonId),
  );
  return [...new Set(told.map((follow) => follow.accountId))].filter(
    (accountId) =>
      accountId !== context.by &&
      !context.holders.has(accountId) &&
      context.mayOpen(accountId),
  );
};

/** Where I am with a list (the line under its word, ListeSuivre). */
export type FollowState =
  | { kind: 'none' }
  | { kind: 'list' }
  | { kind: 'people'; listPersonIds: string[] };

/**
 * Where I am with a list, from what I follow on it.
 * @param mine - My follows of the list.
 * @returns Nothing, the whole list, or some of its people.
 */
export const followState = (
  mine: readonly Pick<Follow, 'listPersonId'>[],
): FollowState => {
  if (mine.some((follow) => follow.listPersonId === null)) {
    return { kind: 'list' };
  }
  const people = mine.flatMap((follow) =>
    follow.listPersonId ? [follow.listPersonId] : [],
  );
  return people.length > 0
    ? { kind: 'people', listPersonIds: people }
    : { kind: 'none' };
};

/** What I follow on a list, as saved: the whole list, or these people. */
export type FollowChoice = { list: boolean; people: string[] };

/**
 * What I follow once a bell is touched: the bell of the list follows it
 * all, or stops; the bell of a person follows them, or stops. Touching a
 * person while following the whole list keeps the others.
 * @param state - Where I am.
 * @param touched - The list, or a person of it.
 * @param people - The people of the list, in their order.
 * @returns What to save.
 */
export const toggledFollow = (
  state: FollowState,
  touched: { kind: 'list' } | { kind: 'person'; listPersonId: string },
  people: readonly string[],
): FollowChoice => {
  if (touched.kind === 'list') {
    return { list: state.kind !== 'list', people: [] };
  }
  const followed =
    state.kind === 'list'
      ? [...people]
      : state.kind === 'people'
        ? state.listPersonIds
        : [];
  const next = followed.includes(touched.listPersonId)
    ? followed.filter((id) => id !== touched.listPersonId)
    : [...followed, touched.listPersonId];
  return {
    list: false,
    people: people.filter((id) => next.includes(id)),
  };
};
