/**
 * Something removed at once on the screen, with « Annuler » in a toast
 * (README 22.19, 22.20): nothing is asked of the server before the toast
 * is gone, so that giving up loses nothing. Leaving the screen, or
 * removing something else, sends what was waiting.
 * @param commit - Removes for good; calls `done` once the server answered.
 * @returns What is leaving (to hide it), and how to start a removal.
 */
export const useDelayedRemoval = (
  commit: (id: string, done: () => void) => void,
) => {
  const toast = useMessages();
  const leaving = ref<{ id: string; timer: number } | null>(null);
  const flush = () => {
    const gone = leaving.value;
    if (!gone) return;
    window.clearTimeout(gone.timer);
    commit(gone.id, () => {
      if (leaving.value?.id === gone.id) leaving.value = null;
    });
  };
  /**
   * Removes on the screen, and says so with « Annuler ».
   * @param id - What is removed.
   * @param title - What the toast says.
   */
  const start = (id: string, title: string) => {
    flush();
    const toastId = `removed-${id}`;
    leaving.value = { id, timer: window.setTimeout(flush, UNDO_MS) };
    toast.undo(
      title,
      () => {
        if (leaving.value?.id !== id) return;
        window.clearTimeout(leaving.value.timer);
        leaving.value = null;
        toast.remove(toastId);
      },
      { id: toastId },
    );
  };
  onBeforeUnmount(flush);
  return { leaving: computed(() => leaving.value?.id ?? null), start };
};
