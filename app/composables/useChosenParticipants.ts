/**
 * The boxes ticked on « Choisir les participants » for one edition, kept
 * across the screen that creates someone new, who arrives ticked.
 * @param editionId - The edition.
 * @returns A shared ref: the people ticked, or null when untouched.
 */
export const useChosenParticipants = (editionId: MaybeRefOrGetter<string>) =>
  useState<string[] | null>(`chosen:${toValue(editionId)}`, () => null);
