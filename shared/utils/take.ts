// « Reprendre ceux d'un autre événement » (tickets 117, 139): the people
// of the events chosen, once each address, none already where they go.

/** Someone of another event, as « Reprendre » offers them. */
export type TakeCandidate = {
  id: string;
  partyId: string;
  email: string | null;
};

/**
 * Those of the events chosen who may be taken: once each address, none
 * whose address is already there. Without an address, each one is shown.
 * @param people - The people of my events.
 * @param from - The events chosen.
 * @param inAlready - The addresses already where they go.
 * @returns Those to show, in their order.
 */
export const peopleToTake = <T extends TakeCandidate>(
  people: readonly T[],
  from: readonly string[],
  inAlready: readonly string[],
): T[] => {
  const all = people.filter(
    (person) =>
      from.includes(person.partyId) &&
      (person.email === null || !inAlready.includes(person.email)),
  );
  return all.filter(
    (person, index) =>
      person.email === null ||
      all.findIndex((other) => other.email === person.email) === index,
  );
};
