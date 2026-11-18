/** What is typed in « Nouvelle édition », not yet created. */
export type NewEditionDraft = {
  label: string;
  eventDate: string;
  budget: string;
  guardianMessage: string;
  /** The budget was typed over: the last edition's no longer replaces it. */
  budgetTouched: boolean;
};

/**
 * The form of a new edition, kept while its word is written on its own
 * page (README 23.3, Correction 18): null until the form fills it.
 * @param slug - The group.
 * @returns The draft, shared by the form and the word's page.
 */
export const useNewEditionDraft = (slug: MaybeRefOrGetter<string>) =>
  useState<NewEditionDraft | null>(`new-edition:${toValue(slug)}`, () => null);
