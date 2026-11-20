import type { IdeaView } from '#server/utils/lists';
import type { RemovableClaim } from '#server/utils/claims';

/** One of those who give an idea, as a pill under it. */
export type GiverPill = {
  /** Their first name; null for « Anonyme ». */
  name: string | null;
  /**
   * Their tick, when the one looking may take it off (those who hold
   * the list, and never their own): touching the pill then unfolds
   * « Décocher ».
   */
  claimId: string | null;
};

/**
 * Those who give an idea, one pill each (Correction 28, maquettes
 * ListeTeneur, ListeDecocher): the same row for one first name, for
 * several and for « Anonyme ». Each pill finds its own tick among those
 * that may be taken off, by first name, in the order they were ticked;
 * the pill of the one looking has none.
 * @param view - What the line says of who gives it.
 * @param claims - The ticks the one looking may take off.
 * @returns The pills; none for an idea nobody gives, that I give alone,
 *   or whose giver the one looking may not know.
 */
export const giverPills = (
  view: IdeaView,
  claims: readonly RemovableClaim[],
): GiverPill[] => {
  if (view.kind === 'taken') {
    const claimId = claims[0]?.id ?? null;
    // Who does not hold the list reads no name: the box says « pris ».
    return view.by === null && claimId === null
      ? []
      : [{ name: view.by, claimId }];
  }
  if (view.kind !== 'group') return [];
  return view.people.reduce<{ pills: GiverPill[]; left: RemovableClaim[] }>(
    (acc, person) => {
      const at = acc.left.findIndex((claim) => claim.by === person.name);
      return {
        pills: [
          ...acc.pills,
          { name: person.name, claimId: acc.left[at]?.id ?? null },
        ],
        left: acc.left.filter((_, index) => index !== at),
      };
    },
    { pills: [], left: [...claims] },
  ).pills;
};
