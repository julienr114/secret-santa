// The messages after an action (README 23.3, Correction 26, maquette
// StyleMessages): a dark plum bar at the bottom of the screen that says
// what just happened and goes by itself. Three kinds, and no screen
// dresses a message its own way: its look is the theme of the toast
// (`app.config.ts`), its kind is chosen here.
//   done:   it is done (a green dot, a title, one line of detail at most,
//           4 seconds);
//   undo:   it is done, and can be taken back (the text and « Annuler »
//           on the right, 6 seconds);
//   failed: it did not work (a coral dot, what to do, a cross: stays
//           until closed, and is read out at once).
// One at a time: a new one replaces the old (the toaster, in `app.vue`),
// but « c'est fait » waits for an « Annuler » to end rather than chase it;
// what failed shows at once.

/** How long a message that needs no answer stays. */
const DONE_MS = 4000;
/** How long « Annuler » stays. */
export const UNDO_MS = 6000;

/** The round dot that leads a message. */
const dot = (icon: string, tone: string, ink: string) => ({
  icon,
  class: `size-[26px] ${tone}`,
  ui: { icon: `size-4 ${ink}` },
});

/**
 * The messages after an action.
 * @returns How to say that something is done, can be taken back, or did
 *   not work, and how to take a message away.
 */
export const useMessages = () => {
  const toast = useToast();
  const { t } = useT();
  /** « Annuler » is on the screen: an action can still be taken back. */
  const undoShown = () =>
    toast.toasts.value.some((one) => (one.actions?.length ?? 0) > 0);
  /**
   * Shows a message that only says « c'est fait » once no « Annuler »
   * is on the screen: a new message replaces the old, and replacing an
   * « Annuler » would settle its action before its time was up.
   * @param show - Shows the message.
   */
  const afterUndo = (show: () => void) => {
    if (!undoShown()) return show();
    const stop = watch(toast.toasts, () => {
      if (undoShown()) return;
      stop();
      show();
    });
  };
  return {
    /**
     * « C'est fait ».
     * @param title - What was done, in the past, without a full stop.
     * @param detail - One more line, lighter, if it helps.
     */
    done: (title: string, detail?: string) =>
      afterUndo(() => {
        toast.add({
          title,
          description: detail,
          color: 'success',
          // Read out politely, when the screen reader is free.
          type: 'background',
          duration: DONE_MS,
          close: false,
          avatar: dot('i-lucide-check', 'bg-success-soft', 'text-success-ink'),
        });
      }),
    /**
     * « C'est fait, et ça se rattrape »: no « tu es sûr ? » before, one
     * « Annuler » after.
     * @param title - What was done.
     * @param onUndo - What giving up does.
     * @param options - An id to take the message away, how long it stays.
     * @param options.id - Its id.
     * @param options.duration - How long, 6 seconds unless said.
     */
    undo: (
      title: string,
      onUndo: () => void,
      options: { id?: string; duration?: number } = {},
    ) => {
      toast.add({
        ...(options.id ? { id: options.id } : {}),
        title,
        color: 'neutral',
        type: 'background',
        // « Annuler » on the right of the text, on the same row.
        orientation: 'horizontal',
        duration: options.duration ?? UNDO_MS,
        close: false,
        actions: [
          {
            label: t('common.actions.cancel'),
            variant: 'link',
            color: 'neutral',
            class:
              'min-h-11 px-2.5 text-[15px] font-bold text-undo hover:text-undo active:text-undo',
            onClick: onUndo,
          },
        ],
      });
    },
    /**
     * « Ça n'a pas marché ».
     * @param title - What went wrong.
     * @param detail - What to do about it.
     */
    failed: (title: string, detail?: string) => {
      toast.add({
        title,
        description: detail,
        color: 'error',
        // Read out at once, and kept until closed.
        type: 'foreground',
        duration: 0,
        close: {
          color: 'neutral',
          variant: 'link',
          class:
            'size-11 justify-center text-message-detail hover:text-inverted',
        },
        avatar: dot('i-lucide-x', 'bg-primary-tint', 'text-primary-ink'),
      });
    },
    /** Takes a message away, by its id. */
    remove: (id: string) => toast.remove(id),
  };
};
