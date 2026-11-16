/** How long an action runs before it shows that it is working. */
export const BUSY_DELAY_MS = 200;

/**
 * Whether to show that an action is working: only once it has run for
 * `BUSY_DELAY_MS`, so a quick one does not flicker; off as soon as it ends.
 * @param pending - Whether the action is running.
 * @returns A ref, true while a slow action runs.
 */
export const useBusy = (pending: () => boolean) => {
  const shown = ref(false);
  const timer = ref<ReturnType<typeof setTimeout> | null>(null);
  watch(
    pending,
    (running) => {
      if (timer.value) clearTimeout(timer.value);
      timer.value = running
        ? setTimeout(() => (shown.value = true), BUSY_DELAY_MS)
        : null;
      if (!running) shown.value = false;
    },
    { immediate: true },
  );
  onScopeDispose(() => timer.value && clearTimeout(timer.value));
  return shown;
};
