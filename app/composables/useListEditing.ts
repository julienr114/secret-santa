import type { InjectionKey } from 'vue';

// The document of a list writes in place (README 22.19): one line at a
// time is being written, and the bar above the keyboard (« Lien »,
// « Supprimer la ligne », « Terminé ») acts on it. The page provides this,
// the lines take their turn in it.

/** What the bar can do to the line being written. */
export type LineActions = {
  link: () => void;
  remove: () => void;
  done: () => void;
};

export type ListEditing = {
  /** The line being written, or null. */
  active: Ref<LineActions | null>;
  /** Asks before deleting an idea someone already ticked. */
  confirmRemove: () => Promise<boolean>;
  /** Asks for a link, from what the idea has. */
  askLink: (current: string | null) => Promise<string | null | undefined>;
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
