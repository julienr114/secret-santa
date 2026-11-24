// Who is a member of an event, and what sets them apart (docs/decisions/
// 2026-11-21-on-entre-par-un-secret-santa-ou-par-une-liste.md, ticket
// 117). Nobody is added to an event itself: one comes in by one of its
// Secret Santa or by one of its lists. Pure.

/**
 * What « Membres » writes under a first name, before its words (docs/
 * spec/v3/fete.md, « Sous un prénom, seulement ce qui sort de
 * l'ordinaire », ticket 158).
 */
export type MemberNote =
  | { kind: 'organises' }
  | { kind: 'outside' }
  | { kind: 'santas'; names: string[] }
  | { kind: 'noSanta' }
  | { kind: 'notDrawing'; names: string[] }
  | { kind: 'noEmail' };

/**
 * What sets a member apart, in this order: « Organise »; the Secret
 * Santa, when it tells them apart (with one this year, « Hors du Secret
 * Santa » for who is not in it; with several, the names of theirs, or
 * « Dans aucun Secret Santa »; with none, nothing); who they never draw;
 * no address. Nothing when all is as usual. No more « by where they came
 * in ».
 * @param member - The member.
 * @param member.organises - Whether they organise the event.
 * @param member.takingPart - The Secret Santa of the year they are in.
 * @param member.notDrawing - The names of those they never draw.
 * @param member.hasEmail - Whether they have an address.
 * @param santas - The Secret Santa of the event's year, by name.
 * @returns The notes, in order.
 */
export const memberNotes = (
  member: {
    organises: boolean;
    takingPart: readonly string[];
    notDrawing: readonly string[];
    hasEmail: boolean;
  },
  santas: readonly { id: string; name: string }[],
): MemberNote[] => {
  const mine = santas.filter((santa) => member.takingPart.includes(santa.id));
  const santa: MemberNote[] =
    santas.length === 0
      ? []
      : santas.length === 1
        ? mine.length === 0
          ? [{ kind: 'outside' }]
          : []
        : mine.length === 0
          ? [{ kind: 'noSanta' }]
          : [{ kind: 'santas', names: mine.map((one) => one.name) }];
  return [
    ...(member.organises ? [{ kind: 'organises' as const }] : []),
    ...santa,
    ...(member.notDrawing.length > 0
      ? [{ kind: 'notDrawing' as const, names: [...member.notDrawing] }]
      : []),
    ...(member.hasEmail ? [] : [{ kind: 'noEmail' as const }]),
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

/**
 * Those of the members who organise the event (docs/spec/v3/fete.md,
 * « Les membres », Q-031): an organiser is a member by their address,
 * and their line in « Membres » begins with « Organise ».
 * @param members - The members, with their address.
 * @param organiserEmails - The addresses of the organisers.
 * @returns The ids of the members who organise.
 */
export const organisingIds = (
  members: readonly { id: string; email: string | null }[],
  organiserEmails: readonly string[],
): string[] => {
  const emails = organiserEmails.map((email) => email.toLowerCase());
  return members
    .filter(
      (member) =>
        member.email !== null && emails.includes(member.email.toLowerCase()),
    )
    .map((member) => member.id);
};
