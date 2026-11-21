import { useQueryClient } from '@tanstack/vue-query';
import { randomListIcon } from '#server/utils/lists';
import { keys } from '~/composables/queries/keys';
import {
  useCreateListMutation,
  type ListSharing,
} from '~/composables/queries/useLists';
import { api } from '~/composables/queries/useApi';

/**
 * A list and its occasion (docs/spec/v3/listes.md, « Une nouvelle
 * liste »): a new list made for an event, which takes its name, its date
 * and its icon, and opens as a draft; or a list shared in an event just
 * made from « Qui verra ta liste ? » (« Une autre occasion »).
 * @returns `createFor` and `shareInto`, each leading to the list.
 */
export const useListOccasion = () => {
  const create = useCreateListMutation();
  const client = useQueryClient();
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
  /**
   * Shares a list in one more event, with all its members, and goes back
   * to the list.
   * @param listId - The list.
   * @param slug - The address of the event.
   * @returns Once on the list.
   */
  const shareInto = async (listId: string, slug: string) => {
    const sharing = await api<ListSharing>(`/api/lists/${listId}/sharing`);
    const added = sharing.options.find((option) => option.slug === slug);
    await api(`/api/lists/${listId}/sharing`, {
      method: 'PUT',
      body: {
        parties: [
          ...sharing.options.filter((o) => o.checked).map((o) => o.id),
          ...(added ? [added.id] : []),
        ],
        isPublic: sharing.isPublic,
      },
    });
    await client.invalidateQueries({ queryKey: keys.lists() });
    await navigateTo(`/listes/${listId}`);
  };
  return { createFor, shareInto, creating: create.isPending };
};
