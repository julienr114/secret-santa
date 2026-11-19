/**
 * The dark bar that says something was just done, with « Annuler » on
 * its right (maquettes ListeDecocheFait, ListePersonneRetiree,
 * ProcheSupprime, ListePartageArrete): one row, no cross, no progress
 * line. What a toast takes besides its title.
 * @param label - The word of the button: « Annuler ».
 * @param onUndo - What giving up does.
 * @returns The options of the toast.
 */
export const undoBar = (label: string, onUndo: () => void) => ({
  orientation: 'horizontal' as const,
  close: false,
  progress: false,
  actions: [
    {
      label,
      variant: 'link' as const,
      color: 'neutral' as const,
      class:
        'min-h-11 px-2.5 text-[15px] font-bold text-undo hover:text-undo active:text-undo',
      onClick: onUndo,
    },
  ],
  ui: {
    root: 'min-h-13 items-center rounded-[18px] bg-inverted py-0 pr-2 pl-4 shadow-[0_10px_28px_rgba(41,37,36,0.3)] ring-0',
    title: 'text-[15px] font-semibold text-inverted',
    actions: 'shrink-0',
  },
});
