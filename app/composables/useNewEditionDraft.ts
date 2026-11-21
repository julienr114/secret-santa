import type { GuessMode } from '#server/utils/guesses';

/** The form of a new Secret Santa (V3TirageNouveau), not yet created. */
export type NewEditionDraft = {
  label: string;
  /** ISO day, or '' while it is to choose. */
  eventDate: string;
  budget: string;
  guardianMessage: string;
  messageNote: string;
  guessMode: GuessMode;
};

/**
 * The form of a new Secret Santa, kept while each row is changed on its
 * own page (docs/spec/v3/regles-d-ecran.md, « Des lignes, pas des
 * champs »): null until the form fills it.
 * @param slug - The party.
 * @returns The draft, shared by the form and the pages of its rows.
 */
export const useNewEditionDraft = (slug: MaybeRefOrGetter<string>) =>
  useState<NewEditionDraft | null>(`new-edition:${toValue(slug)}`, () => null);
