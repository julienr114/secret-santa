/** An exclusion between two people of a group. */
export type Exclusion = {
  id: string;
  giverId: string;
  receiverId: string;
  /** Both ways: neither draws the other. */
  reciprocal: boolean;
};

/** One person someone does not draw, as their page shows it. */
export type NotDrawn = {
  /** The exclusion it comes from, to remove it. */
  exclusionId: string;
  personId: string;
  reciprocal: boolean;
};

/**
 * Who a person never draws: those they are excluded from giving to, and
 * those excluded from them both ways.
 * @param personId - The person.
 * @param exclusions - The group's exclusions.
 * @returns One entry per person not drawn, in the order of the exclusions.
 */
export const notDrawnBy = (
  personId: string,
  exclusions: readonly Exclusion[],
): NotDrawn[] =>
  exclusions.flatMap((e) =>
    e.giverId === personId
      ? [
          {
            exclusionId: e.id,
            personId: e.receiverId,
            reciprocal: e.reciprocal,
          },
        ]
      : e.reciprocal && e.receiverId === personId
        ? [{ exclusionId: e.id, personId: e.giverId, reciprocal: true }]
        : [],
  );
