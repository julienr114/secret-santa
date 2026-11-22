// Who is a member of an event, and by where they came in (docs/decisions/
// 2026-11-21-on-entre-par-un-secret-santa-ou-par-une-liste.md, ticket
// 117). Nobody is added to an event itself: one comes in by one of its
// Secret Santa or by one of its lists. Pure.

/** By where a member came in: a Secret Santa, or a list. */
export type MemberEntry =
  { kind: 'santa'; santaId: string } | { kind: 'list'; listId: string };

/** What « Membres » writes under a first name, before its words. */
export type EntryPart =
  { kind: 'santa'; name: string | null } | { kind: 'list'; holder: string };

/**
 * What « Membres » says of where someone came in (docs/spec/v3/fete.md,
 * « Les membres »): « Secret Santa », or its name when the event has
 * several this year; « La liste de Camille » for each list. A Secret
 * Santa or a list gone since says nothing.
 * @param entries - By where the member came in.
 * @param event - What the event has.
 * @param event.santas - Its Secret Santa, with whether they are of this
 *   year.
 * @param event.lists - The lists, with the first name of who made each.
 * @returns The parts, Secret Santa first, then the lists.
 */
export const entryParts = (
  entries: readonly MemberEntry[],
  event: {
    santas: readonly { id: string; name: string; current: boolean }[];
    lists: readonly { id: string; holder: string }[];
  },
): EntryPart[] => {
  const several = event.santas.filter((santa) => santa.current).length > 1;
  const santas = event.santas.filter((santa) =>
    entries.some(
      (entry) => entry.kind === 'santa' && entry.santaId === santa.id,
    ),
  );
  const named = several ? santas.filter((santa) => santa.current) : [];
  const plain = santas.some((santa) => !named.includes(santa));
  const lists = event.lists.filter((list) =>
    entries.some((entry) => entry.kind === 'list' && entry.listId === list.id),
  );
  return [
    ...(plain ? [{ kind: 'santa' as const, name: null }] : []),
    ...named.map((santa) => ({ kind: 'santa' as const, name: santa.name })),
    ...lists.map((list) => ({ kind: 'list' as const, holder: list.holder })),
  ];
};

/** The stage of a list in its own event: for all its members, for the
 * one who drew, or not shared there. */
export type OwnStage = 'party' | 'giver' | null;

/**
 * Whether the one who holds a list may make someone come into its event
 * by it (docs/spec/v3/listes.md, « Inviter quelqu'un »): only who manages
 * it, only when it is shared with all the members of its own event.
 * @param list - The list.
 * @param list.manages - Whether I manage it.
 * @param list.ownStage - Its stage in the event it was made for.
 * @returns True when « Inviter quelqu'un » is offered.
 */
export const canInviteToList = (list: {
  manages: boolean;
  ownStage: OwnStage;
}): boolean => list.manages && list.ownStage === 'party';

/**
 * Whether opening the link of a list makes one a member of its event
 * (docs/spec/v3/listes.md, « Arriver par le lien »): logged in, not in
 * already, the list shared with all the members of its own event, and a
 * place left before 30. A draft, a list kept for the one who drew, or one
 * shared only in other events makes nobody come in.
 * @param arrival - Who arrives, and the list.
 * @param arrival.loggedIn - Whether they have a session.
 * @param arrival.ownStage - The list's stage in its own event.
 * @param arrival.member - Whether they are a member of that event.
 * @param arrival.placesLeft - The places left in that event.
 * @returns True when they come in.
 */
export const entersByListLink = (arrival: {
  loggedIn: boolean;
  ownStage: OwnStage;
  member: boolean;
  placesLeft: number;
}): boolean =>
  arrival.loggedIn &&
  !arrival.member &&
  arrival.ownStage === 'party' &&
  arrival.placesLeft > 0;

/** Someone a holder or an organiser takes from another event. */
export type Takeable = { id: string; email: string | null };

/**
 * Who « Qui reprendre ? » adds (docs/spec/v3/secret-santa.md, « Choisir
 * les participants »): those ticked, once each address, never one who is
 * in already by that address.
 * @param ticked - Those ticked, in their order.
 * @param inAlready - The addresses of those already there.
 * @returns Those to add.
 */
export const takenOnce = <C extends Takeable>(
  ticked: readonly C[],
  inAlready: readonly string[],
): C[] =>
  ticked.filter(
    (person, index) =>
      person.email === null ||
      (!inAlready.includes(person.email) &&
        ticked.findIndex((other) => other.email === person.email) === index),
  );

/**
 * How many of the 30 places newcomers take: one each, but for someone
 * already a member by that address.
 * @param newcomers - Who comes in.
 * @param memberEmails - The addresses of the members still in.
 * @returns The places they take.
 */
export const placesTaken = (
  newcomers: readonly { email: string | null }[],
  memberEmails: readonly string[],
): number =>
  newcomers.filter(
    (person) => person.email === null || !memberEmails.includes(person.email),
  ).length;
