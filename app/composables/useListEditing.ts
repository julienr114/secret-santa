import type { InjectionKey } from 'vue';
import type { IdeaLine, PersonLine } from '#server/http/lists';

// The document of a list writes in place (README 22.19, 22.20): each line
// has its own actions under it. What a line asks the page, which holds
// the sheets: a confirmation, how the holder gives an idea, and a person
// taken off the list.

export type ListEditing = {
  /** Asks before deleting an idea someone already ticked. */
  confirmRemove: () => Promise<boolean>;
  /** « Changer »: how the holder gives an idea they ticked. */
  change: (idea: IdeaLine, forName: string) => void;
  /** « Se joindre » to a gift given by several. */
  join: (idea: IdeaLine, forName: string) => void;
  /** « Retirer de la liste »: the person goes, with « Annuler ». */
  removePerson: (person: PersonLine) => void;
  /**
   * The grey box of someone else's tick (Corrections 25 and 30): the
   * whole tick goes at once, all of a group, with « Annuler ». Not offered
   * where nobody may (a list by its link).
   */
  untickFor?: (idea: IdeaLine) => void;
  /**
   * « Qui l'offre ? » (21 November 2026): who gives an idea, said by those
   * who hold the list; opened by my state or by the first names under it.
   * Only in the document.
   */
  who?: (idea: IdeaLine, forName: string) => void;
};

export const LIST_EDITING: InjectionKey<ListEditing> = Symbol('list-editing');

/**
 * The editing of the document, as a line sees it.
 * @returns The shared state, provided by the page.
 */
export const useListEditing = (): ListEditing => {
  const editing = inject(LIST_EDITING);
  if (!editing) throw new Error('useListEditing outside a list document');
  return editing;
};
