import type { InjectionKey } from 'vue';
import type { IdeaLine } from '#server/http/lists';

// The document of a list writes in place (README 22.19, 22.20): each line
// has its own actions under it. What a line asks the page, which holds
// the sheets: a confirmation, and how the holder gives an idea.

export type ListEditing = {
  /** Asks before deleting an idea someone already ticked. */
  confirmRemove: () => Promise<boolean>;
  /** « Changer »: how the holder gives an idea they ticked. */
  change: (idea: IdeaLine, forName: string) => void;
  /** « Se joindre » to a gift given by several. */
  join: (idea: IdeaLine, forName: string) => void;
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
