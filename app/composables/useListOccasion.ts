import { randomListIcon } from '#server/utils/lists';
import { useCreateListMutation } from '~/composables/queries/useLists';

/**
 * A list and its occasion (docs/spec/v3/listes.md, « Une nouvelle
 * liste »): a new list made for an event, which takes its name, its date
 * and its icon, and opens as a draft.
 * @returns `createFor`, leading to the list.
 */
export const useListOccasion = () => {
  const create = useCreateListMutation();
  /**
   * Makes a list for an event, and opens it.
   * @param slug - The address of the event.
   * @returns Once on the list.
   */
  const createFor = async (slug: string) => {
    const { id } = await create.mutateAsync({
      // The server takes the event's icon; this one is only its shape.
      icon: randomListIcon((n) => Math.floor(Math.random() * n)),
      party: slug,
    });
    await navigateTo(`/listes/${id}`);
  };
  return { createFor, creating: create.isPending };
};
