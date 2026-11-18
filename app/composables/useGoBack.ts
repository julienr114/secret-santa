import { backMove } from '#shared/utils/navigation';

/**
 * « Retour »: up to the parent of the screen in the tree of pages
 * (docs/ARBORESCENCE.md), not back in the browser's history. When the page
 * before is that parent, the browser goes back, so that the history does
 * not hold it twice.
 * @returns A function taking the parent's path (with its query).
 */
export const useGoBack = () => {
  const router = useRouter();
  return (parent: string) => {
    const previous = import.meta.client ? window.history.state?.back : null;
    return backMove(previous, parent) === 'history'
      ? router.back()
      : navigateTo(parent);
  };
};
