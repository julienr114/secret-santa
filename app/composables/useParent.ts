import { PARENTS, parentOf, placeOf } from '#shared/utils/navigation';
import type { Page } from '#shared/utils/navigation';

/**
 * The parent each page with several was opened from, for the visit: back
 * from one of its own pages, « Retour » still leads there. Lost on a
 * reload, like the history it comes from.
 * @returns The shared state, by the page's path.
 */
const useOpenedFrom = () =>
  useState<Record<string, string>>('opened-from', () => ({}));

/**
 * « Retour » of a page with several parents (docs/spec/v3/navigation.md):
 * the one I come from, read in the history once the page is shown, or its
 * default parent (`parentOf`).
 * @param page - Which page it is.
 * @param fallback - Its default parent.
 * @returns The parent's path, with its query.
 */
export const useParent = (page: Page, fallback: MaybeRefOrGetter<string>) => {
  const route = useRoute();
  const openedFrom = useOpenedFrom();
  const path = route.path;
  const previous = ref<string | null>(null);
  onMounted(() => {
    const before: unknown = window.history.state?.back;
    previous.value = typeof before === 'string' ? before : null;
    const place = previous.value ? placeOf(previous.value) : null;
    if (previous.value && place && PARENTS[page].includes(place)) {
      openedFrom.value = { ...openedFrom.value, [path]: previous.value };
    }
  });
  return computed(() =>
    parentOf(page, previous.value, openedFrom.value[path], toValue(fallback)),
  );
};

/**
 * Where « Retour » would have led from a page, for a gesture that closes
 * it (docs/spec/v3/navigation.md, « Après un geste qui ferme la page »):
 * deleting a list from its own page, or no longer holding it.
 * @returns A function taking the page's path and its default parent.
 */
export const useParentOfPage = () => {
  const openedFrom = useOpenedFrom();
  return (path: string, fallback: string) => openedFrom.value[path] ?? fallback;
};
